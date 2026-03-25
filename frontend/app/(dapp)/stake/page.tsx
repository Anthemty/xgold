"use client";

import { useAppKit } from "@reown/appkit/react";
import { useState } from "react";
import { useAccount } from "wagmi";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const stakingPools = [
  {
    id: 1,
    name: "gXAU Staking",
    token: "gXAU",
    iconUrl: "/tokens/gxau.svg",
    gradient: "from-yellow-400 to-amber-600",
    apy: "45.2",
    tvl: "12,500,000",
    yourStake: "0",
    earned: "0",
    lockPeriod: "Flexible",
    price: 4000,
  },
  {
    id: 2,
    name: "XAUT Staking",
    token: "XAUT",
    iconUrl: "/tokens/xaut.svg",
    gradient: "from-yellow-500 to-orange-500",
    apy: "38.5",
    tvl: "8,750,000",
    yourStake: "0",
    earned: "0",
    lockPeriod: "30 Days",
    price: 2650,
  },
  {
    id: 3,
    name: "PAXG Staking",
    token: "PAXG",
    iconUrl: "/tokens/paxg.svg",
    gradient: "from-amber-400 to-yellow-600",
    apy: "42.3",
    tvl: "6,200,000",
    yourStake: "0",
    earned: "0",
    lockPeriod: "60 Days",
    price: 2645,
  },
  {
    id: 4,
    name: "gXAU-USDT LP",
    token: "gXAU-USDT",
    iconUrl: "/tokens/gxau.svg",
    gradient: "from-cyan-400 to-blue-600",
    apy: "78.5",
    tvl: "5,500,000",
    yourStake: "0",
    earned: "0",
    lockPeriod: "90 Days",
    price: 4000,
  },
];

