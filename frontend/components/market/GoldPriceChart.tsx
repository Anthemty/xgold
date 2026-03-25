"use client";

import { TrendingUp } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";

type GoldPriceChartProps = Record<string, never>;

interface PriceData {
  timestamp: string;
  price_usd: number;
}

interface HoverInfo {
  x: number;
  y: number;
  svgX?: number;
  svgY?: number;
  price: number;
  date: string;
  visible: boolean;
}

export function GoldPriceChart(_props: GoldPriceChartProps = {}) {
  const [timeRange, setTimeRange] = useState<"1D" | "1W" | "1M" | "3M" | "1Y" | "ALL">("ALL");
  const [chartType, _setChartType] = useState<"line" | "candle" | "area">("line");
  const [priceData, setPriceData] = useState<PriceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoverInfo, setHoverInfo] = useState<HoverInfo>({
    x: 0,
    y: 0,
    price: 0,
    date: "",
    visible: false,
  });
  const [stats, setStats] = useState({
    open: 0,
    high: 0,
    low: 0,
    close: 0,
  });

  const fetchPriceHistory = useCallback(async () => {
    setLoading(true);
    try {
      let granularity = "1D";
      let startDate = new Date();

      switch (timeRange) {
        case "1D":
          granularity = "1H";
          startDate.setDate(startDate.getDate() - 1);
          break;
        case "1W":
          granularity = "1D";
          startDate.setDate(startDate.getDate() - 7);
          break;
        case "1M":
          granularity = "1D";
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case "3M":
          granularity = "1D";
          startDate.setMonth(startDate.getMonth() - 3);
          break;
        case "1Y":
          granularity = "1M";
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
        case "ALL":
          granularity = "1M";
          startDate = new Date("1970-01-01");
          break;
      }

      const { data, error } = await supabase
        .from("price_history")
        .select("timestamp, price_usd")
        .eq("asset_symbol", "GOLD")
        .eq("timeframe", granularity)
        .gte("timestamp", startDate.toISOString())
        .order("timestamp", { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        setPriceData(data);

        const prices = data.map((d) => d.price_usd);
        setStats({
          open: data[0].price_usd,
          high: Math.max(...prices),
          low: Math.min(...prices),
          close: data[data.length - 1].price_usd,
        });
      } else {
        setPriceData([]);
      }
    } catch (error) {
      console.error("Error fetching price history:", error);
      setPriceData([]);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchPriceHistory();
  }, [fetchPriceHistory]);

  // 生成平滑曲线路径 (Catmull-Rom样条)
  const generateSmoothPath = (
    data: PriceData[],
    width: number,
    height: number,
    isArea: boolean = false,
    offsetX: number = 0,
    offsetY: number = 0
  ): string => {
    if (data.length === 0) return "";
    if (data.length === 1) {
      const x = offsetX + width / 2;
      const y = offsetY + height / 2;
      return isArea
        ? `M ${offsetX} ${offsetY + height} L ${x} ${y} L ${offsetX + width} ${offsetY + height} Z`
        : `M ${x} ${y}`;
    }

    const prices = data.map((d) => d.price_usd);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice;

    // 添加10%的上下边距,防止线条被截断
    const padding = priceRange * 0.1;
    const paddedMin = minPrice - padding;
    const paddedMax = maxPrice + padding;
    const paddedRange = paddedMax - paddedMin;

    const points = data.map((point, index) => {
      const x = offsetX + (index / (data.length - 1)) * width;
      const normalizedPrice = (point.price_usd - paddedMin) / paddedRange;
      const y = offsetY + height - normalizedPrice * height;
      return { x, y };
    });

    let path = `M ${points[0].x} ${points[0].y}`;

    for (let i = 0; i < points.length - 1; i++) {
      const curr = points[i];
      const next = points[i + 1];

      // 改进端点处理：确保第一个和最后一个点的切线方向准确
      let prev: { x: number; y: number };
      let after: { x: number; y: number };

      if (i === 0) {
        // 第一段：让prev点在curr的反方向延伸
        prev = { x: curr.x - (next.x - curr.x), y: curr.y - (next.y - curr.y) };
      } else {
        prev = points[i - 1];
      }

      if (i === points.length - 2) {
        // 最后一段：让after点在next的正方向延伸
        after = { x: next.x + (next.x - curr.x), y: next.y + (next.y - curr.y) };
      } else {
        after = points[i + 2] || next;
      }

      const cp1x = curr.x + (next.x - prev.x) * 0.3;
      const cp1y = curr.y + (next.y - prev.y) * 0.3;
      const cp2x = next.x - (after.x - curr.x) * 0.3;
      const cp2y = next.y - (after.y - curr.y) * 0.3;

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`;
    }

    if (isArea) {
      const lastPoint = points[points.length - 1];
      path += ` L ${lastPoint.x} ${offsetY + height}`;
      path += ` L ${offsetX} ${offsetY + height}`;
      path += ` Z`;
    }

    return path;
  };

  return (
    <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-amber-500/20">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-amber-100 mb-1">Gold Price Chart</h3>
            <p className="text-sm text-amber-200/60">Historical price trends</p>
          </div>

          {/* 时间范围选择器 - 右上方 */}
          <div className="flex flex-wrap gap-2">
            {(["1D", "1W", "1M", "3M", "1Y", "ALL"] as const).map((range) => (
              <button
                key={range}
                type="button"
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-all ${
                  timeRange === range
                    ? "bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 text-slate-900 shadow-md shadow-amber-500/20"
                    : "text-amber-200/60 hover:text-amber-100 hover:bg-slate-700/50 border border-amber-500/10"
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="h-80 flex items-center justify-center">
            <div className="text-amber-200/60 animate-pulse">Loading chart data...</div>
          </div>
        ) : priceData.length > 0 ? (
          <div className="relative -mx-6">
            <div className="w-full h-full pb-2 flex flex-col relative px-6">
              {/* Hover Tooltip - 固定位置显示 */}
              {hoverInfo.visible && (
                <div className="absolute top-4 left-10 z-10 pointer-events-none">
                  <div className="bg-slate-800/95 backdrop-blur-sm border border-amber-500/30 rounded-lg px-4 py-3 shadow-xl">
                    <div className="text-amber-100 font-bold text-lg mb-1 whitespace-nowrap">
                      $
                      {hoverInfo.price.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                    <div className="text-amber-200/60 text-xs whitespace-nowrap">
                      {hoverInfo.date}
                    </div>
                  </div>
                </div>
              )}

              {/* 图表SVG */}
              <svg
                className="w-full flex-1"
                viewBox="0 0 1070 340"
                preserveAspectRatio="xMidYMid meet"
                onMouseLeave={() => setHoverInfo((prev) => ({ ...prev, visible: false }))}
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const mouseX = e.clientX - rect.left;
                  const svgX = (mouseX / rect.width) * 1070;

                  // 只在图表区域内更新
                  if (svgX >= 10 && svgX <= 1000) {
                    setHoverInfo((prev) =>
                      prev.visible
                        ? {
                            ...prev,
                            x: e.clientX,
                            y: e.clientY,
                            svgX: svgX,
                          }
                        : prev
                    );
                  }
                }}
              >
                <title>Gold price chart</title>
                <defs>
                  <linearGradient id="priceGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="rgb(234, 179, 8)" stopOpacity="0.3" />
                    <stop offset="50%" stopColor="rgb(234, 179, 8)" stopOpacity="0.1" />
                    <stop offset="100%" stopColor="rgb(234, 179, 8)" stopOpacity="0" />
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* 网格线 - Y轴 */}
                {[0, 1, 2, 3, 4].map((i) => {
                  const y = 20 + i * 70;
                  const prices = priceData.map((d) => d.price_usd);
                  const minPrice = Math.min(...prices);
                  const maxPrice = Math.max(...prices);
                  const priceRange = maxPrice - minPrice;
                  const padding = priceRange * 0.1;
                  const paddedMin = minPrice - padding;
                  const paddedMax = maxPrice + padding;
                  const price = paddedMax - ((paddedMax - paddedMin) / 4) * i;

                  return (
                    <g key={`grid-y-${i}`}>
                      <line
                        x1="80"
                        y1={y}
                        x2="1070"
                        y2={y}
                        stroke="rgb(251, 191, 36)"
                        strokeOpacity="0.08"
                        strokeDasharray="4 4"
                      />
                      <text
                        x="0"
                        y={y + 4}
                        fill="rgb(251, 191, 36)"
                        fillOpacity="0.7"
                        fontSize="12"
                        fontWeight="500"
                        textAnchor="start"
                      >
                        ${price.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                      </text>
                    </g>
                  );
                })}

                {/* 网格线 - X轴 (时间标签) */}
                {priceData
                  .filter((_, i) => {
                    const step = Math.max(1, Math.ceil(priceData.length / 8));
                    return i % step === 0 || i === priceData.length - 1;
                  })
                  .map((point) => {
                    const totalPoints = priceData.length;
                    const actualIndex = priceData.indexOf(point);
                    const x = 80 + (actualIndex / (totalPoints - 1)) * 920;
                    const date = new Date(point.timestamp);
                    let label = "";

                    if (timeRange === "ALL" || timeRange === "1Y") {
                      label = date.toLocaleDateString("en-US", { year: "numeric", month: "short" });
                    } else if (timeRange === "3M" || timeRange === "1M") {
                      label = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                    } else {
                      label = date.toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      });
                    }

                    return (
                      <g key={`grid-x-${point.timestamp}`}>
                        <line
                          x1={x}
                          y1="20"
                          x2={x}
                          y2="300"
                          stroke="rgb(251, 191, 36)"
                          strokeOpacity="0.05"
                          strokeDasharray="4 4"
                        />
                        <text
                          x={x}
                          y="320"
                          fill="rgb(251, 191, 36)"
                          fillOpacity="0.7"
                          fontSize="10"
                          fontWeight="500"
                          textAnchor="middle"
                        >
                          {label}
                        </text>
                      </g>
                    );
                  })}

                {/* 绘制面积图 */}
                {chartType === "area" && (
                  <path
                    d={generateSmoothPath(priceData, 920, 280, true, 80, 20)}
                    fill="url(#priceGradient)"
                  />
                )}

                {/* 绘制平滑曲线 */}
                <path
                  d={generateSmoothPath(priceData, 920, 280, false, 80, 20)}
                  fill="none"
                  stroke="rgb(234, 179, 8)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter="url(#glow)"
                />

                {/* 交互区域 - 不可见的触发区 */}
                {priceData.map((point, index) => {
                  const actualIndex = index;
                  const x = 80 + (actualIndex / (priceData.length - 1)) * 920;
                  const prices = priceData.map((d) => d.price_usd);
                  const minPrice = Math.min(...prices);
                  const maxPrice = Math.max(...prices);
                  const priceRange = maxPrice - minPrice;
                  const padding = priceRange * 0.1;
                  const paddedMin = minPrice - padding;
                  const paddedMax = maxPrice + padding;
                  const paddedRange = paddedMax - paddedMin;
                  const y = 20 + 280 - ((point.price_usd - paddedMin) / paddedRange) * 280;

                  const date = new Date(point.timestamp);
                  let dateStr = "";
                  if (timeRange === "ALL" || timeRange === "1Y") {
                    dateStr = date.toLocaleDateString("en-US", { year: "numeric", month: "long" });
                  } else if (timeRange === "3M" || timeRange === "1M") {
                    dateStr = date.toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    });
                  } else {
                    dateStr = date.toLocaleString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    });
                  }

                  return (
                    // biome-ignore lint/a11y/useSemanticElements: SVG element requires circle, cannot use button
                    <circle
                      key={point.timestamp}
                      role="button"
                      tabIndex={0}
                      cx={x}
                      cy={y}
                      r="10"
                      fill="transparent"
                      className="cursor-pointer"
                      onMouseEnter={(e) => {
                        setHoverInfo({
                          x: e.clientX,
                          y: e.clientY,
                          svgX: x,
                          svgY: y,
                          price: point.price_usd,
                          date: dateStr,
                          visible: true,
                        });
                      }}
                      onMouseMove={(e) => {
                        setHoverInfo((prev) => ({
                          ...prev,
                          x: e.clientX,
                          y: e.clientY,
                        }));
                      }}
                    />
                  );
                })}

                {/* Hover 指示线和光点 */}
                {hoverInfo.visible &&
                  hoverInfo.svgX !== undefined &&
                  (() => {
                    // 找到最接近鼠标X位置的数据点
                    let closestIndex = 0;
                    let minDistance = Infinity;

                    priceData.forEach((_point, index) => {
                      const pointX = 80 + (index / (priceData.length - 1)) * 920;
                      const distance = Math.abs(hoverInfo.svgX! - pointX);
                      if (distance < minDistance) {
                        minDistance = distance;
                        closestIndex = index;
                      }
                    });

                    const closestPoint = priceData[closestIndex];
                    const prices = priceData.map((d) => d.price_usd);
                    const minPrice = Math.min(...prices);
                    const maxPrice = Math.max(...prices);
                    const priceRange = maxPrice - minPrice;
                    const padding = priceRange * 0.1;
                    const paddedMin = minPrice - padding;
                    const paddedMax = maxPrice + padding;
                    const paddedRange = paddedMax - paddedMin;
                    const pointY =
                      20 + 280 - ((closestPoint.price_usd - paddedMin) / paddedRange) * 280;

                    // 更新悬停信息（价格和日期）
                    const date = new Date(closestPoint.timestamp);
                    let dateStr = "";
                    if (timeRange === "ALL" || timeRange === "1Y") {
                      dateStr = date.toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                      });
                    } else if (timeRange === "3M" || timeRange === "1M") {
                      dateStr = date.toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      });
                    } else {
                      dateStr = date.toLocaleString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      });
                    }

                    if (hoverInfo.price !== closestPoint.price_usd || hoverInfo.date !== dateStr) {
                      setTimeout(() => {
                        setHoverInfo((prev) => ({
                          ...prev,
                          price: closestPoint.price_usd,
                          date: dateStr,
                        }));
                      }, 0);
                    }

                    return (
                      <>
                        {/* 垂直指示线 - 跟随鼠标 X 位置 */}
                        <line
                          x1={hoverInfo.svgX}
                          y1="20"
                          x2={hoverInfo.svgX}
                          y2="300"
                          stroke="rgb(234, 179, 8)"
                          strokeWidth="1.5"
                          strokeDasharray="4 2"
                          strokeOpacity="0.4"
                          className="pointer-events-none"
                        />
                        {/* 光点 - 显示在最接近的数据点上 */}
                        <circle
                          cx={80 + (closestIndex / (priceData.length - 1)) * 920}
                          cy={pointY}
                          r="8"
                          fill="rgb(234, 179, 8)"
                          stroke="rgb(255, 255, 255)"
                          strokeWidth="3"
                          className="pointer-events-none"
                        />
                        <circle
                          cx={80 + (closestIndex / (priceData.length - 1)) * 920}
                          cy={pointY}
                          r="4"
                          fill="rgb(255, 255, 255)"
                          className="pointer-events-none"
                        />
                      </>
                    );
                  })()}
              </svg>
            </div>
          </div>
        ) : (
          <div className="h-80 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-500/20 to-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-yellow-400" />
              </div>
              <p className="text-amber-200/60 text-lg font-semibold mb-2">No Data Available</p>
              <p className="text-amber-200/40 text-sm">No price data for {timeRange}</p>
            </div>
          </div>
        )}

        {/* 图表底部指标 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 pt-2 border-t border-amber-500/10">
          <div>
            <p className="text-xs text-amber-200/60 mb-0.5">Open</p>
            <p className="text-base font-bold text-amber-100">
              {loading ? "..." : `$${stats.open.toLocaleString()}`}
            </p>
          </div>
          <div>
            <p className="text-xs text-amber-200/60 mb-0.5">High</p>
            <p className="text-base font-bold text-green-400">
              {loading ? "..." : `$${stats.high.toLocaleString()}`}
            </p>
          </div>
          <div>
            <p className="text-xs text-amber-200/60 mb-0.5">Low</p>
            <p className="text-base font-bold text-red-400">
              {loading ? "..." : `$${stats.low.toLocaleString()}`}
            </p>
          </div>
          <div>
            <p className="text-xs text-amber-200/60 mb-0.5">Close</p>
            <p className="text-base font-bold text-amber-100">
              {loading ? "..." : `$${stats.close.toLocaleString()}`}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
