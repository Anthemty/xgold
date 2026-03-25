"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/home/Header";
import { AssetPerformance } from "@/components/market/AssetPerformance";
import { GoldPriceChart } from "@/components/market/GoldPriceChart";
import { GoldPriceHero } from "@/components/market/GoldPriceHero";
import { TokenComparison } from "@/components/market/TokenComparison";
import { TradingVolume } from "@/components/market/TradingVolume";

export function MarketOverview() {
  const [mounted, setMounted] = useState(false);
  const [timeRange, _setTimeRange] = useState<"1D" | "1W" | "1M" | "3M" | "1Y" | "ALL">("1D");

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      {/* 导航栏 */}
      <Header />

      <main className="container mx-auto px-4 py-8 pt-24">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div
            className={`mb-8 transition-all duration-700 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 mb-2">
              Market Overview
            </h1>
            <p className="text-amber-200/60 text-base">Real-time gold market data and analytics</p>
          </div>

          {/* Hero - 黄金价格大屏 */}
          <div
            className={`transition-all duration-700 delay-100 mb-8 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <GoldPriceHero />
          </div>

          {/* 1. 黄金价格走势图 */}
          <div
            className={`transition-all duration-700 delay-300 mb-8 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <GoldPriceChart />
          </div>

          {/* 2. PAXG & XAUT 对比 */}
          <div
            className={`transition-all duration-700 delay-400 mb-8 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <TokenComparison timeRange={timeRange} />
          </div>

          {/* 3. 全球黄金交易量 */}
          <div
            className={`transition-all duration-700 delay-500 mb-8 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <TradingVolume />
          </div>

          {/* 5. 资产表现对比 */}
          <div
            className={`transition-all duration-700 delay-600 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <AssetPerformance timeRange={timeRange} />
          </div>
        </div>
      </main>
    </>
  );
}
