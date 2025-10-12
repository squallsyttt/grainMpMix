# 分类API契约

**基础URL**: `/api`
**版本**: v1
**认证**: 暂无(MVP阶段)

---

## 1. 获取所有分类

**用途**: 获取完整的分类树(扁平化格式)

### 请求

```
GET /categories
```

**Query参数**: 无

**示例**:
```
GET /api/categories
```

### 响应

**成功响应** (200):

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "categories": [
      {
        "id": "rice",
        "name": "糯米专区",
        "parentId": null,
        "level": 1,
        "icon": "https://cdn.example.com/icons/rice.png",
        "cover": "https://cdn.example.com/covers/rice.jpg",
        "description": "优质糯米,香软可口",
        "sort": 1,
        "visible": true,
        "productCount": 28,
        "createTime": 1704844800000,
        "updateTime": 1706140800000
      },
      {
        "id": "rice-northeast",
        "name": "东北糯米",
        "parentId": "rice",
        "level": 2,
        "sort": 1,
        "visible": true,
        "productCount": 15,
        "createTime": 1704844800000,
        "updateTime": 1706140800000
      }
    ],
    "total": 2,
    "cacheTime": 1706140800000
  }
}
```

**响应说明**:
- `categories`: 扁平化的分类数组,前端需自行构建树形索引
- `total`: 分类总数
- `cacheTime`: 数据缓存时间戳,用于客户端判断是否需要更新

---

## 2. 获取根分类列表

**用途**: 获取一级分类(首页分类导航使用)

### 请求

```
GET /categories/roots
```

**Query参数**:

| 参数 | 类型 | 必需 | 默认值 | 说明 |
|------|------|------|--------|------|
| `visibleOnly` | boolean | 否 | true | 是否只返回可见分类 |

**示例**:
```
GET /api/categories/roots?visibleOnly=true
```

### 响应

**成功响应** (200):

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "categories": [
      {
        "id": "rice",
        "name": "糯米专区",
        "parentId": null,
        "level": 1,
        "icon": "https://cdn.example.com/icons/rice.png",
        "sort": 1,
        "visible": true,
        "productCount": 28
      }
    ]
  }
}
```

---

## 3. 获取子分类列表

**用途**: 获取指定分类的直接子分类

### 请求

```
GET /categories/:id/children
```

**路径参数**:

| 参数 | 类型 | 说明 |
|------|------|------|
| `id` | string | 父分类ID |

**Query参数**:

| 参数 | 类型 | 必需 | 默认值 | 说明 |
|------|------|------|--------|------|
| `visibleOnly` | boolean | 否 | true | 是否只返回可见分类 |

**示例**:
```
GET /api/categories/rice/children
```

### 响应

**成功响应** (200):

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "children": [
      {
        "id": "rice-northeast",
        "name": "东北糯米",
        "parentId": "rice",
        "level": 2,
        "sort": 1,
        "visible": true,
        "productCount": 15
      },
      {
        "id": "rice-south",
        "name": "南方糯米",
        "parentId": "rice",
        "level": 2,
        "sort": 2,
        "visible": true,
        "productCount": 13
      }
    ]
  }
}
```

**错误响应** (404):

```json
{
  "code": 40401,
  "message": "Category not found",
  "data": null
}
```

---

## 4. 获取分类详情

**用途**: 获取单个分类的详细信息

### 请求

```
GET /categories/:id
```

**路径参数**:

| 参数 | 类型 | 说明 |
|------|------|------|
| `id` | string | 分类ID |

**示例**:
```
GET /api/categories/rice
```

### 响应

**成功响应** (200):

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "category": {
      "id": "rice",
      "name": "糯米专区",
      "parentId": null,
      "level": 1,
      "icon": "https://cdn.example.com/icons/rice.png",
      "cover": "https://cdn.example.com/covers/rice.jpg",
      "description": "优质糯米,香软可口",
      "sort": 1,
      "visible": true,
      "productCount": 28,
      "createTime": 1704844800000,
      "updateTime": 1706140800000
    }
  }
}
```

---

## 5. 获取分类路径

**用途**: 获取从根分类到指定分类的完整路径(面包屑导航)

