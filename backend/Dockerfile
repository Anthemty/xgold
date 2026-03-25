# =====================
# Stage 1: 安装依赖
# =====================
FROM oven/bun:1 AS deps

WORKDIR /app

COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile --production

# =====================
# Stage 2: 生产镜像
# =====================
FROM oven/bun:1-slim AS runner

WORKDIR /app

ENV NODE_ENV=production

# 从 deps 阶段复制 node_modules
COPY --from=deps /app/node_modules ./node_modules

# 复制源码和配置
COPY src ./src
COPY tsconfig.json .

EXPOSE 4000

CMD ["bun", "run", "src/index.ts"]
