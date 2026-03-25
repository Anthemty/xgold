# GOX Backend — 开发文档

## 概述

GOX Backend 是一个基于 **Bun + Hono + Supabase** 的后端服务，主要职责：

- 定时采集外部黄金价格数据（goldapi.io）并写入 Supabase
- 对外暴露 REST API，供前端调用
- 管理市场数据、价格历史、平台指标

---

## 技术栈

| 技术 | 用途 | 版本 |
|------|------|------|
| [Bun](https://bun.sh) | 运行时 + 包管理器 | >= 1.1 |
| [Hono](https://hono.dev) | HTTP 框架 | ^4.x |
| [Supabase JS](https://supabase.com/docs/reference/javascript) | 数据库客户端 | ^2.x |
| TypeScript | 语言 | ^5.x |
| [Biome](https://biomejs.dev) | Linter + Formatter | ^2.x |

---

## 项目结构

```
backend/
├── src/
│   ├── index.ts              # 入口：启动 HTTP 服务 + 定时任务
│   ├── app.ts                # Hono app 实例，注册所有路由
│   ├── routes/
│   │   ├── market.ts         # GET /api/market — 市场数据
│   │   ├── prices.ts         # GET /api/prices/:symbol — 价格历史
│   │   ├── tokens.ts         # GET /api/tokens — Token 列表
│   │   └── metrics.ts        # GET /api/metrics — 平台指标
│   ├── jobs/
│   │   ├── index.ts          # 注册并启动所有定时任务
│   │   └── syncPrices.ts     # 定时拉取价格并写入 Supabase
│   ├── services/
│   │   ├── goldapi.ts        # goldapi.io API 封装
│   │   └── supabase.ts       # Supabase 客户端 + 数据操作
│   ├── types/
│   │   └── index.ts          # 全局类型定义
│   └── config.ts             # 环境变量读取与校验
├── .env.example              # 环境变量模板
├── .gitignore
├── biome.json                # Biome 配置（与前端保持一致）
├── package.json
├── tsconfig.json
├── Dockerfile
└── DEVELOPMENT.md            # 本文档
```

---

## 本地开发

### 前置条件

- Bun >= 1.1（[安装文档](https://bun.sh/docs/installation)）
- Supabase 项目（[supabase.com/dashboard](https://supabase.com/dashboard)）
- Gold API Key（[goldapi.io](https://www.goldapi.io)）

### 快速开始

```bash
# 1. 进入后端目录
cd backend

# 2. 安装依赖
bun install

# 3. 配置环境变量
cp .env.example .env
# 编辑 .env，填入真实值

# 4. 启动开发服务器（热重载）
bun run dev
```

服务默认运行在 `http://localhost:4000`

### 可用脚本

| 命令 | 说明 |
|------|------|
| `bun run dev` | 启动开发服务器（`--hot` 热重载） |
| `bun run start` | 启动生产服务器 |
| `bun run lint` | 运行 Biome 代码检查 |
| `bun run format` | 格式化代码 |
| `bun run check` | Biome 完整检查并自动修复 |
| `bun run typecheck` | TypeScript 类型检查 |

---

## 环境变量

文件：`backend/.env`

```env
# 服务配置
PORT=4000
NODE_ENV=development

# Supabase（必需）
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Gold API（必需，用于价格采集）
GOLD_API_KEY=your_goldapi_key

# 定时任务间隔（单位：毫秒，默认 5 分钟）
PRICE_SYNC_INTERVAL_MS=300000

# CORS 允许的前端域名（多个用逗号分隔）
CORS_ORIGIN=http://localhost:3000
```

> **注意**：后端使用 `SUPABASE_SERVICE_ROLE_KEY`（服务端密钥），拥有完整写权限，**绝对不能暴露给前端**。前端使用的是 `SUPABASE_ANON_KEY`。

### 获取密钥

| 密钥 | 获取方式 |
|------|----------|
| `SUPABASE_URL` | Supabase Dashboard → 项目 → Settings → API → Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → 项目 → Settings → API → service_role |
| `GOLD_API_KEY` | [goldapi.io](https://www.goldapi.io) → 注册后在 Dashboard 获取 |

---

## Gold API 说明

Gold API（goldapi.io）提供实时贵金属现货价格数据。

### 请求格式

```
GET https://www.goldapi.io/api/{symbol}/{currency}
GET https://www.goldapi.io/api/{symbol}/{currency}/{date}
```

**Header**

```
x-access-token: YOUR_GOLD_API_KEY
Content-Type: application/json
```

### 支持的 Symbol

| Symbol | 说明 |
|--------|------|
| `XAU` | 黄金（Gold） |
| `XAG` | 白银（Silver） |
| `XPT` | 铂金（Platinum） |
| `XPD` | 钯金（Palladium） |

### 支持的 Currency

`USD`、`EUR`、`GBP`、`CNY` 等主流货币，本项目统一使用 `USD`。

### 响应示例

```json
{
  "timestamp": 1734172800,
  "metal": "XAU",
  "currency": "USD",
  "exchange": "FOREXCOM",
  "symbol": "FOREXCOM:XAUUSD",
  "prev_close_price": 3238.50,
  "open_price": 3240.00,
  "low_price": 3238.50,
  "high_price": 3261.00,
  "open_time": 1734134400,
  "price": 3250.45,
  "ch": 11.95,
  "chp": 0.37,
  "ask": 3251.00,
  "bid": 3249.90,
  "price_gram_24k": 104.52,
  "price_gram_22k": 95.81,
  "price_gram_21k": 91.46,
  "price_gram_18k": 78.39
}
```

### 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `timestamp` | `number` | Unix 时间戳（秒） |
| `metal` | `string` | 金属符号（`XAU` 等） |
| `currency` | `string` | 计价货币（`USD`） |
| `price` | `number` | 当前价格（USD/troy oz） |
| `ch` | `number` | 24h 价格变动（绝对值） |
| `chp` | `number` | 24h 价格变动（百分比） |
| `open_price` | `number` | 当日开盘价 |
| `high_price` | `number` | 当日最高价 |
| `low_price` | `number` | 当日最低价 |
| `prev_close_price` | `number` | 前一日收盘价 |
| `ask` | `number` | 卖出价 |
| `bid` | `number` | 买入价 |
| `price_gram_24k` | `number` | 每克 24K 黄金价格（USD） |

### 历史价格

```
GET https://www.goldapi.io/api/XAU/USD/20241201
```

日期格式：`YYYYMMDD`

### 请求限制

| 套餐 | 每月请求数 |
|------|-----------|
| Free | 100 次 |
| Basic | 1,000 次 |
| Pro | 10,000 次 |

> **重要**：Free 套餐每月仅 100 次，`PRICE_SYNC_INTERVAL_MS` 务必根据套餐合理设置。
> - Free（100次/月）：间隔不低于 `26000000`（约 7.2 小时）
> - Basic（1,000次/月）：间隔不低于 `2600000`（约 43 分钟）
> - Pro（10,000次/月）：间隔不低于 `300000`（5 分钟）

---

## API 文档

Base URL：`http://localhost:4000`

### GET /health

健康检查。

**Response**
```json
{
  "status": "ok",
  "timestamp": "2024-12-14T10:00:00.000Z"
}
```

---

### GET /api/tokens

获取所有活跃 Token 列表。

**Query 参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| `tradable` | `boolean` | 只返回可交易 Token |
| `stakeable` | `boolean` | 只返回可质押 Token |

**Response**
```json
{
  "data": [
    {
      "id": "uuid",
      "symbol": "gXAU",
      "name": "gXAU Token",
      "contractAddress": "0x...",
      "decimals": 18,
      "isTradable": true,
      "isStakeable": true,
      "iconUrl": "/tokens/gxau.svg"
    }
  ]
}
```

---

### GET /api/market

获取所有 Token 的最新市场数据（价格、涨跌幅等）。

**Response**
```json
{
  "data": [
    {
      "assetSymbol": "gXAU",
      "priceUsd": 3250.45,
      "change24h": 11.95,
      "changePct24h": 0.37,
      "openPrice": 3240.00,
      "high24h": 3261.00,
      "low24h": 3238.50,
      "prevClosePrice": 3238.50,
      "updatedAt": "2024-12-14T10:00:00.000Z"
    }
  ]
}
```

---

### GET /api/prices/:symbol

获取指定 Token 的价格历史。

**Path 参数**

| 参数 | 说明 |
|------|------|
| `symbol` | Token 符号，如 `gXAU`、`PAXG` |

**Query 参数**

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `timeframe` | `1h` \| `4h` \| `1d` \| `1w` | `1d` | 时间粒度 |
| `limit` | `number` | `100` | 返回条数上限 |

**Response**
```json
{
  "data": [
    {
      "timestamp": "2024-12-14T10:00:00.000Z",
      "openPrice": 3240.00,
      "highPrice": 3261.00,
      "lowPrice": 3238.50,
      "closePrice": 3250.45,
      "priceUsd": 3250.45
    }
  ]
}
```

---

### GET /api/metrics

获取平台整体指标（市值、持有者数、交易量等）。

**Response**
```json
{
  "data": {
    "goldTokensMarketCap": 12500000000,
    "goldTokensMarketCapChange": 2.4,
    "totalTokenHolders": 48200,
    "totalTokenHoldersChange": 320,
    "goldTokensVolume24h": 187500000,
    "goldTokensVolume24hChange": 12.3
  }
}
```

---

## 数据库

后端使用 Supabase（PostgreSQL）。所有 migration 文件统一放在根目录 `supabase/migrations/`。

### 现有表

| 表名 | 说明 |
|------|------|
| `tokens` | Token 基础信息、合约地址、预言机配置 |
| `market_data` | 各 Token 最新市场数据（价格、涨跌幅） |
| `price_history` | 价格历史记录（OHLC）|
| `platform_metrics` | 平台级指标（市值、持有者数等）|

### 新增 Migration

```bash
# 在 supabase/migrations/ 下新建文件
# 命名规范：YYYYMMDD_描述.sql
touch ../../supabase/migrations/20241214_create_market_data_table.sql
```

---

## 定时任务

价格同步任务（`src/jobs/syncPrices.ts`）按 `PRICE_SYNC_INTERVAL_MS` 间隔执行：

1. 调用 Gold API（`GET /api/XAU/USD`）获取最新黄金现货价格
2. 将响应字段（`price`、`ch`、`chp`、`open_price`、`high_price`、`low_price`、`prev_close_price`）映射到内部数据结构
3. Upsert `market_data` 表（以 `asset_symbol` 为唯一键）
4. 插入一条 OHLC 记录到 `price_history` 表
5. 更新 `platform_metrics` 相关指标

---

## 部署（Dokploy）

### 构建配置

| 配置项 | 值 |
|--------|-----|
| 根目录 | `backend` |
| 构建命令 | `bun install` |
| 启动命令 | `bun run start` |
| 端口 | `4000` |
| Dockerfile | `backend/Dockerfile` |

### 环境变量

在 Dokploy 项目设置 → 环境变量中添加：

```env
NODE_ENV=production
PORT=4000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GOLD_API_KEY=your_goldapi_key
PRICE_SYNC_INTERVAL_MS=300000
CORS_ORIGIN=https://your-frontend-domain.com
```

### Dockerfile 说明

后端使用官方 Bun 镜像，多阶段构建以减小镜像体积：

```dockerfile
FROM oven/bun:1 AS base
WORKDIR /app

# 安装依赖
FROM base AS deps
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

# 生产镜像
FROM base AS runner
COPY --from=deps /app/node_modules ./node_modules
COPY src ./src
COPY tsconfig.json .

EXPOSE 4000
CMD ["bun", "run", "start"]
```

---

## 代码规范

与前端保持一致，使用 **Biome** 作为 Linter + Formatter：

- 缩进：2 空格
- 引号：双引号
- 分号：必须
- TypeScript 严格模式
- 禁止 `var`，使用 `const`/`let`

提交前请运行：
```bash
bun run check
```

---

## 错误处理规范

所有 API 统一返回格式：

**成功**
```json
{
  "data": { ... }
}
```

**失败**
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Token not found"
  }
}
```

HTTP 状态码：

| 状态码 | 场景 |
|--------|------|
| `200` | 成功 |
| `400` | 参数错误 |
| `404` | 资源不存在 |
| `500` | 服务器内部错误 |

---

## 开发路线图

- [x] 文档
- [ ] 项目初始化（`package.json`、`tsconfig.json`、`biome.json`）
- [ ] Hono app 基础结构
- [ ] Supabase 服务封装
- [ ] Gold API 服务封装（`src/services/goldapi.ts`）
- [ ] 定时价格同步任务
- [ ] REST API 路由实现
- [ ] Supabase Migration（`market_data`、`price_history`、`platform_metrics`）
- [ ] Dockerfile
- [ ] Dokploy 部署