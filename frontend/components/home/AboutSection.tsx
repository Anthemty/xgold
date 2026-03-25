"use client";

import { Globe, Target, Users, Zap } from "lucide-react";
import { useEffect, useState } from "react";

export function AboutSection() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section
      id="about"
      className="relative py-16 lg:py-20 bg-gray-900/50 border-t border-gray-800/50 overflow-hidden"
    >
      {/* 背景装饰 */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-yellow-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl">
        {/* 标题 */}
        <div className="text-center mb-12">
          <div
            className={`transition-all duration-700 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <h2 className="text-3xl lg:text-4xl xl:text-5xl font-black mb-4 text-white leading-tight">
              ABOUT{" "}
              <span className="inline-block bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 bg-clip-text text-transparent">
                GOX
              </span>
            </h2>
          </div>
        </div>

        {/* 主内容区 - 网格布局 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* What We Are */}
          <div
            className={`group transition-all duration-700 delay-100 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-yellow-500/10 rounded-lg border border-yellow-500/20 group-hover:bg-yellow-500/20 group-hover:border-yellow-500/40 transition-all">
                  <Target className="w-6 h-6 text-yellow-400" />
                </div>
                <h3 className="text-sm font-bold text-yellow-400 tracking-wider">WHAT WE ARE</h3>
              </div>
              <p className="text-gray-300 leading-relaxed text-sm group-hover:text-gray-200 transition-colors">
                Blockchain-based decentralized gold financial infrastructure, centered on{" "}
                <span className="text-yellow-400 font-semibold">Physical Gold Anchoring</span>,{" "}
                <span className="text-yellow-400 font-semibold">On-chain Circulation</span>, and{" "}
                <span className="text-yellow-400 font-semibold">Inclusive Services</span>.
              </p>
            </div>
          </div>

          {/* Our Ecosystem */}
          <div
            className={`group transition-all duration-700 delay-200 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-blue-500/10 rounded-lg border border-blue-500/20 group-hover:bg-blue-500/20 group-hover:border-blue-500/40 transition-all">
                  <Zap className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-sm font-bold text-blue-400 tracking-wider">OUR ECOSYSTEM</h3>
              </div>
              <p className="text-gray-300 leading-relaxed text-sm group-hover:text-gray-200 transition-colors">
                Comprehensive global gold ecosystem integrating{" "}
                <span className="text-blue-400 font-semibold">On-chain Gold</span>,{" "}
                <span className="text-blue-400 font-semibold">Trading</span>,{" "}
                <span className="text-blue-400 font-semibold">Circulation</span>,{" "}
                <span className="text-blue-400 font-semibold">Storage</span>,{" "}
                <span className="text-blue-400 font-semibold">Derivatives</span>, and{" "}
                <span className="text-blue-400 font-semibold">OTC Markets</span>.
              </p>
            </div>
          </div>

          {/* Our Vision */}
          <div
            className={`group transition-all duration-700 delay-300 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-purple-500/10 rounded-lg border border-purple-500/20 group-hover:bg-purple-500/20 group-hover:border-purple-500/40 transition-all">
                  <Globe className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-sm font-bold text-purple-400 tracking-wider">OUR VISION</h3>
              </div>
              <p className="text-gray-300 leading-relaxed text-sm group-hover:text-gray-200 transition-colors">
                Become the world's most valuable gold circulation platform. Enable everyone to{" "}
                <span className="text-purple-400 font-semibold">access, trade, and invest</span> in
                gold <span className="text-purple-400 font-semibold">anytime, anywhere</span> with
                low cost and high efficiency.
              </p>
            </div>
          </div>

          {/* Our Team */}
          <div
            className={`group transition-all duration-700 delay-400 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-emerald-500/10 rounded-lg border border-emerald-500/20 group-hover:bg-emerald-500/20 group-hover:border-emerald-500/40 transition-all">
                  <Users className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="text-sm font-bold text-emerald-400 tracking-wider">OUR TEAM</h3>
              </div>
              <p className="text-gray-300 leading-relaxed text-sm group-hover:text-gray-200 transition-colors">
                Deep expertise across{" "}
                <span className="text-yellow-400 font-semibold">Gold Industry</span>,{" "}
                <span className="text-blue-400 font-semibold">Finance</span>, and{" "}
                <span className="text-purple-400 font-semibold">Blockchain</span>. Operating
                globally from Dubai, Hong Kong, and Singapore.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
