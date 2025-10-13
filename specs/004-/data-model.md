# Data Model: 地区化购物车功能完善

**Feature Branch**: `004-`
**Date**: 2025-10-13
**Prerequisites**: [spec.md](./spec.md), [research.md](./research.md)

**Purpose**: 定义购物车功能的数据实体、类型结构、验证规则、状态转换和存储格式。本文档为前端实现提供明确的数据模型指导。

---

## 核心实体总览

| 实体名称 | 用途 | 存储位置 | 生命周期 |
|---------|------|---------|---------|
| `Product` | 商品基础信息 | 后端API + 前端临时缓存 | 后端管理 |
| `CartItem` | 购物车商品条目 | localStorage | 用户添加到清空/结算 |
| `RegionKey` | 地区唯一标识 | 内存计算 | 运行时生成 |
| `RegionalCart` | 地区化购物车集合 | localStorage | 持久化保存 |
| `CartStats` | 购物车统计信息 | 内存计算 | 实时计算 |
| `Order` | 订单信息 | 后端数据库 | 结算后生成 |
| `Voucher` | 核销券 | 后端数据库 | 支付成功后生成 |

---

## 1. 商品实体 (Product)

### 1.1 TypeScript 定义

```typescript
/**
 * 商品状态枚举
 */
export type ProductStatus = 'on_sale' | 'off_sale' | 'sold_out' | 'pre_sale'

/**
 * 商品实体 - 购物车中的商品信息
 * 注意:购物车使用简化的Product结构,只包含展示和计算所需的字段
 */
export interface Product {
  /** 商品ID - 唯一标识符 */
  id: string

  /** 商品名称 - 最大50字符 */
  name: string

  /** 商品价格(元) - 精确到分,两位小数 */
  price: number

  /** 商品主图URL - 用于购物车展示 */
  image: string

  /** 商品单位 - 例如:"斤"、"kg"、"袋" */
  unit: string

  /** 库存数量(可选) - 用于库存不足提示,不强制校验 */
  stock?: number

  /** 商品状态 - 用于标记下架商品 */
  status?: ProductStatus

  /** 商品描述(可选) - 简短描述 */
  description?: string
}
```

### 1.2 验证规则

从规格需求提取的验证规则:

| 字段 | 验证规则 | 来源需求 | 错误处理 |
|------|---------|---------|---------|
| `id` | 必填,非空字符串 | FR-003 | 拒绝添加到购物车 |
| `name` | 必填,最大50字符 | FR-003 | 截断到50字符 |
| `price` | 必填,`>= 0.01`,精确到分 | FR-024 | 显示"价格异常" |
| `image` | 必填,有效URL | FR-003 | 使用默认占位图 |
| `unit` | 必填,非空字符串 | FR-024 | 默认为"件" |
| `stock` | 可选,`>= 0` | FR-018 | 未提供时不校验库存 |
| `status` | 可选,枚举值 | FR-019 | 默认为`'on_sale'` |

### 1.3 数据来源

- **添加到购物车时**: 从商品详情页或列表页获取商品信息
- **下拉刷新时**: 调用后端API批量查询购物车商品的最新信息(价格、库存、状态)
- **不存储**: 购物车只存储商品ID,商品详情通过ID查询获取(降低localStorage占用)

### 1.4 示例数据

```typescript
const exampleProduct: Product = {
  id: 'prod_12345',
  name: '东北大米(5kg)',
  price: 29.90,
  image: 'https://cdn.example.com/products/rice.jpg',
  unit: 'kg',
  stock: 500,
  status: 'on_sale',
  description: '产地直供,颗粒饱满'
}
```

---

## 2. 购物车项实体 (CartItem)

### 2.1 TypeScript 定义

```typescript
/**
 * 购物车项 - 购物车中的单个商品条目
 */
export interface CartItem {
  /** 商品信息 - 完整的Product对象 */
  product: Product

  /** 购买数量 - 最小1,最大999 */
  quantity: number

  /** 添加时间戳(毫秒) - 用于排序和过期清理 */
  addedAt: number
}
```

### 2.2 验证规则

从规格需求提取的验证规则:

