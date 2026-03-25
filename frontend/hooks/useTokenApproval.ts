/**
 * Token Approval Hook
 * 用于检查和授权 ERC20 token 给 Uniswap SwapRouter
 */

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { type Address, parseUnits } from "viem";
import { ERC20_ABI, SWAP_ROUTER_ADDRESS, MAX_UINT256 } from "@/lib/contracts/swap-router";
import type { Token } from "@/lib/types/token";

export function useTokenApproval(token: Token | null, amount: string, spender?: Address) {
  const { address: userAddress } = useAccount();
  
  // 使用传入的 spender 地址,如果没有则使用默认的 SWAP_ROUTER_ADDRESS
  const spenderAddress = spender || SWAP_ROUTER_ADDRESS;

  // 查询当前授权额度
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: token?.contractAddress as Address,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: userAddress && token ? [userAddress, spenderAddress] : undefined,
    query: {
      enabled: Boolean(userAddress && token),
    },
  });

  // Approve 交易
  const {
    writeContract: approve,
    data: approvalHash,
    isPending: isApproving,
    error: approvalError,
  } = useWriteContract();

  // 等待 Approve 交易确认
  const { isLoading: isConfirming, isSuccess: isApproved } = useWaitForTransactionReceipt({
    hash: approvalHash,
  });

  // 检查是否需要授权
  const needsApproval = () => {
    if (!token || !amount) return false;
    
    // 如果 allowance 还未加载或为 undefined,默认需要授权
    if (allowance === undefined) return true;
    
    try {
      const amountBigInt = parseUnits(amount, token.decimals);
      // 当授权额度小于需要的金额时,需要重新授权
      return allowance < amountBigInt;
    } catch {
      return false;
    }
  };

  // 执行授权（使用无限授权以减少用户交互）
  const handleApprove = async () => {
    if (!token) {
      throw new Error("Token not selected");
    }

    console.log("[useTokenApproval] Approving token:", token.symbol, "to spender:", spenderAddress);
    
    await approve({
      address: token.contractAddress as Address,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [spenderAddress, MAX_UINT256],
    });
    
    console.log("[useTokenApproval] Approval transaction submitted");
  };

  return {
    allowance,
    needsApproval: needsApproval(),
    approve: handleApprove,
    isApproving: isApproving || isConfirming,
    isApproved,
    approvalError,
    refetchAllowance,
  };
}