export default function StakePage() {
  const [selectedPool, setSelectedPool] = useState<number | null>(null);
  const [stakeAmount, setStakeAmount] = useState("");
  const [unstakeAmount, setUnstakeAmount] = useState("");
  const [activeTab, setActiveTab] = useState("stake");
  const { isConnected } = useAccount();
  const { open } = useAppKit();

  const handleOpenModal = async () => {
    try {
      await open();
    } catch (error) {
      console.error("Error opening modal:", error);
    }
  };

  const handleStakeAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setStakeAmount(value);
    }
  };

  const handleUnstakeAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setUnstakeAmount(value);
    }
  };

  const handleMaxStake = () => {
    setStakeAmount("1000");
  };

  const handleMaxUnstake = () => {
    const pool = stakingPools.find((p) => p.id === selectedPool);
    if (pool) {
      setUnstakeAmount(pool.yourStake);
    }
  };

  const getSelectedPool = () => stakingPools.find((p) => p.id === selectedPool);

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 mb-2">
            Stake & Earn
          </h1>
          <p className="text-amber-200/60 text-base">Stake your gold tokens to earn rewards</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-slate-900/80 to-slate-950/80 backdrop-blur-xl border-amber-500/20 shadow-lg shadow-amber-500/5">
            <CardContent className="p-6">
              <div className="text-amber-200/60 text-sm mb-1">Total Value Locked</div>
              <div className="text-3xl font-bold text-amber-100 mb-1">$32.95M</div>
              <div className="text-green-400 text-sm">+12.5% this week</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-900/80 to-slate-950/80 backdrop-blur-xl border-amber-500/20 shadow-lg shadow-amber-500/5">
            <CardContent className="p-6">
              <div className="text-amber-200/60 text-sm mb-1">Your Total Staked</div>
              <div className="text-3xl font-bold text-amber-100 mb-1">$0.00</div>
              <div className="text-slate-400 text-sm">0 Tokens</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-900/80 to-slate-950/80 backdrop-blur-xl border-amber-500/20 shadow-lg shadow-amber-500/5">
            <CardContent className="p-6">
              <div className="text-amber-200/60 text-sm mb-1">Total Rewards Earned</div>
              <div className="text-3xl font-bold text-amber-100 mb-1">$0.00</div>
              <div className="text-slate-400 text-sm">Claim anytime</div>
            </CardContent>
          </Card>
        </div>

        {/* Staking Pools Section Title */}
        <h2 className="text-2xl font-bold text-amber-100 mb-6">Staking Pools</h2>

        {/* Staking Pools */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pools List */}
          <div className="space-y-4">
            {stakingPools.map((pool) => (
              <Card
                key={pool.id}
                className={`bg-gradient-to-br from-slate-900/60 to-slate-950/60 backdrop-blur-xl border-amber-500/20 cursor-pointer transition-all hover:border-amber-400/40 hover:shadow-lg hover:shadow-amber-500/10 ${
                  selectedPool === pool.id
                    ? "ring-2 ring-amber-500 border-amber-500/50 shadow-xl shadow-amber-500/20"
                    : ""
                }`}
                onClick={() => setSelectedPool(pool.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-full bg-gradient-to-br ${pool.gradient} flex items-center justify-center flex-shrink-0 shadow-lg overflow-hidden`}
                      >
                        <Image
                          src={pool.iconUrl}
                          alt={pool.token}
                          width={48}
                          height={48}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-amber-100">{pool.name}</h3>
                        <p className="text-sm text-amber-200/50">{pool.lockPeriod}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-2xl font-bold text-yellow-400">{pool.apy}%</div>
                      <div className="text-xs text-amber-200/40">APY</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-amber-500/10">
                    <div>
                      <div className="text-xs text-amber-200/40 mb-1">TVL</div>
                      <div className="text-sm font-semibold text-amber-100">${pool.tvl}</div>
                    </div>
                    <div>
                      <div className="text-xs text-amber-200/40 mb-1">Your Stake</div>
                      <div className="text-sm font-semibold text-amber-100">
                        {pool.yourStake} {pool.token}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-amber-200/40 mb-1">Earned</div>
                      <div className="text-sm font-semibold text-green-400">
                        {pool.earned} {pool.token}
                      </div>
                    </div>
                    <div className="flex items-end justify-end">
                      {pool.earned !== "0" && (
                        <Button
                          disabled={!isConnected}
                          size="sm"
                          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-xs px-3 h-7"
                        >
                          Claim
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Stake/Unstake Panel */}
          <div className="lg:pl-0">
            <Card className="bg-gradient-to-br from-slate-900/80 to-slate-950/80 backdrop-blur-xl border-amber-500/20 lg:sticky lg:top-24 shadow-xl shadow-amber-500/10">
              <CardHeader className="pb-3 border-b border-amber-500/10">
                <CardTitle className="text-amber-100 text-xl">
                  {selectedPool ? getSelectedPool()?.name : "Select a pool"}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                {!selectedPool ? (
                  <div className="text-center py-12 text-amber-200/40">
                    <div className="text-6xl mb-4">👈</div>
                    <p className="text-base">Select a staking pool to continue</p>
                  </div>
                ) : (
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-2 bg-slate-800/50 mb-4 border border-amber-500/10">
                      <TabsTrigger
                        value="stake"
                        className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-amber-600 data-[state=active]:text-slate-900 text-amber-200/60 font-semibold"
                      >
                        Stake
                      </TabsTrigger>
                      <TabsTrigger
                        value="unstake"
                        className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white text-amber-200/60 font-semibold"
                      >
                        Unstake
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="stake" className="space-y-4 mt-0">
                      <div className="bg-gradient-to-br from-amber-950/30 to-slate-900/30 rounded-2xl p-4 border border-amber-500/20">
                        <div className="flex justify-between text-sm mb-3">
                          <span className="text-amber-200/70 font-medium">Amount to Stake</span>
                          <span className="text-amber-200/50 text-xs">
                            Balance: 1,000 {getSelectedPool()?.token}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="0.0"
                            value={stakeAmount}
                            onChange={handleStakeAmountChange}
                            className="flex-1 bg-transparent border-0 text-3xl text-amber-50 h-12 px-0 placeholder:text-slate-700 font-semibold focus:outline-none min-w-0"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleMaxStake}
                            className="border-amber-500/40 hover:border-amber-400 text-amber-400 hover:text-amber-300 bg-transparent hover:bg-amber-500/10 text-xs px-3 h-8 flex-shrink-0 font-semibold"
                          >
                            MAX
                          </Button>
                        </div>
                        <div className="text-sm text-amber-400/60 mt-2">
                          ≈ $
                          {stakeAmount
                            ? (Number(stakeAmount) * (getSelectedPool()?.price || 0)).toFixed(2)
                            : "0.00"}{" "}
                          USD
                        </div>
                      </div>

                      <div className="space-y-2 p-4 bg-gradient-to-br from-amber-950/20 to-slate-900/30 rounded-xl border border-amber-500/10">
                        <div className="flex justify-between text-sm">
                          <span className="text-amber-200/60">APY</span>
                          <span className="text-yellow-400 font-semibold">
                            {getSelectedPool()?.apy}%
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-amber-200/60">Lock Period</span>
                          <span className="text-amber-100 font-medium">
                            {getSelectedPool()?.lockPeriod}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-amber-200/60">Estimated Daily Rewards</span>
                          <span className="text-amber-100 font-medium">
                            {stakeAmount
                              ? (
                                  (Number(stakeAmount) * Number(getSelectedPool()?.apy || 0)) /
                                  36500
                                ).toFixed(4)
                              : "0.0000"}{" "}
                            {getSelectedPool()?.token}
                          </span>
                        </div>
                      </div>

                      {!isConnected ? (
                        <Button
                          onClick={handleOpenModal}
                          className="w-full bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 hover:from-yellow-400 hover:via-amber-400 hover:to-yellow-500 text-slate-900 font-bold py-4 h-auto text-base shadow-lg shadow-amber-500/30"
                        >
                          Connect Wallet
                        </Button>
                      ) : (
                        <Button
                          disabled={!stakeAmount || Number(stakeAmount) <= 0}
                          className="w-full bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 hover:from-yellow-400 hover:via-amber-400 hover:to-yellow-500 text-slate-900 font-bold py-4 h-auto text-base disabled:opacity-50 shadow-lg shadow-amber-500/30"
                        >
                          {stakeAmount && Number(stakeAmount) > 0
                            ? "Stake Tokens"
                            : "Enter an amount"}
                        </Button>
                      )}
                    </TabsContent>

                    <TabsContent value="unstake" className="space-y-4 mt-0">
                      <div className="bg-gradient-to-br from-slate-900/40 to-slate-950/40 rounded-2xl p-4 border border-slate-700/40">
                        <div className="flex justify-between text-sm mb-3">
                          <span className="text-amber-200/70 font-medium">Amount to Unstake</span>
                          <span className="text-amber-200/50 text-xs">
                            Staked: {getSelectedPool()?.yourStake} {getSelectedPool()?.token}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="0.0"
                            value={unstakeAmount}
                            onChange={handleUnstakeAmountChange}
                            className="flex-1 bg-transparent border-0 text-3xl text-white h-12 px-0 placeholder:text-slate-700 font-semibold focus:outline-none min-w-0"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleMaxUnstake}
                            className="border-slate-600/50 hover:border-purple-500 text-purple-400 hover:text-purple-300 bg-transparent hover:bg-slate-700/30 text-xs px-3 h-8 flex-shrink-0"
                          >
                            MAX
                          </Button>
                        </div>
                        <div className="text-sm text-slate-500 mt-2">
                          ≈ $
                          {unstakeAmount
                            ? (Number(unstakeAmount) * (getSelectedPool()?.price || 0)).toFixed(2)
                            : "0.00"}{" "}
                          USD
                        </div>
                      </div>

                      <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                        <div className="flex gap-2 text-amber-400 text-sm">
                          <svg
                            className="w-5 h-5 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <title>Warning icon</title>
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                          </svg>
                          <div>
                            <div className="font-semibold mb-1">Early Unstaking Fee</div>
                            <div className="text-xs text-amber-300">
                              Unstaking before the lock period ends will incur a 5% fee
                            </div>
                          </div>
                        </div>
                      </div>

                      <Button
                        disabled={!unstakeAmount || Number(unstakeAmount) <= 0}
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold py-4 h-auto text-base disabled:opacity-50"
                      >
                        {unstakeAmount && Number(unstakeAmount) > 0
                          ? "Unstake Tokens"
                          : "Enter an amount"}
                      </Button>
                    </TabsContent>
                  </Tabs>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
