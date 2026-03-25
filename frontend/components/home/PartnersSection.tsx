"use client";

import { useEffect, useState } from "react";

export function PartnersSection() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const goldPartners = [
    { name: "LBMA", logo: "🏅", url: "https://www.lbma.org.uk" },
    { name: "HKGX", logo: "🏦", url: "https://www.hkgoldexchange.com" },
    { name: "COMEX", logo: "📈", url: "https://www.cmegroup.com/markets/metals/gold.html" },
    { name: "UBS", logo: "🏛️", url: "https://www.ubs.com" },
    { name: "DGCX", logo: "🌐", url: "https://www.dgcx.ae" },
    { name: "WGC", logo: "💎", url: "https://www.gold.org" },
    { name: "BRINKS", logo: "🔒", url: "https://www.brinks.com" },
    { name: "PAMP", logo: "⚜️", url: "https://www.pamp.com" },
    { name: "Metalor", logo: "🥇", url: "https://www.metalor.com" },
    { name: "Heraeus", logo: "⚗️", url: "https://www.heraeus-group.com" },
  ];

  const techPartners = [
    { name: "Chainlink", logo: "🔗", url: "https://chain.link" },
    { name: "Ethereum", logo: "◆", url: "https://ethereum.org" },
    { name: "Polygon", logo: "⬡", url: "https://polygon.technology" },
    { name: "Uniswap", logo: "🦄", url: "https://uniswap.org" },
    { name: "The Graph", logo: "📊", url: "https://thegraph.com" },
    { name: "IPFS", logo: "📁", url: "https://ipfs.tech" },
    { name: "Aave", logo: "👻", url: "https://aave.com" },
    { name: "Curve", logo: "〰️", url: "https://curve.fi" },
    { name: "1inch", logo: "🔄", url: "https://1inch.io" },
    { name: "Safe", logo: "🔐", url: "https://safe.global" },
  ];

  // 复制数组以实现无缝循环
  const goldPartnersRow = [...goldPartners, ...goldPartners];
  const techPartnersRow = [...techPartners, ...techPartners];

  return (
    <section id="partners" className="relative py-20 overflow-hidden">
      {/* 背景 */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-[#0a0e27] to-gray-900"></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e40af08_1px,transparent_1px),linear-gradient(to_bottom,#1e40af08_1px,transparent_1px)] bg-[size:40px_40px]"></div>

      <div className="container mx-auto px-4 relative z-10">
        {/* 标题 */}
        <div
          className={`text-center mb-12 transition-all duration-700 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <h2 className="text-4xl lg:text-5xl font-black text-white mb-3">
            Trusted{" "}
            <span className="bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">
              Partners
            </span>
          </h2>
          <p className="text-lg text-gray-400">
            Built on industry-leading technology and partnerships
          </p>
        </div>

        {/* 滚动容器 */}
        <div className="relative">
          {/* 渐变遮罩 - 左右两侧 */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#0a0e27] to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#0a0e27] to-transparent z-10 pointer-events-none"></div>

          {/* 第一行 - 黄金合作伙伴 - 向左滚动 */}
          <div className="mb-4">
            <h3 className="text-center text-sm font-semibold text-yellow-400 mb-6">
              Gold Partners
            </h3>
            <div className="overflow-hidden">
              <div className="flex animate-scroll-left hover:pause-animation">
                {goldPartnersRow.map((partner) => (
                  <a
                    key={partner.url}
                    href={partner.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 mx-4 lg:mx-6 group"
                  >
                    <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 backdrop-blur-sm flex flex-col items-center justify-center gap-3 hover:border-yellow-500/50 hover:shadow-lg hover:shadow-yellow-500/10 transition-all duration-300 cursor-pointer">
                      <div className="text-4xl lg:text-5xl grayscale group-hover:grayscale-0 transition-all">
                        {partner.logo}
                      </div>
                      <span className="text-sm font-bold text-gray-400 group-hover:text-white transition-colors">
                        {partner.name}
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* 第二行 - 技术合作伙伴 - 向右滚动 */}
          <div className="mb-4">
            <h3 className="text-center text-sm font-semibold text-blue-400 mb-6">
              Technology Partners
            </h3>
            <div className="overflow-hidden">
              <div className="flex animate-scroll-right hover:pause-animation">
                {techPartnersRow.map((partner) => (
                  <a
                    key={partner.url}
                    href={partner.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 mx-4 lg:mx-6 group"
                  >
                    <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 backdrop-blur-sm flex flex-col items-center justify-center gap-3 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 cursor-pointer">
                      <div className="text-4xl lg:text-5xl grayscale group-hover:grayscale-0 transition-all">
                        {partner.logo}
                      </div>
                      <span className="text-sm font-bold text-gray-400 group-hover:text-white transition-colors">
                        {partner.name}
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 底部统计 */}
        <div
          className={`mt-16 grid grid-cols-3 gap-4 md:gap-8 transition-all duration-700 delay-300 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <div className="text-center">
            <div className="text-4xl lg:text-5xl font-black text-transparent bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text mb-2">
              20+
            </div>
            <p className="text-gray-400 font-semibold">Strategic Partners</p>
          </div>
          <div className="text-center">
            <div className="text-4xl lg:text-5xl font-black text-transparent bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text mb-2">
              99.9%
            </div>
            <p className="text-gray-400 font-semibold">Uptime Guarantee</p>
          </div>
          <div className="text-center">
            <div className="text-4xl lg:text-5xl font-black text-transparent bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text mb-2">
              24/7
            </div>
            <p className="text-gray-400 font-semibold">Support & Monitoring</p>
          </div>
        </div>
      </div>

      {/* CSS 动画样式 */}
      <style jsx>{`
        @keyframes scroll-left {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        @keyframes scroll-right {
          0% {
            transform: translateX(-50%);
          }
          100% {
            transform: translateX(0);
          }
        }

        .animate-scroll-left {
          animation: scroll-left 40s linear infinite;
        }

        .animate-scroll-right {
          animation: scroll-right 40s linear infinite;
        }

        .hover\\:pause-animation:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}