| 字段 | 验证规则 | 来源需求 | 错误处理 |
|------|---------|---------|---------|
| `product` | 必填,有效Product对象 | FR-003 | 拒绝添加/自动删除 |
| `quantity` | `>= 1 && <= 999` | FR-005, Assumption 8 | 限制在边界值 |
| `quantity` | `<= product.stock` (如有) | FR-018 | 显示Toast提示 |
| `addedAt` | 必填,有效时间戳 | - | 使用当前时间 |

### 2.3 状态转换

```
[添加到购物车]
   ↓
{product, quantity: 1, addedAt: Date.now()}
   ↓
[用户增加数量] → quantity++
   ↓
[用户减少数量] → quantity-- (最小为1)
   ↓
[quantity = 1 时点击删除] → 从CartItem[]移除
   ↓
[结算/清空] → 从localStorage删除
```

### 2.4 计算字段

购物车项有以下派生字段(不存储,实时计算):

```typescript
/**
 * 计算购物车项的小计金额
 */
const getSubtotal = (item: CartItem): number => {
  return Math.round(item.product.price * item.quantity * 100) / 100
}

/**
 * 检查商品是否可增加数量
 */
const canIncrease = (item: CartItem): boolean => {
  // 无库存信息时允许增加
  if (!item.product.stock) return item.quantity < 999

  // 有库存时检查库存限制
  return item.quantity < item.product.stock && item.quantity < 999
}

/**
 * 检查商品是否可减少数量
 */
const canDecrease = (item: CartItem): boolean => {
  return item.quantity > 1
}

/**
 * 检查商品是否已下架
 */
const isOffShelf = (item: CartItem): boolean => {
  return item.product.status === 'off_sale' || item.product.status === 'sold_out'
}
```

### 2.5 示例数据

```typescript
const exampleCartItem: CartItem = {
  product: {
    id: 'prod_12345',
    name: '东北大米(5kg)',
    price: 29.90,
    image: 'https://cdn.example.com/products/rice.jpg',
    unit: 'kg',
    stock: 500,
    status: 'on_sale'
  },
  quantity: 2,
  addedAt: 1697216400000 // 2023-10-13 18:00:00
}
```

---

## 3. 地区键 (RegionKey)

### 3.1 TypeScript 定义

```typescript
/**
 * 地区键 - 格式为 "省份-城市"
 * 用于隔离不同地区的购物车
 */
export type RegionKey = string

/**
 * 生成地区键
 * @param province - 省份名称(如"江苏省")
 * @param city - 城市名称(如"南京市")
 * @returns 地区键(如"江苏省-南京市")
 */
export const getRegionKey = (province: string, city: string): RegionKey => {
  return `${province}-${city}`
}

/**
 * 解析地区键
 * @param regionKey - 地区键(如"江苏省-南京市")
 * @returns 省份和城市对象
 */
export const parseRegionKey = (regionKey: RegionKey): { province: string; city: string } => {
  const [province, city] = regionKey.split('-')
  return { province, city }
}

/**
 * 验证地区键格式
 * @param regionKey - 地区键
 * @returns 是否有效
 */
export const isValidRegionKey = (regionKey: RegionKey): boolean => {
  if (!regionKey || typeof regionKey !== 'string') return false
  const parts = regionKey.split('-')
  return parts.length === 2 && parts[0].length > 0 && parts[1].length > 0
}
```

### 3.2 验证规则

| 验证项 | 规则 | 来源需求 | 错误处理 |
|-------|------|---------|---------|
| 格式 | 必须为`"省份-城市"`格式 | FR-016 | 返回空购物车 |
| 省份 | 非空字符串 | - | 拒绝操作 |
| 城市 | 非空字符串 | - | 拒绝操作 |
| 分隔符 | 必须且只能有一个`-` | - | 解析失败返回默认值 |

### 3.3 示例数据

```typescript
// 有效的地区键
const validKeys: RegionKey[] = [
  '江苏省-南京市',
  '浙江省-杭州市',
  '上海市-上海市', // 直辖市
  '北京市-北京市'
]

// 无效的地区键
const invalidKeys = [
  '', // 空字符串
  '江苏省', // 缺少城市
  '江苏省-南京市-玄武区', // 多个分隔符
  'Jiangsu-Nanjing' // 不支持英文(虽然技术上可解析,但业务不允许)
]
```

---

## 4. 地区化购物车 (RegionalCart)

