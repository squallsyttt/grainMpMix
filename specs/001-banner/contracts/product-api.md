# 商品API契约

**基础URL**: `/api`
**版本**: v1
**认证**: 暂无(MVP阶段)

---

## 1. 获取精选商品列表

**用途**: 获取首页展示的精选商品

### 请求

```
GET /products/featured
```

**Query参数**:

| 参数 | 类型 | 必需 | 默认值 | 说明 |
|------|------|------|--------|------|
| `count` | number | 否 | 12 | 返回商品数量,范围:[8,20] |
| `sortBy` | string | 否 | sales_desc | 排序方式: sales_desc, new_first, rating_desc |

**示例**:
```
GET /api/products/featured?count=12&sortBy=sales_desc
```

### 响应

**成功响应** (200):

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "products": [
      {
        "id": "prod-001",
        "name": "五常大米 5kg装",
        "description": "黑龙江五常产地直供,粒粒饱满",
        "price": 89.9,
        "originalPrice": 109.9,
        "stock": 500,
        "categoryId": "rice-northeast",
        "tags": ["热卖", "产地直供"],
        "images": [
          "https://cdn.example.com/products/prod-001-main.jpg",
          "https://cdn.example.com/products/prod-001-detail.jpg"
        ],
        "sales": 1523,
        "rating": 4.8,
        "reviewCount": 342,
        "promotion": {
          "type": "discount",
          "label": "限时8折",
          "discount": 0.8
        },
        "createTime": 1704844800000,
        "updateTime": 1706140800000,
        "status": "on_sale"
      }
    ],
    "total": 1
  }
}
```

**错误响应** (400):

```json
{
  "code": 40001,
  "message": "Invalid count parameter",
  "data": null
}
```

---

## 2. 按分类获取商品列表

**用途**: 获取指定分类下的商品,支持分页

### 请求

```
GET /products
```

**Query参数**:

| 参数 | 类型 | 必需 | 默认值 | 说明 |
|------|------|------|--------|------|
| `categoryId` | string | 是 | - | 分类ID |
| `includeChildren` | boolean | 否 | true | 是否包含子分类商品 |
| `page` | number | 否 | 1 | 页码,从1开始 |
| `pageSize` | number | 否 | 12 | 每页数量,范围:[1,50] |
| `sortBy` | string | 否 | sales_desc | 排序方式 |
| `minPrice` | number | 否 | - | 最低价格筛选 |
| `maxPrice` | number | 否 | - | 最高价格筛选 |

**示例**:
```
GET /api/products?categoryId=rice&includeChildren=true&page=1&pageSize=12&sortBy=sales_desc
```

### 响应

**成功响应** (200):

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "products": [ /* Product对象数组 */ ],
    "pagination": {
      "page": 1,
      "pageSize": 12,
      "total": 28,
      "totalPages": 3,
      "hasMore": true
    }
  }
}
```

---

## 3. 获取商品详情

**用途**: 获取单个商品的详细信息

### 请求

```
GET /products/:id
```

**路径参数**:

| 参数 | 类型 | 说明 |
|------|------|------|
| `id` | string | 商品ID |

**示例**:
```
GET /api/products/prod-001
```

### 响应

**成功响应** (200):

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "product": {
      /* 完整的Product对象 */
    }
  }
}
```

**错误响应** (404):

```json
{
  "code": 40401,
  "message": "Product not found",
  "data": null
}
```

---

## 4. 搜索商品

**用途**: 关键词搜索商品

### 请求

```
GET /products/search
```

**Query参数**:

| 参数 | 类型 | 必需 | 默认值 | 说明 |
|------|------|------|--------|------|
| `keyword` | string | 是 | - | 搜索关键词 |
| `page` | number | 否 | 1 | 页码 |
| `pageSize` | number | 否 | 12 | 每页数量 |
| `categoryId` | string | 否 | - | 限定分类搜索 |

**示例**:
```
GET /api/products/search?keyword=五常&page=1&pageSize=12
```

### 响应

**成功响应** (200):

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "products": [ /* 匹配的商品列表 */ ],
    "pagination": { /* 分页信息 */ },
    "searchInfo": {
      "keyword": "五常",
      "resultCount": 8,
      "searchTime": 125
    }
  }
}
```

---

## 通用错误码

| 错误码 | HTTP状态 | 说明 |
|-------|---------|------|
| 0 | 200 | 成功 |
| 40001 | 400 | 参数错误 |
| 40101 | 401 | 未授权 |
| 40401 | 404 | 资源不存在 |
| 50001 | 500 | 服务器内部错误 |

---

## MVP阶段实现说明

MVP阶段使用前端模拟数据,无需实际调用后端API。可使用以下工具函数:

```typescript
// utils/apiMock.ts

import { products, getFeaturedProducts, getProductsByCategory } from '../data/products'

/**
 * 模拟API调用延迟
 */
function mockDelay(ms: number = 500): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 模拟API响应格式
 */
function mockResponse<T>(data: T) {
  return {
    code: 0,
    message: 'success',
    data
  }
}

/**
 * 模拟获取精选商品
 */
export async function mockGetFeaturedProducts(count: number = 12) {
  await mockDelay()
  const products = getFeaturedProducts(count)
  return mockResponse({ products, total: products.length })
}

/**
 * 模拟按分类获取商品
 */
export async function mockGetProductsByCategory(
  categoryId: string,
  page: number = 1,
  pageSize: number = 12
) {
  await mockDelay()
  const allProducts = getProductsByCategory(categoryId, true)
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const products = allProducts.slice(start, end)

  return mockResponse({
    products,
    pagination: {
      page,
      pageSize,
      total: allProducts.length,
      totalPages: Math.ceil(allProducts.length / pageSize),
      hasMore: end < allProducts.length
    }
  })
}
```

---

## P3阶段升级说明

P3阶段接入真实后端API时:

1. **创建API请求封装** (`utils/request.ts`):
```typescript
import Taro from '@tarojs/taro'

const BASE_URL = 'https://api.example.com'

export async function request<T>(
  url: string,
  options: Taro.request.Option = {}
): Promise<T> {
  try {
    const response = await Taro.request({
      url: BASE_URL + url,
      timeout: 10000,
      ...options
    })

    const { code, message, data } = response.data

    if (code !== 0) {
      throw new Error(message || '请求失败')
    }

    return data
  } catch (error) {
    console.error('API Request Error:', error)
    throw error
  }
}
```

2. **替换模拟API调用**:
```typescript
// Before (MVP)
import { mockGetFeaturedProducts } from '../utils/apiMock'
const { products } = await mockGetFeaturedProducts(12)

// After (P3)
import { request } from '../utils/request'
const { products } = await request('/products/featured?count=12')
```
