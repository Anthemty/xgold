"use client";

import {
  ArrowRight,
  Award,
  BarChart3,
  Coins,
  Lock,
  Shield,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface GoldPriceData {
  price: number;
  change_24h?: number;
  change_percentage?: number;
  market_cap?: number;
  volume_24h?: number;
  high_24h?: number;
  low_24h?: number;
  ath?: number;
  atl?: number;
}

interface PlatformMetrics {
  gold_tokens_market_cap: number;
  gold_tokens_market_cap_change: number;
  total_token_holders: number;
  total_token_holders_change: number;
  gold_tokens_volume_24h: number;
  gold_tokens_volume_24h_change: number;
  total_investors: number;
  platform_rating: number;
}

export function HeroSection() {
  const [mounted, setMounted] = useState(false);
  const [goldData, setGoldData] = useState<GoldPriceData | null>(null);
  const [metrics, setMetrics] = useState<PlatformMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);

    const fetchGoldPrice = async () => {
      try {
        const { data, error } = await supabase
          .from("market_data")
          .select(
            "price_usd, change_24h, change_pct_24h, market_cap, volume_24h, high_24h, low_24h, ath, atl"
          )
          .eq("asset_symbol", "GOLD")
          .order("updated_at", { ascending: false })
          .limit(1)
          .single();

        if (error) throw error;

        if (data) {
          setGoldData({
            price: data.price_usd,
            change_24h: data.change_24h ?? undefined,
            change_percentage: data.change_pct_24h ?? undefined,
            market_cap: data.market_cap ?? undefined,
            volume_24h: data.volume_24h ?? undefined,
            high_24h: data.high_24h ?? undefined,
            low_24h: data.low_24h ?? undefined,
            ath: data.ath ?? undefined,
            atl: data.atl ?? undefined,
          });
        }
      } catch (error) {
        console.error("Failed to fetch gold price:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchPlatformMetrics = async () => {
      try {
        // 获取所有金币代币（XAUT, PAXG）的数据
        const { data: tokenData, error: tokenError } = await supabase
          .from("market_data")
          .select("asset_symbol, market_cap, volume_24h, holders_count")
          .in("asset_symbol", ["XAUT", "PAXG"]);

        if (tokenError) throw tokenError;

        if (tokenData && tokenData.length > 0) {
          // 计算总市值
          const totalMarketCap = tokenData.reduce((sum, token) => sum + (token.market_cap || 0), 0);

          // 计算总持有者数量
          const totalHolders = tokenData.reduce(
            (sum, token) => sum + (token.holders_count || 0),
            0
          );

          // 计算总交易量
          const totalVolume = tokenData.reduce((sum, token) => sum + (token.volume_24h || 0), 0);

          setMetrics({
            gold_tokens_market_cap: totalMarketCap,
            gold_tokens_market_cap_change: 0, // TODO: 需要历史数据计算变化
            total_token_holders: totalHolders,
            total_token_holders_change: 0, // TODO: 需要历史数据计算变化
            gold_tokens_volume_24h: totalVolume,
            gold_tokens_volume_24h_change: 0, // TODO: 需要历史数据计算变化
            total_investors: totalHolders, // 使用持有者数量作为投资者数量
            platform_rating: 4.8, // 固定评分
          });
        }
      } catch (error) {
        console.error("Failed to fetch platform metrics:", error);
      }
    };

    fetchGoldPrice();
    fetchPlatformMetrics();

    // 订阅 Supabase 实时更新
    const goldChannel = supabase
      .channel("gold-price-updates")
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
            setGoldData({
              price: newData.price_usd as number,
              change_24h: (newData.change_24h as number | null) ?? undefined,
              change_percentage: (newData.change_pct_24h as number | null) ?? undefined,
              market_cap: (newData.market_cap as number | null) ?? undefined,
              volume_24h: (newData.volume_24h as number | null) ?? undefined,
              high_24h: (newData.high_24h as number | null) ?? undefined,
              low_24h: (newData.low_24h as number | null) ?? undefined,
              ath: (newData.ath as number | null) ?? undefined,
              atl: (newData.atl as number | null) ?? undefined,
            });
          }
        }
      )
      .subscribe();

    const metricsChannel = supabase
      .channel("token-metrics-updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "market_data",
          filter: "asset_symbol=in.(XAUT,PAXG)",
        },
        async () => {
          // 当代币数据更新时，重新计算平台指标
          await fetchPlatformMetrics();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(goldChannel);
      supabase.removeChannel(metricsChannel);
    };
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const formatMarketCap = (marketCap: number) => {
    // 将数值转换为合适的单位
    if (marketCap >= 1e12) {
      return `$${(marketCap / 1e12).toFixed(1)}T`;
    } else if (marketCap >= 1e9) {
      return `$${(marketCap / 1e9).toFixed(1)}B`;
    } else if (marketCap >= 1e6) {
      return `$${(marketCap / 1e6).toFixed(1)}M`;
    } else {
      return `$${marketCap.toFixed(0)}`;
    }
  };

  const formatMetricValue = (value: number, type: "market_cap" | "holders" | "volume") => {
    if (type === "market_cap" || type === "volume") {
      return formatMarketCap(value);
    } else if (type === "holders") {
      if (value >= 1e6) {
        return `${(value / 1e6).toFixed(1)}M+`;
      } else if (value >= 1e3) {
        return `${(value / 1e3).toFixed(0)}K+`;
      } else {
        return `${value}+`;
      }
    }
    return value.toString();
  };

  const formatMetricChange = (value: number, type: "percentage" | "number") => {
    if (type === "percentage") {
      return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
    } else {
      if (Math.abs(value) >= 1e6) {
        return `${value >= 0 ? "+" : ""}${(value / 1e6).toFixed(1)}M`;
      } else if (Math.abs(value) >= 1e3) {
        return `${value >= 0 ? "+" : ""}${(value / 1e3).toFixed(1)}K`;
      } else {
        return `${value >= 0 ? "+" : ""}${value}`;
      }
    }
  };

  return (
    <section className="relative container mx-auto px-4 pt-24 pb-16 lg:pt-32 lg:pb-24 overflow-hidden min-h-screen flex items-center">
      {/* 背景装饰 */}
      <div className="absolute inset-0 -z-10">
        {/* 渐变光晕 */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-yellow-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 left-1/4 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-3xl"></div>
        <div className="absolute top-60 right-1/4 w-[500px] h-[500px] bg-yellow-600/5 rounded-full blur-3xl"></div>

        {/* 网格背景 */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

        {/* 浮动的金币图标 */}
        <div className="absolute top-40 right-10 w-16 h-16 opacity-20 animate-float">
          <div className="w-full h-full bg-yellow-500/20 rounded-full border-2 border-yellow-500/30"></div>
        </div>
        <div className="absolute bottom-40 left-10 w-12 h-12 opacity-20 animate-float-delayed">
          <div className="w-full h-full bg-amber-500/20 rounded-full border-2 border-amber-500/30"></div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Tag */}
        <div
          className={`flex justify-center mb-6 transition-all duration-700 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500/15 via-amber-500/15 to-yellow-500/15 rounded-full border border-yellow-500/30 backdrop-blur-sm shadow-lg shadow-yellow-500/10">
            <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
            <span className="text-yellow-400 font-bold text-[10px] sm:text-sm tracking-wide">
              100% PHYSICAL GOLD BACKED DIGITAL ASSETS
            </span>
          </div>
        </div>

        {/* Main Title */}
        <div className="text-center mb-8">
          <h1
            className={`font-black leading-[1.05] tracking-tight transition-all duration-700 delay-100 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <div className="text-6xl sm:text-7xl lg:text-8xl xl:text-9xl mb-2">
              <span className="inline-block bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(251,191,36,0.3)]">
                INVEST IN GOLD
              </span>
            </div>
            <div className="text-3xl sm:text-6xl lg:text-7xl xl:text-8xl">
              <span className="inline-block text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                ON THE BLOCKCHAIN
              </span>
            </div>
          </h1>
        </div>

        {/* Subtitle */}
        <div
          className={`text-center mb-10 transition-all duration-700 delay-200 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <p className="text-base sm:text-lg lg:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed font-light">
            <span className="inline-block mt-1 px-3 py-0.5 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 rounded-lg border border-yellow-500/20">
              <span className="font-bold text-yellow-400 text-sm">Mint</span>
              <span className="text-gray-400 mx-1.5 text-sm">•</span>
              <span className="font-bold text-yellow-400 text-sm">Trade</span>
              <span className="text-gray-400 mx-1.5 text-sm">•</span>
              <span className="font-bold text-yellow-400 text-sm">Redeem</span>
            </span>
            <span className="text-white font-medium relative text-base">
              {" "}
              <br className="sm:hidden" />
              gold tokens
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-yellow-400/0 via-yellow-400/50 to-yellow-400/0"></span>
            </span>
            <span className="text-base"> anytime with blockchain security.</span>
          </p>
        </div>

        {/* Live Gold Price Ticker */}
        {mounted && (
          <div className="flex justify-center mb-10 transition-all duration-700 delay-[250ms] opacity-100 translate-y-0">
            <div className="relative group w-full max-w-5xl mx-auto px-4 sm:px-0">
              {/* Glow effect on hover */}
              <div className="absolute -inset-1 bg-gradient-to-r from-yellow-500/20 via-amber-500/20 to-yellow-500/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="relative flex flex-col sm:flex-row flex-wrap justify-center items-center gap-4 sm:gap-3 lg:gap-4 px-5 sm:px-4 lg:px-6 py-4 sm:py-3 bg-gradient-to-br from-gray-800/60 to-gray-900/40 backdrop-blur-md rounded-2xl sm:rounded-xl border border-yellow-500/30 shadow-xl">
                {/* Gold Price Section */}
                <div className="flex items-center gap-3 sm:gap-3 w-full sm:w-auto justify-center sm:justify-start">
                  <div className="p-2.5 sm:p-2 bg-yellow-500/10 rounded-xl sm:rounded-lg border border-yellow-500/20">
                    <Coins className="w-6 h-6 sm:w-5 sm:h-5 text-yellow-400" />
                  </div>
                  <div className="flex flex-col min-w-[180px] sm:min-w-[140px]">
                    <span className="text-xs sm:text-[10px] text-gray-400 font-medium mb-0.5">
                      Gold Price
                    </span>
                    {loading ? (
                      <div className="h-9 sm:h-8 w-32 sm:w-28 bg-gray-700/50 rounded animate-pulse"></div>
                    ) : goldData && typeof goldData.price === "number" ? (
                      <span className="text-3xl sm:text-2xl font-black bg-gradient-to-r from-yellow-300 to-amber-400 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]">
                        {formatPrice(goldData.price)}
                      </span>
                    ) : (
                      <span className="text-3xl sm:text-2xl font-bold text-gray-500">--</span>
                    )}
                  </div>
                </div>

                {/* Divider */}
                <div className="hidden sm:block w-px h-10 bg-gray-600/50"></div>

                {/* 24h Change Section - Hidden on mobile */}
                <div className="hidden sm:flex items-center gap-2">
                  <div
                    className={`p-1.5 rounded-lg border ${
                      goldData?.change_percentage && goldData.change_percentage >= 0
                        ? "bg-green-500/10 border-green-500/20"
                        : "bg-red-500/10 border-red-500/20"
                    }`}
                  >
                    <TrendingUp
                      className={`w-4 h-4 ${
                        goldData?.change_percentage && goldData.change_percentage >= 0
                          ? "text-green-400"
                          : "text-red-400 rotate-180"
                      } transition-transform`}
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-400 font-medium">24h Change</span>
                    {loading ? (
                      <div className="h-6 w-16 bg-gray-700/50 rounded animate-pulse"></div>
                    ) : goldData && typeof goldData.change_percentage === "number" ? (
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-base font-bold ${
                            goldData.change_percentage >= 0 ? "text-green-400" : "text-red-400"
                          }`}
                        >
                          {goldData.change_percentage >= 0 ? "+" : ""}
                          {goldData.change_percentage.toFixed(2)}%
                        </span>
                        {typeof goldData.change_24h === "number" && (
                          <span
                            className={`text-xs ${
                              goldData.change_percentage >= 0
                                ? "text-green-400/70"
                                : "text-red-400/70"
                            }`}
                          >
                            ({goldData.change_percentage >= 0 ? "+" : ""}
                            {formatPrice(goldData.change_24h)})
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-lg font-bold text-gray-500">--</span>
                    )}
                  </div>
                </div>

                {/* Divider */}
                <div className="hidden lg:block w-px h-12 bg-gray-600/50"></div>

                {/* Market Cap Section - Hidden on mobile */}
                <div className="hidden sm:flex items-center gap-2">
                  <div className="p-1.5 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <BarChart3 className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-400 font-medium">Market Cap</span>
                    {loading ? (
                      <div className="h-6 w-16 bg-gray-700/50 rounded animate-pulse"></div>
                    ) : goldData &&
                      typeof goldData.market_cap === "number" &&
                      goldData.market_cap !== 0 ? (
                      <span className="text-lg font-bold bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent">
                        {formatMarketCap(goldData.market_cap)}
                      </span>
                    ) : (
                      <span className="text-lg font-bold text-gray-500">--</span>
                    )}
                  </div>
                </div>

                {/* Divider */}
                <div className="hidden sm:block w-px h-10 bg-gray-600/50"></div>

                {/* Live Indicator */}
                <div className="hidden sm:flex items-center gap-1.5 ml-1">
                  <div className="relative">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                    <div className="absolute inset-0 w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></div>
                  </div>
                  <span className="text-[10px] text-green-400 font-semibold">LIVE</span>
                </div>

                {/* Divider */}
                <div className="hidden sm:block w-px h-10 bg-gray-600/50"></div>

                {/* Buy Button */}
                <a
                  href="/swap"
                  className="group w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-700/50 sm:border-0"
                >
                  <div className="flex items-center justify-center gap-2 sm:gap-1.5 px-6 sm:px-5 py-3 sm:py-2.5 bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 hover:from-yellow-400 hover:via-amber-400 hover:to-yellow-500 rounded-xl sm:rounded-lg font-bold text-gray-900 transition-all hover:scale-105 cursor-pointer shadow-lg shadow-yellow-500/30 hover:shadow-yellow-500/50">
                    <span className="text-sm sm:text-xs whitespace-nowrap">BUY GOLD TOKENS</span>
                    <ArrowRight className="w-4 h-4 sm:w-3.5 sm:h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Metrics */}
        <div className="mb-8 px-4 sm:px-0">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {[
              {
                value: metrics?.gold_tokens_market_cap
                  ? formatMetricValue(metrics.gold_tokens_market_cap, "market_cap")
                  : "$8.5B",
                label: "Gold Tokens Market Cap",
                change: metrics?.gold_tokens_market_cap_change
                  ? formatMetricChange(metrics.gold_tokens_market_cap_change, "percentage")
                  : "+2.3%",
                icon: TrendingUp,
                delay: "delay-[350ms]",
              },
              {
                value: metrics?.total_token_holders
                  ? formatMetricValue(metrics.total_token_holders, "holders")
                  : "125K+",
                label: "Total Token Holders",
                change: metrics?.total_token_holders_change
                  ? formatMetricChange(metrics.total_token_holders_change, "number")
                  : "+1.2K",
                icon: Users,
                delay: "delay-[400ms]",
              },
              {
                value: metrics?.gold_tokens_volume_24h
                  ? formatMetricValue(metrics.gold_tokens_volume_24h, "volume")
                  : "$890M",
                label: "Gold Tokens 24h Volume",
                change: metrics?.gold_tokens_volume_24h_change
                  ? formatMetricChange(metrics.gold_tokens_volume_24h_change, "percentage")
                  : "+15.8%",
                icon: BarChart3,
                delay: "delay-[450ms]",
              },
            ].map((metric) => (
              <div
                key={metric.label}
                className={`group relative p-4 lg:p-5 rounded-2xl bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border border-gray-700 hover:border-yellow-500/30 hover:shadow-2xl hover:shadow-yellow-500/10 transition-all duration-500 ${
                  metric.delay
                } ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              >
                {/* 背景光效 */}
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/0 to-amber-500/0 group-hover:from-yellow-500/5 group-hover:to-amber-500/5 rounded-2xl transition-all duration-500"></div>

                {/* 横向布局：图标+内容 */}
                <div className="relative flex items-start gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    <div className="p-3 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                      <metric.icon className="w-7 h-7 text-yellow-400" />
                    </div>
                  </div>

                  {/* 内容 */}
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="text-xs text-gray-400 font-medium mb-2">{metric.label}</div>
                    <div className="flex items-center gap-3">
                      <div className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-yellow-400/70 to-amber-500/70 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300 leading-none">
                        {metric.value}
                      </div>
                      <div className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
                        <span className="text-xs text-green-400 font-semibold">
                          {metric.change}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 装饰线 */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-1 bg-gradient-to-r from-yellow-500 to-amber-500 group-hover:w-3/4 transition-all duration-500 rounded-full"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Combined Badges - Trust + Features */}
        <div
          className={`flex justify-center mb-6 transition-all duration-700 delay-[500ms] ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <div className="flex flex-wrap justify-center gap-1.5 lg:gap-2 max-w-5xl">
            {/* Trust Badges */}
            <div className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-gray-800/60 rounded-full border border-gray-700/50 backdrop-blur-sm hover:border-green-500/30 transition-all whitespace-nowrap">
              <Shield className="w-3 h-3 text-green-400 flex-shrink-0" />
              <span className="text-xs text-gray-300 font-medium">Audited by CertiK</span>
            </div>
            <div className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-gray-800/60 rounded-full border border-gray-700/50 backdrop-blur-sm hover:border-blue-500/30 transition-all whitespace-nowrap">
              <Lock className="w-3 h-3 text-blue-400 flex-shrink-0" />
              <span className="text-xs text-gray-300 font-medium">Insured Reserves</span>
            </div>
            <div className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-gray-800/60 rounded-full border border-gray-700/50 backdrop-blur-sm hover:border-purple-500/30 transition-all whitespace-nowrap">
              <Award className="w-3 h-3 text-purple-400 flex-shrink-0" />
              <span className="text-xs text-gray-300 font-medium">ISO Certified</span>
            </div>

            {/* Separator */}
            <div className="hidden lg:block w-px h-6 bg-gray-700/50 self-center mx-0.5"></div>

            {/* Feature Badges */}
            <div className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-gray-800/40 rounded-full border border-gray-700/50 hover:border-yellow-500/30 transition-all whitespace-nowrap">
              <Zap className="w-3 h-3 text-yellow-400 flex-shrink-0" />
              <span className="text-xs text-gray-300 font-medium">Instant Settlement</span>
            </div>
            <div className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-gray-800/40 rounded-full border border-gray-700/50 hover:border-green-500/30 transition-all whitespace-nowrap">
              <TrendingUp className="w-3 h-3 text-green-400 flex-shrink-0" />
              <span className="text-xs text-gray-300 font-medium">No Price Slippage</span>
            </div>
            <div className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-gray-800/40 rounded-full border border-gray-700/50 hover:border-blue-500/30 transition-all whitespace-nowrap">
              <Users className="w-3 h-3 text-blue-400 flex-shrink-0" />
              <span className="text-xs text-gray-300 font-medium">Decentralized</span>
            </div>
          </div>
        </div>

        {/* Social Proof */}
        <div
          className={`flex justify-center transition-all duration-700 delay-[550ms] ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <div className="flex flex-wrap justify-center items-center gap-4 px-4 py-3 bg-gray-800/40 backdrop-blur-sm rounded-xl border border-gray-700/50">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 border-2 border-gray-900 flex items-center justify-center text-xs text-gray-400 font-semibold shadow-lg"
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <span className="text-xs text-gray-300">
                <span className="text-yellow-400 font-bold">
                  {metrics?.total_investors
                    ? formatMetricValue(metrics.total_investors, "holders")
                    : "1,234+"}
                </span>{" "}
                investors trust us
              </span>
            </div>

            <div className="h-6 w-px bg-gray-600"></div>

            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <svg
                    key={i}
                    className="w-4 h-4 text-yellow-400 fill-current drop-shadow-lg"
                    viewBox="0 0 20 20"
                  >
                    <title>Star {i}</title>
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <span className="text-xs text-gray-300 font-medium">
                <span className="text-white font-bold">
                  {metrics?.platform_rating ? metrics.platform_rating.toFixed(1) : "4.9"}
                </span>
                /5 rating
              </span>
            </div>
          </div>
        </div>

        {/* 滚动提示 */}
        {/* <div 
          className={`flex justify-center mt-20 transition-all duration-700 delay-[600ms] ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <div className="flex flex-col items-center gap-3 text-gray-500 animate-bounce">
            <span className="text-sm font-medium">Scroll to explore</span>
            <div className="w-6 h-10 border-2 border-gray-600 rounded-full flex justify-center pt-2">
              <div className="w-1 h-2 bg-gray-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div> */}
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}
