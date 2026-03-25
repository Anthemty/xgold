import type { Metadata } from "next";
import { MarketOverview } from "@/components/market/MarketOverview";

// 强制动态渲染，因为组件依赖客户端数据获取
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Market Overview | GOX",
  description:
    "Real-time gold market data, PAXG & XAUT analytics, and global trading volume insights",
};

export default function MarketPage() {
  return <MarketOverview />;
}
