# 数据模型: 商家列表与商家详情

**功能**: 商家列表与商家详情
**分支**: 005-logo
**日期**: 2025-10-14

本文档定义商家列表功能涉及的所有数据实体、字段、关系和验证规则。

---

## 实体概览

```
┌─────────────┐         ┌──────────────────────┐         ┌─────────────────┐
│   Merchant  │────────>│ MerchantProductMapping│<────────│ ProductCategory │
│   (商家)     │ 1    n  │  (商家-产品关联)      │ n    1  │  (产品分类)      │
└─────────────┘         └──────────────────────┘         └─────────────────┘
       │                                                            │
       │                                                            │
       │ n                                                          │ n
       │                                                            │
       ▼                                                            ▼
┌─────────────┐                                           ┌─────────────────┐
│    Region   │                                           │ RegionalPricing │
│   (区域)     │───────────────────────────────────────────>│  (区域定价)      │
└─────────────┘                    1    n                 └─────────────────┘
```

---

## 1. Merchant (商家)

**描述**: 入驻平台的商家实体,每个商家归属于特定区域。

### 字段定义

| 字段名 | 类型 | 必填 | 说明 | 示例 |
|-------|------|------|------|------|
| `id` | number | ✅ | 商家唯一标识 | 1001 |
| `name` | string | ✅ | 商家名称 | "五常大米批发店" |
| `logo` | string | ❌ | 商家Logo图片URL | "https://cdn.example.com/logo.jpg" |
| `region_id` | number | ✅ | 所属区域ID | 230100 (哈尔滨市) |
| `region_name` | string | ✅ | 所属区域名称 | "哈尔滨市" |
| `province` | string | ✅ | 所属省份 | "黑龙江省" |
| `city` | string | ✅ | 所属城市 | "哈尔滨市" |
| `address` | string | ❌ | 详细地址 | "南岗区中央大街123号" |
| `phone` | string | ❌ | 联系电话 | "13800138000" |
| `business_hours` | string | ❌ | 营业时间 | "09:00-18:00" |
| `description` | string | ❌ | 商家简介 | "专营五常大米,品质保证" |
| `is_active` | number | ✅ | 是否营业(1=营业,0=关闭) | 1 |
| `rating` | number | ❌ | 用户评分(0-5) | 4.5 |
| `years_in_business` | number | ❌ | 经营年限 | 5 |
| `certification_status` | string | ❌ | 认证状态(verified/pending/none) | "verified" |
| `created_at` | string | ✅ | 创建时间 | "2024-01-01 10:00:00" |
| `updated_at` | string | ✅ | 更新时间 | "2024-10-14 12:00:00" |

### TypeScript接口

```typescript
/**
 * 商家实体
 */
export interface Merchant {
  /** 商家ID */
  id: number
  /** 商家名称 */
  name: string
  /** 商家Logo URL */
  logo?: string
  /** 所属区域ID */
  region_id: number
  /** 所属区域名称 */
  region_name: string
  /** 所属省份 */
  province: string
  /** 所属城市 */
  city: string
  /** 详细地址 */
  address?: string
  /** 联系电话 */
  phone?: string
  /** 营业时间 */
  business_hours?: string
  /** 商家简介 */
  description?: string
  /** 是否营业(1=营业,0=关闭) */
  is_active: 0 | 1
  /** 用户评分(0-5) */
  rating?: number
  /** 经营年限 */
  years_in_business?: number
  /** 认证状态 */
  certification_status?: 'verified' | 'pending' | 'none'
  /** 创建时间 */
  created_at: string
  /** 更新时间 */
  updated_at: string
}

/**
 * 商家列表项(可能包含额外的计算字段)
 */
export interface MerchantListItem extends Merchant {
  /** 距离用户的距离(公里),仅当用户提供位置时返回 */
  distance?: number
  /** 该商家支持的产品分类标签 */
  product_tags?: string[]
}
```

### 验证规则

```typescript
const merchantValidationRules = {
  id: {
    type: 'number',
    required: true,
    min: 1
  },
  name: {
    type: 'string',
    required: true,
    minLength: 2,
    maxLength: 50
  },
  logo: {
    type: 'string',
    required: false,
    pattern: /^https?:\/\/.+\.(jpg|jpeg|png|webp)$/i
  },
  region_id: {
    type: 'number',
    required: true
  },
  phone: {
    type: 'string',
    required: false,
    pattern: /^1[3-9]\d{9}$/
  },
  rating: {
    type: 'number',
    required: false,
    min: 0,
    max: 5
  },
  is_active: {
    type: 'number',
    required: true,
    enum: [0, 1]
  }
}
```

### 业务规则

1. **区域归属**: 每个商家必须归属于一个唯一的区域,不能跨区域展示
2. **Logo降级**: 当`logo`字段为空或加载失败时,前端生成品牌色块+首字母占位图
3. **营业状态**: `is_active=0` 的商家在列表中不展示(后端过滤)
4. **必填字段**: `name`和`region_id`为必填,其他字段可选,前端智能处理缺失字段

