import { Hono } from "hono";
import { fetchAllMetrics, fetchMetricByKey } from "@/services/supabase";
import type { ApiError, ApiSuccess, PlatformMetric, PlatformMetricKey } from "@/types";

const metrics = new Hono();

const VALID_METRIC_KEYS: PlatformMetricKey[] = [
  "gold_tokens_market_cap",
  "gold_tokens_market_cap_change",
  "total_token_holders",
  "total_token_holders_change",
  "gold_tokens_volume_24h",
  "gold_tokens_volume_24h_change",
];

// GET /api/metrics
metrics.get("/", async (c) => {
  try {
    const data = await fetchAllMetrics();
    return c.json<ApiSuccess<PlatformMetric[]>>({ data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch metrics";
    console.error("[route/metrics] GET /api/metrics error:", message);
    return c.json<ApiError>({ error: { code: "INTERNAL_ERROR", message } }, 500);
  }
});

// GET /api/metrics/:key
metrics.get("/:key", async (c) => {
  const key = c.req.param("key") as PlatformMetricKey;

  if (!VALID_METRIC_KEYS.includes(key)) {
    return c.json<ApiError>(
      {
        error: {
          code: "BAD_REQUEST",
          message: `Invalid metric key: "${key}". Must be one of: ${VALID_METRIC_KEYS.join(", ")}`,
        },
      },
      400
    );
  }

  try {
    const data = await fetchMetricByKey(key);

    if (!data) {
      return c.json<ApiError>(
        { error: { code: "NOT_FOUND", message: `Metric not found: ${key}` } },
        404
      );
    }

    return c.json<ApiSuccess<PlatformMetric>>({ data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch metric";
    console.error(`[route/metrics] GET /api/metrics/${key} error:`, message);
    return c.json<ApiError>({ error: { code: "INTERNAL_ERROR", message } }, 500);
  }
});

export default metrics;