### 4.1 TypeScript 定义

```typescript
/**
 * 地区化购物车 - 按地区键分组的购物车数据结构
 * 键为RegionKey,值为CartItem数组
 */
export interface RegionalCart {
  [regionKey: RegionKey]: CartItem[]
}

/**
 * 获取指定地区的购物车数据
 * @param regionalCart - 完整的地区化购物车
 * @param regionKey - 地区键
 * @returns 该地区的购物车项数组,不存在时返回空数组
 */
export const getRegionCart = (
  regionalCart: RegionalCart,
  regionKey: RegionKey
): CartItem[] => {
  return regionalCart[regionKey] || []
}

/**
 * 设置指定地区的购物车数据
 * @param regionalCart - 完整的地区化购物车
 * @param regionKey - 地区键
 * @param items - 购物车项数组
 * @returns 更新后的地区化购物车
 */
export const setRegionCart = (
  regionalCart: RegionalCart,
  regionKey: RegionKey,
  items: CartItem[]
): RegionalCart => {
  return {
    ...regionalCart,
    [regionKey]: items
  }
}

/**
 * 清空指定地区的购物车
 * @param regionalCart - 完整的地区化购物车
 * @param regionKey - 地区键
 * @returns 更新后的地区化购物车
 */
export const clearRegionCart = (
  regionalCart: RegionalCart,
  regionKey: RegionKey
): RegionalCart => {
  const newCart = { ...regionalCart }
  delete newCart[regionKey]
  return newCart
}

/**
 * 获取所有地区的购物车商品种类总数
 * @param regionalCart - 完整的地区化购物车
 * @returns 所有地区购物车商品种类总数
 */
export const getTotalItemCount = (regionalCart: RegionalCart): number => {
  return Object.values(regionalCart).reduce((sum, items) => sum + items.length, 0)
}
```

### 4.2 验证规则

从规格需求提取的验证规则:

| 验证项 | 规则 | 来源需求 | 错误处理 |
|-------|------|---------|---------|
| 地区数量 | `<= 10` | Assumption 9 | 提示"地区购物车数量已达上限" |
| 单地区商品种类 | `<= 50` | FR-020, Assumption 8 | 提示"购物车已满" |
| 键格式 | 所有键必须为有效RegionKey | FR-016 | 忽略无效键 |
| 值类型 | 所有值必须为CartItem[] | - | 初始化为空数组 |

### 4.3 localStorage 存储格式

**存储键名**: `regional_cart_data` (来自FR-016)

**存储值**: JSON序列化的RegionalCart对象

```typescript
/**
 * localStorage存储示例
 */
const storageExample = {
  key: 'regional_cart_data',
  value: JSON.stringify({
    '江苏省-南京市': [
      {
        product: { id: 'prod_1', name: '大米', price: 5.0, image: '...', unit: '斤' },
        quantity: 2,
        addedAt: 1697216400000
      },
      {
        product: { id: 'prod_2', name: '面粉', price: 4.5, image: '...', unit: 'kg' },
        quantity: 1,
        addedAt: 1697216500000
      }
    ],
    '浙江省-杭州市': [
      {
        product: { id: 'prod_3', name: '小麦', price: 3.0, image: '...', unit: '斤' },
        quantity: 5,
        addedAt: 1697216600000
      }
    ]
  })
}
```

### 4.4 存储容量估算

**单个CartItem序列化大小**:
```
Product(200 bytes) + quantity(4 bytes) + addedAt(8 bytes) = 约 212 bytes
```

**最大容量计算**:
```
10个地区 × 50种商品/地区 × 212 bytes = 约 106 KB
```

**localStorage限制**: 约10MB (远大于106KB,容量充足)

### 4.5 错误降级处理

根据FR-023和research.md中的SafeStorage模式,localStorage读写需要错误处理:

