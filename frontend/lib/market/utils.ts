/**
 * 格式化价格,保留两位小数
 */
export function formatPrice(price: number): string {
  return price.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * 格式化百分比,保留两位小数
 */
export function formatPercent(percent: number): string {
  const sign = percent >= 0 ? "+" : "";
  return `${sign}${percent.toFixed(2)}%`;
}

/**
 * 格式化大数字(市值等),转换为K/M/B/T单位
 */
export function formatLargeNumber(num: number): string {
  if (num >= 1e12) {
    return `$${(num / 1e12).toFixed(2)}T`;
  }
  if (num >= 1e9) {
    return `$${(num / 1e9).toFixed(2)}B`;
  }
  if (num >= 1e6) {
    return `$${(num / 1e6).toFixed(2)}M`;
  }
  if (num >= 1e3) {
    return `$${(num / 1e3).toFixed(2)}K`;
  }
  return `$${num.toFixed(2)}`;
}

/**
 * 格式化市值,返回带单位的字符串
 */
export function formatMarketCap(marketCap: number): string {
  if (marketCap >= 1e12) {
    return `$${(marketCap / 1e12).toFixed(2)}T`;
  }
  if (marketCap >= 1e9) {
    return `$${(marketCap / 1e9).toFixed(2)}B`;
  }
  if (marketCap >= 1e6) {
    return `$${(marketCap / 1e6).toFixed(2)}M`;
  }
  return `$${marketCap.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

/**
 * 格式化指标值(市值/持有者/交易量)
 */
export function formatMetricValue(
  value: number,
  type: "market_cap" | "holders" | "volume"
): string {
  if (type === "holders") {
    return value.toLocaleString("en-US", { maximumFractionDigits: 0 });
  }
  return formatLargeNumber(value);
}

/**
 * 格式化指标变化(百分比或数字)
 */
export function formatMetricChange(value: number, type: "percentage" | "number"): string {
  if (type === "percentage") {
    return formatPercent(value);
  }
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}
