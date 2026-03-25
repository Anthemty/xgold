import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { config } from "@/config";
import { authMiddleware } from "@/middleware/auth";
import market from "@/routes/market";
import metrics from "@/routes/metrics";
import prices from "@/routes/prices";
import tokens from "@/routes/tokens";

const app = new Hono();

// =====================
// 中间件
// =====================

// 请求日志
app.use("*", logger());

// CORS
app.use(
  "*",
  cors({
    origin: config.cors.origins,
    allowMethods: ["GET", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "X-API-Key"],
    maxAge: 600,
  }),
);

// =====================
// 健康检查
// =====================

app.get("/health", (c) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

// =====================
// API 路由（统一鉴权）
// =====================

app.use("/api/*", authMiddleware);
app.route("/api/tokens", tokens);
app.route("/api/market", market);
app.route("/api/prices", prices);
app.route("/api/metrics", metrics);

// =====================
// 404 兜底
// =====================

app.notFound((c) => {
  return c.json(
    {
      error: {
        code: "NOT_FOUND",
        message: `Route not found: ${c.req.method} ${c.req.path}`,
      },
    },
    404,
  );
});

// =====================
// 全局错误处理
// =====================

app.onError((err, c) => {
  console.error("[app] Unhandled error:", err);
  return c.json(
    {
      error: {
        code: "INTERNAL_ERROR",
        message: config.server.isDev ? err.message : "Internal server error",
      },
    },
    500,
  );
});

export default app;
