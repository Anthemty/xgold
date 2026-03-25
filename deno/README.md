# Deno Deploy - 黄金资产价格定时更新服务

使用 Deno Deploy 部署的黄金资产价格自动更新服务，每小时从 Metals.dev 和 CoinGecko API 获取最新价格并更新到 Supabase 数据库。

## 功能特性

- ⏰ **自动定时更新**: 使用 `Deno.cron()` 每小时整点自动执行
- 📊 **多资产支持**: 支持 GOLD（现货黄金）、XAUT（Tether Gold）、PAXG（Paxos Gold）
- 🌍 **边缘计算**: Deno Deploy 全球边缘节点，低延迟
- 🔒 **安全存储**: 环境变量在 Deno Deploy Dashboard 中配置
- 💾 **数据库同步**: 自动更新 Supabase 的 `market_data` 和 `price_history` 表

## 支持的资产

| 资产 | 符号 | 数据源 | 说明 |
|------|------|--------|------|
| 现货黄金 | GOLD | Metals.dev | 国际现货黄金价格（美元/盎司） |
| Tether Gold | XAUT | CoinGecko | ERC-20 黄金代币 |
| Paxos Gold | PAXG | CoinGecko | ERC-20 黄金代币 |

## 本地开发

### 1. 安装 Deno

```bash
# macOS/Linux
curl -fsSL https://deno.land/install.sh | sh

# 或使用 Homebrew
brew install deno
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env`，填入真实的 API Key：

```bash
cp .env.example .env
```

### 3. 本地运行

```bash
# 开发模式（支持热重载）
deno task dev

# 或直接运行
deno run --allow-net --allow-env main.ts
```

### 4. 测试 HTTP 端点

```bash
# 更新所有资产
curl http://localhost:8000

# 只更新特定资产
curl http://localhost:8000?asset=GOLD
curl http://localhost:8000?asset=XAUT
curl http://localhost:8000?asset=PAXG
```

## 部署到 Deno Deploy

### 方法一：通过 GitHub 自动部署（推荐）

1. 将代码推送到 GitHub 仓库
2. 访问 [Deno Deploy Dashboard](https://dash.deno.com/)
3. 点击 **New Project**
4. 选择 **GitHub** 集成
5. 选择仓库和分支
6. 设置 **Entrypoint**: `deno/main.ts`
7. 添加环境变量:
   - `METALS_API_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
8. 点击 **Deploy**

### 方法二：使用 deployctl CLI

```bash
# 安装 deployctl
deno install --allow-all --no-check -r -f https://deno.land/x/deploy/deployctl.ts

# 部署
deployctl deploy --project=your-project-name main.ts
```

## 环境变量配置

在 Deno Deploy Dashboard 的 **Settings > Environment Variables** 中添加：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `METALS_API_KEY` | `TMHYEEV6MKXYCPOQW0AE...` | Metals.dev API 密钥（必需） |
| `COINGECKO_API_KEY` | `CG-xxx...` | CoinGecko API 密钥（可选，用于提高速率限制） |
| `SUPABASE_URL` | `https://tqmskmshychajelvhiyc.supabase.co` | Supabase 项目 URL（必需） |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGci...` | Supabase Service Role Key（必需） |

## Cron 表达式说明

当前配置: `"0 * * * *"` - 每小时整点执行

其他常用配置：
- `"*/30 * * * *"` - 每 30 分钟
- `"0 */6 * * *"` - 每 6 小时
- `"0 0 * * *"` - 每天午夜

## 数据库表结构

### market_data 表
```sql
asset_symbol    | TEXT (PK)
price_usd       | NUMERIC
change_24h      | NUMERIC
change_pct_24h  | NUMERIC
market_cap      | NUMERIC
updated_at      | TIMESTAMP
```

### price_history 表
```sql
asset_symbol    | TEXT
price_usd       | NUMERIC
timeframe       | TEXT
timestamp       | TIMESTAMP
```

## 监控与日志

- 访问 Deno Deploy Dashboard 查看实时日志
- 定时任务执行日志会显示 "⏰ 定时任务触发: 更新金价"
- 手动触发日志显示 "📊 开始获取金价..."

## 手动触发更新

访问你的部署 URL 即可手动触发更新：

```bash
curl https://your-project.deno.dev
```

## 故障排查

1. **定时任务未执行**: 检查 Deno Deploy 日志，确认 cron 已注册
2. **API 调用失败**: 验证 `METALS_API_KEY` 是否正确
3. **数据库更新失败**: 检查 `SUPABASE_SERVICE_ROLE_KEY` 权限

## 成本

- **Deno Deploy 免费版**: 每月 100 万次请求（每小时执行完全够用）
- **Metals.dev API**: 根据你的订阅计划
- **Supabase**: 免费版支持 50,000 次数据库请求/月

## 相关链接

- [Deno Deploy 文档](https://deno.com/deploy/docs)
- [Deno Cron API](https://deno.com/deploy/docs/cron)
- [Metals.dev API](https://metals.dev/docs)
# dex-deno
