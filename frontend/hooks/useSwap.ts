/**
 * Uniswap V3 Swap Hook
 * 执行 token swap 交易
 */

import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { type Address, parseUnits } from "viem";
import { SWAP_ROUTER_ADDRESS, SWAP_ROUTER_ABI } from "@/lib/contracts/swap-router";
import type { Token } from "@/lib/types/token";

interface UseSwapParams {
  tokenIn: Token | null;
  tokenOut: Token | null;
  amountIn: string;
  amountOutMin: string; // 已包含滑点计算的最小输出
  poolFee: number; // Pool fee tier (500, 3000, 10000)
}

export function useSwap({
  tokenIn,
  tokenOut,
  amountIn,
  amountOutMin,
  poolFee,
}: UseSwapParams) {
  const { address: userAddress } = useAccount();

  // Swap 交易
  const {
    writeContract: swap,
    data: swapHash,
    isPending: isSwapping,
    error: swapError,
    reset: resetSwap,
  } = useWriteContract();

  // 等待 Swap 交易确认
  const {
    isLoading: isConfirming,
    isSuccess: isSwapSuccess,
    data: receipt,
  } = useWaitForTransactionReceipt({
    hash: swapHash,
  });

  // 执行 Swap
  const executeSwap = async () => {
    if (!tokenIn || !tokenOut || !userAddress) {
      throw new Error("Missing required parameters");
    }

    if (!amountIn || Number.parseFloat(amountIn) <= 0) {
      throw new Error("Invalid amount");
    }

    try {
      // 解析金额
      const amountInWei = parseUnits(amountIn, tokenIn.decimals);
      
      // 计算最小输出（考虑滑点）
      const amountOutMinWei = amountOutMin 
        ? parseUnits(amountOutMin, tokenOut.decimals)
        : BigInt(0); // 如果没有指定，使用 0（不推荐）

      // Deadline: 当前时间 + 20 分钟
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 20);

      console.log("[useSwap] Executing swap:", {
        tokenIn: tokenIn.symbol,
        tokenOut: tokenOut.symbol,
        amountIn,
        amountInWei: amountInWei.toString(),
        amountOutMin,
        amountOutMinWei: amountOutMinWei.toString(),
        poolFee,
        deadline: deadline.toString(),
      });

      // 调用 SwapRouter02 的 exactInputSingle - 正确 await
      await swap({
        address: SWAP_ROUTER_ADDRESS,
        abi: SWAP_ROUTER_ABI,
        functionName: "exactInputSingle",
        args: [
          {
            tokenIn: tokenIn.contractAddress as Address,
            tokenOut: tokenOut.contractAddress as Address,
            fee: poolFee,
            recipient: userAddress,
            amountIn: amountInWei,
            amountOutMinimum: amountOutMinWei,
            sqrtPriceLimitX96: BigInt(0), // 不限制价格范围
          },
        ],
        value: BigInt(0), // 非 ETH 交易
      });
      
      console.log("[useSwap] Transaction submitted, waiting for confirmation...");
    } catch (error) {
      console.error("[useSwap] Error:", error);
      throw error;
    }
  };

  return {
    swap: executeSwap,
    isSwapping: isSwapping || isConfirming,
    isSuccess: isSwapSuccess,
    swapHash,
    receipt,
    error: swapError,
    reset: resetSwap,
  };
}
