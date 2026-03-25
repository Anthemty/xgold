import { useEffect, useState } from "react";
import { useReadContract } from "wagmi";
import type { Token } from "@/lib/types/token";

// Uniswap V3 Pool 合约 ABI - 直接读取 slot0 获取当前价格
const POOL_ABI = [
  {
    inputs: [],
    name: "slot0",
    outputs: [
      { name: "sqrtPriceX96", type: "uint160" },
      { name: "tick", type: "int24" },
      { name: "observationIndex", type: "uint16" },
      { name: "observationCardinality", type: "uint16" },
      { name: "observationCardinalityNext", type: "uint16" },
      { name: "feeProtocol", type: "uint8" },
      { name: "unlocked", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "token0",
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "token1",
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

interface UniswapV3PriceConfig {
  poolAddress: `0x${string}`;
  fee: number;
}

/**
 * 从 Uniswap V3 Pool 获取实时价格
 * 直接读取 Pool 的 slot0 获取 sqrtPriceX96，然后转换为价格
 */
export function useUniswapV3Price(
  tokenIn?: Token,
  tokenOut?: Token,
  _amountIn = "1",
  config?: UniswapV3PriceConfig
) {
  const [price, setPrice] = useState<number | null>(null);

  // 如果没有配置或地址无效，直接返回
  const isEnabled = !!(
    config && 
    tokenIn && 
    tokenOut && 
    config.poolAddress !== "0x0000000000000000000000000000000000000000"
  );

  // 读取 Pool 的 slot0
  const { data: slot0Data, isLoading, error } = useReadContract({
    address: config?.poolAddress,
    abi: POOL_ABI,
    functionName: "slot0",
    query: {
      enabled: isEnabled,
      refetchInterval: 12000, // 每 12 秒更新一次价格
    },
  });

  // 读取 token0 地址用于确定价格方向
  const { data: token0Address } = useReadContract({
    address: config?.poolAddress,
    abi: POOL_ABI,
    functionName: "token0",
    query: {
      enabled: isEnabled,
    },
  });

  // 调试和价格计算
  useEffect(() => {
    if (config && tokenIn && tokenOut) {
      console.log(`\n[useUniswapV3Price] ========== 价格获取 ==========`);
      console.log(`[useUniswapV3Price] 交易对: ${tokenIn.symbol}/${tokenOut.symbol}`);
      console.log(`[useUniswapV3Price] Pool: ${config.poolAddress}, Fee: ${config.fee}`);
      console.log(`[useUniswapV3Price] isEnabled: ${isEnabled}`);
      console.log(`[useUniswapV3Price] slot0Data:`, slot0Data);
      if (slot0Data) {
        console.log(`[useUniswapV3Price] sqrtPriceX96:`, (slot0Data as readonly unknown[])[0]);
      }
      console.log(`[useUniswapV3Price] token0Address:`, token0Address);
      console.log(`[useUniswapV3Price] tokenIn.address:`, tokenIn.contractAddress);
      console.log(`[useUniswapV3Price] tokenIn.decimals:`, tokenIn.decimals);
      console.log(`[useUniswapV3Price] tokenOut.decimals:`, tokenOut.decimals);
      console.log(`[useUniswapV3Price] error:`, error);
      console.log(`[useUniswapV3Price] =====================================\n`);
    }
    
    // 价格计算
    console.log(`[useUniswapV3Price] 🔍 检查价格计算条件:`);
    console.log(`  slot0Data: ${!!slot0Data}`);
    console.log(`  tokenIn: ${!!tokenIn}`);
    console.log(`  tokenOut: ${!!tokenOut}`);
    console.log(`  token0Address: ${!!token0Address}`);
    
    if (!slot0Data || !tokenIn || !tokenOut || !token0Address) {
      console.log(`[useUniswapV3Price] ❌ 条件不满足，跳过价格计算`);
      setPrice(null);
      return;
    }

    console.log(`[useUniswapV3Price] ✅ 开始计算价格...`);
    
    try {
      // slot0 返回 [sqrtPriceX96, tick, ...]
      const sqrtPriceX96 = (slot0Data as readonly [bigint, ...unknown[]])[0];
      
      console.log(`[useUniswapV3Price] sqrtPriceX96: ${sqrtPriceX96}`);
      
      // 确定 tokenIn 是 token0 还是 token1
      const isToken0In = tokenIn.contractAddress.toLowerCase() === (token0Address as string).toLowerCase();
      
      // Uniswap V3 价格公式:
      // price_token1_per_token0 = (sqrtPriceX96 / 2^96) ^ 2
      
      const Q96 = 2 ** 96;
      const sqrtPrice = Number(sqrtPriceX96) / Q96;
      const rawPrice = sqrtPrice * sqrtPrice;
      
      console.log(`[useUniswapV3Price] sqrtPrice: ${sqrtPrice}`);
      console.log(`[useUniswapV3Price] rawPrice (token1/token0): ${rawPrice}`);
      
      // 计算价格
      let calculatedPrice: number;
      
      // 关键修复: 为了避免精度问题,我们需要分开处理 decimals 的调整
      // 不要直接用 10^(decimals_in - decimals_out),因为当差值很大时(如 -12)
      // JavaScript Number 会损失精度
      
      if (isToken0In) {
        // 求 token0 -> token1 的价格
        // rawPrice 是 token1/token0 的原始比率(未调整decimals)
        console.log(`[useUniswapV3Price] token0 -> token1`);
        
        // 分步调整 decimals 以避免精度丢失
        if (tokenIn.decimals >= tokenOut.decimals) {
          // 例如: PAXG(18) -> USDC(6), 需要 × 10^12
          const decimalAdjustment = 10 ** (tokenIn.decimals - tokenOut.decimals);
          calculatedPrice = rawPrice * decimalAdjustment;
          console.log(`[useUniswapV3Price] decimals向上调整: ${rawPrice} × 10^${tokenIn.decimals - tokenOut.decimals} = ${calculatedPrice}`);
        } else {
          // 例如: XAUT(6) -> PAXG(18), 需要 ÷ 10^12
          const decimalAdjustment = 10 ** (tokenOut.decimals - tokenIn.decimals);
          calculatedPrice = rawPrice / decimalAdjustment;
          console.log(`[useUniswapV3Price] decimals向下调整: ${rawPrice} ÷ 10^${tokenOut.decimals - tokenIn.decimals} = ${calculatedPrice}`);
        }
      } else {
        // 求 token1 -> token0 的价格（取倒数）
        console.log(`[useUniswapV3Price] token1 -> token0`);
        
        // 先取倒数,再调整 decimals
        const invertedPrice = 1 / rawPrice;
        
        if (tokenIn.decimals >= tokenOut.decimals) {
          const decimalAdjustment = 10 ** (tokenIn.decimals - tokenOut.decimals);
          calculatedPrice = invertedPrice * decimalAdjustment;
          console.log(`[useUniswapV3Price] decimals向上调整: (1/${rawPrice}) × 10^${tokenIn.decimals - tokenOut.decimals} = ${calculatedPrice}`);
        } else {
          const decimalAdjustment = 10 ** (tokenOut.decimals - tokenIn.decimals);
          calculatedPrice = invertedPrice / decimalAdjustment;
          console.log(`[useUniswapV3Price] decimals向下调整: (1/${rawPrice}) ÷ 10^${tokenOut.decimals - tokenIn.decimals} = ${calculatedPrice}`);
        }
      }
      
      // 检查价格是否合理
      if (calculatedPrice === 0 || !Number.isFinite(calculatedPrice)) {
        console.error(`[useUniswapV3Price] ⚠️ 价格计算结果异常: ${calculatedPrice}`);
        console.error(`  rawPrice: ${rawPrice}`);
        console.error(`  tokenIn: ${tokenIn.symbol} (${tokenIn.decimals} decimals)`);
        console.error(`  tokenOut: ${tokenOut.symbol} (${tokenOut.decimals} decimals)`);
        setPrice(null);
        return;
      }
      
      setPrice(calculatedPrice);
      
      console.log(`[useUniswapV3Price] 💰 价格计算完成:`);
      console.log(`  ${tokenIn.symbol} -> ${tokenOut.symbol}: ${calculatedPrice.toFixed(2)}`);
      console.log(`  sqrtPriceX96: ${sqrtPriceX96.toString()}`);
      console.log(`  isToken0In: ${isToken0In}`);
      console.log(`  ${tokenIn.decimals} decimals -> ${tokenOut.decimals} decimals`);
      console.log(`  最终价格: 1 ${tokenIn.symbol} = ${calculatedPrice.toFixed(2)} ${tokenOut.symbol}`);
    } catch (err) {
      console.error("[useUniswapV3Price] 💥 价格计算错误:", err);
      setPrice(null);
    }
  }, [config, tokenIn, tokenOut, isEnabled, slot0Data, token0Address, error]);

  return {
    price,
    loading: isLoading,
    slot0Data,
  };
}
