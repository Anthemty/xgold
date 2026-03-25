# Uniswap V3 交易功能实现

## 概述

已成功集成 Uniswap V3 真实链上交易功能，使用 Wagmi Hooks 实现。

## 已实现功能

### 1. 合约配置 (`lib/contracts/swap-router.ts`)
- ✅ SwapRouter02 地址和 ABI
- ✅ ERC20 Token ABI (approve, allowance, balanceOf)
- ✅ MAX_UINT256 常量

### 2. Token Approval Hook (`hooks/useTokenApproval.ts`)
- ✅ 检查当前授权额度
- ✅ 执行 Token 授权（使用无限授权）
- ✅ 监听授权交易状态
- ✅ 错误处理

### 3. Swap Hook (`hooks/useSwap.ts`)
- ✅ 构建 exactInputSingle 参数
- ✅ 执行 Swap 交易
- ✅ 监听交易状态
- ✅ 滑点保护
- ✅ Deadline 设置

### 4. UI 集成 (`app/(dapp)/swap/page.tsx`)
- ✅ Token Approval 流程
- ✅ Swap 按钮状态管理
- ✅ 交易成功/失败提示
- ✅ Etherscan 链接
- ✅ 加载状态显示

## 使用流程

### 用户交易流程

1. **连接钱包**
   - 点击 "Connect Wallet"
   - 选择钱包并连接

2. **选择交易对**
   - 默认: PAXG → USDC
   - 可切换到其他允许的交易对

3. **输入数量**
   - 输入卖出金额
   - 自动计算买入数量（基于 Uniswap V3 实时价格）

4. **检查详情**
   - Exchange Rate (实时价格)
   - Price Impact
   - Trading Fee
   - Minimum Received (0.5% 滑点保护)

5. **执行交易**
   - 如果未授权: 点击 "Approve PAXG" → 等待确认
   - 授权成功后: 点击 "Swap" → 等待确认
   - 交易成功: 显示成功消息和 Etherscan 链接

## 技术细节

### Swap 参数

```typescript
{
  tokenIn: "0x45804880De22913dAFE09f4980848ECE6EcbAf78",  // PAXG
  tokenOut: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
  fee: 500,                    // 0.05% (Pool fee tier)
  recipient: userAddress,      // 用户地址
  amountIn: parseUnits("1", 18),      // 卖出数量 (Wei)
  amountOutMinimum: parseUnits("4277", 6), // 最小接收 (0.5% 滑点)
  sqrtPriceLimitX96: 0        // 不限制价格
}
```

### 滑点保护

```typescript
slippageTolerance = 0.005; // 0.5%
minReceived = buyAmount * (1 - slippageTolerance);
```

### Deadline

```typescript
deadline = currentTime + 20 minutes;
```

## 支持的交易对

当前支持的 Uniswap V3 Pool:

| 交易对 | Pool 地址 | Fee Tier |
|--------|-----------|----------|
| XAUT-USDT | `0x6546055f46e866a4B9a4A13e81273e3152BAE5dA` | 0.05% |
| PAXG-USDC | `0x5ae13baaef0620fdae1d355495dc51a17adb4082` | 0.05% |
| PAXG-XAUT | `0xed7ef9a9a05a48858a507c080def0405ad1eaa3e` | 0.05% |

## Gas 费用估算

- **Approve 交易**: 约 50,000 - 80,000 gas
- **Swap 交易**: 约 150,000 - 200,000 gas

在 Ethereum 主网上（gas price = 20 gwei）:
- Approve: ~$3-5
- Swap: ~$6-10

## 安全特性

1. **授权管理**
   - 使用无限授权减少用户交互
   - 用户可随时撤销授权

2. **滑点保护**
   - 默认 0.5% 滑点容忍度
   - 防止价格大幅波动时交易

3. **Deadline 保护**
   - 20 分钟交易有效期
   - 防止交易长时间挂起

4. **错误处理**
   - 捕获所有交易错误
   - 显示用户友好的错误消息

## 测试建议

### 测试网测试（推荐先在测试网测试）

1. 切换到 Goerli 或 Sepolia 测试网
2. 获取测试 ETH 和测试 tokens
3. 执行小额交易测试

### 主网测试

1. ⚠️ **先用小额测试**（如 0.001 PAXG）
2. 检查 gas 费用是否合理
3. 确认价格和滑点保护正常
4. 验证交易成功后再进行大额交易

## 常见问题

### Q: 为什么需要两次交易？
A: 第一次是授权 (approve)，第二次是实际交易 (swap)。授权后，后续交易不需要再次授权。

### Q: 交易失败怎么办？
A: 检查以下几点：
- 余额是否足够
- Gas 费用是否足够
- 滑点设置是否合理
- Pool 是否有足够流动性

### Q: 如何撤销授权？
A: 调用 `approve(routerAddress, 0)` 将授权额度设为 0。

### Q: 交易卡住怎么办？
A: 
- 等待 20 分钟 deadline 后交易会自动失败
- 可以尝试加速交易 (在 MetaMask 中)
- 或者取消交易

## 未来改进

- [ ] 添加可调节的滑点设置
- [ ] 支持多跳路由（Multi-hop swaps）
- [ ] 添加交易历史记录
- [ ] 集成 MEV 保护
- [ ] 添加 Gas 优化建议
- [ ] 支持限价单 (Limit Orders)

## 相关链接

- [Uniswap V3 文档](https://docs.uniswap.org/contracts/v3/overview)
- [Wagmi 文档](https://wagmi.sh/)
- [Viem 文档](https://viem.sh/)
- [SwapRouter02 合约](https://etherscan.io/address/0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45)
