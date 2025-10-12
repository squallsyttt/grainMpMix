# 快速上手指南：首页多级分类导航与商品展示

**目标读者**: 新加入项目的开发者
**预计阅读时间**: 10分钟
**前置知识**: Taro基础、React Hooks、TypeScript

---

## 📦 项目结构概览

```
grainMpMix/
├── src/
│   ├── components/          # 可复用组件
│   │   ├── ProductList/     # 商品列表组件
│   │   ├── ProductCard/     # 商品卡片组件
│   │   ├── ProductCategories/ # 分类导航组件(已有)
│   │   └── Breadcrumb/      # 面包屑导航
│   ├── pages/               # 页面
│   │   ├── index/           # 首页(已有)
│   │   ├── category/        # 分类详情页
│   │   └── product/         # 商品详情页
│   ├── data/                # 模拟数据
│   │   ├── products.ts      # 商品数据
│   │   └── categories.ts    # 分类数据(已有,需扩展)
│   ├── types/               # 类型定义
│   │   ├── product.ts
│   │   ├── category.ts
│   │   └── ...
│   ├── utils/               # 工具函数
│   │   ├── categoryIndex.ts # 分类索引构建
│   │   ├── apiMock.ts       # API模拟
│   │   └── ...
│   └── contexts/            # React Context
│       └── CategoryContext.tsx
└── specs/001-banner/        # 功能规格文档
    ├── spec.md              # 功能规格
    ├── research.md          # 技术调研
    ├── data-model.md        # 数据模型
    ├── plan.md              # 实现计划
    └── contracts/           # API契约
```

---

## 🚀 5分钟快速开始

### 步骤1: 理解核心概念

**三大核心组件**:

1. **ProductList (商品列表)**
   - 功能: 展示商品卡片网格,支持滚动加载
   - 使用场景: 首页精选商品、分类页商品列表

2. **ProductCategories (分类导航)**
   - 功能: 展示一级分类,支持点击跳转
   - 使用场景: 首页分类入口
   - 状态: 已存在,需优化点击事件

3. **CategoryContext (分类状态管理)**
   - 功能: 管理分类选择、面包屑路径、商品加载
   - 使用场景: 跨页面共享分类状态

**两种数据模式**:

- **MVP阶段**: 使用 `src/data/*.ts` 的模拟数据
- **P3阶段**: 对接后端API (见 `contracts/` 目录)

### 步骤2: 运行现有代码

```bash
# 安装依赖
npm install

# 启动开发服务器(微信小程序)
npm run dev:weapp

# 启动开发服务器(H5)
npm run dev:h5
```

### 步骤3: 查看首页现状

打开小程序开发者工具,查看首页:
- ✅ 已有: RegionBar、HomeBanner、HorizontalAd、ProductCategories
- ❌ 缺失: 商品列表、分类页面、商品详情页

### 步骤4: 创建第一个组件 - ProductCard

```tsx
// src/components/ProductCard/index.tsx

import React from 'react'
import { View, Text, Image } from '@tarojs/components'
import { Product } from '../../types/product'
import './index.less'

interface ProductCardProps {
  product: Product
  onClick?: (productId: string) => void
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  const handleClick = (): void => {
    onClick?.(product.id)
  }

  return (
    <View className="product-card" onClick={handleClick}>
      {/* 商品图片 */}
      <Image
        src={product.images[0]}
        mode="aspectFill"
        className="product-card__image"
        lazyLoad
      />

      {/* 促销标签 */}
      {product.promotion && (
        <View className="product-card__tag">
          {product.promotion.label}
        </View>
      )}

      {/* 商品信息 */}
      <View className="product-card__info">
        <Text className="product-card__name">{product.name}</Text>

        <View className="product-card__footer">
          <Text className="product-card__price">¥{product.price}</Text>
          {product.originalPrice && (
            <Text className="product-card__original-price">
              ¥{product.originalPrice}
            </Text>
          )}
        </View>

        <Text className="product-card__sales">已售 {product.sales}</Text>
      </View>
    </View>
  )
}

export default React.memo(ProductCard)
```

```less
// src/components/ProductCard/index.less

.product-card {
  position: relative;
  border-radius: 8px;
  background-color: #fff;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

  &__image {
    width: 100%;
    height: 200px;
    background-color: #f5f5f5;
  }

  &__tag {
    position: absolute;
    top: 8px;
    left: 8px;
    padding: 4px 8px;
    background-color: #ff6b35;
    color: #fff;
    font-size: 12px;
    border-radius: 4px;
  }

  &__info {
    padding: 12px;
  }

  &__name {
    font-size: 14px;
    color: #333;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
  }

  &__footer {
    display: flex;
    align-items: baseline;
    margin-top: 8px;
    gap: 8px;
  }

  &__price {
    font-size: 18px;
    font-weight: 700;
    color: #ff6b35;
  }

  &__original-price {
    font-size: 12px;
    color: #999;
    text-decoration: line-through;
  }

  &__sales {
    font-size: 12px;
    color: #999;
    margin-top: 4px;
  }
}
```

### 步骤5: 在首页使用ProductCard

```tsx
// src/pages/index/index.tsx

import ProductList from '../../components/ProductList'
import { products } from '../../data/products'

function Index() {
  // ...现有代码

  return (
    <View className="page">
      <RegionBar />
      <HomeBanner />
      <HorizontalAd />
      <ProductCategories />

      {/* 新增: 商品列表 */}
      <ProductList products={products.slice(0, 12)} />
    </View>
  )
}
```

