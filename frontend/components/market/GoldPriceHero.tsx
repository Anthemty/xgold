"use client";

import { RefreshCw, TrendingDown, TrendingUp } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { GoldPriceData } from "@/lib/market/types";
import { formatLargeNumber, formatPercent, formatPrice } from "@/lib/market/utils";
import { supabase } from "@/lib/supabase";

export function GoldPriceHero() {
  const [data, setData] = useState<GoldPriceData | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const { data: goldData, error } = await supabase
        .from("market_data")
        .select("price_usd, change_24h, change_pct_24h, market_cap")
        .eq("asset_symbol", "GOLD")
        .order("updated_at", { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;

      if (goldData) {
        setData({
          price: goldData.price_usd,
          change_24h: goldData.change_24h,
          change_percentage: goldData.change_pct_24h,
          market_cap: goldData.market_cap / 1e12, // 转换为万亿单位
        });
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error("Failed to fetch gold price data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    // 订阅 Supabase 实时更新
    const goldChannel = supabase
      .channel("gold-price-hero-updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "market_data",
          filter: "asset_symbol=eq.GOLD",
        },
        (payload) => {
          if (payload.new) {
            const newData = payload.new as Record<string, unknown>;
            setData({
              price: newData.price_usd as number,
              change_24h: newData.change_24h as number,
              change_percentage: newData.change_pct_24h as number,
              market_cap: (newData.market_cap as number) / 1e12, // 转换为万亿单位
            });
            setLastUpdate(new Date());
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(goldChannel);
    };
  }, [fetchData]);

  const refreshData = async () => {
    setIsRefreshing(true);
    await fetchData();
  };

  // 格式化日期时间
  const formatDateTime = (date: Date) => {
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  if (loading || !data) {
    return (
      <Card className="bg-gradient-to-br from-slate-900/80 to-slate-950/80 backdrop-blur-xl border-amber-500/20 shadow-lg shadow-amber-500/5">
        <CardContent className="p-6 lg:p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-slate-800/50 rounded"></div>
            <div className="h-24 bg-slate-800/50 rounded"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-20 bg-slate-800/50 rounded"></div>
              <div className="h-20 bg-slate-800/50 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isPositive = (data.change_percentage ?? 0) > 0;

  return (
    <Card className="bg-gradient-to-br from-slate-900/80 to-slate-950/80 backdrop-blur-xl border-amber-500/20 shadow-lg shadow-amber-500/5">
      <CardContent className="p-6 lg:p-8">
        {/* 顶部：标题和更新信息 */}
        <div className="flex items-start justify-between mb-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-2xl">💰</span>
            </div>
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold text-amber-100">Gold Spot Price</h2>
              <p className="text-sm text-amber-200/50">XAU/USD per Troy Ounce</p>
            </div>
          </div>

          {/* 更新时间和刷新按钮 */}
          <div className="flex items-center gap-3 text-xs text-amber-200/60">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>{formatDateTime(lastUpdate)}</span>
            <Button
              onClick={refreshData}
              disabled={isRefreshing}
              size="sm"
              variant="outline"
              className="border-amber-500/30 hover:border-amber-400 text-amber-400 hover:text-amber-300 bg-transparent hover:bg-amber-500/10 p-2"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          {/* 左侧：主要价格信息 */}
          <div className="flex-1">
            <div className="space-y-2">
              <div className="flex items-baseline gap-3">
                <span className="text-5xl lg:text-6xl font-black text-amber-100 tabular-nums">
                  ${formatPrice(data.price)}
                </span>
                <span className="text-xl text-amber-200/60">USD</span>
              </div>

              <div className="flex items-center gap-2">
                {isPositive ? (
                  <TrendingUp className="w-6 h-6 text-green-400" />
                ) : (
                  <TrendingDown className="w-6 h-6 text-red-400" />
                )}
                <span
                  className={`text-2xl font-bold ${isPositive ? "text-green-400" : "text-red-400"}`}
                >
                  {formatPercent(data.change_percentage ?? 0)} ($
                  {formatPrice(Math.abs(data.change_24h ?? 0))})
                </span>
                <span className="text-amber-200/50 text-sm">24h</span>
              </div>
            </div>
          </div>

          {/* 右侧：次要指标 */}
          <div className="grid grid-cols-2 gap-4 lg:gap-6">
            <div className="p-4 bg-gradient-to-br from-amber-950/30 to-slate-900/30 rounded-xl border border-amber-500/10">
              <p className="text-sm text-amber-200/60 mb-1">Gold Market Cap</p>
              <p className="text-2xl font-black text-amber-100">
                {formatLargeNumber((data.market_cap ?? 0) * 1e12)}
              </p>
            </div>
            <div className="p-4 bg-gradient-to-br from-amber-950/30 to-slate-900/30 rounded-xl border border-amber-500/10">
              <p className="text-sm text-amber-200/60 mb-1">24h Change</p>
              <p className={`text-2xl font-bold ${isPositive ? "text-green-400" : "text-red-400"}`}>
                ${formatPrice(Math.abs(data.change_24h ?? 0))}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
