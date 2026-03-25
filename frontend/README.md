# GOX - Gold-Backed DEX Platform

一个基于黄金支持的去中心化交易平台，提供实时黄金价格追踪、代币交易和质押功能。

## 技术栈

- **框架**: Next.js 15 (App Router)
- **语言**: TypeScript (Strict Mode)
- **样式**: TailwindCSS 4
- **UI 组件**: Shadcn/ui
- **数据库**: Supabase (PostgreSQL + Realtime)
- **Web3**: Wagmi + Viem
- **代码质量**: Biome (Linter + Formatter)
- **包管理**: Bun

## 快速开始

### 安装依赖

```bash
bun install
```

### 环境变量

创建 `.env.local` 文件：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
```

### 开发服务器

```bash
bun run dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

## 可用脚本

- `bun run dev` - 启动开发服务器
- `bun run build` - 构建生产版本
- `bun run start` - 启动生产服务器
- `bun run lint` - 运行 Biome 代码检查
- `bun run check` - 运行 Biome 完整检查并自动修复
- `bun run format` - 格式化代码

## 代码质量

本项目使用 [Biome](https://biomejs.dev/) 作为代码质量工具，比 ESLint 快 25 倍，提供统一的 linting 和格式化体验。

### 代码规范

- ✅ TypeScript 严格模式
- ✅ React Hooks 最佳实践
- ✅ 可访问性 (a11y) 标准
- ✅ 性能优化 (useCallback, next/image)
- ✅ 语义化 HTML
- ✅ 类型安全

## 项目结构

```
frontend/
├── app/                    # Next.js App Router
│   ├── (dapp)/            # DApp 页面组
│   │   ├── explore/       # 浏览页面
│   │   ├── stake/         # 质押页面
│   │   └── swap/          # 交易页面
│   ├── market/            # 市场数据页面
│   └── api/               # API 路由
├── components/            # React 组件
│   ├── home/             # 首页组件
│   ├── market/           # 市场数据组件
│   └── ui/               # UI 基础组件
└── lib/                  # 工具函数和配置
    ├── market/           # 市场数据处理
    ├── supabase.ts       # Supabase 客户端
    └── wagmi.ts          # Web3 配置
```

## 功能特性

- 📊 实时黄金价格追踪
- 📈 交互式价格图表 (多时间范围)
- 💱 代币交易功能
- 🔒 质押收益计算
- 🌐 多链支持 (Ethereum, Polygon, BSC, Arbitrum)
- 📱 响应式设计 (移动端优化)
- 🔄 实时数据订阅 (Supabase Realtime)

## 部署

### Vercel (推荐)

点击下方按钮一键部署：

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/kueenOC/dexf)

### 手动部署

```bash
bun run build
bun run start
```

## 文档

详细文档请参考项目 Wiki 或访问 [GOX Documentation](https://your-docs-site.com)。

## 贡献

欢迎提交 Issue 和 Pull Request！

## License

MIT License
