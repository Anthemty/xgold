import { Hono } from "hono";
import { fetchTokenBySymbol, fetchTokens } from "@/services/supabase";
import type { ApiError, ApiSuccess, Token } from "@/types";

const tokens = new Hono();

// GET /api/tokens
tokens.get("/", async (c) => {
  const tradable = c.req.query("tradable");
  const stakeable = c.req.query("stakeable");

  const options: { isTradable?: boolean; isStakeable?: boolean } = {};

  if (tradable !== undefined) {
    options.isTradable = tradable === "true";
  }

  if (stakeable !== undefined) {
    options.isStakeable = stakeable === "true";
  }

  try {
    const data = await fetchTokens(options);
    return c.json<ApiSuccess<Token[]>>({ data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch tokens";
    console.error("[route/tokens] GET /api/tokens error:", message);
    return c.json<ApiError>({ error: { code: "INTERNAL_ERROR", message } }, 500);
  }
});

// GET /api/tokens/:symbol
tokens.get("/:symbol", async (c) => {
  const symbol = c.req.param("symbol").toUpperCase();

  try {
    const data = await fetchTokenBySymbol(symbol);

    if (!data) {
      return c.json<ApiError>(
        { error: { code: "NOT_FOUND", message: `Token not found: ${symbol}` } },
        404
      );
    }

    return c.json<ApiSuccess<Token>>({ data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch token";
    console.error(`[route/tokens] GET /api/tokens/${symbol} error:`, message);
    return c.json<ApiError>({ error: { code: "INTERNAL_ERROR", message } }, 500);
  }
});

export default tokens;
