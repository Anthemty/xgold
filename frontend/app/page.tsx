import { AboutSection } from "@/components/home/AboutSection";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { Footer } from "@/components/home/Footer";
import { Header } from "@/components/home/Header";
import { HeroSection } from "@/components/home/HeroSection";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { PartnersSection } from "@/components/home/PartnersSection";

// 强制动态渲染，因为 HeroSection 依赖客户端数据获取
export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Header />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <PartnersSection />
      <AboutSection />
      <Footer />
    </div>
  );
}
