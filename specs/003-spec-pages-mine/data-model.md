# Data Model: 核销券个人中心数据模型

**Feature**: 核销券个人中心主页设计
**Branch**: `003-spec-pages-mine`
**Created**: 2025-10-13

## 概述

本文档定义个人中心页面所需的核心数据实体和它们之间的关系。所有类型定义遵循 TypeScript 严格模式规范。

---

## 实体定义

### 1. 用户信息 (UserInfo)

**用途**: 存储用户的基本信息,在个人中心顶部展示

**字段定义**:

| 字段 | 类型 | 必填 | 说明 | 验证规则 |
|------|------|------|------|---------|
| `id` | `number` | ✅ | 用户ID | >  0 |
| `avatar` | `string` | ✅ | 头像URL | 有效的HTTP(S) URL |
| `nickname` | `string` | ✅ | 用户昵称 | 长度 1-20 字符 |
| `phone` | `string` | ❌ | 手机号 | 11位数字 |
| `memberLevel` | `MemberLevel` | ✅ | 会员等级 | 枚举值 |
| `memberLevelName` | `string` | ✅ | 会员等级显示名称 | 如"普通会员"、"VIP1" |
| `memberIcon` | `string` | ❌ | 会员等级图标URL | 有效的HTTP(S) URL |
| `registerTime` | `number` | ✅ | 注册时间(Unix时间戳,秒) | > 0 |

**TypeScript定义**:
```typescript
export enum MemberLevel {
  NORMAL = 'normal',
  VIP1 = 'vip1',
  VIP2 = 'vip2',
  VIP3 = 'vip3'
}

export interface UserInfo {
  id: number
  avatar: string
  nickname: string
  phone?: string
  memberLevel: MemberLevel
  memberLevelName: string
  memberIcon?: string
  registerTime: number
}
```

**关系**:
- 一个用户拥有多个核销券 (1:N)
- 一个用户拥有多个订单 (1:N)

---

### 2. 核销券统计 (VoucherStats)

**用途**: 核销券各状态的数量统计,用于个人中心的核销券状态卡片

**字段定义**:

| 字段 | 类型 | 必填 | 说明 | 验证规则 |
|------|------|------|------|---------|
| `pending` | `number` | ✅ | 待核销数量 | >= 0 |
| `used` | `number` | ✅ | 已核销数量 | >= 0 |
| `expired` | `number` | ✅ | 已过期数量 | >= 0 |
| `expiringSoon` | `number` | ✅ | 即将过期数量(7天内) | >= 0 |

**TypeScript定义**:
```typescript
export interface VoucherStats {
  pending: number
  used: number
  expired: number
  expiringSoon: number
}
```

**业务规则**:
- `expiringSoon` 是 `pending` 的子集(即将过期的券必须是待核销状态)
- 总数 = `pending` + `used` + `expired`

---

### 3. 订单统计 (OrderStats)

**用途**: 订单各状态的数量统计,用于个人中心的订单入口

**字段定义**:

| 字段 | 类型 | 必填 | 说明 | 验证规则 |
|------|------|------|------|---------|
| `total` | `number` | ✅ | 总订单数 | >= 0 |
| `pending` | `number` | ✅ | 待支付数量 | >= 0 |
| `verified` | `number` | ✅ | 已核销数量 | >= 0 |

**TypeScript定义**:
```typescript
export interface OrderStats {
  total: number
  pending: number
  verified: number
}
```

**业务规则**:
- `pending` 和 `verified` 是 `total` 的子集
- 待支付订单超过30分钟自动取消,不计入`pending`

---

### 4. 最近核销券列表项 (RecentVoucher)

**用途**: 个人中心展示的最近3张待核销券

**字段定义**:

| 字段 | 类型 | 必填 | 说明 | 验证规则 |
|------|------|------|------|---------|
| `id` | `number` | ✅ | 核销券ID | > 0 |
| `title` | `string` | ✅ | 券标题 | 长度 1-50 字符 |
| `productImage` | `string` | ✅ | 商品图片URL | 有效的HTTP(S) URL |
| `productName` | `string` | ✅ | 商品名称 | 长度 1-50 字符 |
| `purchaseTime` | `number` | ✅ | 购买时间(Unix时间戳,秒) | > 0 |
| `expireAt` | `number` | ✅ | 过期时间(Unix时间戳,秒) | > purchaseTime |
| `daysRemaining` | `number` | ✅ | 剩余天数 | >= 0 |

**TypeScript定义**:
```typescript
export interface RecentVoucher {
  id: number
  title: string
  productImage: string
  productName: string
  purchaseTime: number
  expireAt: number
  daysRemaining: number
}
```

**业务规则**:
- 只返回待核销状态的券
- 按购买时间倒序排列
- 最多返回3条

---

### 5. 最近订单列表项 (RecentOrder)

**用途**: 个人中心展示的最近3个订单

**字段定义**:

| 字段 | 类型 | 必填 | 说明 | 验证规则 |
|------|------|------|------|---------|
| `id` | `number` | ✅ | 订单ID | > 0 |
| `orderNo` | `string` | ✅ | 订单号 | 长度固定20字符 |
| `productImage` | `string` | ✅ | 商品图片URL | 有效的HTTP(S) URL |
| `productName` | `string` | ✅ | 商品名称 | 长度 1-50 字符 |
| `status` | `OrderStatus` | ✅ | 订单状态 | 枚举值 |
| `statusText` | `string` | ✅ | 状态显示文本 | 如"待支付"、"已完成" |
| `createTime` | `number` | ✅ | 创建时间(Unix时间戳,秒) | > 0 |