---

## 2. ProductCategory (产品分类)

**描述**: 平台统一管理的产品分类,商家只能上架平台已有的分类。

### 字段定义

| 字段名 | 类型 | 必填 | 说明 | 示例 |
|-------|------|------|------|------|
| `id` | number | ✅ | 分类ID | 1 |
| `name` | string | ✅ | 分类名称 | "大米" |
| `image` | string | ✅ | 分类图片URL | "https://cdn.example.com/rice.jpg" |
| `description` | string | ❌ | 分类描述 | "优质东北大米" |
| `sort_order` | number | ✅ | 排序权重 | 100 |
| `is_active` | number | ✅ | 是否启用(1=启用,0=禁用) | 1 |

### TypeScript接口

```typescript
/**
 * 产品分类
 */
export interface ProductCategory {
  /** 分类ID */
  id: number
  /** 分类名称 */
  name: string
  /** 分类图片URL */
  image: string
  /** 分类描述 */
  description?: string
  /** 排序权重 */
  sort_order: number
  /** 是否启用 */
  is_active: 0 | 1
}
```

### 业务规则

1. **平台管理**: 产品分类由平台统一创建和管理,商家不能自定义分类
2. **分类展示顺序**: 按`sort_order`升序排列
3. **停用分类**: `is_active=0`的分类不在前端展示

---

## 3. MerchantProductMapping (商家-产品关联)

**描述**: 表示商家上架了哪些平台产品分类。

### 字段定义

| 字段名 | 类型 | 必填 | 说明 | 示例 |
|-------|------|------|------|------|
| `id` | number | ✅ | 关联ID | 1 |
| `merchant_id` | number | ✅ | 商家ID | 1001 |
| `category_id` | number | ✅ | 产品分类ID | 1 |
| `is_available` | number | ✅ | 是否有货(1=有货,0=缺货) | 1 |
| `stock_status` | string | ❌ | 库存状态描述 | "充足" |
| `created_at` | string | ✅ | 上架时间 | "2024-01-01 10:00:00" |
| `updated_at` | string | ✅ | 更新时间 | "2024-10-14 12:00:00" |

### TypeScript接口

```typescript
/**
 * 商家-产品关联
 */
export interface MerchantProductMapping {
  /** 关联ID */
  id: number
  /** 商家ID */
  merchant_id: number
  /** 产品分类ID */
  category_id: number
  /** 是否有货 */
  is_available: 0 | 1
  /** 库存状态描述 */
  stock_status?: string
  /** 上架时间 */
  created_at: string
  /** 更新时间 */
  updated_at: string
}

/**
 * 商家产品(用于详情页展示,包含分类信息和价格)
 */
export interface MerchantProduct extends ProductCategory {
  /** 是否有货 */
  is_available: boolean
  /** 当前区域价格 */
  price: number
  /** 价格单位 */
  price_unit: string
}
```

### 业务规则

1. **唯一约束**: 一个商家对一个产品分类只能有一条关联记录(merchant_id + category_id 唯一)
2. **缺货处理**: `is_available=0`时,商家详情页仍展示该品类,但标记"暂无库存"
3. **级联删除**: 商家删除时,关联记录自动删除

---

## 4. RegionalPricing (区域定价)

**描述**: 平台产品按区域的统一定价,同一区域内所有商家价格相同。

### 字段定义

| 字段名 | 类型 | 必填 | 说明 | 示例 |
|-------|------|------|------|------|
| `id` | number | ✅ | 定价ID | 1 |
| `category_id` | number | ✅ | 产品分类ID | 1 |
| `region_id` | number | ✅ | 区域ID | 230100 |
| `price` | number | ✅ | 价格(分) | 500 |
| `price_unit` | string | ✅ | 价格单位 | "元/斤" |
| `effective_date` | string | ✅ | 生效日期 | "2024-01-01" |
| `expire_date` | string | ❌ | 失效日期 | "2024-12-31" |
| `created_at` | string | ✅ | 创建时间 | "2024-01-01 10:00:00" |

### TypeScript接口

```typescript
/**
 * 区域定价
 */
export interface RegionalPricing {
  /** 定价ID */
  id: number
  /** 产品分类ID */
  category_id: number
  /** 区域ID */
  region_id: number
  /** 价格(分) */
  price: number
  /** 价格单位 */
  price_unit: string
  /** 生效日期 */
  effective_date: string
  /** 失效日期 */
  expire_date?: string
  /** 创建时间 */
  created_at: string
}

/**
 * 区域定价查询参数
 */
export interface GetRegionalPriceParams {
  /** 产品分类ID列表 */
  category_ids: number[]
  /** 区域ID */
  region_id: number
}

/**
 * 区域定价响应(用于前端展示)
 */
export interface RegionalPriceDisplay {
  /** 产品分类ID */
  category_id: number
  /** 产品分类名称 */
  category_name: string
  /** 价格(元,已转换) */
  price: number
  /** 价格单位 */
  price_unit: string
}
```

