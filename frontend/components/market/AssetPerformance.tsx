"use client";

import { Activity, TrendingUp } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AssetData } from "@/lib/market/types";

interface AssetPerformanceProps {
  timeRange: "1D" | "1W" | "1M" | "3M" | "1Y" | "ALL";
}

export function AssetPerformance({ timeRange }: AssetPerformanceProps) {
  const [assets, setAssets] = useState<AssetData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch("/api/market/assets");
      const json = await response.json();
      setAssets(json);
    } catch (error) {
      console.error("Failed to fetch asset data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return <div className="text-center text-amber-200/60">Loading asset data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* 标题 */}
      <div className="text-center">
        <h2 className="text-3xl lg:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 mb-2">
          Asset Performance
        </h2>
        <p className="text-amber-200/60">Gold vs major assets comparison</p>
      </div>

      {/* 对比表格 */}
      <Card className="bg-gradient-to-br from-slate-900/80 to-slate-950/80 backdrop-blur-xl border-amber-500/20 shadow-lg shadow-amber-500/5">
        <CardContent className="p-6 lg:p-8">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-amber-500/20">
                  <th className="text-left py-4 px-4 text-sm font-bold text-amber-200/60">Asset</th>
                  <th className="text-right py-4 px-4 text-sm font-bold text-amber-200/60">24h</th>
                  <th className="text-right py-4 px-4 text-sm font-bold text-amber-200/60">7d</th>
                  <th className="text-right py-4 px-4 text-sm font-bold text-amber-200/60">1M</th>
                  <th className="text-right py-4 px-4 text-sm font-bold text-amber-200/60">YTD</th>
                  <th className="text-right py-4 px-4 text-sm font-bold text-amber-200/60">1Y</th>
                </tr>
              </thead>
              <tbody>
                {assets.map((asset) => (
                  <tr
                    key={asset.symbol}
                    className="border-b border-amber-500/10 hover:bg-amber-500/5 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-2 h-2 rounded-full ${asset.color.replace("text-", "bg-")}`}
                        ></div>
                        <div>
                          <p className="font-bold text-amber-100">{asset.name}</p>
                          <p className="text-sm text-amber-200/40">{asset.symbol}</p>
                        </div>
                      </div>
                    </td>
                    <td
                      className={`text-right py-4 px-4 font-bold ${asset.h24 >= 0 ? "text-green-400" : "text-red-400"}`}
                    >
                      {asset.h24 >= 0 ? "+" : ""}
                      {asset.h24.toFixed(2)}%
                    </td>
                    <td
                      className={`text-right py-4 px-4 font-bold ${asset.d7 >= 0 ? "text-green-400" : "text-red-400"}`}
                    >
                      {asset.d7 >= 0 ? "+" : ""}
                      {asset.d7.toFixed(2)}%
                    </td>
                    <td
                      className={`text-right py-4 px-4 font-bold ${asset.m1 >= 0 ? "text-green-400" : "text-red-400"}`}
                    >
                      {asset.m1 >= 0 ? "+" : ""}
                      {asset.m1.toFixed(2)}%
                    </td>
                    <td
                      className={`text-right py-4 px-4 font-bold ${asset.ytd >= 0 ? "text-green-400" : "text-red-400"}`}
                    >
                      {asset.ytd >= 0 ? "+" : ""}
                      {asset.ytd.toFixed(2)}%
                    </td>
                    <td
                      className={`text-right py-4 px-4 font-bold ${asset.y1 >= 0 ? "text-green-400" : "text-red-400"}`}
                    >
                      {asset.y1 >= 0 ? "+" : ""}
                      {asset.y1.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* 多资产对比图 */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-slate-900/60 to-slate-950/60 backdrop-blur-xl border-amber-500/20 hover:border-amber-400/40 transition-all">
          <CardHeader className="border-b border-amber-500/10">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-yellow-400" />
              <CardTitle className="text-xl text-amber-100">
                Price Comparison ({timeRange})
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[300px] bg-gradient-to-br from-slate-900/40 to-slate-950/40 rounded-xl border border-amber-500/10 flex items-center justify-center">
              <p className="text-amber-200/40">Multi-asset normalized chart</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-900/60 to-slate-950/60 backdrop-blur-xl border-amber-500/20 hover:border-amber-400/40 transition-all">
          <CardHeader className="border-b border-amber-500/10">
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-blue-400" />
              <CardTitle className="text-xl text-amber-100">Volatility Analysis</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[300px] bg-gradient-to-br from-slate-900/40 to-slate-950/40 rounded-xl border border-amber-500/10 flex items-center justify-center">
              <p className="text-amber-200/40">Volatility bar chart</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