```typescript
/**
 * 从localStorage安全读取购物车数据
 * @returns 购物车数据,读取失败返回空对象
 */
export const loadCartFromStorage = (): RegionalCart => {
  try {
    const data = localStorage.getItem('regional_cart_data')
    if (!data) return {}

    const parsed = JSON.parse(data)
    if (typeof parsed !== 'object' || parsed === null) {
      console.warn('[Cart] Invalid cart data format, resetting to empty')
      return {}
    }

    // 验证数据结构
    const validated: RegionalCart = {}
    for (const [key, value] of Object.entries(parsed)) {
      if (isValidRegionKey(key) && Array.isArray(value)) {
        validated[key] = value.filter(item =>
          item.product?.id && item.quantity >= 1
        )
      }
    }

    return validated
  } catch (error) {
    console.error('[Cart] Failed to load cart from storage:', error)
    // 降级:返回空购物车,不影响正常使用
    return {}
  }
}

/**
 * 安全保存购物车数据到localStorage
 * @param cart - 购物车数据
 * @returns 是否保存成功
 */
export const saveCartToStorage = (cart: RegionalCart): boolean => {
  try {
    const serialized = JSON.stringify(cart)
    localStorage.setItem('regional_cart_data', serialized)
    return true
  } catch (error) {
    // 处理存储配额已满的情况
    if (error.name === 'QuotaExceededError') {
      console.error('[Cart] localStorage quota exceeded')
      // 尝试清理过期数据(7天前的购物车项)
      const cleaned = cleanExpiredCartItems(cart, 7 * 24 * 60 * 60 * 1000)
      try {
        localStorage.setItem('regional_cart_data', JSON.stringify(cleaned))
        return true
      } catch (retryError) {
        console.error('[Cart] Failed to save even after cleaning')
      }
    }
    console.error('[Cart] Failed to save cart to storage:', error)
    return false
  }
}

/**
 * 清理过期的购物车项
 * @param cart - 购物车数据
 * @param maxAge - 最大保留时间(毫秒)
 * @returns 清理后的购物车数据
 */
const cleanExpiredCartItems = (cart: RegionalCart, maxAge: number): RegionalCart => {
  const now = Date.now()
  const cleaned: RegionalCart = {}

  for (const [key, items] of Object.entries(cart)) {
    const validItems = items.filter(item => now - item.addedAt < maxAge)
    if (validItems.length > 0) {
      cleaned[key] = validItems
    }
  }

  return cleaned
}
```

---

## 5. 购物车统计 (CartStats)

### 5.1 TypeScript 定义

```typescript
/**
 * 购物车统计信息 - 实时计算,不存储
 */
export interface CartStats {
  /** 商品种类数 - 购物车中不同商品的数量 */
  itemCount: number

  /** 商品总数量 - 所有商品数量的总和 */
  totalItems: number

  /** 总金额(元) - 所有商品小计的总和,精确到分 */
  totalAmount: number
}

/**
 * 计算购物车统计信息
 * @param items - 购物车项数组
 * @returns 统计信息
 */
export const calculateCartStats = (items: CartItem[]): CartStats => {
  const itemCount = items.length

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

  const totalAmount = items.reduce((sum, item) => {
    const subtotal = item.product.price * item.quantity
    return sum + subtotal
  }, 0)

  // 精确到分(两位小数)
  const roundedTotalAmount = Math.round(totalAmount * 100) / 100

  return {
    itemCount,
    totalItems,
    totalAmount: roundedTotalAmount
  }
}

/**
 * 格式化金额显示
 * @param amount - 金额(元)
 * @returns 格式化的金额字符串(如"¥29.90")
 */
export const formatAmount = (amount: number): string => {
  return `¥${amount.toFixed(2)}`
}

/**
 * 格式化商品单价显示
 * @param product - 商品信息
 * @returns 格式化的单价字符串(如"¥5.00/斤")
 */
export const formatUnitPrice = (product: Product): string => {
  return `¥${product.price.toFixed(2)}/${product.unit}`
}
```

### 5.2 计算规则

从规格需求提取的计算规则:

| 统计项 | 计算方法 | 来源需求 | 精度要求 |
|-------|---------|---------|---------|
| `itemCount` | `items.length` | FR-004 | 整数 |
| `totalItems` | `Σ(item.quantity)` | FR-004 | 整数 |
| `totalAmount` | `Σ(item.product.price * item.quantity)` | FR-004, FR-024 | 精确到分(两位小数) |

### 5.3 性能优化

- **避免重复计算**: 使用React的`useMemo`缓存统计结果
- **更新时机**: 只在购物车数据变化时重新计算
- **计算复杂度**: O(n),n为购物车商品数量(最多50种)

