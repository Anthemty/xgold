"use client";

import {
  ArrowUpRight,
  Award,
  Building2,
  CheckCircle2,
  Globe,
  Shield,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";

export function FeaturesSection() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section
      id="features"
      className="relative py-12 lg:py-18 bg-gradient-to-b from-gray-900 via-gray-900/98 to-gray-900 overflow-hidden"
    >
      {/* 背景装饰 */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-yellow-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-3xl"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl">
        {/* 顶部:核心价值主张 */}
        <div className="text-center mb-6 lg:mb-9">
          <div
            className={`transition-all duration-700 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <h2 className="text-4xl lg:text-5xl xl:text-6xl font-black mb-3 text-white leading-tight">
              WHY CHOOSE{" "}
              <span className="inline-block bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-600 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(234,179,8,0.3)]">
                GOX
              </span>
              ?
            </h2>
            <p className="text-base lg:text-lg text-gray-300 mb-4 font-normal max-w-3xl mx-auto">
              World's First Comprehensive Gold RWA Ecosystem
            </p>

            {/* 标签组 */}
            <div className="flex flex-wrap justify-center gap-3">
              <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 rounded-full border border-yellow-500/30 backdrop-blur-sm">
                <Award className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-gray-200 font-semibold">
                  Trillion-Scale Experience
                </span>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full border border-blue-500/30 backdrop-blur-sm">
                <Globe className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-gray-200 font-semibold">Global Coverage</span>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full border border-purple-500/30 backdrop-blur-sm">
                <Shield className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-gray-200 font-semibold">Institutional Grade</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bento Grid 主布局 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-5 mb-8">
          {/* 左侧大块 - Full-Stack Solution */}
          <div
            className={`lg:col-span-7 group relative p-6 lg:p-8 rounded-3xl bg-gradient-to-br from-gray-800/90 via-gray-800/70 to-gray-900/90 border-2 border-blue-500/20 hover:border-blue-500/40 backdrop-blur-xl overflow-hidden transition-all duration-700 delay-100 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            {/* 背景装饰 */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-cyan-500/10 to-transparent rounded-full blur-3xl"></div>

            <div className="relative z-10">
              {/* 图标 + 标题 */}
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Building2 className="w-7 h-7 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl lg:text-3xl font-bold text-white mb-1">Full-Stack</h3>
                    <p className="text-blue-400 font-semibold text-lg">Gold On-Chain Solution</p>
                  </div>
                </div>
                <ArrowUpRight className="w-6 h-6 text-gray-500 group-hover:text-blue-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
              </div>

              {/* 特性列表 */}
              <div className="space-y-3">
                {[
                  "Global Physical Gold Tokenization",
                  "Detection, Custody & Audit Services",
                  "RWA Issuance & Listing Support",
                ].map((feature) => (
                  <div key={feature} className="flex items-center gap-3 group/item">
                    <div className="w-6 h-6 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-blue-400" />
                    </div>
                    <span className="text-gray-300 group-hover/item:text-white transition-colors">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              {/* 底部进度条装饰 */}
              <div className="mt-6 h-1 bg-gray-700/50 rounded-full overflow-hidden">
                <div className="h-full w-0 bg-gradient-to-r from-blue-500 to-cyan-500 group-hover:w-full transition-all duration-1000"></div>
              </div>
            </div>
          </div>

          {/* 右侧上方 - DEX Platform */}
          <div
            className={`lg:col-span-5 group relative p-6 rounded-3xl bg-gradient-to-br from-yellow-500/10 via-gray-800/80 to-gray-900/90 border-2 border-yellow-500/20 hover:border-yellow-500/40 backdrop-blur-xl overflow-hidden transition-all duration-700 delay-200 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-yellow-500/20 to-transparent rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>

            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-yellow-500/20 to-amber-500/20 border border-yellow-500/30 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-7 h-7 text-yellow-400" />
                </div>
                <ArrowUpRight className="w-6 h-6 text-gray-500 group-hover:text-yellow-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
              </div>

              <h3 className="text-xl lg:text-2xl font-bold text-white mb-1.5">World's First</h3>
              <p className="text-yellow-400 font-semibold mb-5">Gold DEX Platform</p>

              <div className="space-y-2.5 text-sm">
                {[
                  "Pioneering Gold DEX Infrastructure",
                  "Support for Global Gold RWA Assets",
                  "Derivatives & OTC Trading",
                ].map((feature) => (
                  <div key={feature} className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-yellow-500/20 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-yellow-400" />
                    </div>
                    <span className="text-gray-300 leading-tight">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="mt-5 h-1 bg-gray-700/50 rounded-full overflow-hidden">
                <div className="h-full w-0 bg-gradient-to-r from-yellow-500 to-amber-500 group-hover:w-full transition-all duration-1000 delay-100"></div>
              </div>
            </div>
          </div>

          {/* 右侧下方 - Liquidity Solution */}
          <div
            className={`lg:col-span-5 group relative p-6 rounded-3xl bg-gradient-to-br from-purple-500/10 via-gray-800/80 to-gray-900/90 border-2 border-purple-500/20 hover:border-purple-500/40 backdrop-blur-xl overflow-hidden transition-all duration-700 delay-300 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <div className="absolute top-0 left-0 w-48 h-48 bg-gradient-to-br from-purple-500/20 to-transparent rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>

            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Wallet className="w-7 h-7 text-purple-400" />
                </div>
                <ArrowUpRight className="w-6 h-6 text-gray-500 group-hover:text-purple-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
              </div>

              <h3 className="text-xl lg:text-2xl font-bold text-white mb-1.5">Complete</h3>
              <p className="text-purple-400 font-semibold mb-5">Liquidity Solution</p>

              <div className="space-y-2.5 text-sm">
                {[
                  "Staking, Yield & Payment Services",
                  "DeFi Collateral & Lending",
                  "Fiat-Backed Gold RWA Loans",
                ].map((feature) => (
                  <div key={feature} className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-purple-500/20 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                    </div>
                    <span className="text-gray-300 leading-tight">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 h-1 bg-gray-700/50 rounded-full overflow-hidden">
                <div className="h-full w-0 bg-gradient-to-r from-purple-500 to-pink-500 group-hover:w-full transition-all duration-1000 delay-200"></div>
              </div>
            </div>
          </div>

          {/* 左侧下方 - Dashboard 统计卡片 */}
          <div
            className={`lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-3 transition-all duration-700 delay-400 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            {[
              { icon: "🔒", value: "100%", label: "Backed", sublabel: "Physical Gold" },
              { icon: "⚡", value: "24/7", label: "Trading", sublabel: "Instant Settlement" },
              { icon: "💎", value: "$1", label: "Minimum", sublabel: "Start Investing" },
              { icon: "🏛️", value: "AAA", label: "Grade", sublabel: "Institutional" },
              { icon: "🌐", value: "50+", label: "Vaults", sublabel: "Global Network" },
              { icon: "📊", value: "RT", label: "Proof", sublabel: "Real-time Data" },
            ].map((item) => (
              <div
                key={item.label}
                className="group relative p-4 rounded-2xl bg-gradient-to-br from-gray-800/60 to-gray-900/80 border border-gray-700/50 hover:border-yellow-500/50 backdrop-blur-sm hover:shadow-lg hover:shadow-yellow-500/10 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <div className="text-2xl font-black text-yellow-400 mb-1">{item.value}</div>
                <div className="text-xs font-bold text-white mb-0.5">{item.label}</div>
                <div className="text-xs text-gray-500">{item.sublabel}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 底部：团队经验展示 - Dashboard 风格 */}
        {/* <div 
          className={`transition-all duration-700 delay-500 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="relative p-8 lg:p-10 rounded-3xl bg-gradient-to-r from-gray-800/80 via-gray-800/60 to-gray-800/80 border-2 border-gray-700/50 backdrop-blur-xl overflow-hidden">
           
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 via-transparent to-amber-500/5"></div>
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl"></div>

            <div className="relative z-10">
              <div className="text-center mb-8">
                <h3 className="text-2xl lg:text-3xl font-black text-white mb-2">PROVEN EXPERIENCE</h3>
                <p className="text-gray-400">Backed by industry-leading expertise</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4 lg:gap-6">
                {[
                  {
                    icon: BarChart3,
                    text: "Trillion-Scale Platform Operations",
                    color: "from-blue-500 to-cyan-500"
                  },
                  {
                    icon: Globe,
                    text: "Global Gold Market Trading & Risk Control",
                    color: "from-yellow-500 to-amber-500"
                  },
                  {
                    icon: Building2,
                    text: "Worldwide Vault Management & Authentication",
                    color: "from-purple-500 to-pink-500"
                  },
                  {
                    icon: Coins,
                    text: "CEX, DEX, DeFi, OTC Full Expertise",
                    color: "from-green-500 to-emerald-500"
                  }
                ].map((item, index) => (
                  <div
                    key={index}
                    className="group relative flex items-center gap-4 p-5 lg:p-6 rounded-2xl bg-gray-900/60 border border-gray-700/50 hover:border-yellow-500/50 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] overflow-hidden"
                  >
                    
                    <div className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r group-hover:w-full transition-all duration-1000" style={{
                      backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))`,
                      '--tw-gradient-from': item.color.split(' ')[0].replace('from-', ''),
                      '--tw-gradient-to': item.color.split(' ')[1].replace('to-', '')
                    } as any}></div>

                    <div className={`w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br ${item.color}/20 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform border border-gray-700/50`}>
                      <item.icon className={`w-6 h-6 lg:w-7 lg:h-7 bg-gradient-to-br ${item.color} bg-clip-text text-transparent`} style={{
                        filter: 'drop-shadow(0 0 10px currentColor)'
                      }} />
                    </div>
                    <p className="text-gray-200 font-bold text-sm lg:text-base leading-tight group-hover:text-white transition-colors">
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div> */}
      </div>
    </section>
  );
}
