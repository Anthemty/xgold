"use client";

import {
  ArrowDownUp,
  ArrowLeftRight,
  ChevronLeft,
  ChevronRight,
  FileCheck,
  Landmark,
  Lock,
  PiggyBank,
  Shield,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function HowItWorksSection() {
  const [mounted, setMounted] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 自动播放逻辑
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 8);
    }, 2500);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const flows = [
    // Physical Flow
    {
      id: 1,
      icon: Shield,
      title: "Verification",
      desc: "Physical gold authentication by certified experts",
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-500/5 to-cyan-500/10",
      shadow: "shadow-blue-500/20",
      category: "physical",
    },
    {
      id: 2,
      icon: Lock,
      title: "Custody",
      desc: "Secure storage in institutional vaults worldwide",
      gradient: "from-emerald-500 to-teal-500",
      bgGradient: "from-emerald-500/5 to-teal-500/10",
      shadow: "shadow-emerald-500/20",
      category: "physical",
    },
    {
      id: 3,
      icon: FileCheck,
      title: "Certification",
      desc: "Blockchain-based proof of ownership recorded",
      gradient: "from-purple-500 to-pink-500",
      bgGradient: "from-purple-500/5 to-pink-500/10",
      shadow: "shadow-purple-500/20",
      category: "physical",
    },
    {
      id: 4,
      icon: Sparkles,
      title: "Minting",
      desc: "Digital tokens created, backed by real gold",
      gradient: "from-yellow-500 to-amber-500",
      bgGradient: "from-yellow-500/5 to-amber-500/10",
      shadow: "shadow-yellow-500/20",
      category: "physical",
    },
    // Digital Flow
    {
      id: 5,
      icon: PiggyBank,
      title: "Staking",
      desc: "Earn passive yields on your gold token holdings",
      gradient: "from-orange-500 to-red-500",
      bgGradient: "from-orange-500/5 to-red-500/10",
      shadow: "shadow-orange-500/20",
      category: "digital",
    },
    {
      id: 6,
      icon: ArrowLeftRight,
      title: "Trading",
      desc: "Trade seamlessly on DEX and CEX platforms",
      gradient: "from-indigo-500 to-violet-500",
      bgGradient: "from-indigo-500/5 to-violet-500/10",
      shadow: "shadow-indigo-500/20",
      category: "digital",
    },
    {
      id: 7,
      icon: Landmark,
      title: "DeFi Integration",
      desc: "Use gold tokens as collateral in DeFi protocols",
      gradient: "from-cyan-500 to-blue-500",
      bgGradient: "from-cyan-500/5 to-blue-500/10",
      shadow: "shadow-cyan-500/20",
      category: "digital",
    },
    {
      id: 8,
      icon: ArrowDownUp,
      title: "Redemption",
      desc: "Exchange tokens back to physical gold anytime",
      gradient: "from-pink-500 to-rose-500",
      bgGradient: "from-pink-500/5 to-rose-500/10",
      shadow: "shadow-pink-500/20",
      category: "digital",
    },
  ];

  return (
    <section
      id="how-it-works"
      className="relative py-12 lg:py-16 bg-gradient-to-b from-gray-900 via-[#0a0e27] to-gray-900 overflow-hidden"
    >
      {/* 背景 */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/3 to-transparent animate-scan"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e40af08_1px,transparent_1px),linear-gradient(to_bottom,#1e40af08_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-yellow-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl">
        {/* 标题 */}
        <div className="text-center mb-8 lg:mb-10">
          <div
            className={`transition-all duration-700 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            {/* <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 rounded-full border border-blue-500/30 mb-6">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span className="text-blue-400 font-semibold text-sm">STEP-BY-STEP PROCESS</span>
            </div> */}

            <h2 className="text-3xl lg:text-4xl xl:text-5xl font-black mb-4 text-white leading-tight">
              HOW IT{" "}
              <span className="inline-block bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 bg-clip-text text-transparent">
                WORKS
              </span>
            </h2>
            <p className="text-lg lg:text-xl text-gray-300 font-light max-w-3xl mx-auto">
              From Physical Gold to Digital Freedom
            </p>
          </div>
        </div>

        {/* 新流程图 - 网格布局 (缩小30%) */}
        <div className="relative mb-8">
          <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {flows.map((step, index) => (
              <div key={step.id} className="relative">
                <button
                  type="button"
                  className={`group relative transition-all duration-500 text-left w-full ${
                    mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                  onMouseEnter={() => {
                    setIsPlaying(false);
                    setActiveStep(index);
                  }}
                  onMouseLeave={() => setIsPlaying(true)}
                >
                  {/* 卡片 - 缩小尺寸 */}
                  <div
                    className={`relative h-full p-5 rounded-xl bg-gradient-to-br ${step.bgGradient} backdrop-blur-sm border transition-all duration-500 ${
                      activeStep === index
                        ? `border-transparent shadow-xl ${step.shadow} scale-105 z-10`
                        : "border-gray-700/50 hover:border-gray-600 hover:scale-102"
                    }`}
                  >
                    {/* 发光背景 */}
                    {activeStep === index && (
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${step.gradient} opacity-10 rounded-2xl animate-pulse`}
                      ></div>
                    )}

                    {/* 步骤编号 - 缩小 */}
                    <div className="absolute -top-2 -left-2 w-7 h-7 rounded-full bg-gray-900 border border-gray-700 flex items-center justify-center font-black text-white text-xs shadow-lg ring-2 ring-gray-900 z-20">
                      {step.id}
                    </div>

                    {/* 图标 - 缩小 */}
                    <div className="relative mb-5 mt-1">
                      <div
                        className={`w-14 h-14 mx-auto bg-gradient-to-br ${step.bgGradient} backdrop-blur-sm border border-gray-700/30 rounded-full flex items-center justify-center shadow-md transition-all duration-500 ${
                          activeStep === index ? "scale-110 rotate-6" : "group-hover:scale-105"
                        }`}
                      >
                        <step.icon className="w-7 h-7 text-gray-400" />
                      </div>
                    </div>

                    {/* 内容 - 缩小字体 */}
                    <div className="relative text-center">
                      <h3
                        className={`text-sm font-black mb-3 transition-colors ${
                          activeStep === index ? "text-white" : "text-gray-300"
                        }`}
                      >
                        {step.title}
                      </h3>
                      <p className="text-gray-400 text-xs leading-snug">{step.desc}</p>
                    </div>

                    {/* 底部进度指示器 */}
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-800 rounded-b-2xl overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${step.gradient} transition-all duration-1000 ${
                          activeStep === index ? "w-full" : "w-0"
                        }`}
                      ></div>
                    </div>
                  </div>
                </button>

                {/* 连接箭头 (桌面) - 缩小 */}
                {index < flows.length - 1 && (index + 1) % 4 !== 0 && (
                  <div className="hidden lg:block absolute top-1/2 -right-2 z-30 -translate-y-1/2">
                    <div
                      className={`transition-all duration-500 ${
                        activeStep >= index ? "opacity-100 scale-100" : "opacity-30 scale-75"
                      }`}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <title>Flow arrow</title>
                        <path
                          d="M5 12h14m0 0l-6-6m6 6l-6 6"
                          stroke="url(#gradient)"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        <defs>
                          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop
                              offset="0%"
                              stopColor="#fbbf24"
                              stopOpacity={activeStep >= index ? "1" : "0.3"}
                            />
                            <stop
                              offset="100%"
                              stopColor="#f59e0b"
                              stopOpacity={activeStep >= index ? "1" : "0.3"}
                            />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                  </div>
                )}

                {/* 换行连接 (4到5) - 调整位置 */}
                {index === 3 && (
                  <div className="hidden lg:block absolute -bottom-6 left-1/2 -translate-x-1/2 z-30">
                    <div
                      className={`transition-all duration-500 ${
                        activeStep >= 3 ? "opacity-100 scale-100" : "opacity-30 scale-75"
                      }`}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <title>Flow arrow down</title>
                        <path
                          d="M12 5v14m0 0l-6-6m6 6l6-6"
                          stroke="url(#gradient-down)"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        <defs>
                          <linearGradient id="gradient-down" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop
                              offset="0%"
                              stopColor="#fbbf24"
                              stopOpacity={activeStep >= 3 ? "1" : "0.3"}
                            />
                            <stop
                              offset="100%"
                              stopColor="#f59e0b"
                              stopOpacity={activeStep >= 3 ? "1" : "0.3"}
                            />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 中心 Token - 缩小 */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 hidden lg:block pointer-events-none">
            <div className="relative">
              <div className="absolute -inset-6 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 rounded-full blur-2xl animate-pulse"></div>
              <div className="relative w-24 h-24 bg-gradient-to-br from-yellow-500 via-amber-500 to-yellow-600 rounded-full flex items-center justify-center shadow-2xl shadow-yellow-500/50 border-3 border-yellow-400/30">
                <div className="absolute inset-[3px] bg-[#0a0e27] rounded-full flex flex-col items-center justify-center">
                  <div className="text-2xl mb-0.5">💎</div>
                  <div className="text-white font-black text-[9px]">GOLD</div>
                  <div className="text-yellow-400 font-black text-[9px]">TOKEN</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 底部控制器 - 增大并优化颜色 */}
        <div
          className={`max-w-6xl mx-auto transition-all duration-700 delay-500 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="bg-gradient-to-r from-gray-800/60 via-gray-800/40 to-gray-800/60 backdrop-blur-xl rounded-3xl border border-gray-700/50 p-3">
            {/* 进度条 */}
            <div className="mb-2">
              <div className="flex justify-between items-center mb-2">
                <span className="text-base font-bold text-gray-300">
                  Step {activeStep + 1} of {flows.length}
                </span>
                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="px-4 py-2 rounded-xl bg-gray-700/50 hover:bg-gray-700 border border-gray-600 hover:border-gray-500 text-sm font-bold text-gray-300 hover:text-white transition-all"
                >
                  {isPlaying ? "⏸ Pause" : "▶ Play"}
                </button>
              </div>
              <div className="h-3 bg-gray-700/50 rounded-full overflow-hidden shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 via-yellow-500 to-pink-500 transition-all duration-500 rounded-full shadow-lg"
                  style={{ width: `${((activeStep + 1) / flows.length) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* 导航 */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <Button
                onClick={() => {
                  setActiveStep((prev) => (prev - 1 + flows.length) % flows.length);
                  setIsPlaying(false);
                }}
                variant="outline"
                className="border-2 border-gray-600 hover:border-gray-500 bg-gray-800/50 hover:bg-gray-800 text-gray-300 hover:text-white font-bold text-sm h-9 px-5 rounded-xl transition-all"
              >
                <ChevronLeft className="w-5 h-5 mr-2" />
                Previous
              </Button>

              <div className="flex-1 text-center py-1">
                <h4 className="text-white font-black text-lg sm:text-xl mb-1">
                  {flows[activeStep]?.title}
                </h4>
                <p className="text-gray-400 text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
                  {flows[activeStep]?.desc}
                </p>
              </div>

              <Button
                onClick={() => {
                  setActiveStep((prev) => (prev + 1) % flows.length);
                  setIsPlaying(false);
                }}
                className="bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 border-2 border-gray-600 hover:border-gray-500 text-white font-bold text-sm h-9 px-5 rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                Next
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </div>

            {/* 步骤指示器 */}
            <div className="flex justify-center gap-2 mt-2">
              {flows.map((step, index) => (
                <button
                  type="button"
                  key={step.id}
                  onClick={() => {
                    setActiveStep(index);
                    setIsPlaying(false);
                  }}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === activeStep
                      ? `w-12 bg-gradient-to-r ${step.gradient}`
                      : "w-2 bg-gray-600 hover:bg-gray-500"
                  }`}
                  aria-label={`Go to step ${index + 1}`}
                ></button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scan {
          0%, 100% { transform: translateY(-100%); }
          50% { transform: translateY(100%); }
        }
        .animate-scan {
          animation: scan 10s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}
