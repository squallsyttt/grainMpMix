# 数据模型设计：首页多级分类导航与商品展示

**项目**: 粮仓Mix小程序
**功能**: 首页多级分类导航与商品展示
**创建时间**: 2025-10-11
**基于**: research.md 技术调研结论

---

## 核心实体

### 1. Product (商品)

**用途**: 大米商品的核心数据模型

**字段定义**:

```typescript
interface Product {
  // 基础信息
  id: string                    // 商品唯一标识
  name: string                  // 商品名称,如"五常大米 5kg装"
  description: string           // 商品描述

  // 价格与库存
  price: number                 // 当前售价(单位:元)
  originalPrice?: number        // 原价(用于显示折扣)
  stock: number                 // 库存数量

  // 分类与标签
  categoryId: string            // 所属分类ID
  tags?: string[]               // 商品标签,如["有机","新品","热卖"]

  // 媒体资源
  images: string[]              // 商品图片URLs(第一张为主图)

  // 销售数据
  sales: number                 // 累计销量
  rating: number                // 平均评分 (0-5)
  reviewCount: number           // 评价数量

  // 促销信息
  promotion?: Promotion         // 促销活动(可选)

  // 时间戳
  createTime: number            // 创建时间(毫秒时间戳)
  updateTime: number            // 更新时间

  // 状态
  status: ProductStatus         // 商品状态
}

enum ProductStatus {
  ON_SALE = 'on_sale',          // 在售
  OFF_SALE = 'off_sale',        // 下架
  OUT_OF_STOCK = 'out_of_stock' // 缺货
}

interface Promotion {
  type: 'discount' | 'special_price' | 'bundle'  // 促销类型
  label: string                                   // 促销标签,如"限时特惠"
  discount?: number                               // 折扣(0.8表示8折)
  specialPrice?: number                           // 特价
  startTime?: number                              // 开始时间
  endTime?: number                                // 结束时间
}
```

**验证规则**:
- `price` 必须 > 0
- `stock` 必须 >= 0
- `rating` 必须在 0-5 之间
- `images` 至少包含一张图片
- `categoryId` 必须存在于有效分类列表中

**状态转换**:
```
ON_SALE → OFF_SALE (下架)
ON_SALE → OUT_OF_STOCK (售罄)
OFF_SALE → ON_SALE (重新上架)
OUT_OF_STOCK → ON_SALE (补货)
```

**索引建议**:
- `categoryId` (用于按分类查询)
- `status` (用于筛选在售商品)
- `sales` (用于销量排序)
- `createTime` (用于新品排序)

---

### 2. Category (分类)

**用途**: 多级商品分类树形结构

**字段定义**:

```typescript
interface Category {
  // 基础信息
  id: string                    // 分类唯一标识
  name: string                  // 分类名称,如"糯米专区"

  // 树形结构
  parentId: string | null       // 父分类ID,根分类为null
  level: number                 // 层级: 1=一级, 2=二级, 3=三级

  // 展示信息
  icon?: string                 // 分类图标URL
  cover?: string                // 分类封面图URL
  description?: string          // 分类描述

  // 排序与状态
  sort: number                  // 排序权重(数字越小越靠前)
  visible: boolean              // 是否可见

  // 统计信息
  productCount: number          // 该分类下商品数量(包含子分类)

  // 时间戳
  createTime: number
  updateTime: number
}
```

**验证规则**:
- `level` 必须在 1-3 之间
- 一级分类 `parentId` 必须为 `null`
- 二级/三级分类 `parentId` 必须存在
- 同一父分类下 `sort` 不能重复

**关系约束**:
- 一级分类: `parentId = null`, `level = 1`
- 二级分类: `parentId = 一级分类ID`, `level = 2`
- 三级分类: `parentId = 二级分类ID`, `level = 3`
- 不允许跨级关联(如三级分类的parent不能是一级分类)

**数据示例**:

```json
[
  {
    "id": "cat-1",
    "name": "糯米专区",
    "parentId": null,
    "level": 1,
    "sort": 1,
    "visible": true,
    "productCount": 28,
    "icon": "https://cdn.example.com/icons/rice.png"
  },
  {
    "id": "cat-1-1",
    "name": "东北糯米",
    "parentId": "cat-1",
    "level": 2,
    "sort": 1,
    "visible": true,
    "productCount": 15,
    "icon": null
  },
  {
    "id": "cat-1-1-1",
    "name": "五常糯米",
    "parentId": "cat-1-1",
    "level": 3,
    "sort": 1,
    "visible": true,
    "productCount": 8,
    "icon": null
  }
]
```

---

### 3. Banner (轮播图)

**用途**: 首页营销横幅

**字段定义**:

