function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function optionalEnv(key: string, defaultValue: string): string {
  return process.env[key] ?? defaultValue;
}

export const config = {
  server: {
    port: parseInt(optionalEnv("PORT", "4000"), 10),
    nodeEnv: optionalEnv("NODE_ENV", "development"),
    get isDev() {
      return this.nodeEnv === "development";
    },
    get isProd() {
      return this.nodeEnv === "production";
    },
  },

  supabase: {
    get url() {
      return requireEnv("SUPABASE_URL");
    },
    get serviceRoleKey() {
      return requireEnv("SUPABASE_SERVICE_ROLE_KEY");
    },
  },

  goldApi: {
    get apiKey() {
      return requireEnv("GOLD_API_KEY");
    },
    baseUrl: "https://www.goldapi.io/api",
  },

  jobs: {
    priceSyncIntervalMs: parseInt(optionalEnv("PRICE_SYNC_INTERVAL_MS", "300000"), 10),
  },

  cors: {
    get origins(): string[] {
      return optionalEnv("CORS_ORIGIN", "http://localhost:3000")
        .split(",")
        .map((o) => o.trim())
        .filter(Boolean);
    },
  },
} as const;

/**
 * 启动时校验所有必需的环境变量
 * 在 index.ts 最顶部调用，确保服务启动前快速失败
 */
export function validateConfig(): void {
  const required = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "GOLD_API_KEY"];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.map((k) => `  - ${k}`).join("\n")}`
    );
  }

  const intervalMs = config.jobs.priceSyncIntervalMs;
  if (Number.isNaN(intervalMs) || intervalMs < 60000) {
    throw new Error(
      `PRICE_SYNC_INTERVAL_MS must be a number >= 60000 (1 minute). Got: ${process.env.PRICE_SYNC_INTERVAL_MS}`
    );
  }

  console.log("[config] Environment validated successfully");
  console.log(`[config] NODE_ENV=${config.server.nodeEnv}`);
  console.log(`[config] PORT=${config.server.port}`);
  console.log(`[config] PRICE_SYNC_INTERVAL_MS=${intervalMs}ms`);
  console.log(`[config] CORS_ORIGIN=${config.cors.origins.join(", ")}`);
}
