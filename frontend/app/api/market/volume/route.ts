import { NextResponse } from "next/server";
import type { VolumeData } from "@/lib/market/types";

export async function GET() {
  // 模拟全球黄金交易量数据
  const volumeData: VolumeData = {
    total: 187.5, // 24小时全球总交易量 (十亿美元)
    change: 12.3, // 相比昨天的变化百分比

    // 交易量分布（按市场类型）
    distribution: [
      {
        name: "OTC Markets",
        value: 45.2,
        amount: 84.7,
        color: "from-yellow-500 to-amber-600",
      },
      {
        name: "COMEX Futures",
        value: 28.7,
        amount: 53.8,
        color: "from-blue-500 to-cyan-600",
      },
      {
        name: "London Bullion",
        value: 18.4,
        amount: 34.5,
        color: "from-purple-500 to-pink-600",
      },
      {
        name: "Shanghai Gold",
        value: 5.3,
        amount: 9.9,
        color: "from-green-500 to-emerald-600",
      },
      {
        name: "Digital Gold",
        value: 2.4,
        amount: 4.6,
        color: "from-orange-500 to-red-600",
      },
    ],

    // 顶级交易市场
    topMarkets: [
      {
        name: "CME Group (COMEX)",
        volume: 53.8,
        change: 15.6,
      },
      {
        name: "London Bullion Market",
        volume: 34.5,
        change: 8.9,
      },
      {
        name: "Shanghai Gold Exchange",
        volume: 9.9,
        change: -3.2,
      },
      {
        name: "Dubai Gold & Commodities",
        volume: 7.2,
        change: 22.4,
      },
      {
        name: "Tokyo Commodity Exchange",
        volume: 5.6,
        change: 4.7,
      },
    ],

    // 链上黄金代币交易量
    onChain: [
      {
        token: "PAXG",
        volume24h: 2847.3,
        volume7d: 18956.2,
      },
      {
        token: "XAUT",
        volume24h: 1653.8,
        volume7d: 11247.5,
      },
      {
        token: "PMGT",
        volume24h: 89.5,
        volume7d: 623.4,
      },
      {
        token: "GLC",
        volume24h: 34.2,
        volume7d: 248.7,
      },
    ],
  };

  return NextResponse.json(volumeData);
}
