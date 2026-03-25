"use client";

import { useAppKit, useAppKitAccount, useAppKitNetwork } from "@reown/appkit/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  const { caipNetwork } = useAppKitNetwork();

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const getNetworkName = () => {
    return caipNetwork?.name || "Unknown Network";
  };

  const handleOpenModal = async () => {
    try {
      await open();
    } catch (error) {
      console.error("Error opening modal:", error);
    }
  };

  const navigation = [
    { name: "Swap", href: "/swap" },
    // { name: "Stake", href: "/stake" },
    { name: "Explore", href: "/explore" },
  ];

  const ConnectButton = () => {
    if (!isConnected || !address) {
      return (
        <Button
          onClick={handleOpenModal}
          className="bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 hover:from-yellow-400 hover:via-amber-400 hover:to-yellow-500 text-slate-900 px-6 py-2 rounded-xl font-bold transition-all shadow-lg shadow-amber-500/30"
        >
          Connect Wallet
        </Button>
      );
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="bg-gradient-to-br from-amber-900/40 to-yellow-900/40 hover:from-amber-800/50 hover:to-yellow-800/50 text-amber-100 border-amber-500/30 hover:border-amber-400/50 px-4 py-2 rounded-xl font-medium transition-all shadow-lg shadow-amber-500/10"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>{formatAddress(address)}</span>
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="bg-slate-900 border-amber-500/30 text-white w-56"
        >
          <DropdownMenuLabel className="text-amber-200">My Account</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-amber-500/20" />
          <DropdownMenuItem className="focus:bg-amber-500/10 focus:text-white cursor-default">
            <div className="flex flex-col gap-1 w-full">
              <span className="text-xs text-amber-400/60">Address</span>
              <span className="font-mono text-sm text-amber-100">{formatAddress(address)}</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem className="focus:bg-amber-500/10 focus:text-white cursor-default">
            <div className="flex flex-col gap-1 w-full">
              <span className="text-xs text-amber-400/60">Network</span>
              <span className="text-sm text-amber-100">{getNetworkName()}</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-amber-500/20" />
          <DropdownMenuItem
            onClick={handleOpenModal}
            className="focus:bg-amber-500/10 focus:text-white cursor-pointer"
          >
            View Account
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleOpenModal}
            className="focus:bg-amber-500/10 focus:text-white cursor-pointer"
          >
            Switch Network
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-amber-500/20" />
          <DropdownMenuItem
            onClick={handleOpenModal}
            className="focus:bg-red-600 focus:text-white cursor-pointer text-red-400"
          >
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return (
    <nav className="border-b border-amber-500/10 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image src="/gox.svg" alt="Gold" width={48} height={48} className="w-12 h-12" />
            {/* <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-400">
              GOX
            </span> */}
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-300 border border-amber-500/30"
                      : "text-slate-400 hover:text-amber-300 hover:bg-amber-500/5"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* Desktop Connect Button */}
          <div className="hidden md:block">
            <ConnectButton />
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-amber-300 hover:text-amber-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <title>{mobileMenuOpen ? "Close menu" : "Open menu"}</title>
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-amber-500/10">
            <div className="flex flex-col gap-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-3 rounded-lg font-medium transition-all ${
                      isActive
                        ? "bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-300 border border-amber-500/30"
                        : "text-slate-400 hover:text-amber-300 hover:bg-amber-500/5"
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
              <div className="mt-2 pt-2 border-t border-amber-500/10">
                <ConnectButton />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
