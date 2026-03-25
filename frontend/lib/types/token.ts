export interface Token {
  id: string;
  symbol: string;
  name: string;
  description?: string;

  // UI 显示
  iconUrl: string; // "/tokens/paxg.svg"
  gradientClass: string; // "from-amber-400 to-yellow-600"

  // 合约信息
  contractAddress: `0x${string}`;
  decimals: number;

  // 预言机
  oracleType: "chainlink" | "pyth" | "fixed";
  oracleAddress?: `0x${string}`;
  oracleDecimals?: number;
  fixedPriceUsd?: number;

  // 功能
  isTradable: boolean;
  isStakeable: boolean;
  isActive: boolean;

  // Swap 配置
  minSwapAmount?: string;
  maxSwapAmount?: string;
  swapFeePercentage?: string;

  // Stake 配置
  minStakeAmount?: string;
  stakeApy?: string;
  lockPeriodDays?: number;

  // 元数据
  websiteUrl?: string;
  coingeckoId?: string;
  sortOrder: number;
}

// 数据库原始数据类型（snake_case）
export interface TokenRow {
  id: string;
  symbol: string;
  name: string;
  description?: string;
  icon_url: string;
  gradient_class?: string;
  contract_address: string;
  decimals: number;
  oracle_type: "chainlink" | "pyth" | "fixed";
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
  created_at: string;
  updated_at: string;
}
