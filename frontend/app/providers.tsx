"use client";

import { createAppKit } from "@reown/appkit/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { projectId, networks, wagmiAdapter } from "@/lib/wagmi";

// 1. 验证 projectId
if (!projectId) {
  throw new Error("NEXT_PUBLIC_REOWN_PROJECT_ID is not set");
}

// 2. 获取当前 URL
const getAppUrl = () => {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_APP_URL || "https://demo.gox.top";
};

// 3. Create modal
createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  metadata: {
    name: "GOX",
    description: "Decentralized Exchange for Gold-backed Tokens",
    url: getAppUrl(),
    icons: [`${getAppUrl()}/favicon.svg`],
  },
  features: {
    analytics: false,
    email: true,
    socials: ["google", "x", "discord"],
  },
});

// 4. Create query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
