import { Hono } from "hono";
import { fetchMarketData, fetchMarketDataBySymbol } from "@/services/supabase";
import type { ApiError, ApiSuccess, MarketData } from "@/types";

const market = new Hono();

// GET /api/market
market.get("/", async (c) => {
  try {
    const data = await fetchMarketData();
    return c.json<ApiSuccess<MarketData[]>>({ data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch market data";
    console.error("[route/market] GET /api/market error:", message);
    return c.json<ApiError>({ error: { code: "INTERNAL_ERROR", message } }, 500);
  }
});

// GET /api/market/:symbol
market.get("/:symbol", async (c) => {
  const symbol = c.req.param("symbol").toUpperCase();

  try {
    const data = await fetchMarketDataBySymbol(symbol);

    if (!data) {
      return c.json<ApiError>(
        { error: { code: "NOT_FOUND", message: `Market data not found: ${symbol}` } },
        404
      );
    }

    return c.json<ApiSuccess<MarketData>>({ data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch market data";
    console.error(`[route/market] GET /api/market/${symbol} error:`, message);
    return c.json<ApiError>({ error: { code: "INTERNAL_ERROR", message } }, 500);
  }
});

export default market;
