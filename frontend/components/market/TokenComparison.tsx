"use client";

import { Coins, Lock, TrendingDown, TrendingUp, Users } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import type { TokenData } from "@/lib/market/types";
import { formatPercent, formatPrice } from "@/lib/market/utils";
import { supabase } from "@/lib/supabase";

interface TokenComparisonProps {
  timeRange: "1D" | "1W" | "1M" | "3M" | "1Y" | "ALL";
}

interface PriceHistoryData {
  timestamp: string;
  price_usd: number;
  asset_symbol: string;
}

export function TokenComparison(_props: TokenComparisonProps) {
  const [tokens, setTokens] = useState<TokenData[]>([]);
  const [loading, setLoading] = useState(true);
  const [priceHistory, setPriceHistory] = useState<PriceHistoryData[]>([]);
  const [_chartLoading, setChartLoading] = useState(true);
  const [_goldPrice, setGoldPrice] = useState<number>(0);

  const fetchData = useCallback(async () => {
    try {
      // 获取 GOLD 价格
      const { data: goldData } = await supabase
        .from("market_data")
        .select("price_usd")
        .eq("asset_symbol", "GOLD")
        .single();

      const currentGoldPrice = goldData?.price_usd || 0;
      setGoldPrice(currentGoldPrice);

      // 获取代币数据
      const { data, error } = await supabase
        .from("market_data")
        .select("asset_symbol, price_usd, change_24h, change_pct_24h, market_cap, volume_24h, tvl, total_supply, circulating_supply, holders_count")
        .in("asset_symbol", ["PAXG", "XAUT"])
        .order("asset_symbol", { ascending: true });

      if (error) throw error;

      if (data) {
        const formattedTokens: TokenData[] = data.map((token) => ({
          symbol: token.asset_symbol,
          name: token.asset_symbol === "PAXG" ? "Pax Gold" : "Tether Gold",
          price: token.price_usd,
          change_24h: token.change_24h ?? 0,
          change_percentage: token.change_pct_24h ?? 0,
          volume_24h: token.volume_24h ?? 0,
          market_cap: token.market_cap ?? 0,
          tvl: token.tvl ? token.tvl / 1e6 : token.market_cap ? token.market_cap / 1e6 : 0,
          supply: token.circulating_supply ?? (token.market_cap && token.price_usd ? token.market_cap / token.price_usd : 0),
          holders: token.holders_count ?? 0,
          premium: currentGoldPrice > 0 ? ((token.price_usd / currentGoldPrice - 1) * 100) : 0,
        }));

        setTokens(formattedTokens);
      }
    } catch (error) {
      console.error("Failed to fetch token data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPriceHistory = useCallback(async () => {
    setChartLoading(true);
    try {
      // 从 market_data 获取 GOLD, PAXG, XAUT 的数据
      const assets = ["GOLD", "PAXG", "XAUT"];
      const allData: PriceHistoryData[] = [];

      for (const asset of assets) {
        const { data, error } = await supabase
          .from("market_data")
          .select("updated_at, price_usd, asset_symbol")
          .eq("asset_symbol", asset)
          .order("updated_at", { ascending: false })
          .limit(1);

        if (error) {
          console.error(`Error fetching ${asset} data:`, error);
          continue;
        }

        if (data && data.length > 0) {
          allData.push({
            timestamp: data[0].updated_at || new Date().toISOString(),
            price_usd: data[0].price_usd,
            asset_symbol: data[0].asset_symbol,
          });
        }
      }

      setPriceHistory(allData);
    } catch (error) {
      console.error("Failed to fetch market data:", error);
    } finally {
      setChartLoading(false);
    }
  }, []);

  useEffect(() => {
    // 初始加载数据
    fetchData();
    fetchPriceHistory();

    // 订阅 PAXG 和 XAUT 的实时更新
    const tokensChannel = supabase
      .channel("token-comparison-updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "market_data",
          filter: "asset_symbol=in.(PAXG,XAUT)",
        },
        (payload) => {
          console.log("Token data updated:", payload);
          // 强制重新获取数据以确保最新状态
          fetchData();
        }
      )
      .subscribe((status) => {
        console.log("Token subscription status:", status);
      });

    // 设置定时强制刷新（每30秒）
    const refreshInterval = setInterval(() => {
      console.log("Force refreshing token data...");
      fetchData();
    }, 30000);

    return () => {
      supabase.removeChannel(tokensChannel);
      clearInterval(refreshInterval);
    };
  }, [fetchData, fetchPriceHistory]);

  if (loading) {
    return <div className="text-center text-amber-200/60">Loading tokens...</div>;
  }

  const tokenConfig = [
    { gradient: "from-blue-500 to-cyan-500", icon: "🥇" },
    { gradient: "from-green-500 to-emerald-500", icon: "💰" },
  ];

  // 归一化价格数据 - 以第一个数据点为基准100
  const _getNormalizedData = (symbol: string) => {
    const assetData = priceHistory.filter((d) => d.asset_symbol === symbol);
    if (assetData.length === 0) return [];

    const basePrice = assetData[0].price_usd;
    return assetData.map((d) => ({
      timestamp: d.timestamp,
      normalized: (d.price_usd / basePrice) * 100,
    }));
  };

  // 生成SVG路径
  const _generatePath = (
    data: { timestamp: string; normalized: number }[],
    width: number,
    height: number
  ) => {
    if (data.length === 0) return "";

    const minValue = Math.min(...data.map((d) => d.normalized));
    const maxValue = Math.max(...data.map((d) => d.normalized));
    const valueRange = maxValue - minValue || 1;

    const points = data.map((point, index) => {
      const x = 60 + (index / (data.length - 1)) * (width - 80);
      const y = 20 + (1 - (point.normalized - minValue) / valueRange) * (height - 40);
      return { x, y };
    });

    return points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  };

  const _assetConfig = [
    { symbol: "GOLD", color: "rgb(234, 179, 8)", name: "Gold Spot" },
    { symbol: "PAXG", color: "rgb(59, 130, 246)", name: "PAXG" },
    { symbol: "XAUT", color: "rgb(16, 185, 129)", name: "XAUT" },
  ];

  return (
    <div className="space-y-6">
      {/* 标题 */}
      <div className="text-center">
        <h2 className="text-3xl lg:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 mb-2">
          Gold Token Analytics
        </h2>
        <p className="text-amber-200/60">Real-time PAXG & XAUT market data</p>
      </div>

      {/* 代币对比卡片 */}
      <div className="grid md:grid-cols-2 gap-6">
        {tokens.map((token, index) => {
          const config = tokenConfig[index];
          const isPositive = (token.change_percentage ?? 0) > 0;

          return (
            <Card
              key={token.symbol}
              className="bg-gradient-to-br from-slate-900/60 to-slate-950/60 backdrop-blur-xl border-amber-500/20 hover:border-amber-400/40 transition-all hover:shadow-lg hover:shadow-amber-500/10"
            >
              <CardContent className="p-6">
                {/* 头部 */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 bg-gradient-to-br ${config.gradient} rounded-full flex items-center justify-center font-black text-white text-xl shadow-lg`}
                    >
                      {config.icon}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-amber-100">{token.symbol}</h3>
                      <p className="text-sm text-amber-200/50">{token.name}</p>
                    </div>
                  </div>
                </div>

                {/* 价格 */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-4xl font-black text-amber-100">
                      ${formatPrice(token.price)}
                    </span>
                    <span className="text-amber-200/60">USD</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {isPositive ? (
                      <TrendingUp className="w-5 h-5 text-green-400" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-red-400" />
                    )}
                    <span
                      className={`text-xl font-bold ${
                        isPositive ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {formatPercent(token.change_percentage ?? 0)}
                    </span>
                    <span className="text-amber-200/40 text-sm">24h</span>
                  </div>
                </div>

                {/* 指标网格 */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gradient-to-br from-amber-950/30 to-slate-900/30 rounded-xl border border-amber-500/10">
                    <div className="flex items-center gap-2 mb-2">
                      <Lock className="w-4 h-4 text-amber-200/60" />
                      <p className="text-xs text-amber-200/60">TVL</p>
                    </div>
                    <p className="text-xl font-bold text-amber-100">${(token.tvl ?? 0).toFixed(1)}M</p>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-amber-950/30 to-slate-900/30 rounded-xl border border-amber-500/10">
                    <div className="flex items-center gap-2 mb-2">
                      <Coins className="w-4 h-4 text-amber-200/60" />
                      <p className="text-xs text-amber-200/60">Supply</p>
                    </div>
                    <p className="text-xl font-bold text-amber-100">
                      {((token.supply ?? 0) / 1000).toFixed(1)}k oz
                    </p>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-amber-950/30 to-slate-900/30 rounded-xl border border-amber-500/10">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-4 h-4 text-amber-200/60" />
                      <p className="text-xs text-amber-200/60">Holders</p>
                    </div>
                    <p className="text-xl font-bold text-amber-100">
                      {((token.holders ?? 0) / 1000).toFixed(1)}k
                    </p>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-amber-950/30 to-slate-900/30 rounded-xl border border-amber-500/10">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-amber-200/60" />
                      <p className="text-xs text-amber-200/60">Premium</p>
                    </div>
                    <p
                      className={`text-xl font-bold ${
                        (token.premium ?? 0) > 0 ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {formatPercent(token.premium ?? 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 价格对比图表 - 暂时隐藏 */}
      {/* 
      <Card className="bg-gradient-to-br from-slate-900/80 to-slate-950/80 backdrop-blur-xl border-amber-500/20 shadow-lg shadow-amber-500/5">
        <CardContent className="p-6 lg:p-8">
          <h3 className="text-xl font-bold text-amber-100 mb-4">
            Price Comparison (24h)
          </h3>
          
          {chartLoading ? (
            <div className="h-[300px] flex items-center justify-center">
              <p className="text-amber-200/60 animate-pulse">Loading chart data...</p>
            </div>
          ) : priceHistory.length > 0 ? (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-4 justify-center">
                {assetConfig.map(asset => {
                  const data = getNormalizedData(asset.symbol);
                  if (data.length === 0) return null;
                  const change = ((data[data.length - 1].normalized - 100)).toFixed(2);
                  return (
                    <div key={asset.symbol} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: asset.color }}></div>
                      <span className="text-sm text-amber-100">{asset.name}</span>
                      <span className={`text-sm font-bold ${parseFloat(change) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {parseFloat(change) >= 0 ? '+' : ''}{change}%
                      </span>
                    </div>
                  );
                })}
              </div>
              
              <svg className="w-full" viewBox="0 0 800 300" preserveAspectRatio="xMidYMid meet">
                <defs>
                  {assetConfig.map(asset => (
                    <filter key={`glow-${asset.symbol}`} id={`glow-${asset.symbol}`}>
                      <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  ))}
                </defs>
                
                {[0, 1, 2, 3, 4].map(i => {
                  const y = 20 + (i * 70);
                  return (
                    <line
                      key={`grid-${i}`}
                      x1="60"
                      y1={y}
                      x2="780"
                      y2={y}
                      stroke="rgb(251, 191, 36)"
                      strokeOpacity="0.08"
                      strokeDasharray="4 4"
                    />
                  );
                })}
                
                {assetConfig.map(asset => {
                  const data = getNormalizedData(asset.symbol);
                  if (data.length === 0) return null;
                  return (
                    <path
                      key={asset.symbol}
                      d={generatePath(data, 800, 300)}
                      fill="none"
                      stroke={asset.color}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      filter={`url(#glow-${asset.symbol})`}
                    />
                  );
                })}
              </svg>
            </div>
          ) : (
            <div className="h-[300px] bg-gradient-to-br from-slate-900/40 to-slate-950/40 rounded-xl border border-amber-500/10 flex items-center justify-center">
              <p className="text-amber-200/40">No 24h data available</p>
            </div>
          )}
        </CardContent>
      </Card>
      */}
    </div>
  );
}
