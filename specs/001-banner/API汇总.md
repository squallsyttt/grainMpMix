# API接口汇总 - 粮仓Mix小程序

**基础URL**: `/api`
**Mock服务**: `src/utils/mock.ts`
**更新日期**: 2025-10-11

---

## 📋 页面接口清单

### 1. 首页 (pages/index)

| 接口 | 用途 | Mock函数 |
|------|------|----------|
| `GET /banners` | 获取轮播图 | `mockGetBanners()` |
| `GET /categories` | 获取分类列表 | `mockGetCategories()` |
| `GET /products/featured` | 获取精选商品 | `mockGetFeaturedProducts()` |

**页面加载流程**:
```typescript
// pages/index/index.tsx
useEffect(() => {
  const loadData = async () => {
    const banners = await mockGetBanners()           // 加载轮播图
    const categories = await mockGetCategories()     // 加载分类
    const products = await mockGetFeaturedProducts() // 加载商品
  }
  loadData()
}, [])
```

---

### 2. 分类页 (pages/category)

| 接口 | 用途 | Mock函数 |
|------|------|----------|
| `GET /categories/:id/products` | 获取分类商品 | `mockGetCategoryProducts(categoryId)` |
| `GET /categories/:id/children` | 获取子分类 | `mockGetCategoryChildren(categoryId)` |

**页面加载流程**:
```typescript
// pages/category/index.tsx
const { categoryId } = router.params

useEffect(() => {
  const loadData = async () => {
    const children = await mockGetCategoryChildren(categoryId)  // 获取子分类
    const products = await mockGetCategoryProducts(categoryId)  // 获取商品
  }
  loadData()
}, [categoryId])
```

---

### 3. 商品详情页 (pages/product)

| 接口 | 用途 | Mock函数 |
|------|------|----------|
| `GET /products/:id` | 获取商品详情 | `mockGetProductDetail(productId)` |

**页面加载流程**:
```typescript
// pages/product/index.tsx
const { id } = router.params

useEffect(() => {
  const loadData = async () => {
    const product = await mockGetProductDetail(id)
  }
  loadData()
}, [id])
```

---

### 4. 资讯页 (pages/news) - 待实现

| 接口 | 用途 | Mock函数 |
|------|------|----------|
| `GET /news` | 获取资讯列表 | `mockGetNewsList()` |
| `GET /news/:id` | 获取资讯详情 | `mockGetNewsDetail(id)` |

---

### 5. 购物车页 (pages/cart) - 待实现

| 接口 | 用途 | Mock函数 |
|------|------|----------|
| `GET /cart` | 获取购物车 | `mockGetCart()` |
| `POST /cart` | 添加商品 | `mockAddToCart(productId, count)` |
| `PUT /cart/:id` | 更新数量 | `mockUpdateCartItem(id, count)` |
| `DELETE /cart/:id` | 删除商品 | `mockDeleteCartItem(id)` |

---

## 📡 接口详细定义

### 1. 轮播图接口

```typescript
// GET /api/banners
interface BannerResponse {
  code: 0
  data: {
    id: string
    imageUrl: string
    title: string
    linkType: 'none' | 'product' | 'category' | 'web'
    linkValue: string
  }[]
}

// Mock数据示例
{
  code: 0,
  data: [
    {
      id: 'banner-1',
      imageUrl: 'https://placeholder.com/750x300',
      title: '五常大米新品上市',
      linkType: 'product',
      linkValue: 'prod-001'
    }
  ]
}
```

---

### 2. 分类接口

```typescript
// GET /api/categories
interface CategoryResponse {
  code: 0
  data: {
    id: string
    name: string
    parentId: string | null
    icon: string
    productCount: number
  }[]
}

// Mock数据示例
{
  code: 0,
  data: [
    {
      id: 'rice',
      name: '糯米专区',
      parentId: null,
      icon: 'rice',
      productCount: 28
    },
    {
      id: 'rice-northeast',
      name: '东北糯米',
      parentId: 'rice',
      icon: null,
      productCount: 15
    }
  ]
}
```

---

### 3. 商品接口