```typescript
// React组件中的使用示例
const stats = useMemo(() => {
  return calculateCartStats(currentRegionCart)
}, [currentRegionCart])
```

### 5.4 示例数据

```typescript
// 输入:购物车数据
const cartItems: CartItem[] = [
  { product: { id: '1', name: '大米', price: 5.0, unit: '斤', image: '...' }, quantity: 2, addedAt: 0 },
  { product: { id: '2', name: '面粉', price: 4.5, unit: 'kg', image: '...' }, quantity: 1, addedAt: 0 },
  { product: { id: '3', name: '小麦', price: 3.0, unit: '斤', image: '...' }, quantity: 5, addedAt: 0 }
]

// 输出:统计信息
const stats: CartStats = {
  itemCount: 3,      // 3种商品
  totalItems: 8,     // 2+1+5=8件
  totalAmount: 29.50 // 5*2 + 4.5*1 + 3*5 = 10 + 4.5 + 15 = 29.50
}

// 格式化显示
formatAmount(stats.totalAmount) // "¥29.50"
formatUnitPrice(cartItems[0].product) // "¥5.00/斤"
```

---

## 6. 订单实体 (Order)

### 6.1 TypeScript 定义

```typescript
/**
 * 配送方式枚举
 */
export type DeliveryType = 'self_pickup' | 'errand_delivery'

/**
 * 支付状态枚举
 */
export type PaymentStatus = 'pending' | 'paid' | 'cancelled' | 'refunded'

/**
 * 订单状态枚举
 */
export type OrderStatus = 'pending_payment' | 'pending_verification' | 'verified' | 'cancelled'

/**
 * 订单实体 - 购物车结算后生成
 * 注意:本功能不实现订单创建逻辑,只定义数据结构供对接
 */
export interface Order {
  /** 订单ID */
  id: string

  /** 用户ID */
  userId: string

  /** 订单商品列表 - 结算时从购物车复制 */
  items: CartItem[]

  /** 购买地区键 - 从购物车结算时的地区 */
  regionKey: RegionKey

  /** 配送方式 */
  deliveryType: DeliveryType

  /** 配送地址(自提时为门店地址,跑腿时为用户地址) */
  deliveryAddress: string

  /** 商品总金额(元) */
  totalAmount: number

  /** 运费(元) */
  deliveryFee: number

  /** 订单总金额 = 商品总金额 + 运费 */
  orderAmount: number

  /** 支付状态 */
  paymentStatus: PaymentStatus

  /** 订单状态 */
  orderStatus: OrderStatus

  /** 创建时间(时间戳) */
  createTime: number

  /** 支付时间(时间戳,可选) */
  payTime?: number

  /** 备注(可选) */
  remark?: string
}
```

### 6.2 与购物车的关系

```
购物车(CartItem[])
   ↓ [用户点击"去结算"]
订单确认页
   ↓ [用户填写配送信息并支付]
订单(Order)
   ↓ [支付成功]
1. 生成核销券(Voucher)
2. 清空当前地区购物车(localStorage删除对应RegionKey)
```

### 6.3 数据流转

```typescript
/**
 * 从购物车生成订单数据(草稿)
 * @param items - 购物车项数组
 * @param regionKey - 购买地区
 * @param deliveryType - 配送方式
 * @returns 订单草稿数据
 */
export const createOrderDraft = (
  items: CartItem[],
  regionKey: RegionKey,
  deliveryType: DeliveryType
): Partial<Order> => {
  const stats = calculateCartStats(items)

  return {
    items: items.map(item => ({ ...item })), // 深拷贝
    regionKey,
    deliveryType,
    totalAmount: stats.totalAmount,
    deliveryFee: deliveryType === 'self_pickup' ? 0 : 5.0, // 自提免运费,跑腿5元
    orderAmount: stats.totalAmount + (deliveryType === 'self_pickup' ? 0 : 5.0),
    paymentStatus: 'pending',
    orderStatus: 'pending_payment',
    createTime: Date.now()
  }
}
```

---

## 7. 核销券实体 (Voucher)

### 7.1 TypeScript 定义

