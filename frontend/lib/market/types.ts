export interface GoldPriceData {
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

export interface TokenData {
  symbol: string;
  name: string;
  price: number;
  change_24h: number;
  change_percentage: number;
  volume_24h: number;
  market_cap: number;
  tvl?: number;
  supply?: number;
  holders?: number;
  premium?: number;
}

export interface AssetData {
  symbol: string;
  name: string;
  color: string;
  h24: number;
  d7: number;
  m1: number;
  ytd: number;
  y1: number;
}

export interface PlatformMetrics {
  gold_tokens_market_cap: number;
  gold_tokens_market_cap_change: number;
  total_token_holders: number;
  total_token_holders_change: number;
  gold_tokens_volume_24h: number;
  gold_tokens_volume_24h_change: number;
  total_investors: number;
  platform_rating: number;
}

export interface VolumeData {
  total: number;
  change: number;
  distribution: Array<{
    name: string;
    value: number;
    amount: number;
    color: string;
  }>;
  topMarkets: Array<{
    name: string;
    volume: number;
    change: number;
  }>;
  onChain: Array<{
    token: string;
    volume24h: number;
    volume7d: number;
  }>;
}
