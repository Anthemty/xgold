import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* 背景渐变 */}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/10 via-amber-600/5 to-transparent"></div>

      {/* 内容 */}
      <div className="container mx-auto px-4 text-center relative z-10">
        <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
          Start Your Gold Investment Today
        </h2>
        <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
          Join thousands of investors who trust GOX for secure, blockchain-based gold ownership.
        </p>
        <Button
          size="lg"
          className="bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white text-lg px-12 shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
        >
          Get Started Now
        </Button>
      </div>
    </section>
  );
}