```typescript
/**
 * 核销券状态枚举
 */
export type VoucherStatus = 'pending' | 'used' | 'expired'

/**
 * 核销券实体 - 订单支付成功后生成
 * 注意:本功能不实现核销券逻辑,只定义数据结构供参考
 */
export interface Voucher {
  /** 核销券ID */
  id: string

  /** 关联订单ID */
  orderId: string

  /** 用户ID */
  userId: string

  /** 购买地区键 - 限制核销地区 */
  regionKey: RegionKey

  /** 核销券码 - 用于扫码核销 */
  code: string

  /** 核销券状态 */
  status: VoucherStatus

  /** 创建时间(时间戳) */
  createTime: number

  /** 过期时间(时间戳) */
  expireTime: number

  /** 核销时间(时间戳,可选) */
  verifyTime?: number

  /** 核销门店ID(可选) */
  storeId?: string
}
```

### 7.2 与购物车的关系

- **生成时机**: 订单支付成功后,后端生成核销券
- **购物车操作**: 生成核销券的同时,清空当前地区购物车(FR-021)
- **地区关联**: 核销券的`regionKey`与购物车的地区键一致,限制核销地区

---

## 8. 数据关系图

```
┌─────────────────┐
│  RegionContext  │ 提供当前地区
└────────┬────────┘
         │ RegionKey
         ↓
┌─────────────────────────────────────────┐
│         CartContext                     │
│  ┌─────────────────────────────────┐   │
│  │      RegionalCart               │   │
│  │  {                              │   │
│  │    "江苏省-南京市": [           │   │
│  │      CartItem {                 │   │
│  │        product: Product,        │   │
│  │        quantity: 2,             │   │
│  │        addedAt: timestamp       │   │
│  │      }                          │   │
│  │    ],                           │   │
│  │    "浙江省-杭州市": [...]       │   │
│  │  }                              │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │       CartStats (实时计算)      │   │
│  │  {                              │   │
│  │    itemCount: 3,                │   │
│  │    totalItems: 8,               │   │
│  │    totalAmount: 29.50           │   │
│  │  }                              │   │
│  └─────────────────────────────────┘   │
└──────────────┬──────────────────────────┘
               │
               ↓ [用户点击"去结算"]
┌──────────────────────────┐
│    订单确认页              │
│  ┌────────────────────┐  │
│  │ Order (草稿)        │  │
│  │  - items: CartItem[]│  │
│  │  - regionKey        │  │
│  │  - totalAmount      │  │
│  └────────────────────┘  │
└──────────┬───────────────┘
           │
           ↓ [支付成功]
┌──────────────────────────┐
│     后端处理              │
│  1. 生成 Order (正式)    │
│  2. 生成 Voucher[]       │
│  3. 通知前端清空购物车    │
└──────────┬───────────────┘
           │
           ↓
┌──────────────────────────┐
│  前端清空购物车            │
│  localStorage.setItem(   │
│    'regional_cart_data', │
│    JSON.stringify({      │
│      ...regionalCart,    │
│      [regionKey]: []     │
│    })                    │
│  )                       │
└──────────────────────────┘
```

---

## 9. 状态转换图

### 9.1 购物车项生命周期

```
[商品详情页/列表页]
         ↓ 点击"加入购物车"
    [添加到购物车]
         ↓
    CartItem创建
    quantity = 1
    addedAt = Date.now()
         ↓
    保存到localStorage
         ↓
    ┌─────────────┐
    │  购物车显示  │ ←─┐
    └─────────────┘   │
         ↓            │
    [用户操作]         │
         ↓            │
    ┌─ 增加数量 ───────┘ (quantity++, 保存到localStorage)
    │
    ├─ 减少数量 ───────┘ (quantity--, 保存到localStorage)
    │
    ├─ 删除商品 → 从CartItem[]移除 → 保存到localStorage → 购物车显示更新
    │
    ├─ 清空购物车 → 从RegionalCart删除该地区 → 保存到localStorage → 显示空状态
    │
    └─ 去结算 → 生成订单 → 支付成功 → 清空该地区购物车 → 保存到localStorage
```

### 9.2 地区切换流程

```
[用户在"江苏省-南京市"]
         ↓
    购物车显示南京地区商品
         ↓
    [用户点击RegionBar切换地区]
         ↓
    RegionContext更新
    currentRegionKey = "浙江省-杭州市"
         ↓
    CartContext监听地区变化
         ↓
    从localStorage读取完整RegionalCart
         ↓
    提取RegionalCart["浙江省-杭州市"]
         ↓
    购物车页面重新渲染
         ↓
    显示杭州地区商品(或空状态)
```

