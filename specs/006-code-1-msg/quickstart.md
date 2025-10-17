# Quick Start: 首页商品分类多级展示优化

**Feature**: 006-code-1-msg
**Date**: 2025-10-17

## 功能概述

本功能优化了首页商品分类展示,支持多级分类(最多4层)的完整浏览体验,包括:
- ✅ 首页一级分类网格展示 (支持"查看更多")
- ✅ 分类导航页树形展开/收起
- ✅ 分类详情页二级子分类水平导航
- ✅ 商品列表页按分类筛选

---

## 5分钟体验

### 1. 首页浏览分类

```bash
# 1. 启动开发服务器
npm run dev:weapp

# 2. 打开微信开发者工具
# 3. 访问首页,查看"产品分类"区块
```

**预期效果**:
- 显示前6个一级分类(精米、碎米、香米、新米等)
- 每个分类显示图标、名称
- 有子分类的分类显示子分类数量
- 底部显示"查看更多"按钮

### 2. 查看完整分类树

```bash
# 点击"查看更多"按钮
```

**预期效果**:
- 跳转到分类导航页
- 显示所有一级分类
- 点击分类可展开/收起子分类
- 支持多层级嵌套展开

### 3. 浏览分类商品

```bash
# 点击任意分类(如"香米")
```

**预期效果**:
- 跳转到商品列表页
- 页面标题显示分类名称
- 顶部显示二级子分类导航 (水平滚动)
- 默认显示该分类及所有子分类的商品

---

## 目录结构

```
src/
├── components/
│   ├── ProductCategories/      # [改造] 首页分类展示
│   ├── CategoryTree/           # [新增] 可展开分类树
│   └── CategoryNavBar/         # [新增] 二级分类导航栏
│
├── pages/
│   ├── index/                  # [改造] 首页
│   ├── category-nav/           # [新增] 分类导航页
│   └── product-list/           # [新增] 商品列表页
│
├── types/
│   └── category.ts             # [改造] 分类类型定义
│
├── utils/
│   └── categoryTree.ts         # [新增] 树形数据处理
│
└── services/
    └── category.ts             # [新增] 分类API服务

specs/006-code-1-msg/
├── spec.md                     # 功能规范
├── plan.md                     # 实施计划
├── research.md                 # 技术研究
├── data-model.md               # 数据模型
├── quickstart.md               # 本文档
└── contracts/
    └── category-tree-api.md    # API合约
```

---

## 核心组件说明

### 1. ProductCategories (首页分类组件)

**位置**: `src/components/ProductCategories/index.tsx`

**改造内容**:
- ✅ 只展示前6个一级分类
- ✅ 显示子分类数量
- ✅ 添加"查看更多"按钮

**使用示例**:
```tsx
import ProductCategories from '@/components/ProductCategories'

<ProductCategories />
```

### 2. CategoryTree (分类树组件)

**位置**: `src/components/CategoryTree/index.tsx`

**功能**:
- 树形展示分类层级
- 支持展开/收起
- 支持最多4层嵌套

**Props**:
```typescript
interface CategoryTreeProps {
  /** 分类树数据 */
  data: CategoryTreeNode[]
  /** 点击分类回调 */
  onCategoryClick: (id: number) => void
}
```

**使用示例**:
```tsx
import CategoryTree from '@/components/CategoryTree'

<CategoryTree
  data={categories}
  onCategoryClick={handleCategoryClick}
/>
```

### 3. CategoryNavBar (分类导航栏)

**位置**: `src/components/CategoryNavBar/index.tsx`

**功能**:
- 水平滚动显示二级分类
- 支持切换选中状态

**Props**:
```typescript
interface CategoryNavBarProps {
  /** 二级分类列表 */
  categories: CategoryTreeNode[]
  /** 当前选中ID */
  activeId: number | null
  /** 切换回调 */
  onChange: (id: number | null) => void
}
```

**使用示例**:
```tsx
import CategoryNavBar from '@/components/CategoryNavBar'

<CategoryNavBar
  categories={subCategories}
  activeId={activeSubCategoryId}
  onChange={setActiveSubCategoryId}
/>
```

---

## 核心工具函数

### buildCategoryIndex (构建分类索引)

**位置**: `src/utils/categoryTree.ts`

**功能**: 将树形数据转为扁平索引,提升查找性能

**使用示例**:
```typescript
import { buildCategoryIndex } from '@/utils/categoryTree'

const index = buildCategoryIndex(categoryTree)

// O(1) 查找分类
const category = index.byId.get(106)

// O(1) 获取子分类
const children = index.byParentId.get(106)
```

### getCategoryPath (获取分类路径)

**功能**: 计算分类的完整路径 (用于面包屑)

**使用示例**:
```typescript
import { getCategoryPath } from '@/utils/categoryTree'

const path = getCategoryPath(108, index)
// 返回: [{ id: 106, name: "香米", depth: 0 }, { id: 108, name: "东北五常精品", depth: 1 }]
```

