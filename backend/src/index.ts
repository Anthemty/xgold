import app from "@/app";
import { config, validateConfig } from "@/config";
import { startSyncJob } from "@/jobs/syncPrices";

// =====================
// 启动前校验环境变量
// =====================

validateConfig();

// =====================
// 启动定时任务
// =====================

startSyncJob(config.jobs.priceSyncIntervalMs);

// =====================
// 启动 HTTP 服务
// =====================

const server = Bun.serve({
  port: config.server.port,
  fetch: app.fetch,
});

console.log(`[server] GOX Backend running on http://localhost:${server.port}`);

// =====================
// 优雅退出
// =====================

process.on("SIGINT", () => {
  console.log("\n[server] Received SIGINT, shutting down...");
  server.stop();
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("[server] Received SIGTERM, shutting down...");
  server.stop();
  process.exit(0);
});
