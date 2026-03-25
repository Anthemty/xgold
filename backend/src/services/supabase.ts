import { createClient } from "@supabase/supabase-js";
import { config } from "@/config";
import type {
  MarketData,
  PlatformMetric,
  PlatformMetricKey,
  PriceHistory,
  PriceTimeframe,
  Token,
} from "@/types";
import type { Database } from "@/types/database";

// =====================
// 客户端单例
// =====================

let _client: ReturnType<typeof createClient<Database>> | null = null;

export function getSupabaseClient() {
  if (!_client) {
    _client = createClient<Database>(config.supabase.url, config.supabase.serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return _client;
}

// =====================
// Tokens
// =====================

export async function fetchTokens(options?: {
  isTradable?: boolean;
  isStakeable?: boolean;
}): Promise<Token[]> {
  const client = getSupabaseClient();

  let query = client.from("tokens").select("*").eq("is_active", true);

  if (options?.isTradable !== undefined) {
    query = query.eq("is_tradable", options.isTradable);
  }

  if (options?.isStakeable !== undefined) {
    query = query.eq("is_stakeable", options.isStakeable);
  }

  const { data, error } = await query.order("sort_order", { ascending: true });

  if (error) {
    throw new Error(`[supabase] fetchTokens failed: ${error.message}`);
  }

  return (data ?? []) as Token[];
}

export async function fetchTokenBySymbol(symbol: string): Promise<Token | null> {
  const client = getSupabaseClient();

  const { data, error } = await client
    .from("tokens")
    .select("*")
    .eq("symbol", symbol)
    .eq("is_active", true)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // No rows found
      return null;
    }
    throw new Error(`[supabase] fetchTokenBySymbol failed: ${error.message}`);
  }

  return data as Token;
}

// =====================
// Market Data
// =====================

export async function upsertMarketData(marketData: MarketData): Promise<void> {
  const client = getSupabaseClient();

  const { error } = await client.from("market_data").upsert(
    {
      ...marketData,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "asset_symbol",
    }
  );

  if (error) {
    throw new Error(`[supabase] upsertMarketData failed: ${error.message}`);
  }
}

export async function fetchMarketData(symbol?: string): Promise<MarketData[]> {
  const client = getSupabaseClient();

  let query = client.from("market_data").select("*");

  if (symbol) {
    query = query.eq("asset_symbol", symbol);
  }

  const { data, error } = await query.order("asset_symbol", {
    ascending: true,
  });

  if (error) {
    throw new Error(`[supabase] fetchMarketData failed: ${error.message}`);
  }

  return (data ?? []) as MarketData[];
}

export async function fetchMarketDataBySymbol(symbol: string): Promise<MarketData | null> {
  const client = getSupabaseClient();

  const { data, error } = await client
    .from("market_data")
    .select("*")
    .eq("asset_symbol", symbol)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error(`[supabase] fetchMarketDataBySymbol failed: ${error.message}`);
  }

  return data as MarketData;
}

// =====================
// Price History
// =====================

export async function insertPriceHistory(entry: PriceHistory): Promise<void> {
  const client = getSupabaseClient();

  const { error } = await client.from("price_history").insert({
    ...entry,
    created_at: new Date().toISOString(),
  });

  if (error) {
    throw new Error(`[supabase] insertPriceHistory failed: ${error.message}`);
  }
}

export async function fetchPriceHistory(
  symbol: string,
  timeframe: PriceTimeframe = "1d",
  limit = 100
): Promise<PriceHistory[]> {
  const client = getSupabaseClient();

  const { data, error } = await client
    .from("price_history")
    .select("*")
    .eq("asset_symbol", symbol)
    .eq("timeframe", timeframe)
    .order("timestamp", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`[supabase] fetchPriceHistory failed: ${error.message}`);
  }

  return (data ?? []) as PriceHistory[];
}

// =====================
// Platform Metrics
// =====================

export async function upsertMetric(key: PlatformMetricKey, value: number): Promise<void> {
  const client = getSupabaseClient();

  const { error } = await client.from("platform_metrics").upsert(
    {
      metric_key: key,
      numeric_value: value,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "metric_key",
    }
  );

  if (error) {
    throw new Error(`[supabase] upsertMetric(${key}) failed: ${error.message}`);
  }
}

export async function upsertMetrics(
  entries: Partial<Record<PlatformMetricKey, number>>
): Promise<void> {
  const client = getSupabaseClient();

  const rows = Object.entries(entries).map(([key, value]) => ({
    metric_key: key,
    numeric_value: value,
    updated_at: new Date().toISOString(),
  }));

  if (rows.length === 0) return;

  const { error } = await client.from("platform_metrics").upsert(rows, {
    onConflict: "metric_key",
  });

  if (error) {
    throw new Error(`[supabase] upsertMetrics failed: ${error.message}`);
  }
}

export async function fetchAllMetrics(): Promise<PlatformMetric[]> {
  const client = getSupabaseClient();

  const { data, error } = await client
    .from("platform_metrics")
    .select("*")
    .order("metric_key", { ascending: true });

  if (error) {
    throw new Error(`[supabase] fetchAllMetrics failed: ${error.message}`);
  }

  return (data ?? []) as PlatformMetric[];
}

export async function fetchMetricByKey(key: PlatformMetricKey): Promise<PlatformMetric | null> {
  const client = getSupabaseClient();

  const { data, error } = await client
    .from("platform_metrics")
    .select("*")
    .eq("metric_key", key)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error(`[supabase] fetchMetricByKey(${key}) failed: ${error.message}`);
  }

  return data as PlatformMetric;
}
