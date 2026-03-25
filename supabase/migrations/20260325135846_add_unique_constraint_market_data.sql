-- 先清理 market_data 中重复的 asset_symbol 数据（保留每个 symbol 最新一条）
WITH ranked AS (
  SELECT
    id,
    asset_symbol,
    ROW_NUMBER() OVER (
      PARTITION BY asset_symbol
      ORDER BY updated_at DESC NULLS LAST, id DESC
    ) AS rn
  FROM market_data
),
to_delete AS (
  SELECT id
  FROM ranked
  WHERE rn > 1
)
DELETE FROM market_data
WHERE id IN (SELECT id FROM to_delete);

-- 添加唯一约束（用于 upsert ON CONFLICT (asset_symbol)）
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'market_data_asset_symbol_key'
  ) THEN
    ALTER TABLE market_data
      ADD CONSTRAINT market_data_asset_symbol_key UNIQUE (asset_symbol);
  END IF;
END $$;

-- 为 platform_metrics.metric_key 补充唯一约束（用于 upsert ON CONFLICT (metric_key)）
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'platform_metrics_metric_key_key'
  ) THEN
    ALTER TABLE platform_metrics
      ADD CONSTRAINT platform_metrics_metric_key_key UNIQUE (metric_key);
  END IF;
END $$;
