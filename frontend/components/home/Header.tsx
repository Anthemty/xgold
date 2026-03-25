"use client";

import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    // 只处理当前页面的锚点链接
    if (href.startsWith("/#")) {
      e.preventDefault();
      const targetId = href.substring(2); // 移除 "/#"
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        // 首页不减去 header 高度，直接滚动到元素位置
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }

      // 关闭移动菜单
      setIsMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Features", href: "/#features" },
    { name: "Guide", href: "/#how-it-works" },
    { name: "Partners", href: "/#partners" },
    { name: "About", href: "/#about" },
    { name: "Market", href: "/market" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-gray-900/95 backdrop-blur-lg border-b border-gray-800 shadow-lg"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 relative transform group-hover:scale-110 transition-transform">
              <Image
                src="/gox.svg"
                alt="gox Logo"
                width={40}
                height={40}
                className="w-full h-full"
              />
            </div>
            <span className="text-2xl font-black text-white">GOX</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={(e) => handleSmoothScroll(e, link.href)}
                className="text-gray-300 hover:text-white font-semibold transition-colors relative group"
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-yellow-500 to-amber-600 group-hover:w-full transition-all duration-300"></span>
              </Link>
            ))}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center gap-4">
            <a href="/swap">
              <Button className="bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-gray-900 font-bold">
                Launch App
              </Button>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-gray-300 hover:text-white transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-800">
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleSmoothScroll(e, link.href)}
                  className="text-gray-300 hover:text-white font-semibold transition-colors py-2"
                >
                  {link.name}
                </Link>
              ))}
              <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-gray-800">
                <Button
                  variant="outline"
                  className="w-full border-gray-700 text-gray-300 hover:text-white hover:border-gray-600"
                >
                  Connect Wallet
                </Button>
                <Button className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-gray-900 font-bold">
                  Launch App
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
