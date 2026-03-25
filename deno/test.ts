// 测试脚本：测试所有资产（GOLD、XAUT、PAXG）的价格获取和数据库更新功能
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { load } from "https://deno.land/std@0.224.0/dotenv/mod.ts";

// 加载 .env 文件
await load({ export: true });

const METALS_API_KEY = Deno.env.get("METALS_API_KEY")!;
const COINGECKO_API_KEY = Deno.env.get("COINGECKO_API_KEY") || "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

console.log("🔧 环境变量检查:");
console.log("- METALS_API_KEY:", METALS_API_KEY ? "✓ 已配置" : "✗ 未配置");
console.log("- COINGECKO_API_KEY:", COINGECKO_API_KEY ? "✓ 已配置" : "✗ 未配置（可选）");
console.log("- SUPABASE_URL:", SUPABASE_URL ? "✓ 已配置" : "✗ 未配置");
console.log("- SUPABASE_SERVICE_ROLE_KEY:", SUPABASE_SERVICE_ROLE_KEY ? "✓ 已配置" : "✗ 未配置");
console.log("");

type AssetSymbol = "GOLD" | "XAUT" | "PAXG";

interface PriceData {
  price: number;
  timestamp: string;
}

// 获取 GOLD 价格
async function fetchGoldPrice(): Promise<PriceData> {
  console.log("📊 测试 Metals.dev API (GOLD)...");
  const response = await fetch(
    `https://api.metals.dev/v1/latest?api_key=${METALS_API_KEY}&currency=USD&unit=toz`
  );

  if (!response.ok) {
    throw new Error(`Metals API 请求失败: ${response.statusText}`);
  }

  const data = await response.json();
  const price = data.metals?.gold || 0;
  const timestamp = data.timestamps?.metal || new Date().toISOString();

  console.log("✓ GOLD 价格获取成功:");
  console.log(`  价格: $${price.toFixed(2)}/oz`);
  console.log(`  时间: ${timestamp}`);
  console.log("");

  return { price, timestamp };
}

// 获取代币价格（XAUT/PAXG）
async function fetchTokenPrice(symbol: "XAUT" | "PAXG"): Promise<PriceData> {
  const tokenId = symbol === "XAUT" ? "tether-gold" : "pax-gold";
  console.log(`📊 测试 CoinGecko API (${symbol})...`);

  const headers: HeadersInit = {};
  if (COINGECKO_API_KEY) {
    headers["x-cg-demo-api-key"] = COINGECKO_API_KEY;
  }

  const response = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${tokenId}&vs_currencies=usd&include_last_updated_at=true`,
    { headers }
  );

  if (!response.ok) {
    throw new Error(`CoinGecko API 请求失败: ${response.statusText}`);
  }

  const data = await response.json();
  const price = data[tokenId]?.usd || 0;
  const timestamp = data[tokenId]?.last_updated_at
    ? new Date(data[tokenId].last_updated_at * 1000).toISOString()
    : new Date().toISOString();

  console.log(`✓ ${symbol} 价格获取成功:`);
  console.log(`  价格: $${price.toFixed(2)}`);
  console.log(`  时间: ${timestamp}`);
  console.log("");

  return { price, timestamp };
}

// 计算市值
function calculateMarketCap(symbol: AssetSymbol, price: number): number {
  switch (symbol) {
    case "GOLD":
      const GOLD_TOTAL_SUPPLY_OZ = 218000 * 1000 * 32.1507;
      return price * GOLD_TOTAL_SUPPLY_OZ;
    case "XAUT":
      const XAUT_SUPPLY = 600000;
      return price * XAUT_SUPPLY;
    case "PAXG":
      const PAXG_SUPPLY = 300000;
      return price * PAXG_SUPPLY;
  }
}

// 测试单个资产
async function testAsset(symbol: AssetSymbol) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`测试 ${symbol}`);
  console.log("=".repeat(60) + "\n");

  try {
    // 1. 获取价格
    const priceData = symbol === "GOLD"
      ? await fetchGoldPrice()
      : await fetchTokenPrice(symbol as "XAUT" | "PAXG");

    // 2. 测试 Supabase 连接
    console.log("💾 测试 Supabase 数据库连接...");
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: existingData, error: selectError } = await supabase
      .from("market_data")
      .select("price_usd")
      .eq("asset_symbol", symbol)
      .maybeSingle();

    if (selectError) {
      throw new Error(`数据库查询失败: ${selectError.message}`);
    }

    console.log("✓ 数据库连接成功");
    console.log(`  现有价格: ${existingData ? "$" + existingData.price_usd.toFixed(2) : "无数据"}`);
    console.log("");

    // 3. 计算市值和变化
    const oldPrice = existingData?.price_usd || priceData.price;
    const change_24h = priceData.price - oldPrice;
    const change_pct_24h = oldPrice !== 0 ? (change_24h / oldPrice) * 100 : 0;
    const market_cap = calculateMarketCap(symbol, priceData.price);

    console.log("📈 计算结果:");
    console.log(`  24h 变化: $${change_24h.toFixed(2)} (${change_pct_24h.toFixed(2)}%)`);
    console.log(`  总市值: $${(market_cap / 1e9).toFixed(2)} billion`);
    console.log("");

    // 4. 更新数据库
    console.log("💾 更新数据库...");

    if (existingData) {
      const { error: updateError } = await supabase
        .from("market_data")
        .update({
          price_usd: priceData.price,
          change_24h,
          change_pct_24h,
          market_cap,
          updated_at: priceData.timestamp,
        })
        .eq("asset_symbol", symbol);

      if (updateError) {
        throw new Error(`更新失败: ${updateError.message}`);
      }
      console.log("✓ market_data 更新成功");
    } else {
      const { error: insertError } = await supabase
        .from("market_data")
        .insert({
          asset_symbol: symbol,
          price_usd: priceData.price,
          change_24h,
          change_pct_24h,
          market_cap,
          updated_at: priceData.timestamp,
        });

      if (insertError) {
        throw new Error(`插入失败: ${insertError.message}`);
      }
      console.log("✓ market_data 插入成功");
    }

    // 5. 插入历史记录
    const { error: historyError } = await supabase
      .from("price_history")
      .insert({
        asset_symbol: symbol,
        price_usd: priceData.price,
        timeframe: "1H",
        timestamp: priceData.timestamp,
      });

    if (historyError) {
      throw new Error(`历史记录插入失败: ${historyError.message}`);
    }

    console.log("✓ price_history 插入成功");
    console.log(`\n✅ ${symbol} 测试通过！`);

    return true;
  } catch (error) {
    console.error(`\n❌ ${symbol} 测试失败:`, error.message);
    return false;
  }
}

// 运行所有测试
const assets: AssetSymbol[] = ["GOLD", "XAUT", "PAXG"];
const results = [];

for (const asset of assets) {
  const success = await testAsset(asset);
  results.push({ asset, success });
}

// 汇总结果
console.log("\n" + "=".repeat(60));
console.log("测试汇总");
console.log("=".repeat(60));
results.forEach(({ asset, success }) => {
  console.log(`${success ? "✅" : "❌"} ${asset}`);
});

const allPassed = results.every(r => r.success);
console.log(allPassed ? "\n🎉 所有测试通过！" : "\n⚠️ 部分测试失败");

Deno.exit(allPassed ? 0 : 1);