---

## 10. API 契约(如适用)

### 10.1 商品信息查询 API (用于下拉刷新)

**端点**: `POST /api/products/batch-query`

**请求体**:
```typescript
interface BatchQueryRequest {
  productIds: string[] // 购物车中所有商品ID
  regionKey: string     // 当前地区键
}
```

**响应体**:
```typescript
interface BatchQueryResponse {
  products: Product[] // 商品信息数组
  timestamp: number   // 查询时间戳
}
```

**用途**: 下拉刷新时批量查询购物车商品的最新价格、库存、状态

### 10.2 订单创建 API (用于结算)

**端点**: `POST /api/orders/create`

**请求体**:
```typescript
interface CreateOrderRequest {
  items: Array<{
    productId: string
    quantity: number
  }>
  regionKey: string
  deliveryType: DeliveryType
  deliveryAddress: string
  remark?: string
}
```

**响应体**:
```typescript
interface CreateOrderResponse {
  orderId: string
  orderAmount: number
  paymentUrl: string // 支付跳转URL
}
```

**用途**: 购物车结算时创建订单

---

## 11. 本地缓存策略总结

| 数据项 | 存储位置 | 存储键名 | 存储格式 | 生命周期 |
|-------|---------|---------|---------|---------|
| `RegionalCart` | localStorage | `regional_cart_data` | JSON字符串 | 永久(除非用户清空/结算) |
| `RegionKey` | RegionContext | - | 内存状态 | 应用关闭时清空 |
| `CartStats` | - | - | 实时计算,不存储 | 组件卸载时清空 |
| `Product详情` | - | - | 不存储,按需查询 | - |

**关键设计决策**(来自Assumption 11和FR-015):
- ✅ 购物车数据**仅保存在前端localStorage**中
- ❌ **不同步到服务器后端**
- ❌ **不跨设备同步**
- ✅ 降低后端存储成本
- ✅ 提升响应速度(无需网络请求)

---

## 12. 验证清单

在实现过程中,请确保以下数据模型要求得到满足:

- [ ] 所有实体类型定义在 `src/types/cart.ts` 中(已存在,需补充)
- [ ] 实现 `loadCartFromStorage` 和 `saveCartToStorage` 错误降级处理
- [ ] 实现 `calculateCartStats` 函数并精确到分
- [ ] 实现 `getTotalItemCount` 用于TabBar徽标计算
- [ ] 实现 `isValidRegionKey` 验证地区键格式
- [ ] 购物车操作(增删改)后立即调用 `saveCartToStorage`
- [ ] 地区切换时从localStorage重新加载完整RegionalCart
- [ ] 单地区购物车商品种类限制为50种(FR-020)
- [ ] 所有地区购物车数量限制为10个(Assumption 9)
- [ ] 单个商品数量限制为1-999(FR-005, Assumption 8)
- [ ] 金额计算精确到分,使用`Math.round(amount * 100) / 100`
- [ ] 下架商品显示灰色遮罩,无法增加数量(FR-019)
- [ ] 支付成功后清空当前地区购物车(FR-021)
- [ ] localStorage配额超限时清理7天前的购物车项

---

## 附录: 完整类型定义文件

以下是建议的 `src/types/cart.ts` 完整内容(整合现有定义和新增定义):

