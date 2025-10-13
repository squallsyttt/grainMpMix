# Quickstart: 核销券个人中心开发指南

**Feature**: 核销券个人中心主页
**Created**: 2025-10-13

## 快速开始

### 1. 环境准备

确保已安装:
- Node.js >= 16
- npm >= 8
- 微信开发者工具 (用于预览小程序)

### 2. 开发步骤

#### Step 1: 创建页面组件

```bash
# 页面文件已在 src/pages/mine/ 下
src/pages/mine/
├── index.tsx    # 主组件
├── index.less   # 样式文件
└── types.ts     # 类型定义
```

#### Step 2: 创建可复用组件

```bash
# 新建3个组件
src/components/
├── UserInfoCard/
├── VoucherStatsCard/
└── FunctionListItem/
```

#### Step 3: 添加类型定义

```bash
# 在 src/types/ 下添加
src/types/
├── stats.ts     # 统计数据类型
├── recent.ts    # 最近列表类型
└── function.ts  # 功能项类型
```

#### Step 4: 创建服务层

```bash
# 在 src/services/ 下添加
src/services/user.ts
```

#### Step 5: 创建Context

```bash
# 在 src/contexts/ 下添加
src/contexts/UserContext.tsx
```

#### Step 6: 添加Mock数据

```bash
# 在 src/data/mock/ 下添加
src/data/mock/user.ts
```

### 3. 运行开发环境

```bash
# 微信小程序
npm run dev:weapp

# H5预览
npm run dev:h5
```

### 4. 验证功能

- [ ] 页面正常加载
- [ ] 核销券统计显示正确
- [ ] 最近3张券展示正确
- [ ] 下拉刷新工作正常
- [ ] 未登录状态显示登录引导

### 5. 接入真实API

修改 `src/services/user.ts` 中的 API 调用,从Mock数据切换到真实API。

## 关键文件清单

| 文件路径 | 说明 | 状态 |
|---------|------|------|
| `src/pages/mine/index.tsx` | 个人中心主页面 | 新增 |
| `src/components/UserInfoCard/` | 用户信息卡片 | 新增 |
| `src/components/VoucherStatsCard/` | 核销券统计卡片 | 新增 |
| `src/components/FunctionListItem/` | 功能列表项 | 新增 |
| `src/services/user.ts` | 用户服务 | 新增 |
| `src/contexts/UserContext.tsx` | 用户上下文 | 新增 |
| `src/types/stats.ts` | 统计类型 | 新增 |
| `src/types/recent.ts` | 最近列表类型 | 新增 |
| `src/data/mock/user.ts` | 用户Mock数据 | 新增 |

## 下一步

完成开发后,运行 `/speckit.tasks` 生成详细的实施任务清单。
