-- 创建 tokens 表（简化版，单链，适用于所有功能）
CREATE TABLE IF NOT EXISTS tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 基础信息
  symbol TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  
  -- UI 显示（使用图片 URL）
  icon_url TEXT NOT NULL,
  gradient_class TEXT,
  
  -- 合约信息（单链）
  contract_address TEXT NOT NULL,
  decimals INT DEFAULT 18,
  
  -- 预言机配置
  oracle_type TEXT CHECK (oracle_type IN ('chainlink', 'pyth', 'fixed')),
  oracle_address TEXT,
  oracle_decimals INT DEFAULT 8,
  fixed_price_usd DECIMAL(18, 8),
  
  -- 功能开关
  is_tradable BOOLEAN DEFAULT true,
  is_stakeable BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  -- Swap 配置
  min_swap_amount DECIMAL(30, 18),
  max_swap_amount DECIMAL(30, 18),
  swap_fee_percentage DECIMAL(5, 4) DEFAULT 0.003,
  
  -- Stake 配置
  min_stake_amount DECIMAL(30, 18),
  stake_apy DECIMAL(8, 4),
  lock_period_days INT,
  
  -- 元数据
  website_url TEXT,
  coingecko_id TEXT,
  sort_order INT DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_tokens_active ON tokens(is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_tokens_tradable ON tokens(is_tradable) WHERE is_tradable = true;
CREATE INDEX IF NOT EXISTS idx_tokens_stakeable ON tokens(is_stakeable) WHERE is_stakeable = true;

-- 插入初始数据
INSERT INTO tokens (
  symbol, name, description, icon_url, gradient_class, 
  contract_address, decimals,
  oracle_type, oracle_address, oracle_decimals, fixed_price_usd,
  is_tradable, is_stakeable, 
  min_swap_amount, max_swap_amount, swap_fee_percentage,
  sort_order
) VALUES
(
  'gXAU', 
  'gXAU Token', 
  'Platform native gold-backed token',
  '/tokens/gxau.svg', 
  'from-yellow-400 to-amber-600',
  '0x0000000000000000000000000000000000000000',
  18,
  'chainlink',
  '0x214eD9Da11D2fbe465a6fc601a91E62EbEc1a0D6',
  8,
  NULL,
  true,
  true,
  0.001,
  10000,
  0.003,
  1
),
(
  'PAXG', 
  'Pax Gold', 
  'Gold-backed ERC-20 token by Paxos',
  '/tokens/paxg.svg', 
  'from-amber-400 to-yellow-600',
  '0x45804880De22913dAFE09f4980848ECE6EcbAf78',
  18,
  'chainlink',
  '0x9B97304EA12EFed0FAd976FBeCAad46016bf269e',
  8,
  NULL,
  true,
  false,
  0.001,
  10000,
  0.003,
  2
),
(
  'XAUT', 
  'Tether Gold', 
  'Gold-backed token by Tether',
  '/tokens/xaut.svg', 
  'from-yellow-500 to-orange-500',
  '0x68749665FF8D2d112Fa859AA293F07A622782F38',
  6,
  'chainlink',
  '0x214eD9Da11D2fbe465a6fc601a91E62EbEc1a0D6',
  8,
  NULL,
  true,
  false,
  0.001,
  10000,
  0.003,
  3
),
(
  'USDT', 
  'Tether USD', 
  'Leading stablecoin pegged to USD',
  '/tokens/usdt.svg', 
  'from-green-500 to-emerald-600',
  '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  6,
  'fixed',
  NULL,
  NULL,
  1.0,
  true,
  false,
  1,
  1000000,
  0.003,
  4
)
ON CONFLICT (symbol) DO NOTHING;

-- 添加更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tokens_updated_at
  BEFORE UPDATE ON tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
