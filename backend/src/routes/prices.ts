import { Hono } from "hono";
import { fetchPriceHistory } from "@/services/supabase";
import type { ApiError, ApiSuccess, PriceHistory, PriceTimeframe } from "@/types";

const prices = new Hono();

const VALID_TIMEFRAMES: PriceTimeframe[] = ["1h", "4h", "1d", "1w"];

// GET /api/prices/:symbol
prices.get("/:symbol", async (c) => {
  const symbol = c.req.param("symbol").toUpperCase();
  const timeframeParam = c.req.query("timeframe") ?? "1d";
  const limitParam = c.req.query("limit") ?? "100";

  // 校验 timeframe
  if (!VALID_TIMEFRAMES.includes(timeframeParam as PriceTimeframe)) {
    return c.json<ApiError>(
      {
        error: {
          code: "BAD_REQUEST",
          message: `Invalid timeframe: "${timeframeParam}". Must be one of: ${VALID_TIMEFRAMES.join(", ")}`,
        },
      },
      400
    );
  }

  // 校验 limit
  const limit = parseInt(limitParam, 10);
  if (Number.isNaN(limit) || limit < 1 || limit > 1000) {
    return c.json<ApiError>(
      {
        error: {
          code: "BAD_REQUEST",
          message: `Invalid limit: "${limitParam}". Must be a number between 1 and 1000`,
        },
      },
      400
    );
  }

  try {
    const data = await fetchPriceHistory(symbol, timeframeParam as PriceTimeframe, limit);
    return c.json<ApiSuccess<PriceHistory[]>>({ data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch price history";
    console.error(`[route/prices] GET /api/prices/${symbol} error:`, message);
    return c.json<ApiError>({ error: { code: "INTERNAL_ERROR", message } }, 500);
  }
});

export default prices;
