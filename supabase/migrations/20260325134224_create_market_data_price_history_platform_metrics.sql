-- =====================
-- market_data
-- 存储各 Token 最新市场数据（每个 asset_symbol 只保留一行，upsert 更新）
-- =====================

CREATE TABLE IF NOT EXISTS market_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 资产标识
  asset_symbol TEXT UNIQUE NOT NULL,

  -- 价格数据（来自 Gold API）
  price_usd DECIMAL(18, 6) NOT NULL,
  change_24h DECIMAL(18, 6) NOT NULL DEFAULT 0,
  change_pct_24h DECIMAL(10, 6) NOT NULL DEFAULT 0,
  open_price DECIMAL(18, 6) NOT NULL DEFAULT 0,
  high_24h DECIMAL(18, 6) NOT NULL DEFAULT 0,
  low_24h DECIMAL(18, 6) NOT NULL DEFAULT 0,
  prev_close_price DECIMAL(18, 6) NOT NULL DEFAULT 0,

  -- 买卖价
  ask DECIMAL(18, 6),
  bid DECIMAL(18, 6),

  -- 克单位价格
  price_gram_24k DECIMAL(18, 6),

  -- 时间
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_market_data_symbol ON market_data(asset_symbol);
CREATE INDEX IF NOT EXISTS idx_market_data_updated_at ON market_data(updated_at DESC);

-- 自动更新 updated_at
CREATE TRIGGER update_market_data_updated_at
  BEFORE UPDATE ON market_data
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE market_data ENABLE ROW LEVEL SECURITY;

-- 任何人可读
CREATE POLICY "market_data_select_public"
  ON market_data FOR SELECT
  USING (true);

-- 只有 service_role 可写
CREATE POLICY "market_data_insert_service_role"
  ON market_data FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "market_data_update_service_role"
  ON market_data FOR UPDATE
  USING (auth.role() = 'service_role');


-- =====================
-- price_history
-- 存储价格历史记录（OHLC），按 asset_symbol + timeframe + timestamp 查询
-- =====================

CREATE TABLE IF NOT EXISTS price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 资产标识
  asset_symbol TEXT NOT NULL,

  -- OHLC 数据
  price_usd DECIMAL(18, 6) NOT NULL,
  open_price DECIMAL(18, 6) NOT NULL,
  high_price DECIMAL(18, 6) NOT NULL,
  low_price DECIMAL(18, 6) NOT NULL,
  close_price DECIMAL(18, 6) NOT NULL,

  -- 时间粒度
  timeframe TEXT NOT NULL CHECK (timeframe IN ('1h', '4h', '1d', '1w')),

  -- K 线时间戳（这根 K 线所代表的时间点）
  timestamp TIMESTAMPTZ NOT NULL,

  -- 写入时间
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 索引：最常见的查询模式 symbol + timeframe + timestamp DESC
CREATE INDEX IF NOT EXISTS idx_price_history_symbol_timeframe
  ON price_history(asset_symbol, timeframe, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_price_history_timestamp
  ON price_history(timestamp DESC);

-- RLS
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "price_history_select_public"
  ON price_history FOR SELECT
  USING (true);

CREATE POLICY "price_history_insert_service_role"
  ON price_history FOR INSERT
  WITH CHECK (auth.role() = 'service_role');


-- =====================
-- platform_metrics
-- 存储平台级别的统计指标（每个 metric_key 只保留一行，upsert 更新）
-- =====================

CREATE TABLE IF NOT EXISTS platform_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 指标 key，唯一
  metric_key TEXT UNIQUE NOT NULL,

  -- 指标值（数值型）
  numeric_value DECIMAL(30, 8) NOT NULL DEFAULT 0,

  -- 更新时间
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_platform_metrics_key ON platform_metrics(metric_key);

-- 自动更新 updated_at
CREATE TRIGGER update_platform_metrics_updated_at
  BEFORE UPDATE ON platform_metrics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE platform_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "platform_metrics_select_public"
  ON platform_metrics FOR SELECT
  USING (true);

CREATE POLICY "platform_metrics_insert_service_role"
  ON platform_metrics FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "platform_metrics_update_service_role"
  ON platform_metrics FOR UPDATE
  USING (auth.role() = 'service_role');

-- 插入初始指标 key（值默认为 0，由后端定时任务更新）
INSERT INTO platform_metrics (metric_key, numeric_value) VALUES
  ('gold_tokens_market_cap',         0),
  ('gold_tokens_market_cap_change',  0),
  ('total_token_holders',            0),
  ('total_token_holders_change',     0),
  ('gold_tokens_volume_24h',         0),
  ('gold_tokens_volume_24h_change',  0)
ON CONFLICT (metric_key) DO NOTHING;
