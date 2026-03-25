// Deno Deploy: 定时获取金价及代币价格并更新 Supabase 数据库
// Deploy: https://dash.deno.com/

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { load } from "https://deno.land/std@0.224.0/dotenv/mod.ts";

// 加载 .env 文件（本地开发时使用，Deno Deploy 会自动使用环境变量）
await load({ export: true });

// 环境变量配置（在 Deno Deploy Dashboard 中设置）
const METALS_API_KEY = Deno.env.get("METALS_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const COINGECKO_API_KEY = Deno.env.get("COINGECKO_API_KEY") || "";
const ETHERSCAN_API_KEY = Deno.env.get("ETHERSCAN_API_KEY") || "";

interface PriceData {
  price: number;
  timestamp: string;
}

interface TokenDetailData extends PriceData {
  volume_24h?: number;
  high_24h?: number;
  low_24h?: number;
  market_cap?: number;
  circulating_supply?: number;
  total_supply?: number;
  tvl?: number;
  holders_count?: number;
  ath?: number;
  ath_date?: string;
  atl?: number;
  atl_date?: string;
}

type AssetSymbol = "GOLD" | "XAUT" | "PAXG";

// ERC-20 代币合约地址映射
const TOKEN_CONTRACTS: Record<string, string> = {
  PAXG: "0x45804880De22913dAFE09f4980848ECE6EcbAf78",
  XAUT: "0x68749665FF8D2d112Fa859AA293F07A622782F38",
};

// 从 Metals.dev API 获取金价
async function fetchGoldPrice(): Promise<PriceData> {
  const response = await fetch(
    `https://api.metals.dev/v1/latest?api_key=${METALS_API_KEY}&currency=USD&unit=toz`
  );

  if (!response.ok) {
    throw new Error(`Metals API request failed: ${response.statusText}`);
  }

  const data = await response.json();
  const price = data.metals?.gold || 0;

  return {
    price,
    timestamp: data.timestamps?.metal || new Date().toISOString(),
  };
}

// 从 CoinGecko API 获取代币详细数据
async function fetchTokenDetailData(tokenId: string): Promise<TokenDetailData> {
  const headers: HeadersInit = {};
  if (COINGECKO_API_KEY) {
    headers["x-cg-demo-api-key"] = COINGECKO_API_KEY;
  }

  // 使用 coins/{id} API 获取完整数据
  const response = await fetch(
    `https://api.coingecko.com/api/v3/coins/${tokenId}?localization=false&tickers=false&community_data=false&developer_data=false`,
    { headers }
  );

  if (!response.ok) {
    throw new Error(`CoinGecko API request failed: ${response.statusText}`);
  }

  const data = await response.json();
  
  return {
    price: data.market_data?.current_price?.usd || 0,
    timestamp: data.last_updated || new Date().toISOString(),
    volume_24h: data.market_data?.total_volume?.usd,
    high_24h: data.market_data?.high_24h?.usd,
    low_24h: data.market_data?.low_24h?.usd,
    market_cap: data.market_data?.market_cap?.usd,
    circulating_supply: data.market_data?.circulating_supply,
    total_supply: data.market_data?.total_supply,
    tvl: data.market_data?.total_value_locked?.usd, // 使用 CoinGecko 提供的 TVL 数据
    ath: data.market_data?.ath?.usd,
    ath_date: data.market_data?.ath_date?.usd,
    atl: data.market_data?.atl?.usd,
    atl_date: data.market_data?.atl_date?.usd,
  };
}

// 从 Blockscout API 获取代币持仓人数（免费，无需 API key）
async function fetchTokenHoldersCount(contractAddress: string): Promise<number | undefined> {
  try {
    // 使用 Blockscout API 获取持有者数量（完全免费）
    const response = await fetch(
      `https://eth.blockscout.com/api/v2/tokens/${contractAddress}`
    );

    if (!response.ok) {
      console.warn(`⚠️ Blockscout API 请求失败 (${response.status}): ${response.statusText}`);
      return undefined;
    }

    const data = await response.json();
    
    console.log(`📊 Blockscout 返回数据:`, { 
      holders_count: data.holders_count, 
      name: data.name,
      symbol: data.symbol,
      address: contractAddress 
    });
    
    // Blockscout 直接返回 holders_count 字段（字符串格式）
    if (data.holders_count) {
      const count = typeof data.holders_count === 'string' 
        ? parseInt(data.holders_count.replace(/,/g, '')) 
        : data.holders_count;
      return count;
    }
    
    return undefined;
  } catch (error) {
    console.warn(`⚠️ 获取持仓人数失败 (${contractAddress}):`, error.message);
    return undefined;
  }
}

// 从 CoinGecko API 获取代币价格（简化版本）
async function fetchTokenPrice(tokenId: string): Promise<PriceData> {
  const headers: HeadersInit = {};
  if (COINGECKO_API_KEY) {
    headers["x-cg-demo-api-key"] = COINGECKO_API_KEY;
  }

  const response = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${tokenId}&vs_currencies=usd&include_last_updated_at=true`,
    { headers }
  );

  if (!response.ok) {
    throw new Error(`CoinGecko API request failed: ${response.statusText}`);
  }

  const data = await response.json();
  const price = data[tokenId]?.usd || 0;
  const timestamp = data[tokenId]?.last_updated_at 
    ? new Date(data[tokenId].last_updated_at * 1000).toISOString()
    : new Date().toISOString();

  return { price, timestamp };
}

// 获取资产价格（根据类型）
async function fetchAssetPrice(symbol: AssetSymbol): Promise<PriceData> {
  switch (symbol) {
    case "GOLD":
      return fetchGoldPrice();
    case "XAUT":
      return fetchTokenPrice("tether-gold");
    case "PAXG":
      return fetchTokenPrice("pax-gold");
    default:
      throw new Error(`Unknown asset symbol: ${symbol}`);
  }
}

// 获取资产完整数据（包含详细指标）
async function fetchAssetDetailData(symbol: AssetSymbol): Promise<TokenDetailData> {
  let detailData: TokenDetailData;
  
  switch (symbol) {
    case "GOLD":
      return fetchGoldPrice();
    case "XAUT":
      detailData = await fetchTokenDetailData("tether-gold");
      break;
    case "PAXG":
      detailData = await fetchTokenDetailData("pax-gold");
      break;
    default:
      throw new Error(`Unknown asset symbol: ${symbol}`);
  }
  
  // 获取持仓人数（仅适用于代币）
  if (TOKEN_CONTRACTS[symbol]) {
    console.log(`🔍 正在获取 ${symbol} 的持仓人数...`);
    const holdersCount = await fetchTokenHoldersCount(TOKEN_CONTRACTS[symbol]);
    console.log(`📊 ${symbol} 持仓人数:`, holdersCount);
    if (holdersCount !== undefined) {
      detailData.holders_count = holdersCount;
    }
  }
  
  return detailData;
}

// 计算资产市值
function calculateMarketCap(symbol: AssetSymbol, price: number): number {
  switch (symbol) {
    case "GOLD":
      // 总储量: 218,000 吨 = 7,007,651,000 盎司
      const GOLD_TOTAL_SUPPLY_OZ = 218000 * 1000 * 32.1507;
      return price * GOLD_TOTAL_SUPPLY_OZ;
    case "XAUT":
      // XAUT 流通供应量约 600,000 代币（每个代币 = 1 盎司黄金）
      const XAUT_SUPPLY = 600000;
      return price * XAUT_SUPPLY;
    case "PAXG":
      // PAXG 流通供应量约 300,000 代币（每个代币 = 1 盎司黄金）
      const PAXG_SUPPLY = 300000;
      return price * PAXG_SUPPLY;
    default:
      return 0;
  }
}

// 更新 Supabase 数据库
async function updateDatabase(symbol: AssetSymbol, priceData: PriceData | TokenDetailData) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // 获取旧价格用于计算变化
  const { data: existingData } = await supabase
    .from("market_data")
    .select("price_usd")
    .eq("asset_symbol", symbol)
    .maybeSingle();

  const oldPrice = existingData?.price_usd || priceData.price;
  const change_24h = priceData.price - oldPrice;
  const change_pct_24h = oldPrice !== 0 ? (change_24h / oldPrice) * 100 : 0;
  
  // 如果是TokenDetailData，使用API返回的market_cap，否则计算
  const detailData = priceData as TokenDetailData;
  const market_cap = detailData.market_cap || calculateMarketCap(symbol, priceData.price);

  // 构建更新数据对象
  const updateData: any = {
    price_usd: priceData.price,
    change_24h,
    change_pct_24h,
    market_cap,
    updated_at: priceData.timestamp,
  };

  // 如果有详细数据，添加额外字段
  if (detailData.volume_24h !== undefined) updateData.volume_24h = detailData.volume_24h;
  if (detailData.high_24h !== undefined) updateData.high_24h = detailData.high_24h;
  if (detailData.low_24h !== undefined) updateData.low_24h = detailData.low_24h;
  if (detailData.circulating_supply !== undefined) updateData.circulating_supply = detailData.circulating_supply;
  if (detailData.total_supply !== undefined) updateData.total_supply = detailData.total_supply;
  if (detailData.tvl !== undefined) updateData.tvl = detailData.tvl;
  if (detailData.holders_count !== undefined) updateData.holders_count = detailData.holders_count;
  if (detailData.ath !== undefined) updateData.ath = detailData.ath;
  if (detailData.ath_date !== undefined) updateData.ath_date = detailData.ath_date;
  if (detailData.atl !== undefined) updateData.atl = detailData.atl;
  if (detailData.atl_date !== undefined) updateData.atl_date = detailData.atl_date;

  // 更新或插入 market_data 表
  if (existingData) {
    await supabase
      .from("market_data")
      .update(updateData)
      .eq("asset_symbol", symbol);
  } else {
    await supabase.from("market_data").insert({
      asset_symbol: symbol,
      ...updateData,
    });
  }

  // 插入价格历史记录
  await supabase.from("price_history").insert({
    asset_symbol: symbol,
    price_usd: priceData.price,
    timeframe: "1H",
    timestamp: priceData.timestamp,
  });

  console.log(`✅ ${symbol} 价格已更新: $${priceData.price.toFixed(2)}`);
}

// 更新所有资产价格（使用详细数据）
async function updateAllAssets() {
  const assets: AssetSymbol[] = ["GOLD", "XAUT", "PAXG"];
  const results = [];

  for (const symbol of assets) {
    try {
      console.log(`📊 获取 ${symbol} 详细数据...`);
      const detailData = await fetchAssetDetailData(symbol);
      await updateDatabase(symbol, detailData);
      results.push({ symbol, success: true, price: detailData.price });
    } catch (error) {
      console.error(`❌ ${symbol} 更新失败:`, error);
      results.push({ symbol, success: false, error: error.message });
    }
  }

  return results;
}

// 手动触发更新（HTTP 请求）
async function handleRequest(req: Request): Promise<Response> {
  try {
    const url = new URL(req.url);
    const asset = url.searchParams.get("asset")?.toUpperCase() as AssetSymbol | null;

    // 如果指定了资产，只更新该资产（使用详细数据）
    if (asset && ["GOLD", "XAUT", "PAXG"].includes(asset)) {
      console.log(`📊 开始获取 ${asset} 详细数据...`);
      const detailData = await fetchAssetDetailData(asset);
      await updateDatabase(asset, detailData);

      return new Response(
        JSON.stringify({
          success: true,
          data: { symbol: asset, ...detailData },
        }),
        {
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 否则更新所有资产
    console.log("📊 开始获取所有资产价格...");
    const results = await updateAllAssets();

    return new Response(
      JSON.stringify({
        success: true,
        data: results,
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("❌ 错误:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// Deno Deploy 定时任务：每小时整点执行
// 注意：仅在生产环境中可用，Preview 部署不支持
if (typeof Deno.cron === "function") {
  Deno.cron("update all assets", "0 * * * *", async () => {
    console.log("⏰ 定时任务触发: 更新所有资产价格");
    try {
      await updateAllAssets();
    } catch (error) {
      console.error("❌ 定时任务失败:", error);
    }
  });
} else {
  console.log("ℹ️ Deno.cron 不可用（可能是 Preview 部署）");
}

// 启动 HTTP 服务器（支持手动触发）
Deno.serve(handleRequest);