#### 3.1 获取精选商品

```typescript
// GET /api/products/featured?count=12
interface FeaturedProductsResponse {
  code: 0
  data: {
    id: string
    name: string
    price: number
    originalPrice?: number
    image: string
    sales: number
    tags: string[]
  }[]
}

// Mock数据示例
{
  code: 0,
  data: [
    {
      id: 'prod-001',
      name: '五常大米 5kg',
      price: 89.9,
      originalPrice: 109.9,
      image: 'https://placeholder.com/400x400',
      sales: 1523,
      tags: ['热卖', '产地直供']
    }
  ]
}
```

#### 3.2 获取分类商品

```typescript
// GET /api/categories/:id/products?page=1&pageSize=12
interface CategoryProductsResponse {
  code: 0
  data: {
    products: Product[]
    pagination: {
      page: number
      pageSize: number
      total: number
      hasMore: boolean
    }
  }
}

// Mock数据示例
{
  code: 0,
  data: {
    products: [ /* 同上 */ ],
    pagination: {
      page: 1,
      pageSize: 12,
      total: 28,
      hasMore: true
    }
  }
}
```

#### 3.3 获取商品详情

```typescript
// GET /api/products/:id
interface ProductDetailResponse {
  code: 0
  data: {
    id: string
    name: string
    description: string
    price: number
    originalPrice?: number
    stock: number
    images: string[]
    categoryId: string
    sales: number
    rating: number
    reviewCount: number
  }
}

// Mock数据示例
{
  code: 0,
  data: {
    id: 'prod-001',
    name: '五常大米 5kg装',
    description: '黑龙江五常产地直供',
    price: 89.9,
    originalPrice: 109.9,
    stock: 500,
    images: ['url1', 'url2'],
    categoryId: 'rice-northeast',
    sales: 1523,
    rating: 4.8,
    reviewCount: 342
  }
}
```

---

### 4. 子分类接口

```typescript
// GET /api/categories/:id/children
interface CategoryChildrenResponse {
  code: 0
  data: {
    id: string
    name: string
    productCount: number
  }[]
}

// Mock数据示例
{
  code: 0,
  data: [
    { id: 'rice-northeast', name: '东北糯米', productCount: 15 },
    { id: 'rice-south', name: '南方糯米', productCount: 13 }
  ]
}
```

---

## 🛠️ Mock服务实现

### 统一Mock文件 (src/utils/mock.ts)

```typescript
// src/utils/mock.ts

import { banners } from '../data/banners'
import { categories } from '../data/categories'
import { products } from '../data/products'

/**
 * 模拟网络延迟
 */
const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * 统一响应格式
 */
const response = <T>(data: T) => ({ code: 0, data })

// ==================== 轮播图 ====================

export async function mockGetBanners() {
  await delay()
  return response(banners)
}

// ==================== 分类 ====================

export async function mockGetCategories() {
  await delay()
  return response(categories)
}

export async function mockGetCategoryChildren(categoryId: string) {
  await delay()
  const children = categories.filter(c => c.parentId === categoryId)
  return response(children)
}

// ==================== 商品 ====================

export async function mockGetFeaturedProducts(count: number = 12) {
  await delay()
  const featured = products
    .filter(p => p.status === 'on_sale')
    .sort((a, b) => b.sales - a.sales)
    .slice(0, count)
  return response(featured)
}

export async function mockGetCategoryProducts(
  categoryId: string,
  page: number = 1,
  pageSize: number = 12
) {
  await delay()

  // 获取该分类及子分类下的所有商品
  const categoryIds = [categoryId]
  categories
    .filter(c => c.parentId === categoryId)
    .forEach(c => categoryIds.push(c.id))

  const allProducts = products.filter(p =>
    categoryIds.includes(p.categoryId) && p.status === 'on_sale'
  )

  const start = (page - 1) * pageSize
  const end = start + pageSize
  const pageProducts = allProducts.slice(start, end)

  return response({
    products: pageProducts,
    pagination: {
      page,
      pageSize,
      total: allProducts.length,
      hasMore: end < allProducts.length
    }
  })
}

export async function mockGetProductDetail(productId: string) {
  await delay()
  const product = products.find(p => p.id === productId)
  if (!product) {
    return { code: 404, data: null, message: 'Product not found' }
  }
  return response(product)
}

// ==================== 资讯(待实现) ====================

export async function mockGetNewsList(page: number = 1) {
  await delay()
  // TODO: 实现资讯列表mock
  return response({ news: [], pagination: {} })
}

export async function mockGetNewsDetail(newsId: string) {
  await delay()
  // TODO: 实现资讯详情mock
  return response(null)
}

// ==================== 购物车(待实现) ====================

let cartItems: any[] = [] // 内存存储购物车

export async function mockGetCart() {
  await delay()
  return response(cartItems)
}

export async function mockAddToCart(productId: string, count: number) {
  await delay()
  const existing = cartItems.find(item => item.productId === productId)
  if (existing) {
    existing.count += count
  } else {
    cartItems.push({ id: Date.now().toString(), productId, count })
  }
  return response({ success: true })
}

export async function mockUpdateCartItem(id: string, count: number) {
  await delay()
  const item = cartItems.find(i => i.id === id)
  if (item) {
    item.count = count
  }
  return response({ success: true })
}

export async function mockDeleteCartItem(id: string) {
  await delay()
  cartItems = cartItems.filter(i => i.id !== id)
  return response({ success: true })
}
```