---

## 📚 核心概念深入

### 1. 数据流向

```
模拟数据(data/*.ts)
    ↓
CategoryContext (状态管理)
    ↓
页面组件 (pages/*)
    ↓
展示组件 (components/*)
```

**示例**:
1. 用户在首页点击"糯米专区"
2. ProductCategories触发 `onClick` 回调
3. CategoryContext更新 `selectedCategory` 状态
4. 使用 `Taro.navigateTo` 跳转到分类页
5. 分类页从Context读取 `selectedCategory` 和 `products`
6. 渲染ProductList组件

### 2. 分类索引的使用

**为什么需要索引?**

原始数据是扁平数组:
```typescript
const categories = [
  { id: '1', name: '糯米', parentId: null },
  { id: '1-1', name: '东北糯米', parentId: '1' },
  { id: '1-2', name: '南方糯米', parentId: '1' }
]
```

构建索引后:
```typescript
const index = buildCategoryIndex(categories)

// O(1) 查找子分类
const children = index.childrenMap.get('1') // ['1-1', '1-2']

// O(1) 查找父分类
const parent = index.byId.get('1-1').parentId // '1'

// O(h) 获取面包屑路径 (h=层级深度)
const path = getCategoryPath(index, '1-1') // ['1', '1-1']
```

**使用示例**:

```typescript
import { buildCategoryIndex, getCategoryPath } from '../utils/categoryIndex'
import { categories } from '../data/categories'

const categoryIndex = buildCategoryIndex(categories)

// 获取面包屑
const breadcrumb = getCategoryPath(categoryIndex, 'rice-northeast')
// 结果: [{ id: 'rice', name: '糯米专区' }, { id: 'rice-northeast', name: '东北糯米' }]
```

### 3. Context的使用模式

**定义Context**:
```typescript
// contexts/CategoryContext.tsx
export const CategoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [products, setProducts] = useState([])

  return (
    <CategoryContext.Provider value={{ selectedCategory, products, ... }}>
      {children}
    </CategoryContext.Provider>
  )
}
```

**在App中注册**:
```typescript
// app.tsx
import { CategoryProvider } from './contexts/CategoryContext'

function App({ children }) {
  return (
    <CategoryProvider>
      {children}
    </CategoryProvider>
  )
}
```

**在组件中使用**:
```typescript
import { useCategory } from '../../contexts/CategoryContext'

const MyComponent = () => {
  const { selectedCategory, products, selectCategory } = useCategory()

  return <View>{selectedCategory?.name}</View>
}
```

---

## 🔧 常见任务

### 任务1: 添加新商品数据

编辑 `src/data/products.ts`:

```typescript
export const products: Product[] = [
  ...products, // 现有数据
  {
    id: 'prod-new',
    name: '新商品名称',
    price: 99.9,
    categoryId: 'rice', // 必须是有效的分类ID
    images: ['https://placeholder.com/400x400'],
    // ...其他必需字段
  }
]
```

### 任务2: 创建新页面

```bash
# 创建目录结构
mkdir -p src/pages/product
touch src/pages/product/index.tsx
touch src/pages/product/index.less
touch src/pages/product/index.config.ts
```

在 `app.config.ts` 中注册路由:

```typescript
export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/product/index', // 新增
  ],
})
```

### 任务3: 调试分类索引

在浏览器控制台调试:

```typescript
import { buildCategoryIndex } from '../utils/categoryIndex'
import { categories } from '../data/categories'

const index = buildCategoryIndex(categories)
console.log('索引:', index)
console.log('根分类:', index.roots)
console.log('糯米的子分类:', index.childrenMap.get('rice'))
```

---

## 📖 推荐阅读顺序

**第一天** (理解需求和技术方案):
1. `spec.md` - 理解功能需求
2. `research.md` - 理解技术选型

**第二天** (理解数据和接口):
3. `data-model.md` - 理解数据结构
4. `contracts/product-api.md` - 理解商品API
5. `contracts/category-api.md` - 理解分类API

**第三天** (开始编码):
6. 本文档 (quickstart.md)
7. 创建ProductCard组件
8. 创建ProductList组件
9. 集成到首页

---

## 🆘 常见问题

**Q: 为什么使用Context而不是Redux?**
A: MVP阶段状态简单,Context足够。见 `research.md` 第3节的详细对比。

**Q: 如何处理图片加载失败?**
A: 使用NutUI的Image组件,配置`error`属性。见 `research.md` 第2节。

**Q: 如何添加三级分类?**
A: 在 `categories.ts` 中添加 `level: 3`, `parentId: 二级分类ID` 的数据即可,索引自动支持。

**Q: 首页商品如何排序?**
A: 使用 `products.sort((a, b) => b.sales - a.sales)`,见 `data/products.ts` 的 `getFeaturedProducts` 函数。

---

## 🎯 下一步

- 阅读 `plan.md` 了解完整的实现计划
- 查看 `tasks.md` (由 `/speckit.tasks` 生成) 获取详细任务列表
- 开始实现P1核心功能!

**建议实施顺序**:
1. 创建类型定义 (`types/*.ts`)
2. 创建工具函数 (`utils/*.ts`)
3. 创建基础组件 (ProductCard, ProductList)
4. 集成到首页
5. 创建分类页面
6. 创建商品详情页