```typescript
interface Banner {
  id: string                    // Banner唯一标识
  title: string                 // 标题
  imageUrl: string              // 图片URL

  // 跳转配置
  linkType: BannerLinkType      // 跳转类型
  linkValue: string             // 跳转值(根据linkType解释)

  // 展示控制
  sort: number                  // 排序权重
  visible: boolean              // 是否可见
  startTime?: number            // 开始时间(可选,用于定时上线)
  endTime?: number              // 结束时间(可选,用于定时下线)

  // 时间戳
  createTime: number
  updateTime: number
}

enum BannerLinkType {
  NONE = 'none',                // 无跳转
  PRODUCT = 'product',          // 跳转商品详情, linkValue=商品ID
  CATEGORY = 'category',        // 跳转分类页, linkValue=分类ID
  WEB_PAGE = 'web_page',        // 跳转H5页面, linkValue=URL
  MINI_PROGRAM = 'mini_program' // 跳转其他小程序, linkValue=appId/path组合
}
```

**验证规则**:
- `imageUrl` 必须是有效URL
- `linkType` 与 `linkValue` 必须匹配
- 如果设置了 `startTime` 和 `endTime`, 则 `endTime` > `startTime`

---

### 4. HomeConfig (首页配置)

**用途**: 首页布局和展示规则配置

**字段定义**:

```typescript
interface HomeConfig {
  id: string

  // 商品展示配置
  productDisplay: {
    defaultCount: number        // 首页默认展示商品数量 (8-12)
    loadMoreCount: number       // 每次加载更多的数量 (12)
    sortBy: ProductSortType     // 默认排序方式
  }

  // 分类展示配置
  categoryDisplay: {
    showIcons: boolean          // 是否显示分类图标
    layout: 'grid' | 'scroll'   // 布局方式: 网格 或 横向滚动
    columns?: number            // 网格列数(grid模式)
  }

  // 刷新配置
  refreshConfig: {
    enablePullDown: boolean     // 是否启用下拉刷新
    enableScrollLoad: boolean   // 是否启用上滑加载
  }

  // 更新时间
  updateTime: number
}

enum ProductSortType {
  SALES_DESC = 'sales_desc',    // 按销量降序
  PRICE_ASC = 'price_asc',      // 按价格升序
  PRICE_DESC = 'price_desc',    // 按价格降序
  NEW_FIRST = 'new_first',      // 新品优先
  RATING_DESC = 'rating_desc'   // 按评分降序
}
```

---

## 辅助实体

### 5. CategoryIndex (分类索引)

**用途**: 前端使用的分类索引结构,基于扁平数组构建

```typescript
interface CategoryIndex {
  // ID -> Category 映射
  byId: Map<string, Category>

  // parentId -> Category[] 映射
  childrenMap: Map<string, Category[]>

  // 根分类列表
  roots: Category[]
}
```

**构建方法**: 见 `research.md` 第5节

---

## 数据关系图

```
┌─────────────────┐
│     Banner      │  首页轮播图
└─────────────────┘

┌─────────────────┐
│   HomeConfig    │  首页配置
└─────────────────┘

┌─────────────────┐       ┌─────────────────┐
│    Category     │───────│    Product      │
│   (分类树)       │ 1:N   │   (商品)        │
└─────────────────┘       └─────────────────┘
    │
    │ parentId (自关联)
    │
    └─ Category (子分类)
```

**关系说明**:
- `Category` 与 `Product`: 一对多 (一个分类下有多个商品)
- `Category` 与 `Category`: 自关联 (通过`parentId`形成树形结构)
- `Banner` 独立实体,通过 `linkType` 和 `linkValue` 关联其他实体
- `HomeConfig` 独立配置,不直接关联其他实体

---

## MVP阶段模拟数据

### categories.ts (扩展现有文件)

```typescript
// src/data/categories.ts

export interface Category {
  id: string
  name: string
  parentId: string | null
  level: number
  icon?: string
  sort: number
  visible: boolean
  productCount: number
  createTime: number
  updateTime: number
}

export const categories: Category[] = [
  // 一级分类
  {
    id: 'rice',
    name: '糯米专区',
    parentId: null,
    level: 1,
    icon: 'rice',
    sort: 1,
    visible: true,
    productCount: 28,
    createTime: Date.now(),
    updateTime: Date.now()
  },
  {
    id: 'millet',
    name: '细米专区',
    parentId: null,
    level: 1,
    icon: 'millet',
    sort: 2,
    visible: true,
    productCount: 15,
    createTime: Date.now(),
    updateTime: Date.now()
  },
  {
    id: 'wheat',
    name: '碎米专区',
    parentId: null,
    level: 1,
    icon: 'wheat',
    sort: 3,
    visible: true,
    productCount: 12,
    createTime: Date.now(),
    updateTime: Date.now()
  },
  {
    id: 'organic',
    name: '有机米专区',
    parentId: null,
    level: 1,
    icon: 'organic',
    sort: 4,
    visible: true,
    productCount: 8,
    createTime: Date.now(),
    updateTime: Date.now()
  },
  {
    id: 'special',
    name: '特价专区',
    parentId: null,
    level: 1,
    icon: 'special',
    sort: 5,
    visible: true,
    productCount: 20,
    createTime: Date.now(),
    updateTime: Date.now()
  },

  // 二级分类示例
  {
    id: 'rice-northeast',
    name: '东北糯米',
    parentId: 'rice',
    level: 2,
    sort: 1,
    visible: true,
    productCount: 15,
    createTime: Date.now(),
    updateTime: Date.now()
  },
  {
    id: 'rice-south',
    name: '南方糯米',
    parentId: 'rice',
    level: 2,
    sort: 2,
    visible: true,
    productCount: 13,
    createTime: Date.now(),
    updateTime: Date.now()
  }
]
```