### getDescendants (获取所有子孙节点)

**功能**: 获取分类的所有子孙节点ID (用于商品筛选)

**使用示例**:
```typescript
import { getDescendants } from '@/utils/categoryTree'

const ids = getDescendants(106, index)
// 返回: [106, 108, ...] (106及其所有子孙ID)
```

---

## API 使用

### 获取分类树

```typescript
import { get } from '@/services/request'
import { CategoryTreeNode } from '@/types/category'

async function fetchCategoryTree(): Promise<CategoryTreeNode[]> {
  const response = await get<CategoryTreeNode[]>(
    '/api/wanlshop/category/tree',
    {},
    false // 不需要Token
  )

  if (response.code === 1 && response.data) {
    return response.data
  } else {
    throw new Error(response.msg || '获取分类失败')
  }
}
```

### 使用自定义Hook

```typescript
import { useCategories } from '@/hooks/useCategories'

function MyComponent() {
  const { tree, index, loading, error, refetch } = useCategories()

  if (loading) return <Loading />
  if (error) return <Error message={error} onRetry={refetch} />

  return <CategoryTree data={tree} />
}
```

---

## 页面路由

| 页面 | 路由 | 参数 | 说明 |
|------|------|------|------|
| 首页 | `/pages/index/index` | - | 展示前6个一级分类 |
| 分类导航页 | `/pages/category-nav/index` | - | 完整分类树 |
| 商品列表页 | `/pages/product-list/index` | `?categoryId=106&name=香米` | 显示分类商品 |

### 页面跳转示例

```typescript
import Taro from '@tarojs/taro'

// 首页 -> 分类导航页
Taro.navigateTo({
  url: '/pages/category-nav/index'
})

// 首页 -> 商品列表页
Taro.navigateTo({
  url: `/pages/product-list/index?categoryId=106&name=香米`
})
```

---

## 样式规范

### BEM 命名示例

```less
// 分类卡片
.category-card {
  padding: 16px;

  &__image {
    width: 80px;
    height: 80px;
  }

  &__name {
    font-size: 14px;
    color: #333;
  }

  &__count {
    font-size: 12px;
    color: #999;
  }

  &--has-children {
    border: 1px solid #1890ff;
  }
}
```

### 间距规范

使用8px的倍数:
```less
.category-grid {
  padding: 16px;        // 2 * 8px
  gap: 16px;            // 2 * 8px
}

.category-item {
  margin-bottom: 24px;  // 3 * 8px
}
```

---

## 性能优化

### 1. 图片懒加载

```tsx
import { Image } from '@nutui/nutui-react-taro'

<Image src={fullImageUrl(category.image)} lazy />
```

### 2. 组件记忆化

```tsx
import React from 'react'

const CategoryCard = React.memo<CategoryCardProps>(({ category }) => {
  return <View>{category.name}</View>
})
```

### 3. 事件处理优化

```tsx
import { useCallback } from 'react'

const handleClick = useCallback((id: number) => {
  Taro.navigateTo({ url: `/pages/product-list/index?categoryId=${id}` })
}, [])
```

---

## 常见问题

### Q1: 分类数据加载失败怎么办?

**A**: 检查以下几点:
1. API地址是否正确 (`/api/wanlshop/category/tree`)
2. 网络是否正常
3. 后端服务是否启动
4. 查看浏览器/小程序控制台错误信息

### Q2: 如何修改首页显示的分类数量?

**A**: 修改 `src/components/ProductCategories/index.tsx` 中的常量:
```typescript
const HOME_DISPLAY_COUNT = 6 // 改为你想要的数量
```

### Q3: 如何支持超过4层的分类?

**A**: 修改 `src/utils/categoryTree.ts` 中的常量:
```typescript
export const MAX_DEPTH = 4 // 改为更大的值
```

### Q4: 分类图片显示不出来?

**A**: 检查图片URL拼接逻辑:
```typescript
// 确保完整URL格式正确
const fullImageUrl = (relativePath: string) => {
  return `${API_BASE_URL}${relativePath}`
}
```

---

## 下一步

阅读完本文档后,建议:
1. 查看 [功能规范](./spec.md) 了解完整需求
2. 查看 [数据模型](./data-model.md) 了解类型定义
3. 查看 [API合约](./contracts/category-tree-api.md) 了解接口细节
4. 运行 `/speckit.tasks` 生成详细的实施任务列表
5. 运行 `/speckit.implement` 开始实施

## 相关资源

- [Taro 文档](https://taro-docs.jd.com/docs/)
- [NutUI React Taro 文档](https://nutui.jd.com/h5/react/2x/#/zh-CN/guide/intro-react)
- [TypeScript 官方文档](https://www.typescriptlang.org/docs/)