```typescript
/**
 * 购物车相关类型定义
 * Feature: 地区化购物车功能完善
 */

// ==================== 商品实体 ====================

export type ProductStatus = 'on_sale' | 'off_sale' | 'sold_out' | 'pre_sale'

export interface Product {
  id: string
  name: string
  price: number
  image: string
  unit: string
  stock?: number
  status?: ProductStatus
  description?: string
}

// ==================== 购物车项实体 ====================

export interface CartItem {
  product: Product
  quantity: number
  addedAt: number
}

// ==================== 地区键 ====================

export type RegionKey = string

export const getRegionKey = (province: string, city: string): RegionKey => {
  return `${province}-${city}`
}

export const parseRegionKey = (regionKey: RegionKey): { province: string; city: string } => {
  const [province, city] = regionKey.split('-')
  return { province, city }
}

export const isValidRegionKey = (regionKey: RegionKey): boolean => {
  if (!regionKey || typeof regionKey !== 'string') return false
  const parts = regionKey.split('-')
  return parts.length === 2 && parts[0].length > 0 && parts[1].length > 0
}

// ==================== 地区化购物车 ====================

export interface RegionalCart {
  [regionKey: RegionKey]: CartItem[]
}

export const getRegionCart = (regionalCart: RegionalCart, regionKey: RegionKey): CartItem[] => {
  return regionalCart[regionKey] || []
}

export const setRegionCart = (
  regionalCart: RegionalCart,
  regionKey: RegionKey,
  items: CartItem[]
): RegionalCart => {
  return {
    ...regionalCart,
    [regionKey]: items
  }
}

export const clearRegionCart = (
  regionalCart: RegionalCart,
  regionKey: RegionKey
): RegionalCart => {
  const newCart = { ...regionalCart }
  delete newCart[regionKey]
  return newCart
}

export const getTotalItemCount = (regionalCart: RegionalCart): number => {
  return Object.values(regionalCart).reduce((sum, items) => sum + items.length, 0)
}

// ==================== 购物车统计 ====================

export interface CartStats {
  itemCount: number
  totalItems: number
  totalAmount: number
}

export const calculateCartStats = (items: CartItem[]): CartStats => {
  const itemCount = items.length
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalAmount = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  )
  const roundedTotalAmount = Math.round(totalAmount * 100) / 100

  return { itemCount, totalItems, totalAmount: roundedTotalAmount }
}

export const formatAmount = (amount: number): string => {
  return `¥${amount.toFixed(2)}`
}

export const formatUnitPrice = (product: Product): string => {
  return `¥${product.price.toFixed(2)}/${product.unit}`
}

// ==================== localStorage 操作 ====================

const STORAGE_KEY = 'regional_cart_data'

export const loadCartFromStorage = (): RegionalCart => {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (!data) return {}

    const parsed = JSON.parse(data)
    if (typeof parsed !== 'object' || parsed === null) {
      console.warn('[Cart] Invalid cart data format, resetting to empty')
      return {}
    }

    const validated: RegionalCart = {}
    for (const [key, value] of Object.entries(parsed)) {
      if (isValidRegionKey(key) && Array.isArray(value)) {
        validated[key] = value.filter(
          (item: any) => item.product?.id && item.quantity >= 1
        )
      }
    }

    return validated
  } catch (error) {
    console.error('[Cart] Failed to load cart from storage:', error)
    return {}
  }
}

export const saveCartToStorage = (cart: RegionalCart): boolean => {
  try {
    const serialized = JSON.stringify(cart)
    localStorage.setItem(STORAGE_KEY, serialized)
    return true
  } catch (error) {
    if ((error as any).name === 'QuotaExceededError') {
      console.error('[Cart] localStorage quota exceeded')
      const cleaned = cleanExpiredCartItems(cart, 7 * 24 * 60 * 60 * 1000)
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned))
        return true
      } catch (retryError) {
        console.error('[Cart] Failed to save even after cleaning')
      }
    }
    console.error('[Cart] Failed to save cart to storage:', error)
    return false
  }
}

const cleanExpiredCartItems = (cart: RegionalCart, maxAge: number): RegionalCart => {
  const now = Date.now()
  const cleaned: RegionalCart = {}

  for (const [key, items] of Object.entries(cart)) {
    const validItems = items.filter(item => now - item.addedAt < maxAge)
    if (validItems.length > 0) {
      cleaned[key] = validItems
    }
  }

  return cleaned
}

// ==================== 辅助函数 ====================

export const getSubtotal = (item: CartItem): number => {
  return Math.round(item.product.price * item.quantity * 100) / 100
}

export const canIncrease = (item: CartItem): boolean => {
  if (!item.product.stock) return item.quantity < 999
  return item.quantity < item.product.stock && item.quantity < 999
}

export const canDecrease = (item: CartItem): boolean => {
  return item.quantity > 1
}

export const isOffShelf = (item: CartItem): boolean => {
  return item.product.status === 'off_sale' || item.product.status === 'sold_out'
}
```

---

**文档版本**: v1.0
**最后更新**: 2025-10-13
**下一步**: 生成 `quickstart.md` 开发指南
