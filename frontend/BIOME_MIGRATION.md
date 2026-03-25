# Biome 迁移完成

## ✅ 已完成

1. **安装 Biome** - v2.3.8
2. **移除 ESLint** - 删除 eslint 和 eslint-config-next
3. **创建配置** - biome.json
4. **更新脚本** - package.json scripts
5. **VS Code 集成** - .vscode/settings.json
6. **代码格式化** - 42 个文件已格式化

## 📝 配置详情

### biome.json 配置
- ✅ Git VCS 集成
- ✅ 忽略构建目录和配置文件
- ✅ 忽略 CSS 文件(Tailwind 语法)
- ✅ 2 空格缩进,100 字符行宽
- ✅ 自动组织 imports
- ⚠️ 警告级别: useButtonType, noImgElement
- ❌ 禁用: noNonNullAssertion (Next.js 环境变量常用)

### 可用命令
```bash
bun run lint      # 检查代码问题
bun run format    # 格式化代码
bun run check     # lint + format
bun run ci        # CI 模式(只检查不修复)
```

## ⚠️ 需要修复的问题

Biome 发现了一些代码质量问题(35 个警告, 39 个错误):

### 1. Button 缺少 type 属性 (警告)
**位置**: explore/page.tsx, swap/page.tsx, stake/page.tsx
**修复**: 给 `<button>` 添加 `type="button"`
```tsx
// 修改前
<button onClick={...}>

// 修改后  
<button type="button" onClick={...}>
```

### 2. 使用 isNaN 而非 Number.isNaN (可修复)
**位置**: swap/page.tsx
```tsx
// 修改前
if (!isNaN(Number(value)))

// 修改后
if (!Number.isNaN(Number(value)))
```

### 3. Image 优化 (警告)
**位置**: Footer.tsx
**建议**: 使用 Next.js `<Image>` 替代 `<img>`

### 4. 其他问题
- href 验证
- 未使用的变量
- 可选的代码简化

## 🚀 下一步

### 选项 1: 修复所有问题(推荐)
```bash
# 自动修复安全的问题
bun run check --write

# 自动修复包括不安全的修复
bun run check --write --unsafe
```

### 选项 2: 逐步修复
手动修复每个文件,保持代码质量

### 选项 3: 放宽规则
在 biome.json 中将某些规则改为 "off" 或 "warn"

## 📊 统计

- **检查文件**: 42 个
- **格式化**: 12ms
- **检查时间**: 21ms  
- **速度**: ~2000 文件/秒 ⚡

## 💡 提示

1. **保存时自动格式化**: VS Code 已配置 formatOnSave
2. **自动组织 imports**: 保存时自动执行
3. **Git commit hook**: 可选安装 husky + lint-staged
4. **CI/CD**: 在 pipeline 中运行 `bun run ci`

---

需要我帮你修复这些代码问题吗?
