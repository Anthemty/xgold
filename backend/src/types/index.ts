// =====================
// Gold API
// =====================

export interface GoldApiResponse {
  timestamp: number;
  metal: string;
  currency: string;
  exchange: string;
  symbol: string;
  prev_close_price: number;
  open_price: number;
  low_price: number;
  high_price: number;
  open_time: number;
  price: number;
  ch: number;
  chp: number;
  ask: number;
  bid: number;
  price_gram_24k: number;
  price_gram_22k: number;
  price_gram_21k: number;
  price_gram_18k: number;
}

export interface GoldApiErrorResponse {
  error: string;
}

export type GoldMetalSymbol = "XAU" | "XAG" | "XPT" | "XPD";

// =====================
// Market Data
// =====================

export interface MarketData {
  id?: string;
  asset_symbol: string;
  price_usd: number;
  change_24h: number;
  change_pct_24h: number;
  open_price: number;
  high_24h: number;
  low_24h: number;
  prev_close_price: number;
  ask?: number;
  bid?: number;
  price_gram_24k?: number;
  updated_at?: string;
}

// =====================
// Price History
// =====================

export interface PriceHistory {
  id?: string;
  asset_symbol: string;
  price_usd: number;
  open_price: number;
  high_price: number;
  low_price: number;
  close_price: number;
  timeframe: PriceTimeframe;
  timestamp: string;
  created_at?: string;
}

export type PriceTimeframe = "1h" | "4h" | "1d" | "1w";

// =====================
// Platform Metrics
// =====================

export interface PlatformMetric {
  id?: string;
  metric_key: string;
  numeric_value: number;
  updated_at?: string;
}

export type PlatformMetricKey =
  | "gold_tokens_market_cap"
  | "gold_tokens_market_cap_change"
  | "total_token_holders"
  | "total_token_holders_change"
  | "gold_tokens_volume_24h"
  | "gold_tokens_volume_24h_change";

// =====================
// Token
// =====================

export interface Token {
  id: string;
  symbol: string;
  name: string;
  description?: string;
  icon_url: string;
  gradient_class?: string;
  contract_address: string;
  decimals: number;
  oracle_type?: "chainlink" | "pyth" | "fixed";
  oracle_address?: string;
  oracle_decimals?: number;
  fixed_price_usd?: string;
  is_tradable: boolean;
  is_stakeable: boolean;
  is_active: boolean;
  min_swap_amount?: string;
  max_swap_amount?: string;
  swap_fee_percentage?: string;
  min_stake_amount?: string;
  stake_apy?: string;
  lock_period_days?: number;
  website_url?: string;
  coingecko_id?: string;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

// =====================
// API Response
// =====================

export interface ApiSuccess<T> {
  data: T;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// =====================
// Job
// =====================

export interface SyncResult {
  success: boolean;
  symbol: string;
  priceUsd?: number;
  error?: string;
  syncedAt: string;
}