**TypeScript定义**:
```typescript
import { OrderStatus } from './order'

export interface RecentOrder {
  id: number
  orderNo: string
  productImage: string
  productName: string
  status: OrderStatus
  statusText: string
  createTime: number
}
```

**业务规则**:
- 按创建时间倒序排列
- 最多返回3条

---

### 6. 功能列表项 (FunctionItem)

**用途**: 个人中心底部功能列表的配置数据

**字段定义**:

| 字段 | 类型 | 必填 | 说明 | 验证规则 |
|------|------|------|------|---------|
| `id` | `string` | ✅ | 功能唯一标识 | kebab-case格式 |
| `title` | `string` | ✅ | 功能标题 | 长度 1-10 字符 |
| `icon` | `React.ComponentType` | ✅ | NutUI图标组件 | 有效的React组件 |
| `url` | `string` | ❌ | 跳转URL(可选) | Taro路由格式 |
| `action` | `() => void` | ❌ | 点击回调(可选) | 函数 |
| `badge` | `number` | ❌ | 徽标数量(可选) | >= 0 |
| `disabled` | `boolean` | ❌ | 是否禁用 | 默认false |
| `comingSoon` | `boolean` | ❌ | 即将上线标识 | 默认false |

**TypeScript定义**:
```typescript
export interface FunctionItem {
  id: string
  title: string
  icon: React.ComponentType<{ size?: number; color?: string }>
  url?: string
  action?: () => void
  badge?: number
  disabled?: boolean
  comingSoon?: boolean
}
```

**业务规则**:
- `url` 和 `action` 至少提供一个
- `disabled` 为 `true` 时,点击无效果
- `comingSoon` 为 `true` 时,显示"即将上线"标识并禁用点击

---

## 实体关系图

```
┌─────────────┐
│  UserInfo   │
│  (用户信息)  │
└──────┬──────┘
       │
       │ 1:N
       │
       ├─────────────────────┐
       │                     │
       ▼                     ▼
┌─────────────┐       ┌─────────────┐
│VoucherStats │       │ OrderStats  │
│(核销券统计)  │       │ (订单统计)   │
└─────────────┘       └─────────────┘
       │                     │
       │                     │
       ▼                     ▼
┌──────────────┐      ┌──────────────┐
│RecentVoucher │      │ RecentOrder  │
│(最近核销券)   │      │ (最近订单)    │
└──────────────┘      └──────────────┘
```

---

## 状态转换

### 核销券状态转换

```
 待核销(pending) ──核销操作──→ 已核销(used)
     │
     │ 过期
     ▼
 已过期(expired)
```

### 订单状态转换

```
 待支付(pending) ──支付──→ 已支付(paid) ──核销──→ 已核销(verified)
     │
     │ 超时/取消
     ▼
 已取消(cancelled)
```

---

## 数据一致性规则

### 1. 统计数据一致性

- 核销券统计的总数 = 待核销 + 已核销 + 已过期
- 订单统计的待支付 + 已核销 ≤ 总数
- 即将过期数量 ≤ 待核销数量

### 2. 时间有效性

- `expireAt` > `purchaseTime` (核销券过期时间必须晚于购买时间)
- `daysRemaining` = Math.ceil((expireAt - now) / 86400) (剩余天数向上取整)

### 3. 数据同步

- 用户核销券后,`VoucherStats` 的 `pending` -1,`used` +1
- 用户支付订单后,`OrderStats` 的 `pending` -1
- 核销券过期后,`VoucherStats` 的 `pending` -1,`expired` +1

---

## 数据加载策略

### 并行加载

个人中心页面加载时,并行请求以下数据:

```typescript
Promise.all([
  getUserInfo(),        // 用户信息
  getVoucherStats(),    // 核销券统计
  getOrderStats(),      // 订单统计
  getRecentVouchers(),  // 最近核销券(最多3条)
  getRecentOrders()     // 最近订单(最多3条)
])
```

**理由**: 这5个请求互不依赖,并行加载可减少总加载时间。

### 缓存策略

- **用户信息**: 缓存到 Context,刷新页面后从 localStorage 恢复
- **统计数据**: 不缓存,每次进入页面或下拉刷新时重新加载
- **最近列表**: 不缓存,每次进入页面时重新加载

---

## 文件存放位置

```
src/types/
├── user.ts              # UserInfo, MemberLevel
├── stats.ts             # VoucherStats, OrderStats (新增)
├── recent.ts            # RecentVoucher, RecentOrder (新增)
└── function.ts          # FunctionItem (新增)
```

---

## Mock数据示例

### 用户信息

```typescript
export const mockUserInfo: UserInfo = {
  id: 1,
  avatar: 'https://img.yzcdn.cn/vant/cat.jpeg',
  nickname: '张三',
  phone: '13800138000',
  memberLevel: MemberLevel.VIP1,
  memberLevelName: 'VIP1会员',
  memberIcon: 'https://img.yzcdn.cn/vant/icon-vip.png',
  registerTime: 1672502400 // 2023-01-01
}
```

### 核销券统计

```typescript
export const mockVoucherStats: VoucherStats = {
  pending: 5,
  used: 12,
  expired: 3,
  expiringSoon: 2
}
```

### 订单统计

```typescript
export const mockOrderStats: OrderStats = {
  total: 20,
  pending: 2,
  verified: 15
}
```

### 最近核销券

```typescript
export const mockRecentVouchers: RecentVoucher[] = [
  {
    id: 1,
    title: '东北大米兑换券',
    productImage: 'https://img.yzcdn.cn/vant/apple-1.jpg',
    productName: '东北大米 5kg',
    purchaseTime: 1704038400, // 2024-01-01
    expireAt: 1706630400,     // 2024-01-31
    daysRemaining: 5
  },
  // ... 最多3条
]
```
