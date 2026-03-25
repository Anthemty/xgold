/**
 * Uniswap V3 Pool 配置
 * 
 * 每个交易对需要配置其对应的 Pool 地址
 */

export interface PoolConfig {
  // Pool 地址
  poolAddress: `0x${string}`;
  // 费率（例如 500 表示 0.05%, 3000 表示 0.3%）
  fee: number;
}

export interface UniswapV3Config {
  // Pool 配置（trading pair -> pool config）
  pools: Record<string, PoolConfig>;
}

// Ethereum 主网配置 (Chain ID: 1)
export const uniswapV3Config: UniswapV3Config = {
  pools: {
    // 1. GXAU-USDT Pool
    "GXAU-USDT": {
      poolAddress: "0x0000000000000000000000000000000000000000", // TODO: 需要创建或找到 Pool
      fee: 3000, // 0.3%
    },
    
    // 2. XAUT-USDT Pool (0.05% fee tier)
    // 这是最大的 XAUT/USDT 流动性池
    "XAUT-USDT": {
      poolAddress: "0x6546055f46e866a4B9a4A13e81273e3152BAE5dA",
      fee: 500, // 0.05%
    },
    
    // 3. PAXG-XAUT Pool
    "PAXG-XAUT": {
      poolAddress: "0xed7ef9a9a05a48858a507c080def0405ad1eaa3e", // TODO: 需要找到实际的 Pool 地址
      fee: 500, // 0.05%
    },
    
    // 4. PAXG-USDC Pool
    "PAXG-USDC": {
      poolAddress: "0x5ae13baaef0620fdae1d355495dc51a17adb4082",
      fee: 500, // 0.05% (与 XAUT/USDT 相同)
    },
  },
};

/**
 * 允许的交易对列表
 * 格式: [token0Symbol, token1Symbol]
 */
export const ALLOWED_TRADING_PAIRS: [string, string][] = [
  ["GXAU", "USDT"],
  ["XAUT", "USDT"],
  ["PAXG", "XAUT"],
  ["PAXG", "USDC"],
];

/**
 * 检查交易对是否被允许
 */
export function isAllowedTradingPair(token0Symbol: string, token1Symbol: string): boolean {
  const t0 = token0Symbol.toUpperCase();
  const t1 = token1Symbol.toUpperCase();
  
  return ALLOWED_TRADING_PAIRS.some(
    ([a, b]) => (a === t0 && b === t1) || (a === t1 && b === t0)
  );
}

/**
 * 获取给定 token 可以交易的所有其他 tokens
 */
export function getAllowedPairTokens(tokenSymbol: string): string[] {
  const symbol = tokenSymbol.toUpperCase();
  const allowedTokens = new Set<string>();
  
  for (const [t0, t1] of ALLOWED_TRADING_PAIRS) {
    if (t0 === symbol) {
      allowedTokens.add(t1);
    } else if (t1 === symbol) {
      allowedTokens.add(t0);
    }
  }
  
  return Array.from(allowedTokens);
}

/**
 * 根据 token symbols 获取 pool 配置
 * 支持大小写不敏感匹配
 */
export function getPoolConfig(token0Symbol: string, token1Symbol: string): PoolConfig | undefined {
  // 转换为大写进行匹配
  const t0 = token0Symbol.toUpperCase();
  const t1 = token1Symbol.toUpperCase();
  
  const key1 = `${t0}-${t1}`;
  const key2 = `${t1}-${t0}`;
  
  return uniswapV3Config.pools[key1] || uniswapV3Config.pools[key2];
}