---

## 🔄 后端对接指南

### 步骤1: 查看Mock数据结构

打开 `src/utils/mock.ts`,查看每个函数的返回数据格式。

### 步骤2: 实现后端接口

以"获取精选商品"为例:

```javascript
// 后端实现 (Node.js/Express示例)
app.get('/api/products/featured', async (req, res) => {
  const { count = 12 } = req.query

  const products = await Product.find({ status: 'on_sale' })
    .sort({ sales: -1 })
    .limit(count)

  res.json({
    code: 0,
    data: products  // 字段与Mock保持一致!
  })
})
```

### 步骤3: 替换Mock为真实API

```typescript
// 修改前 (使用Mock)
import { mockGetFeaturedProducts } from '../utils/mock'
const { data } = await mockGetFeaturedProducts(12)

// 修改后 (使用真实API)
import Taro from '@tarojs/taro'
const { data } = await Taro.request({
  url: 'https://api.yourdomain.com/api/products/featured?count=12'
})
```

或者创建统一请求函数:

```typescript
// utils/request.ts
export async function request<T>(url: string): Promise<{ code: number; data: T }> {
  const response = await Taro.request({ url: BASE_URL + url })
  return response.data
}

// 使用
import { request } from '../utils/request'
const { data } = await request('/api/products/featured?count=12')
```

---

## 📌 快速索引

**需要添加新接口?** 按照这个模板:

1. **在本文档添加接口定义** (响应格式示例)
2. **在 `src/utils/mock.ts` 添加Mock函数**
3. **在对应页面使用Mock函数**
4. **后端照着Mock的数据结构实现**
5. **前端替换Mock为真实API调用**

**示例 - 添加搜索接口**:

```typescript
// 1. 文档定义
// GET /api/products/search?keyword=五常
interface SearchResponse {
  code: 0
  data: Product[]
}

// 2. Mock实现
export async function mockSearchProducts(keyword: string) {
  await delay()
  const results = products.filter(p =>
    p.name.includes(keyword) && p.status === 'on_sale'
  )
  return response(results)
}

// 3. 页面使用
const { data } = await mockSearchProducts('五常')

// 4. 后端实现 (参考Mock的数据结构)
// 5. 前端替换为真实API
```

---

## 📂 相关文件

| 文件 | 说明 |
|------|------|
| `src/utils/mock.ts` | Mock服务统一实现 |
| `src/data/banners.ts` | 轮播图模拟数据 |
| `src/data/categories.ts` | 分类模拟数据 |
| `src/data/products.ts` | 商品模拟数据 |
| `src/utils/request.ts` | 真实API请求封装(P3阶段) |

---

**最后更新**: 2025-10-11
**维护者**: 根据页面需求持续更新此文档