### products.ts (新建文件)

```typescript
// src/data/products.ts

export interface Product {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  stock: number
  categoryId: string
  tags?: string[]
  images: string[]
  sales: number
  rating: number
  reviewCount: number
  promotion?: {
    type: 'discount' | 'special_price'
    label: string
    discount?: number
    specialPrice?: number
  }
  createTime: number
  updateTime: number
  status: 'on_sale' | 'off_sale' | 'out_of_stock'
}

export const products: Product[] = [
  {
    id: 'prod-001',
    name: '五常大米 5kg装',
    description: '黑龙江五常产地直供,粒粒饱满,口感香软',
    price: 89.9,
    originalPrice: 109.9,
    stock: 500,
    categoryId: 'rice-northeast',
    tags: ['热卖', '产地直供'],
    images: [
      'https://via.placeholder.com/400x400/4CAF50/FFFFFF?text=五常大米',
      'https://via.placeholder.com/750x750/4CAF50/FFFFFF?text=细节图'
    ],
    sales: 1523,
    rating: 4.8,
    reviewCount: 342,
    promotion: {
      type: 'discount',
      label: '限时8折',
      discount: 0.8
    },
    createTime: Date.now() - 7 * 24 * 60 * 60 * 1000,
    updateTime: Date.now(),
    status: 'on_sale'
  },
  {
    id: 'prod-002',
    name: '盘锦大米 10kg装',
    description: '辽宁盘锦特产,蟹田大米,营养丰富',
    price: 158,
    stock: 300,
    categoryId: 'rice-northeast',
    tags: ['有机认证'],
    images: [
      'https://via.placeholder.com/400x400/2196F3/FFFFFF?text=盘锦大米'
    ],
    sales: 856,
    rating: 4.6,
    reviewCount: 178,
    createTime: Date.now() - 15 * 24 * 60 * 60 * 1000,
    updateTime: Date.now(),
    status: 'on_sale'
  },
  {
    id: 'prod-003',
    name: '泰国香米 2.5kg',
    description: '进口泰国茉莉香米,香味浓郁',
    price: 45.8,
    stock: 1000,
    categoryId: 'rice-south',
    tags: ['进口', '新品'],
    images: [
      'https://via.placeholder.com/400x400/FF9800/FFFFFF?text=泰国香米'
    ],
    sales: 2341,
    rating: 4.9,
    reviewCount: 521,
    promotion: {
      type: 'special_price',
      label: '新品特惠',
      specialPrice: 39.9
    },
    createTime: Date.now() - 2 * 24 * 60 * 60 * 1000,
    updateTime: Date.now(),
    status: 'on_sale'
  },
  // ... 更多商品数据
]

/**
 * 获取精选商品列表(首页展示)
 */
export function getFeaturedProducts(count: number = 12): Product[] {
  return products
    .filter(p => p.status === 'on_sale')
    .sort((a, b) => b.sales - a.sales)
    .slice(0, count)
}

/**
 * 按分类ID获取商品
 */
export function getProductsByCategory(
  categoryId: string,
  includeChildren: boolean = false
): Product[] {
  return products.filter(p => {
    if (!includeChildren) {
      return p.categoryId === categoryId && p.status === 'on_sale'
    }
    // 如果包含子分类,需要结合CategoryIndex查询
    return p.categoryId.startsWith(categoryId) && p.status === 'on_sale'
  })
}

/**
 * 按ID获取商品详情
 */
export function getProductById(id: string): Product | undefined {
  return products.find(p => p.id === id)
}
```

---

## 类型定义文件结构

```
src/types/
├── product.ts      # Product, ProductStatus, Promotion等
├── category.ts     # Category, CategoryIndex等
├── banner.ts       # Banner, BannerLinkType等
└── home.ts         # HomeConfig, ProductSortType等
```

---

## 下一步

参见 `contracts/` 目录的API契约定义,定义前后端交互接口规范。
