"use client";

import { BarChart3, PieChart, TrendingUp } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { VolumeData } from "@/lib/market/types";

export function TradingVolume() {
  const [data, setData] = useState<VolumeData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch("/api/market/volume");
      const json = await response.json();
      setData(json);
    } catch (error) {
      console.error("Failed to fetch volume data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading || !data) {
    return <div className="text-center text-amber-200/60">Loading volume data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* 标题 */}
      <div className="text-center">
        <h2 className="text-3xl lg:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 mb-2">
          Global Trading Volume
        </h2>
        <p className="text-amber-200/60">24-hour market activity across all platforms</p>
      </div>

      {/* 总交易量卡片 */}
      <Card className="bg-gradient-to-br from-slate-900/80 to-slate-950/80 backdrop-blur-xl border-amber-500/20 shadow-lg shadow-amber-500/5">
        <CardContent className="p-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 mb-3">
              <BarChart3 className="w-6 h-6 text-yellow-400" />
              <p className="text-amber-200/60 text-lg font-semibold">24h Global Volume</p>
            </div>
            <div className="flex items-baseline justify-center gap-3 mb-3">
              <span className="text-5xl lg:text-6xl font-black text-amber-100">${data.total}B</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <span className="text-xl font-bold text-green-400">+{data.change}%</span>
              <span className="text-amber-200/40">vs Yesterday</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 分布 & 排行 */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* 交易量分布 */}
        <Card className="bg-gradient-to-br from-slate-900/60 to-slate-950/60 backdrop-blur-xl border-amber-500/20 hover:border-amber-400/40 transition-all">
          <CardHeader className="border-b border-amber-500/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                <PieChart className="w-5 h-5 text-white" />
              </div>
              <CardTitle className="text-xl text-amber-100">Volume Distribution</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {/* 饼图占位符 */}
            <div className="h-[200px] bg-gradient-to-br from-slate-900/40 to-slate-950/40 rounded-xl border border-amber-500/10 flex items-center justify-center mb-6">
              <p className="text-amber-200/40">Pie Chart</p>
            </div>

            {/* 图例 */}
            <div className="space-y-3">
              {data.distribution.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between p-3 bg-gradient-to-br from-amber-950/20 to-slate-900/20 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${item.color}`}></div>
                    <span className="text-sm text-amber-200/80">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-amber-100">${item.amount}B</p>
                    <p className="text-xs text-amber-200/40">{item.value}%</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top 市场排行 */}
        <Card className="bg-gradient-to-br from-slate-900/60 to-slate-950/60 backdrop-blur-xl border-amber-500/20 hover:border-amber-400/40 transition-all">
          <CardHeader className="border-b border-amber-500/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <CardTitle className="text-xl text-amber-100">Top Markets</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {data.topMarkets.map((market, index) => (
                <div
                  key={market.name}
                  className="flex items-center gap-4 p-4 bg-gradient-to-br from-amber-950/20 to-slate-900/20 rounded-xl border border-amber-500/10 hover:border-amber-400/30 transition-all"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-lg flex items-center justify-center font-black text-slate-900 text-sm shadow-lg">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-amber-100">{market.name}</p>
                    <p className="text-sm text-amber-200/50">${market.volume}B</p>
                  </div>
                  <div
                    className={`text-right ${market.change > 0 ? "text-green-400" : "text-red-400"}`}
                  >
                    <p className="font-bold">
                      {market.change > 0 ? "+" : ""}
                      {market.change}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 链上交易量 */}
      <Card className="bg-gradient-to-br from-slate-900/80 to-slate-950/80 backdrop-blur-xl border-amber-500/20 shadow-lg shadow-amber-500/5">
        <CardHeader className="border-b border-amber-500/10">
          <CardTitle className="text-xl text-amber-100">On-Chain Gold Token Volume</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-amber-500/10">
                  <th className="text-left py-3 px-4 text-sm font-bold text-amber-200/60">Token</th>
                  <th className="text-right py-3 px-4 text-sm font-bold text-amber-200/60">
                    24h Volume
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-bold text-amber-200/60">
                    7d Volume
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-bold text-amber-200/60">
                    Trend
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.onChain.map((item) => (
                  <tr
                    key={item.token}
                    className="border-b border-amber-500/5 hover:bg-amber-500/5 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <span className="font-bold text-amber-100">{item.token}</span>
                    </td>
                    <td className="text-right py-4 px-4 text-amber-100 font-semibold">
                      ${item.volume24h}M
                    </td>
                    <td className="text-right py-4 px-4 text-amber-100 font-semibold">
                      ${item.volume7d}M
                    </td>
                    <td className="text-right py-4 px-4">
                      <div className="inline-block w-20 h-8 bg-gradient-to-br from-slate-900/40 to-slate-950/40 rounded-lg border border-amber-500/10"></div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
