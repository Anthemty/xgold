import { getGoldPrice } from "@/services/goldapi";
import { insertPriceHistory, upsertMarketData, upsertMetrics } from "@/services/supabase";
import type { SyncResult } from "@/types";

// =====================
// 价格同步任务
// =====================

/**
 * 执行一次黄金价格同步
 * 1. 从 Gold API 拉取 XAU/USD 最新现货价格
 * 2. Upsert market_data 表
 * 3. 插入一条 price_history 记录
 * 4. 更新 platform_metrics 相关指标
 */
export async function syncGoldPrice(): Promise<SyncResult> {
  const syncedAt = new Date().toISOString();

  try {
    console.log("[syncPrices] Fetching XAU/USD from Gold API...");

    const data = await getGoldPrice();

    console.log(`[syncPrices] XAU/USD = $${data.price} (${data.chp >= 0 ? "+" : ""}${data.chp}%)`);

    // 1. Upsert market_data
    await upsertMarketData({
      asset_symbol: "XAU",
      price_usd: data.price,
      change_24h: data.ch,
      change_pct_24h: data.chp,
      open_price: data.open_price,
      high_24h: data.high_price,
      low_24h: data.low_price,
      prev_close_price: data.prev_close_price,
      ask: data.ask,
      bid: data.bid,
      price_gram_24k: data.price_gram_24k,
      updated_at: syncedAt,
    });

    console.log("[syncPrices] market_data upserted");

    // 2. Insert price_history (1d timeframe)
    await insertPriceHistory({
      asset_symbol: "XAU",
      price_usd: data.price,
      open_price: data.open_price,
      high_price: data.high_price,
      low_price: data.low_price,
      close_price: data.price,
      timeframe: "1d",
      timestamp: syncedAt,
    });

    console.log("[syncPrices] price_history inserted");

    // 3. Update platform_metrics
    await upsertMetrics({
      gold_tokens_market_cap_change: data.chp,
    });

    console.log("[syncPrices] platform_metrics updated");

    return {
      success: true,
      symbol: "XAU",
      priceUsd: data.price,
      syncedAt,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[syncPrices] Sync failed: ${message}`);

    return {
      success: false,
      symbol: "XAU",
      error: message,
      syncedAt,
    };
  }
}

// =====================
// 定时器管理
// =====================

let _timer: ReturnType<typeof setInterval> | null = null;

/**
 * 启动价格同步定时任务
 * @param intervalMs 同步间隔（毫秒）
 */
export function startSyncJob(intervalMs: number): void {
  if (_timer !== null) {
    console.warn("[syncPrices] Sync job is already running");
    return;
  }

  console.log(`[syncPrices] Starting sync job (interval: ${intervalMs}ms)`);

  // 立即执行一次
  syncGoldPrice().then((result) => {
    if (result.success) {
      console.log(`[syncPrices] Initial sync success: $${result.priceUsd}`);
    } else {
      console.error(`[syncPrices] Initial sync failed: ${result.error}`);
    }
  });

  // 启动定时器
  _timer = setInterval(async () => {
    const result = await syncGoldPrice();
    if (result.success) {
      console.log(`[syncPrices] Scheduled sync success: $${result.priceUsd}`);
    } else {
      console.error(`[syncPrices] Scheduled sync failed: ${result.error}`);
    }
  }, intervalMs);

  console.log("[syncPrices] Sync job started");
}

/**
 * 停止价格同步定时任务
 */
export function stopSyncJob(): void {
  if (_timer === null) {
    console.warn("[syncPrices] Sync job is not running");
    return;
  }

  clearInterval(_timer);
  _timer = null;
  console.log("[syncPrices] Sync job stopped");
}

/**
 * 判断定时任务是否正在运行
 */
export function isSyncJobRunning(): boolean {
  return _timer !== null;
}
