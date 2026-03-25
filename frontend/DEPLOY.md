# Frontend Deployment Guide

## Dokploy 部署配置

### 环境变量设置

在 Dokploy 项目设置中添加以下环境变量：

#### 必需的环境变量

```bash
# Supabase 配置（必需）
NEXT_PUBLIC_SUPABASE_URL=https://tqmskmshychajelvhiyc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Reown (WalletConnect) 项目 ID（必需）
NEXT_PUBLIC_REOWN_PROJECT_ID=your_reown_project_id_here
```

#### 可选的环境变量

```bash
# Metals.dev API Key（可选，用于后端服务）
METALS_API_KEY=your_metals_api_key_here
```

### 部署步骤

1. **在 Dokploy 中创建新项目**
   - 选择 GitHub 仓库
   - 分支: `main`
   - 根目录: `frontend`

2. **设置环境变量**
   - 进入项目设置 > 环境变量
   - 添加上述必需的环境变量

3. **构建配置**
   - 构建命令: `bun install && bun run build`
   - 启动命令: `bun run start`
   - 端口: `3000`

4. **部署**
   - 点击部署按钮
   - 等待构建完成

### 故障排查

#### 错误: `supabaseUrl is required`

这表示构建时缺少 Supabase 环境变量。确保在 Dokploy 项目设置中已添加：
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

#### 构建缓存问题

如果遇到缓存问题，在 Dokploy 中：
1. 进入项目设置
2. 清除构建缓存
3. 重新部署

### 本地开发

```bash
# 1. 复制环境变量模板
cp .env.example .env.local

# 2. 编辑 .env.local 填入真实值
# 3. 安装依赖
bun install

# 4. 启动开发服务器
bun run dev
```

### 获取 API 密钥

- **Supabase**: [https://supabase.com/dashboard](https://supabase.com/dashboard) > 你的项目 > Settings > API
- **Reown**: [https://cloud.reown.com/](https://cloud.reown.com/) > 创建新项目
- **Metals.dev**: [https://metals.dev/](https://metals.dev/) > 注册并获取 API Key
