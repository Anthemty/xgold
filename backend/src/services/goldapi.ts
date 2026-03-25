import { config } from "@/config";
import type { GoldApiErrorResponse, GoldApiResponse, GoldMetalSymbol } from "@/types";

// =====================
// 请求封装
// =====================

async function request(path: string): Promise<GoldApiResponse> {
  const url = `${config.goldApi.baseUrl}${path}`;

  const response = await fetch(url, {
    headers: {
      "x-access-token": config.goldApi.apiKey,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}`;
    try {
      const body = (await response.json()) as GoldApiErrorResponse;
      errorMessage = body.error ?? errorMessage;
    } catch {
      // 忽略 JSON 解析失败
    }
    throw new Error(`[goldapi] Request failed: ${errorMessage} (url: ${url})`);
  }

  return response.json() as Promise<GoldApiResponse>;
}

// =====================
// 公共 API
// =====================

/**
 * 获取指定金属的最新现货价格
 * GET /api/{symbol}/USD
 */
export async function getSpotPrice(metal: GoldMetalSymbol): Promise<GoldApiResponse> {
  return request(`/${metal}/USD`);
}

/**
 * 获取指定金属某天的历史价格
 * GET /api/{symbol}/USD/{date}
 * @param date 格式 YYYYMMDD，例如 "20241201"
 */
export async function getHistoricalPrice(
  metal: GoldMetalSymbol,
  date: string
): Promise<GoldApiResponse> {
  // 校验日期格式
  if (!/^\d{8}$/.test(date)) {
    throw new Error(`[goldapi] Invalid date format: "${date}". Expected YYYYMMDD`);
  }
  return request(`/${metal}/USD/${date}`);
}

/**
 * 获取黄金（XAU）最新现货价格（最常用的快捷方法）
 */
export async function getGoldPrice(): Promise<GoldApiResponse> {
  return getSpotPrice("XAU");
}
