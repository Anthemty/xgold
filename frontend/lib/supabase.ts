import { createClient } from "@supabase/supabase-js";

// 使用默认值避免构建时崩溃，运行时会使用真实环境变量
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface MarketData {
  id: string;
  asset_symbol: string;
  price_usd: number;
  change_24h?: number;
  change_pct_24h?: number;
  market_cap?: number;
  volume_24h?: number;
  updated_at?: string;
  total_supply?: number;
  circulating_supply?: number;
  holders_count?: number;
  tvl?: number;
  high_24h?: number;
  low_24h?: number;
  ath?: number;
  ath_date?: string;
  atl?: number;
  atl_date?: string;
}

export interface PriceHistory {
  id: string;
  asset_symbol: string;
  price_usd: number;
  timestamp: string;
  timeframe: string;
  created_at?: string;
  open_price?: number;
  high_price?: number;
  low_price?: number;
  close_price?: number;
}

export interface PlatformMetrics {
  id: string;
  metric_key: string;
  numeric_value?: number;
  updated_at?: string;
}