### 业务规则

1. **唯一约束**: 一个区域的一个产品分类只能有一个有效价格(category_id + region_id + 时间范围 唯一)
2. **价格单位**: 存储为"分",前端展示时转换为"元"(price / 100)
3. **生效规则**: 只展示当前日期在 `effective_date` 和 `expire_date` 之间的价格
4. **统一定价**: 同一区域内所有商家的相同产品价格必须相同

---

## 5. Region (区域)

**描述**: 用户所在地理区域,用于过滤商家和定价。

### 字段定义

| 字段名 | 类型 | 必填 | 说明 | 示例 |
|-------|------|------|------|------|
| `id` | number | ✅ | 区域ID | 230100 |
| `name` | string | ✅ | 区域名称 | "哈尔滨市" |
| `province` | string | ✅ | 所属省份 | "黑龙江省" |
| `level` | string | ✅ | 区域级别(province/city/district) | "city" |
| `parent_id` | number | ❌ | 父级区域ID | 230000 |

### TypeScript接口

```typescript
/**
 * 区域
 */
export interface Region {
  /** 区域ID */
  id: number
  /** 区域名称 */
  name: string
  /** 所属省份 */
  province: string
  /** 区域级别 */
  level: 'province' | 'city' | 'district'
  /** 父级区域ID */
  parent_id?: number
}
```

### 业务规则

1. **层级结构**: 省 -> 市 -> 区/县 三级结构
2. **前端使用**: RegionContext提供province和city字符串,API根据名称查询region_id
3. **优先级**: 优先使用city过滤,city为空时使用province

---

## 实体关系说明

### 1. Merchant → MerchantProductMapping → ProductCategory

**关系**: 多对多
**说明**: 一个商家可以上架多个产品分类,一个产品分类可以被多个商家上架

```sql
-- 查询某商家已上架的产品分类
SELECT pc.*
FROM product_category pc
INNER JOIN merchant_product_mapping mpm ON pc.id = mpm.category_id
WHERE mpm.merchant_id = 1001 AND mpm.is_available = 1
```

### 2. Region → Merchant

**关系**: 一对多
**说明**: 一个区域可以有多个商家,一个商家只能属于一个区域

```sql
-- 查询某区域的所有商家
SELECT * FROM merchant
WHERE region_id = 230100 AND is_active = 1
```

### 3. Region → RegionalPricing

**关系**: 一对多
**说明**: 一个区域可以有多个产品定价,一个定价只属于一个区域

```sql
-- 查询某区域的所有产品价格
SELECT * FROM regional_pricing
WHERE region_id = 230100
AND effective_date <= CURDATE()
AND (expire_date IS NULL OR expire_date >= CURDATE())
```

---

## 前端数据流

### 商家列表页

```typescript
// 1. 从RegionContext获取用户区域
const { province, city } = useRegion()

// 2. 调用API获取商家列表
const response = await getMerchantList({
  city,
  province,
  page: 1,
  limit: 20
})

// 3. 渲染商家卡片
response.data.data.forEach(merchant => {
  // merchant.logo -> MerchantLogo组件
  // merchant.name -> 商家名称
  // merchant.address -> 地址
  // merchant.product_tags -> 产品标签
})
```

### 商家详情页

```typescript
// 1. 获取商家基本信息
const merchant = await getMerchantDetail(merchantId)

// 2. 获取该商家的产品列表(包含当前区域价格)
const products = await getMerchantProducts(merchantId, {
  city,
  province
})

// 3. 渲染商家信息 + 产品列表
// merchant -> MerchantInfo组件
// products -> MerchantProductList组件
```

---

## 数据一致性保证

### 1. 区域过滤一致性

- 商家列表:根据用户区域过滤
- 商家详情:展示该商家信息(不过滤)
- 产品价格:根据用户区域展示对应价格

### 2. 价格显示一致性

- 同一区域内所有商家的相同产品价格必须相同
- 价格存储为"分",展示为"元"
- 价格单位统一显示(如"元/斤")

### 3. 缺失字段处理

- `logo`缺失 -> 生成首字母占位图
- `address`缺失 -> 隐藏地址字段
- `phone`缺失 -> 隐藏电话字段
- `rating`缺失 -> 不显示评分
- 可选字段全部缺失 -> 只显示必填字段(name, region)

---

## 总结

### 核心实体(5个)

1. ✅ Merchant - 商家信息
2. ✅ ProductCategory - 产品分类
3. ✅ MerchantProductMapping - 商家-产品关联
4. ✅ RegionalPricing - 区域定价
5. ✅ Region - 地理区域

### 关键业务规则

- 商家归属唯一区域,不跨区域展示
- 产品分类由平台统一管理
- 区域定价统一,同区域同价
- 可选字段缺失时智能降级
- Logo缺失时生成占位图

### 下一步

进入API合约设计(contracts/merchant.yaml)