### 请求

```
GET /categories/:id/path
```

**路径参数**:

| 参数 | 类型 | 说明 |
|------|------|------|
| `id` | string | 分类ID |

**示例**:
```
GET /api/categories/rice-northeast/path
```

### 响应

**成功响应** (200):

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "path": [
      {
        "id": "rice",
        "name": "糯米专区",
        "level": 1
      },
      {
        "id": "rice-northeast",
        "name": "东北糯米",
        "level": 2
      }
    ]
  }
}
```

---

## 6. 获取分类下所有后代ID

**用途**: 获取指定分类及其所有子分类的ID列表(用于商品查询)

### 请求

```
GET /categories/:id/descendants
```

**路径参数**:

| 参数 | 类型 | 说明 |
|------|------|------|
| `id` | string | 分类ID |

**示例**:
```
GET /api/categories/rice/descendants
```

### 响应

**成功响应** (200):

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "categoryIds": [
      "rice",
      "rice-northeast",
      "rice-northeast-wuchang",
      "rice-northeast-panjin",
      "rice-south",
      "rice-south-thai"
    ]
  }
}
```

**用法示例**:
```typescript
// 获取"糯米专区"及其所有子分类的商品
const { categoryIds } = await request('/categories/rice/descendants')
const { products } = await request(`/products?categoryIds=${categoryIds.join(',')}`)
```

---

## MVP阶段实现说明

MVP阶段使用前端模拟数据:

```typescript
// utils/apiMock.ts

import { categories } from '../data/categories'
import { buildCategoryIndex, getCategoryPath, getAllDescendantIds } from '../utils/categoryIndex'

const categoryIndex = buildCategoryIndex(categories)

/**
 * 模拟获取所有分类
 */
export async function mockGetAllCategories() {
  await mockDelay()
  return mockResponse({
    categories,
    total: categories.length,
    cacheTime: Date.now()
  })
}

/**
 * 模拟获取根分类
 */
export async function mockGetRootCategories(visibleOnly: boolean = true) {
  await mockDelay()
  const roots = categoryIndex.roots.filter(
    c => !visibleOnly || c.visible
  )
  return mockResponse({ categories: roots })
}

/**
 * 模拟获取子分类
 */
export async function mockGetCategoryChildren(
  categoryId: string,
  visibleOnly: boolean = true
) {
  await mockDelay()
  const children = categoryIndex.childrenMap.get(categoryId) || []
  const filtered = children.filter(c => !visibleOnly || c.visible)
  return mockResponse({ children: filtered })
}

/**
 * 模拟获取分类路径
 */
export async function mockGetCategoryPath(categoryId: string) {
  await mockDelay()
  const path = getCategoryPath(categoryIndex, categoryId)
  return mockResponse({ path })
}

/**
 * 模拟获取后代ID
 */
export async function mockGetDescendantIds(categoryId: string) {
  await mockDelay()
  const categoryIds = getAllDescendantIds(categoryIndex, categoryId)
  return mockResponse({ categoryIds })
}
```

---

## 缓存策略

**客户端缓存建议**:

1. **缓存时长**: 24小时
2. **缓存键**: `category_cache`
3. **缓存更新时机**:
   - 用户主动下拉刷新
   - 缓存过期后首次访问
   - 后端返回的`cacheTime`大于本地缓存时间

**示例代码**:

```typescript
// utils/categoryCache.ts

const CACHE_KEY = 'category_cache'
const CACHE_TIME_KEY = 'category_cache_time'
const CACHE_DURATION = 24 * 60 * 60 * 1000

export async function loadCategories(forceRefresh: boolean = false) {
  // 1. 检查缓存
  if (!forceRefresh) {
    const cached = getCachedCategories()
    if (cached) {
      return cached
    }
  }

  // 2. 从API获取
  const { categories, cacheTime } = await request('/api/categories')

  // 3. 保存到缓存
  setCachedCategories(categories)

  return categories
}
```

---

## P3阶段升级说明

与商品API类似,P3阶段替换为真实API调用即可。分类数据因为变化频率低,建议优先实现缓存策略以减少网络请求。
