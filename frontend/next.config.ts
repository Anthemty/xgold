import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizeCss: false,
  },
  images: {
    unoptimized: true,
  },
  output: 'standalone',
};

export default nextConfig;
