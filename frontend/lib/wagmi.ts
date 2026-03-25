import type { AppKitNetwork } from "@reown/appkit/networks";
import { mainnet } from "@reown/appkit/networks";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { cookieStorage, createStorage } from "@wagmi/core";

// Get projectId from https://cloud.reown.com
export const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID;

if (!projectId) {
  throw new Error("Project ID is not defined");
}

// 只保留 Ethereum Mainnet - Uniswap V3 Pool 配置仅在 Mainnet 上有效
export const networks: [AppKitNetwork, ...AppKitNetwork[]] = [mainnet];

// Set up the Wagmi Adapter (Config)
export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
  projectId,
  networks,
});

export const config = wagmiAdapter.wagmiConfig;
