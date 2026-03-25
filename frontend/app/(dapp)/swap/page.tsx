"use client";

import { useAppKit } from "@reown/appkit/react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAccount, useReadContract, useSendTransaction, useWaitForTransactionReceipt } from "wagmi";
import { type Address, formatUnits } from "viem";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useSwapTokens } from "@/hooks/useTokens";
import { useTokenApproval } from "@/hooks/useTokenApproval";
import { ERC20_ABI } from "@/lib/contracts/swap-router";
import { get1inchQuote, get1inchSwap, ONEINCH_ROUTER, type OneInchQuote } from "@/lib/1inch";
import { supabase } from "@/lib/supabase";
import type { Token } from "@/lib/types/token";

export default function SwapPage() {
  const { tokens, loading: tokensLoading } = useSwapTokens();
  const [sellToken, setSellToken] = useState<Token | null>(null);
  const [buyToken, setBuyToken] = useState<Token | null>(null);
  const [sellAmount, setSellAmount] = useState("");
  const [buyAmount, setBuyAmount] = useState("");
  const [isSelectingToken, setIsSelectingToken] = useState<"sell" | "buy" | null>(null);
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successTxHash, setSuccessTxHash] = useState<string | null>(null);
  
  // 1inch Quote 状态
  const [oneInchQuote, setOneInchQuote] = useState<OneInchQuote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  
  // 交易进度模态框
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [progressStep, setProgressStep] = useState<'approve' | 'swap' | 'success' | 'error'>('approve');
  const [progressMessage, setProgressMessage] = useState("");
  const [progressTxHash, setProgressTxHash] = useState<string | null>(null);
  
  const { isConnected, address: userAddress, chainId } = useAccount();
  const { open } = useAppKit();

  // 存储从 market_data 表查询的实时 USD 价格
  const [marketPrices, setMarketPrices] = useState<Record<string, number>>({});

  // 查询 Sell Token 余额
  const { data: sellTokenBalance, refetch: refetchSellBalance } = useReadContract({
    address: sellToken?.contractAddress as Address,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: Boolean(userAddress && sellToken),
    },
  });

  // 查询 Buy Token 余额
  const { data: buyTokenBalance, refetch: refetchBuyBalance } = useReadContract({
    address: buyToken?.contractAddress as Address,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: Boolean(userAddress && buyToken),
    },
  });

  // 格式化余额显示
  const formatBalance = (balance: bigint | undefined, decimals: number) => {
    if (!balance) return "0.0";
    const formatted = formatUnits(balance, decimals);
    const num = Number.parseFloat(formatted);
    if (num === 0) return "0.0";
    if (num < 0.0001) return "< 0.0001";
    return num.toFixed(4);
  };

  // 从 market_data 表查询实时 USD 价格
  useEffect(() => {
    const fetchMarketPrices = async () => {
      try {
        const { data, error } = await supabase
          .from("market_data")
          .select("asset_symbol, price_usd")
          .in("asset_symbol", ["XAUT", "PAXG", "GXAU"]);

        if (error) {
          console.error("[marketPrices] 查询失败:", error);
          return;
        }

        if (data) {
          const prices: Record<string, number> = {};
          for (const row of data) {
            prices[row.asset_symbol] = row.price_usd;
          }
          setMarketPrices(prices);
          console.log("[marketPrices] 实时价格:", prices);
        }
      } catch (err) {
        console.error("[marketPrices] 查询错误:", err);
      }
    };

    fetchMarketPrices();

    // 订阅实时更新
    const channel = supabase
      .channel("market-prices-swap")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "market_data",
          filter: "asset_symbol=in.(XAUT,PAXG,GXAU)",
        },
        () => {
          console.log("[marketPrices] 价格更新，重新查询");
          fetchMarketPrices();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // 初始化默认选择的 tokens (PAXG/USDC)
  useEffect(() => {
    if (tokens && tokens.length > 0 && !sellToken && !buyToken) {
      const paxgToken = tokens.find((t) => t.symbol.toUpperCase() === "PAXG");
      const usdcToken = tokens.find((t) => t.symbol.toUpperCase() === "USDC");
      
      // 优先使用 PAXG/USDC，如果不存在则使用 XAUT/USDT
      if (paxgToken && usdcToken) {
        setSellToken(paxgToken);
        setBuyToken(usdcToken);
      } else {
        const xautToken = tokens.find((t) => t.symbol.toUpperCase() === "XAUT");
        const usdtToken = tokens.find((t) => t.symbol === "USDT");
        setSellToken(xautToken || tokens[0]);
        setBuyToken(usdtToken || tokens[tokens.length - 1]);
      }
    }
  }, [tokens, sellToken, buyToken]);

  // Token Approval Hook - 使用 1inch Router
  const {
    needsApproval,
    approve,
    isApproving,
    isApproved,
    approvalError,
    refetchAllowance,
  } = useTokenApproval(sellToken, sellAmount, ONEINCH_ROUTER as Address);

  // 使用 1inch API 获取报价（带 debounce）
  useEffect(() => {
    if (!sellToken || !buyToken || !sellAmount || Number(sellAmount) <= 0) {
      setOneInchQuote(null);
      setBuyAmount("");
      return;
    }

    setQuoteLoading(true);
    const timer = setTimeout(async () => {
      try {
        const quote = await get1inchQuote(sellToken, buyToken, sellAmount, chainId || 1);
        if (quote) {
          setOneInchQuote(quote);
          // 转换 dstAmount 为可读格式
          const buyAmountFormatted = formatUnits(BigInt(quote.dstAmount), buyToken.decimals);
          setBuyAmount(buyAmountFormatted);
          console.log('[1inch] Quote:', quote);
        } else {
          setOneInchQuote(null);
          setBuyAmount("");
        }
      } catch (error) {
        console.error('[1inch] Quote error:', error);
        setOneInchQuote(null);
        setBuyAmount("");
      } finally {
        setQuoteLoading(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [sellToken, buyToken, sellAmount, chainId]);

  // Swap Transaction
  const {
    sendTransaction,
    data: swapHash,
    isPending: isSwapping,
    error: swapError,
  } = useSendTransaction();

  const {
    isLoading: isSwapConfirming,
    isSuccess: isSwapSuccess,
  } = useWaitForTransactionReceipt({
    hash: swapHash,
  });

  // 监听授权成功后重新检查并刷新 allowance
  useEffect(() => {
    if (isApproved) {
      console.log("[Swap] Token approved successfully, refetching allowance...");
      setProgressStep('success');
      setProgressMessage(`${sellToken?.symbol} approved successfully!`);
      
      // 延迟关闭模态框
      setTimeout(() => {
        setShowProgressModal(false);
        refetchAllowance();
      }, 1500);
    }
  }, [isApproved, refetchAllowance, sellToken]);
  
  // 监听 Approving 状态
  useEffect(() => {
    if (isApproving && !isApproved) {
      setShowProgressModal(true);
      setProgressStep('approve');
      setProgressMessage(`Approving ${sellToken?.symbol}...`);
      setProgressTxHash(null);
    }
  }, [isApproving, isApproved, sellToken]);
  
  // 监听 Swapping 状态
  useEffect(() => {
    if (isSwapping && !isSwapSuccess) {
      setShowProgressModal(true);
      setProgressStep('swap');
      setProgressMessage(`Swapping ${sellAmount} ${sellToken?.symbol} for ${buyToken?.symbol}...`);
      setProgressTxHash(swapHash || null);
    }
  }, [isSwapping, isSwapSuccess, sellAmount, sellToken, buyToken, swapHash]);

  // 监听交易成功
  useEffect(() => {
    if (isSwapSuccess && swapHash) {
      console.log("[Swap] Swap successful!", swapHash);
      
      // 显示成功模态框
      setProgressStep('success');
      setProgressMessage('Swap completed successfully!');
      setProgressTxHash(swapHash);
      
      // 显示成功消息
      setShowSuccessMessage(true);
      setSuccessTxHash(swapHash);
      
      // 清空输入
      setSellAmount("");
      setBuyAmount("");
      setOneInchQuote(null);
      
      // 刷新余额
      refetchSellBalance();
      refetchBuyBalance();
      
      // 2秒后关闭模态框
      setTimeout(() => {
        setShowProgressModal(false);
      }, 2000);
      
      // 3秒后隐藏成功消息
      setTimeout(() => {
        setShowSuccessMessage(false);
        setSuccessTxHash(null);
      }, 3000);
      
      // 延迟刷新 buy balance 以确保链上数据同步
      setTimeout(() => {
        refetchBuyBalance();
        console.log("[Swap] Buy balance refetched after delay");
      }, 3000);
    }
  }, [isSwapSuccess, swapHash, refetchSellBalance, refetchBuyBalance]);

  // 计算兑换率（基于 1inch Quote）
  const getExchangeRate = useCallback(() => {
    if (!sellToken || !buyToken || !oneInchQuote || quoteLoading) {
      return 0;
    }
    
    // 计算兑换率: dstAmount / (sellAmount * 10^sellDecimals)
    if (sellAmount && Number(sellAmount) > 0) {
      const buyAmountNum = Number(formatUnits(BigInt(oneInchQuote.dstAmount), buyToken.decimals));
      const rate = buyAmountNum / Number(sellAmount);
      console.log(`[getExchangeRate] 1inch rate: ${rate}`);
      return rate;
    }
    
    return 0;
  }, [sellToken, buyToken, sellAmount, oneInchQuote, quoteLoading]);

  // 计算 USD 价值（通用方案 - 始终基于实时汇率）
  const getSellUsdValue = () => {
    if (!sellAmount || Number.isNaN(Number(sellAmount)) || !sellToken) return "0.00";
    
    const exchangeRate = getExchangeRate();
    
    console.log(`[getSellUsdValue] Debug:`, {
      sellToken: sellToken.symbol,
      buyToken: buyToken?.symbol,
      sellAmount,
      exchangeRate,
      sellTokenFixed: sellToken.fixedPriceUsd,
      buyTokenFixed: buyToken?.fixedPriceUsd,
      marketPrice: marketPrices[sellToken.symbol],
    });
    
    // 策略1: 如果 sell token 是稳定币(USDC/USDT)，直接计算
    if (sellToken.symbol === "USDC" || sellToken.symbol === "USDT") {
      return (Number(sellAmount) * 1).toFixed(2);
    }
    
    // 策略2: 如果有实时汇率 && buy token 是稳定币，通过汇率计算
    // 这是最准确的方案：sellAmount * exchangeRate * buyTokenUsdPrice
    if (exchangeRate > 0 && buyToken) {
      if (buyToken.symbol === "USDC" || buyToken.symbol === "USDT") {
        // sell token 换成稳定币的数量 * $1
        const stablecoinAmount = Number(sellAmount) * exchangeRate;
        return (stablecoinAmount * 1).toFixed(2);
      }
      
      // 如果 buy token 也不是稳定币，使用 market_data 的实时价格
      if (marketPrices[buyToken.symbol]) {
        const buyTokenAmount = Number(sellAmount) * exchangeRate;
        const usdValue = buyTokenAmount * marketPrices[buyToken.symbol];
        console.log(`[getSellUsdValue] 策略2-market: ${buyTokenAmount} ${buyToken.symbol} × $${marketPrices[buyToken.symbol]} = $${usdValue.toFixed(2)}`);
        return usdValue.toFixed(2);
      }
      
      // 如果 buy token 有固定 USD 价格（后备方案）
      if (buyToken.fixedPriceUsd) {
        const buyTokenAmount = Number(sellAmount) * exchangeRate;
        return (buyTokenAmount * buyToken.fixedPriceUsd).toFixed(2);
      }
    }
    
    // 策略3: 直接使用 sell token 的 market_data 实时价格
    if (marketPrices[sellToken.symbol]) {
      const usdValue = Number(sellAmount) * marketPrices[sellToken.symbol];
      console.log(`[getSellUsdValue] 策略3-market: ${sellAmount} ${sellToken.symbol} × $${marketPrices[sellToken.symbol]} = $${usdValue.toFixed(2)}`);
      return usdValue.toFixed(2);
    }
    
    // 策略4: 后备方案 - 使用 token 的固定价格
    if (sellToken.fixedPriceUsd) {
      return (Number(sellAmount) * sellToken.fixedPriceUsd).toFixed(2);
    }
    
    console.warn(`[getSellUsdValue] 无法计算 USD 价值，所有策略都失败`);
    return "0.00";
  };

  const getBuyUsdValue = () => {
    if (!buyAmount || Number.isNaN(Number(buyAmount)) || !buyToken) return "0.00";
    
    // 策略1: 如果 buy token 是稳定币，直接计算
    if (buyToken.symbol === "USDC" || buyToken.symbol === "USDT") {
      return (Number(buyAmount) * 1).toFixed(2);
    }
    
    // 策略2: 使用 market_data 的实时价格
    if (marketPrices[buyToken.symbol]) {
      const usdValue = Number(buyAmount) * marketPrices[buyToken.symbol];
      console.log(`[getBuyUsdValue] market: ${buyAmount} ${buyToken.symbol} × $${marketPrices[buyToken.symbol]} = $${usdValue.toFixed(2)}`);
      return usdValue.toFixed(2);
    }
    
    // 策略3: 如果 buy token 有固定 USD 价格，使用固定价格
    if (buyToken.fixedPriceUsd) {
      return (Number(buyAmount) * buyToken.fixedPriceUsd).toFixed(2);
    }
    
    // 策略4: 使用 sell 的 USD 价值（交易等价）
    const sellUsd = getSellUsdValue();
    if (sellUsd !== "0.00") {
      return sellUsd;
    }
    
    return "0.00";
  };

  // 计算价格影响
  const getPriceImpact = () => {
    if (!sellAmount || Number.isNaN(Number(sellAmount))) return "0.00";
    const impact = (Number(sellAmount) / 10000) * 100;
    return impact > 5 ? "5.00" : impact.toFixed(2);
  };

  // 计算交易费用 (1inch 会动态优化费用，这里使用估算值)
  const getTradingFee = () => {
    if (!oneInchQuote || !sellAmount) return "0.00";
    // 估算约 0.1% 的总费用 (聚合器费用 + DEX 费用)
    const usdValue = getSellUsdValue();
    const feePercentage = 0.001; // 0.1%
    return (Number(usdValue) * feePercentage).toFixed(2);
  };

  // 计算最小接收量 (应用 1% 滑点)
  const getMinimumReceived = () => {
    if (!buyAmount || Number.isNaN(Number(buyAmount))) return "0";
    const slippage = 0.01; // 1%
    const minAmount = Number(buyAmount) * (1 - slippage);
    return minAmount.toFixed(6);
  };

  const handleSelectToken = (token: Token) => {
    if (isSelectingToken === "sell") {
      setSellToken(token);
    } else if (isSelectingToken === "buy") {
      setBuyToken(token);
    }
    setIsSelectingToken(null);
  };

  const handleSwapTokens = () => {
    const temp = sellToken;
    setSellToken(buyToken);
    setBuyToken(temp);
    const _tempAmount = sellAmount;
    setSellAmount(buyAmount);
  };

  const handleOpenModal = async () => {
    try {
      await open();
    } catch (error) {
      console.error("Error opening modal:", error);
    }
  };

  const handleSellAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setSellAmount(value);
    }
  };

  // 处理交易按钮点击
  const handleSwapClick = async () => {
    if (!isConnected) {
      await handleOpenModal();
      return;
    }

    if (!sellToken || !buyToken || !sellAmount || Number(sellAmount) <= 0 || !userAddress) {
      return;
    }

    try {
      // 如果需要授权，先执行授权
      if (needsApproval) {
        console.log("[Swap] Approving token...");
        await approve();
        return;
      }

      // 执行 1inch Swap
      console.log("[Swap] Executing 1inch swap...");
      const swapData = await get1inchSwap(
        sellToken,
        buyToken,
        sellAmount,
        userAddress,
        1, // 1% slippage
        chainId || 1
      );

      if (!swapData) {
        console.error("[Swap] Failed to get swap data from 1inch");
        setProgressStep('error');
        setProgressMessage('Failed to get swap data');
        setShowProgressModal(true);
        return;
      }

      console.log("[Swap] 1inch swap data:", swapData);

      // 添加 20% gas buffer
      const gasLimit = BigInt(swapData.tx.gas);
      const gasWithBuffer = (gasLimit * BigInt(120)) / BigInt(100);

      // 发送交易
      sendTransaction({
        to: swapData.tx.to as Address,
        data: swapData.tx.data as `0x${string}`,
        value: BigInt(swapData.tx.value),
        gas: gasWithBuffer,
      });
    } catch (error) {
      console.error("[Swap] Error:", error);
      setProgressStep('error');
      setProgressMessage(error instanceof Error ? error.message : 'Swap failed');
      setShowProgressModal(true);
    }
  };

  // 获取按钮文本
  const getButtonText = () => {
    if (!isConnected) return "Connect Wallet";
    if (!sellAmount || Number(sellAmount) <= 0) return "Enter an amount";
    if (quoteLoading) return "Getting quote...";
    if (!oneInchQuote) return "Price unavailable";
    if (isApproving) return "Approving...";
    if (needsApproval) return `Approve ${sellToken?.symbol}`;
    if (isSwapping || isSwapConfirming) return "Swapping...";
    return "Swap";
  };

  // 按钮是否禁用
  const isButtonDisabled = () => {
    if (!isConnected) return false;
    if (!sellAmount || Number(sellAmount) <= 0) return true;
    if (quoteLoading || !oneInchQuote) return true;
    if (isApproving || isSwapping || isSwapConfirming) return true;
    return false;
  };

  // 加载状态
  if (tokensLoading) {
    return (
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-lg mx-auto text-center">
          <div className="text-amber-200/60">Loading tokens...</div>
        </div>
      </main>
    );
  }

  // 没有 tokens 或未初始化
  if (!sellToken || !buyToken) {
    return (
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-lg mx-auto text-center">
          <div className="text-amber-200/60">Initializing...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-20">
      <div className="max-w-lg mx-auto">
        {/* 主卡片 - 黄金渐变边框 + 深色背景 */}
        <Card className="bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-slate-950/95 backdrop-blur-xl border border-amber-500/20 shadow-2xl shadow-amber-500/10">
          <CardHeader className="pb-1">
            <div className="flex justify-between items-center">
              <CardTitle className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 text-2xl font-bold">
                Swap
              </CardTitle>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="text-amber-400/60 hover:text-amber-400 hover:bg-amber-500/10"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <title>Settings</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-2">
            {/* Sell Token - 黄金光晕效果 */}
            <div className="bg-gradient-to-br from-amber-950/30 to-slate-900/30 rounded-2xl p-4 border border-amber-500/20 hover:border-amber-400/40 transition-all shadow-inner">
              <div className="flex justify-between text-sm mb-3">
                <span className="text-amber-200/70 font-medium">Sell</span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">
                    Balance: {isConnected ? formatBalance(sellTokenBalance, sellToken.decimals) : "0.0"}
                  </span>
                  {isConnected && sellTokenBalance && sellTokenBalance > BigInt(0) && (
                    <button
                      type="button"
                      onClick={() => {
                        const maxAmount = formatUnits(sellTokenBalance, sellToken.decimals);
                        setSellAmount(maxAmount);
                      }}
                      className="text-xs font-semibold text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 px-2 py-0.5 rounded transition-all"
                    >
                      MAX
                    </button>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="0"
                  value={sellAmount}
                  onChange={handleSellAmountChange}
                  className="flex-1 bg-transparent border-0 text-3xl text-amber-50 h-12 px-0 placeholder:text-slate-700 font-semibold focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none min-w-0"
                />
                <button
                  type="button"
                  onClick={() => setIsSelectingToken("sell")}
                  className="flex items-center gap-1.5 bg-gradient-to-br from-amber-900/40 to-yellow-900/40 hover:from-amber-800/50 hover:to-yellow-800/50 border border-amber-500/30 hover:border-amber-400/50 px-2.5 py-1.5 rounded-xl transition-all shadow-lg shadow-amber-500/10 flex-shrink-0"
                >
                  <div className="w-5 h-5 rounded-full flex-shrink-0 overflow-hidden flex items-center justify-center">
                    <Image
                      src={sellToken.iconUrl}
                      alt={sellToken.symbol}
                      width={20}
                      height={20}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="font-semibold text-sm text-amber-100 whitespace-nowrap">
                    {sellToken.symbol}
                  </span>
                  <svg
                    className="w-3.5 h-3.5 text-amber-300 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <title>Select token</title>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              </div>
              <div className="text-sm text-amber-400/60 mt-2">≈ ${getSellUsdValue()} USD</div>
            </div>

            {/* Swap Icon - 黄金旋转按钮 */}
            <div className="flex justify-center -my-2 relative z-10">
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={handleSwapTokens}
                className="border-amber-500/30 hover:border-amber-400/60 bg-gradient-to-br from-amber-900/40 to-yellow-900/40 hover:from-amber-800/50 hover:to-yellow-800/50 rounded-lg transition-all hover:rotate-180 duration-500 w-10 h-10 shadow-lg shadow-amber-500/20"
              >
                <svg
                  className="w-5 h-5 text-amber-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <title>Swap direction</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                  />
                </svg>
              </Button>
            </div>

            {/* Buy Token */}
            <div className="bg-gradient-to-br from-slate-900/40 to-slate-950/40 rounded-2xl p-4 border border-slate-700/40 hover:border-slate-600/50 transition-all shadow-inner">
              <div className="flex justify-between text-sm mb-3">
                <span className="text-slate-300 font-medium">Buy</span>
                <span className="text-slate-400">
                  Balance: {isConnected ? formatBalance(buyTokenBalance, buyToken.decimals) : "0.0"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="0"
                  value={buyAmount}
                  disabled
                  className="flex-1 bg-transparent border-0 text-3xl text-white h-12 px-0 placeholder:text-slate-700 font-semibold focus:outline-none min-w-0"
                />
                <button
                  type="button"
                  onClick={() => setIsSelectingToken("buy")}
                  className="flex items-center gap-1.5 bg-slate-800/50 hover:bg-slate-700/60 border border-slate-600/50 hover:border-slate-500/60 px-2.5 py-1.5 rounded-xl transition-all flex-shrink-0"
                >
                  <div className="w-5 h-5 rounded-full flex-shrink-0 overflow-hidden flex items-center justify-center">
                    <Image
                      src={buyToken.iconUrl}
                      alt={buyToken.symbol}
                      width={20}
                      height={20}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="font-semibold text-sm text-white whitespace-nowrap">
                    {buyToken.symbol}
                  </span>
                  <svg
                    className="w-3.5 h-3.5 text-slate-300 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <title>Select token</title>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              </div>
              <div className="text-sm text-slate-500 mt-2">≈ ${getBuyUsdValue()} USD</div>
            </div>

            {/* Swap Button - 黄金渐变 */}
            <Button
              type="button"
              onClick={handleSwapClick}
              disabled={isButtonDisabled()}
              className="w-full bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 hover:from-yellow-400 hover:via-amber-400 hover:to-yellow-500 text-slate-900 font-bold py-4 h-auto text-lg shadow-2xl shadow-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-300"
            >
              {getButtonText()}
            </Button>

            {/* 交易错误提示 */}
            {(approvalError || swapError) && (
              <div className="p-3 bg-red-950/50 border border-red-500/30 rounded-lg">
                <p className="text-red-400 text-sm">
                  {approvalError?.message || swapError?.message || "Transaction failed"}
                </p>
              </div>
            )}

            {/* 交易成功提示 */}
            {showSuccessMessage && successTxHash && (
              <div className="p-3 bg-green-950/50 border border-green-500/30 rounded-lg">
                <p className="text-green-400 text-sm">
                  Swap successful!{" "}
                  <a
                    href={`https://etherscan.io/tx/${successTxHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-green-300"
                  >
                    View on Etherscan
                  </a>
                </p>
              </div>
            )}

            {/* Transaction Details */}
            <div className="mt-4 rounded-lg border border-slate-800/30 overflow-hidden">
              {/* 标题栏 */}
              <button
                type="button"
                onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
                className="w-full px-4 py-2.5 bg-slate-900/10 flex items-center justify-between hover:bg-slate-900/20 transition-colors"
              >
                <span className="text-xs text-slate-500 uppercase tracking-wider">Transaction Details</span>
                <svg
                  className={`w-4 h-4 text-slate-500 transition-transform ${isDetailsExpanded ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  role="img"
                  aria-label="Toggle details"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* 展开内容 */}
              {isDetailsExpanded && (
                <div className="p-4 bg-slate-900/5 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Exchange Rate</span>
                    <span className="text-slate-400 font-medium">
                      {getExchangeRate() > 0 ? (
                        <>1 {sellToken.symbol} = {getExchangeRate().toFixed(6)} {buyToken.symbol}</>
                      ) : (
                        <span className="text-slate-600">--</span>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Price Impact</span>
                    <span
                      className={`font-medium ${Number(getPriceImpact()) > 3 ? "text-red-400/70" : "text-green-400/70"}`}
                    >
                      {getPriceImpact()}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">
                      Trading Fee (est.)
                    </span>
                    <span className="text-slate-400 font-medium">${getTradingFee()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Minimum Received</span>
                    <span className="text-slate-400 font-medium">
                      {getMinimumReceived()} {buyToken.symbol}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        {/* <Card className="mt-6 bg-gradient-to-br from-slate-900/80 to-slate-950/80 backdrop-blur-xl border border-amber-500/10">
          <CardHeader>
            <CardTitle className="text-amber-100 text-lg">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center text-slate-400 py-8">No transactions yet</div>
          </CardContent>
        </Card> */}
      </div>

      {/* Token Selection Dialog - 黄金主题 */}
      <Dialog open={isSelectingToken !== null} onOpenChange={() => setIsSelectingToken(null)}>
        <DialogContent className="bg-gradient-to-br from-slate-900 to-slate-950 border-amber-500/30 text-white shadow-2xl shadow-amber-500/20">
          <DialogHeader>
            <DialogTitle className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-400">
              Select a token
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {tokens?.map((token) => {
              const isCurrentToken = (isSelectingToken === "sell" ? sellToken?.id : buyToken?.id) === token.id;
              
              return (
                <button
                  type="button"
                  key={token.id}
                  onClick={() => !isCurrentToken && handleSelectToken(token)}
                  disabled={isCurrentToken}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    isCurrentToken
                      ? "bg-slate-800/30 border-slate-700/50 cursor-not-allowed opacity-50"
                      : "hover:bg-amber-500/10 border-transparent hover:border-amber-500/30 cursor-pointer"
                  }`}
                >
                  <div className="w-10 h-10 bg-slate-800/50 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    <Image
                      src={token.iconUrl}
                      alt={token.symbol}
                      width={32}
                      height={32}
                      className="w-full h-full object-contain scale-[0.7]"
                    />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-amber-100">
                      {token.symbol}
                    </div>
                    <div className="text-sm text-slate-400">
                      {token.name}
                    </div>
                  </div>
                  <div className="text-sm font-medium text-amber-400/70">
                    {token.fixedPriceUsd ? `$${token.fixedPriceUsd.toLocaleString()}` : "Oracle"}
                  </div>
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* Transaction Progress Modal */}
      <Dialog open={showProgressModal} onOpenChange={(open) => {
        // 只允许在成功或错误时关闭
        if (!open && (progressStep === 'success' || progressStep === 'error')) {
          setShowProgressModal(false);
        }
      }}>
        <DialogContent className="bg-gradient-to-br from-slate-900 to-slate-950 border-amber-500/30 text-white shadow-2xl shadow-amber-500/20 max-w-md">
          <div className="flex flex-col items-center justify-center py-8">
            {/* 进度图标 */}
            <div className="mb-6">
              {progressStep === 'approve' && (
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-4 border-amber-500/30 border-t-amber-500 animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-8 h-8 text-amber-500/50" fill="none" stroke="currentColor" viewBox="0 0 24 24" role="img" aria-label="Approving">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              )}
              {progressStep === 'swap' && (
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-4 border-amber-500/30 border-t-amber-500 animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-8 h-8 text-amber-500/50" fill="none" stroke="currentColor" viewBox="0 0 24 24" role="img" aria-label="Swapping">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  </div>
                </div>
              )}
              {progressStep === 'success' && (
                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center animate-scale-in">
                  <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" role="img" aria-label="Success">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
              {progressStep === 'error' && (
                <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
                  <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" role="img" aria-label="Error">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              )}
            </div>

            {/* 进度标题 */}
            <h3 className="text-xl font-semibold mb-2 text-center">
              {progressStep === 'approve' && (
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500">
                  Approving Token
                </span>
              )}
              {progressStep === 'swap' && (
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500">
                  Swapping Tokens
                </span>
              )}
              {progressStep === 'success' && (
                <span className="text-green-400">
                  Transaction Successful!
                </span>
              )}
              {progressStep === 'error' && (
                <span className="text-red-400">
                  Transaction Failed
                </span>
              )}
            </h3>

            {/* 进度消息 */}
            <p className="text-center text-slate-400 mb-6 px-4 text-sm">
              {progressMessage}
            </p>

            {/* 步骤指示器 */}
            {(progressStep === 'approve' || progressStep === 'swap') && (
              <div className="flex items-center gap-3 mb-6">
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                    progressStep === 'approve' 
                      ? 'border-amber-500 bg-amber-500/20' 
                      : 'border-amber-500 bg-amber-500'
                  }`}>
                    {progressStep === 'approve' ? (
                      <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    ) : (
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" role="img" aria-label="Completed">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="text-xs text-slate-500">Approve</span>
                </div>
                
                <div className="w-12 h-0.5 bg-slate-700 relative">
                  {progressStep === 'swap' && (
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-amber-500" />
                  )}
                </div>
                
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                    progressStep === 'swap' 
                      ? 'border-amber-500 bg-amber-500/20' 
                      : 'border-slate-700 bg-slate-900'
                  }`}>
                    {progressStep === 'swap' && (
                      <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    )}
                  </div>
                  <span className="text-xs text-slate-500">Swap</span>
                </div>
              </div>
            )}

            {/* 提示信息 */}
            {(progressStep === 'approve' || progressStep === 'swap') && (
              <div className="text-center">
                <p className="text-xs text-slate-500 mb-2">
                  Confirm this transaction in your wallet
                </p>
                <div className="flex items-center justify-center gap-1 text-xs text-slate-600">
                  <div className="w-1 h-1 rounded-full bg-slate-600 animate-pulse" />
                  <div className="w-1 h-1 rounded-full bg-slate-600 animate-pulse" style={{ animationDelay: '0.2s' }} />
                  <div className="w-1 h-1 rounded-full bg-slate-600 animate-pulse" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
            )}

            {/* 成功时显示交易链接 */}
            {progressStep === 'success' && progressTxHash && (
              <a
                href={`https://etherscan.io/tx/${progressTxHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-amber-400 hover:text-amber-300 underline"
              >
                View on Etherscan
              </a>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
