"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTokens } from "@/hooks/useTokens";

const pools = [
  {
    id: 1,
    name: "GXAU-USDT",
    tokens: ["GXAU", "USDT"],
    gradients: ["from-yellow-400 to-amber-600", "from-green-500 to-emerald-600"],
    tvl: "12,500,000",
    volume24h: "2,340,000",
    fees24h: "7,020",
    apr: "45.2",
    type: "V2",
  },
  {
    id: 2,
    name: "XAUT-USDT",
    tokens: ["XAUT", "USDT"],
    gradients: ["from-yellow-500 to-orange-500", "from-green-500 to-emerald-600"],
    tvl: "8,750,000",
    volume24h: "1,890,000",
    fees24h: "5,670",
    apr: "38.5",
    type: "V2",
  },
  {
    id: 3,
    name: "PAXG-USDT",
    tokens: ["PAXG", "USDT"],
    gradients: ["from-amber-400 to-yellow-600", "from-green-500 to-emerald-600"],
    tvl: "5,200,000",
    volume24h: "980,000",
    fees24h: "2,940",
    apr: "42.3",
    type: "V2",
  },
];

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("tvl");
  const [filterType, setFilterType] = useState("all");
  const [activeTab, setActiveTab] = useState("pools");
  
  // 从数据库获取 tokens
  const { tokens: dbTokens, loading: tokensLoading, error: tokensError } = useTokens();

  // 创建 token symbol 到 iconUrl 的映射
  const tokenIconMap = (dbTokens || []).reduce((acc, token) => {
    acc[token.symbol] = token.iconUrl;
    return acc;
  }, {} as Record<string, string>);

  // 使用数据库 tokens 并添加临时的 UI 数据
  const tokensWithUIData = (dbTokens || []).map((token) => ({
    ...token,
    gradient: token.symbol === "gXAU" 
      ? "from-yellow-400 to-amber-600"
      : token.symbol === "XAUT"
      ? "from-yellow-500 to-orange-500"
      : token.symbol === "PAXG"
      ? "from-amber-400 to-yellow-600"
      : "from-green-500 to-emerald-600",
    price: token.fixedPriceUsd || 0,
    change24h: Math.random() * 20 - 10, // 临时模拟数据
  }));

  // 更新 pools 数据，使用数据库中的 iconUrls
  const poolsWithDynamicIcons = pools.map((pool) => ({
    ...pool,
    iconUrls: pool.tokens.map((symbol) => tokenIconMap[symbol] || `/tokens/${symbol.toLowerCase()}.svg`),
  }));

  const filteredPools = poolsWithDynamicIcons
    .filter((pool) => {
      const matchesSearch = pool.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === "all" || pool.type === filterType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "tvl":
          return parseFloat(b.tvl.replace(/,/g, "")) - parseFloat(a.tvl.replace(/,/g, ""));
        case "volume":
          return (
            parseFloat(b.volume24h.replace(/,/g, "")) - parseFloat(a.volume24h.replace(/,/g, ""))
          );
        case "apr":
          return parseFloat(b.apr) - parseFloat(a.apr);
        default:
          return 0;
      }
    });

  const filteredTokens = tokensWithUIData.filter(
    (token) =>
      token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 mb-2">
            Explore Markets
          </h1>
          <p className="text-amber-200/60">Discover gold-backed token liquidity pools</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-slate-900/80 to-slate-950/80 backdrop-blur-xl border-amber-500/20 shadow-lg shadow-amber-500/5">
            <CardContent className="p-4">
              <div className="text-amber-200/60 text-xs mb-1">Total Liquidity</div>
              <div className="text-2xl font-bold text-amber-100">$26.45M</div>
              <div className="text-green-400 text-xs mt-1">+8.2%</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-900/80 to-slate-950/80 backdrop-blur-xl border-amber-500/20 shadow-lg shadow-amber-500/5">
            <CardContent className="p-4">
              <div className="text-amber-200/60 text-xs mb-1">24h Volume</div>
              <div className="text-2xl font-bold text-amber-100">$5.21M</div>
              <div className="text-green-400 text-xs mt-1">+15.3%</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-900/80 to-slate-950/80 backdrop-blur-xl border-amber-500/20 shadow-lg shadow-amber-500/5">
            <CardContent className="p-4">
              <div className="text-amber-200/60 text-xs mb-1">24h Fees</div>
              <div className="text-2xl font-bold text-amber-100">$15.6K</div>
              <div className="text-green-400 text-xs mt-1">+12.1%</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-900/80 to-slate-950/80 backdrop-blur-xl border-amber-500/20 shadow-lg shadow-amber-500/5">
            <CardContent className="p-4">
              <div className="text-amber-200/60 text-xs mb-1">Total Pools</div>
              <div className="text-2xl font-bold text-amber-100">3</div>
              <div className="text-amber-200/40 text-xs mt-1">Gold tokens only</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-amber-500/20">
          <button
            type="button"
            onClick={() => setActiveTab("pools")}
            className={`px-4 py-2 font-semibold transition-colors border-b-2 ${
              activeTab === "pools"
                ? "text-amber-300 border-amber-500"
                : "text-amber-200/40 border-transparent hover:text-amber-300"
            }`}
          >
            Pools
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("tokens")}
            className={`px-4 py-2 font-semibold transition-colors border-b-2 ${
              activeTab === "tokens"
                ? "text-amber-300 border-amber-500"
                : "text-amber-200/40 border-transparent hover:text-amber-300"
            }`}
          >
            Tokens
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Search pools or tokens..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-800/50 border-amber-500/20 text-amber-100 placeholder:text-amber-200/30 focus:border-amber-500/50"
            />
          </div>

          {activeTab === "pools" && (
            <>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-48 bg-slate-800/50 border-amber-500/20 text-amber-100">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-amber-500/30 text-amber-100">
                  <SelectItem value="tvl">TVL (High to Low)</SelectItem>
                  <SelectItem value="volume">Volume (High to Low)</SelectItem>
                  <SelectItem value="apr">APR (High to Low)</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full md:w-32 bg-slate-800/50 border-amber-500/20 text-amber-100">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-amber-500/30 text-amber-100">
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="V2">V2</SelectItem>
                  <SelectItem value="V3">V3</SelectItem>
                </SelectContent>
              </Select>
            </>
          )}
        </div>

        {/* Content */}
        {activeTab === "pools" ? (
          <div className="space-y-3">
            {filteredPools.map((pool) => (
              <Card
                key={pool.id}
                className="bg-gradient-to-br from-slate-900/60 to-slate-950/60 backdrop-blur-xl border-amber-500/20 hover:border-amber-400/40 transition-all cursor-pointer hover:shadow-lg hover:shadow-amber-500/10"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Pool Info */}
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <div className="flex -space-x-2">
                        <div className="w-10 h-10 bg-slate-800/50 flex items-center justify-center flex-shrink-0 overflow-hidden border-2 border-slate-900 shadow-lg">
                          <Image
                            src={pool.iconUrls[0]}
                            alt={pool.tokens[0]}
                            width={32}
                            height={32}
                            className="w-full h-full object-contain scale-[0.7]"
                          />
                        </div>
                        <div className="w-10 h-10 bg-slate-800/50 flex items-center justify-center flex-shrink-0 overflow-hidden border-2 border-slate-900 shadow-lg">
                          <Image
                            src={pool.iconUrls[1]}
                            alt={pool.tokens[1]}
                            width={32}
                            height={32}
                            className="w-full h-full object-contain scale-[0.7]"
                          />
                        </div>
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-lg font-bold text-amber-100">{pool.name}</h3>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs px-2 py-0.5 rounded ${
                              pool.type === "V3"
                                ? "bg-purple-500/20 text-purple-400"
                                : "bg-blue-500/20 text-blue-400"
                            }`}
                          >
                            {pool.type}
                          </span>
                          <span className="text-xs text-amber-200/40">0.3% Fee</span>
                        </div>
                      </div>
                    </div>

                    {/* Pool Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                      <div>
                        <div className="text-xs text-amber-200/60 mb-1">TVL</div>
                        <div className="text-sm font-semibold text-amber-100">${pool.tvl}</div>
                      </div>
                      <div>
                        <div className="text-xs text-amber-200/60 mb-1">Volume 24h</div>
                        <div className="text-sm font-semibold text-amber-100">
                          ${pool.volume24h}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-amber-200/60 mb-1">Fees 24h</div>
                        <div className="text-sm font-semibold text-green-400">${pool.fees24h}</div>
                      </div>
                      <div>
                        <div className="text-xs text-amber-200/60 mb-1">APR</div>
                        <div className="text-sm font-semibold text-yellow-400">{pool.apr}%</div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 hover:from-yellow-400 hover:via-amber-400 hover:to-yellow-500 text-slate-900 shrink-0 font-semibold shadow-lg shadow-amber-500/20"
                    >
                      Add Liquidity
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredPools.length === 0 && (
              <div className="text-center py-12 text-amber-200/40">
                <div className="text-6xl mb-4">🔍</div>
                <p>No pools found</p>
              </div>
            )}
          </div>
        ) : tokensLoading ? (
          <div className="text-center py-12 text-amber-200/40">
            <div className="text-6xl mb-4">⏳</div>
            <p>Loading tokens...</p>
          </div>
        ) : tokensError ? (
          <div className="text-center py-12 text-red-400/60">
            <div className="text-6xl mb-4">⚠️</div>
            <p>Failed to load tokens</p>
            <p className="text-sm mt-2">{tokensError.message}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredTokens.map((token) => (
              <Card
                key={token.symbol}
                className="bg-gradient-to-br from-slate-900/60 to-slate-950/60 backdrop-blur-xl border-amber-500/20 hover:border-amber-400/40 transition-all cursor-pointer hover:shadow-lg hover:shadow-amber-500/10"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-slate-800/50 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-lg">
                        <Image
                          src={token.iconUrl}
                          alt={token.symbol}
                          width={48}
                          height={48}
                          className="w-full h-full object-contain scale-[0.7]"
                        />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-amber-100">{token.symbol}</h3>
                        <p className="text-sm text-amber-200/50">{token.name}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-baseline">
                      <span className="text-sm text-amber-200/60">Price</span>
                      <span className="text-xl font-bold text-amber-100">
                        ${token.price.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-amber-200/60">24h Change</span>
                      <span
                        className={`text-sm font-semibold ${
                          token.change24h >= 0 ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {token.change24h >= 0 ? "+" : ""}
                        {token.change24h.toFixed(2)}%
                      </span>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    className="w-full mt-4 bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 hover:from-yellow-400 hover:via-amber-400 hover:to-yellow-500 text-slate-900 font-semibold shadow-lg shadow-amber-500/20"
                  >
                    Trade
                  </Button>
                </CardContent>
              </Card>
            ))}

            {filteredTokens.length === 0 && (
              <div className="col-span-full text-center py-12 text-amber-200/40">
                <div className="text-6xl mb-4">🔍</div>
                <p>No tokens found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
