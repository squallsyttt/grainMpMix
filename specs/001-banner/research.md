# 技术调研文档：首页多级分类导航与商品展示

**项目**: 粮仓Mix小程序
**功能**: 首页多级分类导航与商品展示
**创建时间**: 2025-01-11
**Taro版本**: 3.6.24
**React版本**: 18.0.0
**NutUI版本**: 2.3.10

---

## 1. 商品列表滚动加载最佳实践

### Decision（决策）

**选择方案：使用 Taro ScrollView + onScrollToLower 实现上滑加载更多**

对于20-30个商品的列表，不使用虚拟滚动，采用常规ScrollView即可满足性能需求。

### Rationale（选择理由）

1. **数据量不大，无需虚拟滚动**
   - 20-30个商品项不会造成性能瓶颈
   - 虚拟滚动（VirtualList）适用于100+项的长列表
   - 过度优化会增加复杂度和维护成本

2. **ScrollView API 成熟稳定**
   - Taro原生支持，跨平台兼容性好
   - `onScrollToLower` 事件触发时机可靠
   - `lowerThreshold` 可灵活配置触发距离

3. **实现简单直观**
   - 代码逻辑清晰，易于理解和维护
   - 状态管理简单，只需维护列表数据和加载状态
   - 调试方便，不涉及复杂的虚拟DOM计算

### Alternatives Considered（其他方案及拒绝原因）

#### 方案A：VirtualList 虚拟滚动
```tsx
// ❌ 不推荐：数据量小，过度设计
<VirtualList
  height={500}
  itemData={products}
  itemCount={products.length}
  itemSize={120}
  onScroll={handleScroll}
>
  {ProductCard}
</VirtualList>
```

**拒绝原因**：
- 需要固定item高度（`itemSize`），但商品卡片高度可能不固定
- 增加打包体积（需要引入额外组件）
- 调试复杂度高
- 对于20-30条数据，性能提升微乎其微

#### 方案B：手动监听 onScroll 计算滚动位置
```tsx
// ❌ 不推荐：重复造轮子
const handleScroll = (e) => {
  const { scrollTop, scrollHeight, clientHeight } = e.detail
  if (scrollTop + clientHeight >= scrollHeight - 50) {
    loadMore()
  }
}
```

**拒绝原因**：
- `onScrollToLower` 已经封装了这个逻辑
- 手动计算容易出错
- 代码冗余

### Code Example（推荐实现）

```tsx
import React, { useState } from 'react'
import { View, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.less'

interface Product {
  id: string
  name: string
  price: number
  image: string
}

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)

  // 加载更多数据
  const loadMore = async (): Promise<void> => {
    if (loading || !hasMore) return

    setLoading(true)
    try {
      const newProducts = await fetchProducts(page)

      if (newProducts.length === 0) {
        setHasMore(false)
        Taro.showToast({ title: '没有更多了', icon: 'none' })
        return
      }

      setProducts(prev => [...prev, ...newProducts])
      setPage(prev => prev + 1)
    } catch (error) {
      console.error('加载商品失败:', error)
      Taro.showToast({ title: '加载失败，请重试', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView
      className="product-list"
      scrollY
      scrollWithAnimation
      lowerThreshold={100}
      onScrollToLower={loadMore}
      style={{ height: '100vh' }}
    >
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}

      {loading && (
        <View className="loading-indicator">
          <Loading size="20px" />
          <Text>加载中...</Text>
        </View>
      )}

      {!hasMore && products.length > 0 && (
        <View className="no-more-text">— 已经到底了 —</View>
      )}
    </ScrollView>
  )
}
```

### 关键配置说明

| 属性 | 值 | 说明 |
|------|-----|------|
| `scrollY` | `true` | 启用纵向滚动 |
| `scrollWithAnimation` | `true` | 平滑滚动动画 |
| `lowerThreshold` | `100` | 距底部100px时触发（可根据网络情况调整） |
| `height` | `100vh` | 固定高度，必须设置才能触发滚动 |

---

## 2. 图片懒加载方案

### Decision（决策）

**选择方案：Taro Image 组件 + lazyLoad 属性 + 占位图**

结合NutUI的Image组件作为增强方案，提供更好的加载状态和错误处理。

### Rationale（选择理由）

1. **原生支持，零额外成本**
   - Taro Image组件内置懒加载
   - 小程序平台原生优化
   - 无需额外安装依赖

2. **性能优势明显**
   - 减少首屏加载时间
   - 节省用户流量
   - 降低内存占用

3. **NutUI Image增强用户体验**
   - 提供加载骨架屏
   - 统一的错误占位图
   - 圆角、fit模式等样式支持

### Alternatives Considered（其他方案及拒绝原因）

#### 方案A：自定义懒加载Hook
```tsx
// ❌ 不推荐：重复造轮子
const useLazyLoad = (src: string) => {
  const [loaded, setLoaded] = useState(false)
  const [visible, setVisible] = useState(false)
  // 使用 IntersectionObserver 监听...
}
```

**拒绝原因**：
- 小程序不支持 IntersectionObserver
- 需要自行处理兼容性
- 增加维护成本

#### 方案B：第三方懒加载库
```tsx
// ❌ 不推荐：不适配Taro生态
import LazyLoad from 'react-lazyload'
<LazyLoad height={200}>
  <img src={image} />
</LazyLoad>
```

**拒绝原因**：
- 为Web端设计，不适配小程序
- 打包体积增加
- 可能存在兼容性问题

### Code Example（推荐实现）

#### 方案1：基础懒加载（Taro原生）

```tsx
import { Image } from '@tarojs/components'

interface ProductImageProps {
  src: string
  alt: string
}

const ProductImage: React.FC<ProductImageProps> = ({ src, alt }) => {
  return (
    <Image
      src={src}
      mode="aspectFill"
      lazyLoad
      className="product-image"
      style={{ width: '750rpx', height: '750rpx' }}
    />
  )
}
```

#### 方案2：增强版（NutUI Image）

```tsx
import { Image } from '@nutui/nutui-react-taro'
import { ImageError } from '@nutui/icons-react-taro'

interface ProductImageProps {
  src: string
  alt: string
  onLoad?: () => void
  onError?: () => void
}

const ProductImage: React.FC<ProductImageProps> = ({
  src,
  alt,
  onLoad,
  onError
}) => {
  return (
    <Image
      src={src}
      width="375"
      height="375"
      fit="cover"
      lazy
      radius="8px"
      loading={
        <View className="image-loading">
          <Skeleton width="100%" height="100%" />
        </View>
      }
      error={
        <View className="image-error">
          <ImageError size={40} color="#ccc" />
          <Text>图片加载失败</Text>
        </View>
      }
      onLoad={onLoad}
      onError={onError}
    />
  )
}
```

### 图片尺寸优化建议

| 场景 | 推荐尺寸 | 说明 |
|------|---------|------|
| 商品列表缩略图 | 400x400px | 2倍图，适配大部分手机 |
| 商品详情大图 | 750x750px | 满屏显示 |
| Banner图 | 750x400px | 宽屏比例 |
| WebP格式 | - | 比JPEG小30-50%，优先使用 |

**图片优化策略**：

```typescript
// utils/image.ts
export const getOptimizedImageUrl = (
  url: string,
  width: number,
  height: number,
  quality: number = 80
): string => {
  // 假设使用七牛云/阿里云OSS
  return `${url}?imageView2/1/w/${width}/h/${height}/q/${quality}/format/webp`
}

// 使用
const optimizedUrl = getOptimizedImageUrl(product.image, 400, 400)
```

### 占位图和错误处理策略

```less
// styles/image.less
.product-image {
  background-color: #f5f5f5; // 占位背景色

  &-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, #f5f5f5 25%, #e5e5e5 50%, #f5f5f5 75%);
    animation: shimmer 1.5s infinite;
  }

  &-error {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    background-color: #f8f8f8;
    color: #999;
  }
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
```

---

## 3. 状态管理方案

### Decision（决策）

**MVP阶段：使用 React Context + useState，不引入Redux/Zustand**

后期如需要，可平滑迁移到Zustand（推荐）或Redux Toolkit。

### Rationale（选择理由）

1. **符合MVP原则**
   - 功能简单，状态管理需求不复杂
   - Context API 完全满足当前需求
   - 避免过早优化

2. **项目已有Context实践**
   - 现有代码已使用 `RegionContext` 和 `CartContext`
   - 团队熟悉，无学习成本
   - 代码风格统一

3. **性能足够**
   - 首页状态变化频率低
   - 不涉及复杂的状态派生计算
   - Context重渲染影响范围可控

### Alternatives Considered（其他方案及拒绝原因）

#### 方案A：Redux Toolkit
```tsx
// ❌ MVP阶段不推荐：过度设计
import { createSlice, configureStore } from '@reduxjs/toolkit'

const categorySlice = createSlice({
  name: 'category',
  initialState: { ... },
  reducers: { ... }
})
```

**拒绝原因**：
- 需要安装额外依赖（@reduxjs/toolkit, react-redux）
- 增加打包体积（~20KB gzipped）
- 需要配置store、编写slice、使用hooks
- MVP阶段过于复杂，维护成本高

**何时考虑Redux**：
- 状态共享范围超过3层组件嵌套
- 需要中间件（如redux-saga处理复杂异步）
- 需要时间旅行调试
- 团队已有Redux技术栈

#### 方案B：Zustand
```tsx
// ⚠️ 可选方案：适合后期升级
import create from 'zustand'

const useCategoryStore = create((set) => ({
  selectedCategory: null,
  setCategory: (cat) => set({ selectedCategory: cat })
}))
```

**暂不采用的原因**：
- MVP阶段Context已够用
- 增加新依赖（~3KB）
- 团队需要学习新API

**何时考虑Zustand**：
- Context性能出现瓶颈
- 需要更简洁的全局状态管理
- 不需要Redux的完整生态（中间件、DevTools等）

### Code Example（推荐实现）

#### CategoryContext 实现

```tsx
// contexts/CategoryContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react'
import Taro from '@tarojs/taro'

interface Category {
  id: string
  name: string
  parentId: string | null
  level: number
}

interface Product {
  id: string
  name: string
  price: number
  categoryId: string
  image: string
}

interface CategoryContextType {
  // 分类相关
  categories: Category[]
  selectedCategory: Category | null
  categoryPath: Category[] // 面包屑路径
  selectCategory: (category: Category) => void
  goBackToParent: () => void

  // 商品相关
  products: Product[]
  loading: boolean
  hasMore: boolean
  loadProducts: (categoryId: string, page?: number) => Promise<void>
  refreshProducts: () => Promise<void>
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined)

const STORAGE_KEY_CATEGORY = 'selected_category'
const STORAGE_KEY_PATH = 'category_path'

export const CategoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 分类状态
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [categoryPath, setCategoryPath] = useState<Category[]>([])

  // 商品状态
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)

  // 从本地存储恢复状态
  useEffect(() => {
    const savedCategory = Taro.getStorageSync(STORAGE_KEY_CATEGORY)
    const savedPath = Taro.getStorageSync(STORAGE_KEY_PATH)

    if (savedCategory) {
      setSelectedCategory(JSON.parse(savedCategory))
    }
    if (savedPath) {
      setCategoryPath(JSON.parse(savedPath))
    }
  }, [])

  // 选择分类
  const selectCategory = (category: Category): void => {
    setSelectedCategory(category)

    // 更新面包屑路径
    const newPath = [...categoryPath, category]
    setCategoryPath(newPath)

    // 保存到本地存储
    Taro.setStorageSync(STORAGE_KEY_CATEGORY, JSON.stringify(category))
    Taro.setStorageSync(STORAGE_KEY_PATH, JSON.stringify(newPath))

    // 加载商品
    loadProducts(category.id, 1)
  }

  // 返回上级分类
  const goBackToParent = (): void => {
    if (categoryPath.length <= 1) {
      // 已经是顶级，清空选择
      setSelectedCategory(null)
      setCategoryPath([])
      setProducts([])
      Taro.removeStorageSync(STORAGE_KEY_CATEGORY)
      Taro.removeStorageSync(STORAGE_KEY_PATH)
      return
    }

    // 返回上一级
    const newPath = categoryPath.slice(0, -1)
    const parentCategory = newPath[newPath.length - 1]

    setSelectedCategory(parentCategory)
    setCategoryPath(newPath)

    Taro.setStorageSync(STORAGE_KEY_CATEGORY, JSON.stringify(parentCategory))
    Taro.setStorageSync(STORAGE_KEY_PATH, JSON.stringify(newPath))

    loadProducts(parentCategory.id, 1)
  }

  // 加载商品列表
  const loadProducts = async (categoryId: string, page = 1): Promise<void> => {
    if (loading) return

    setLoading(true)
    try {
      const response = await fetch(`/api/products?categoryId=${categoryId}&page=${page}`)
      const data = await response.json()

      if (page === 1) {
        setProducts(data.products)
      } else {
        setProducts(prev => [...prev, ...data.products])
      }

      setHasMore(data.hasMore)
      setCurrentPage(page)
    } catch (error) {
      console.error('加载商品失败:', error)
      Taro.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  // 刷新商品列表
  const refreshProducts = async (): Promise<void> => {
    if (!selectedCategory) return
    await loadProducts(selectedCategory.id, 1)
  }

  return (
    <CategoryContext.Provider
      value={{
        categories,
        selectedCategory,
        categoryPath,
        selectCategory,
        goBackToParent,
        products,
        loading,
        hasMore,
        loadProducts,
        refreshProducts,
      }}
    >
      {children}
    </CategoryContext.Provider>
  )
}

export const useCategory = (): CategoryContextType => {
  const context = useContext(CategoryContext)
  if (!context) {
    throw new Error('useCategory must be used within CategoryProvider')
  }
  return context
}
```

#### 在组件中使用

```tsx
// pages/index/index.tsx
import { useCategory } from '../../contexts/CategoryContext'

const IndexPage: React.FC = () => {
  const {
    selectedCategory,
    categoryPath,
    products,
    loading,
    selectCategory,
    goBackToParent
  } = useCategory()

  return (
    <View className="index-page">
      {/* 面包屑导航 */}
      <Breadcrumb path={categoryPath} onBack={goBackToParent} />

      {/* 分类列表或商品列表 */}
      {selectedCategory ? (
        <ProductList products={products} loading={loading} />
      ) : (
        <CategoryGrid onSelect={selectCategory} />
      )}
    </View>
  )
}
```

### 性能优化建议

```tsx
// 使用 React.memo 避免不必要的重渲染
export const ProductCard = React.memo<ProductCardProps>(({ product }) => {
  return (
    <View className="product-card">
      <ProductImage src={product.image} alt={product.name} />
      <Text>{product.name}</Text>
      <Text className="price">¥{product.price}</Text>
    </View>
  )
})

// 使用 useMemo 缓存计算结果
const filteredProducts = useMemo(() => {
  return products.filter(p => p.categoryId === selectedCategory?.id)
}, [products, selectedCategory])

// 使用 useCallback 缓存回调函数
const handleProductClick = useCallback((productId: string) => {
  Taro.navigateTo({ url: `/pages/product/detail?id=${productId}` })
}, [])
```

---

## 4. 路由参数传递

### Decision（决策）

**选择方案：URL Query参数 + Taro Storage 组合方式**

- 简单参数（ID、页码等）使用URL query
- 复杂对象（分类路径、筛选条件等）使用Storage

### Rationale（选择理由）

1. **URL Query 适合简单参数**
   - 语义清晰，易于调试
   - 支持分享（带参数跳转）
   - 小程序原生支持

2. **Storage 适合复杂数据**
   - URL长度限制（微信小程序<2048字符）
   - 避免JSON序列化/反序列化的URL编码问题
   - 性能更好

3. **兼顾可维护性和可扩展性**
   - 简单场景代码简洁
   - 复杂场景有应对方案
   - 不依赖EventChannel（只适用于navigateTo）

### Alternatives Considered（其他方案及拒绝原因）

#### 方案A：全部使用URL Query
```tsx
// ❌ 不推荐：复杂参数会导致URL过长
Taro.navigateTo({
  url: `/pages/product/list?category=${JSON.stringify(category)}&path=${JSON.stringify(path)}`
})
```

**拒绝原因**：
- URL长度限制（微信小程序2048字符）
- JSON序列化后需要encodeURIComponent，可读性差
- 调试困难（URL过长）
- 不支持分享（URL太复杂）

#### 方案B：全部使用EventChannel
```tsx
// ⚠️ 局限性大：只支持navigateTo
Taro.navigateTo({
  url: '/pages/product/list',
  events: {
    acceptDataFromOpenedPage: (data) => { /* ... */ }
  },
  success: (res) => {
    res.eventChannel.emit('sendDataToOpenedPage', { category })
  }
})
```

**拒绝原因**：
- 只在navigateTo中可用，redirectTo/switchTab不支持
- 页面返回时数据会丢失
- 不支持分享链接
- 代码复杂，不直观

#### 方案C：全部使用Storage
```tsx
// ⚠️ 不推荐：滥用会导致维护困难
Taro.setStorageSync('product_id', id)
Taro.navigateTo({ url: '/pages/product/detail' })
```

**拒绝原因**：
- 简单参数用Storage反而繁琐
- 不易调试（看不到URL就知道参数）
- 需要手动清理，容易产生垃圾数据
- 不支持分享

### Code Example（推荐实现）

#### 场景1：简单参数 - 使用URL Query

```tsx
// 跳转到商品详情（单个ID）
const navigateToProductDetail = (productId: string): void => {
  Taro.navigateTo({
    url: `/pages/product/detail?id=${productId}`
  })
}

// 接收参数
import { getCurrentInstance } from '@tarojs/taro'

const ProductDetailPage: React.FC = () => {
  const $instance = getCurrentInstance()

  useEffect(() => {
    const { id } = $instance.router?.params || {}
    if (id) {
      loadProductDetail(id)
    }
  }, [])

  // ...
}
```

#### 场景2：复杂对象 - 使用Storage

```tsx
// 跳转到商品列表（包含复杂筛选条件）
interface CategoryFilter {
  categoryId: string
  categoryPath: Category[]
  priceRange?: [number, number]
  sortBy?: 'price' | 'sales' | 'new'
}

const navigateToProductList = (filter: CategoryFilter): void => {
  // 复杂对象存入Storage
  Taro.setStorageSync('product_list_filter', JSON.stringify(filter))

  // URL只传递必要的ID
  Taro.navigateTo({
    url: `/pages/product/list?categoryId=${filter.categoryId}`
  })
}

// 接收参数
const ProductListPage: React.FC = () => {
  const $instance = getCurrentInstance()
  const [filter, setFilter] = useState<CategoryFilter | null>(null)

  useEffect(() => {
    // 优先从Storage读取完整数据
    const savedFilter = Taro.getStorageSync('product_list_filter')
    if (savedFilter) {
      setFilter(JSON.parse(savedFilter))
      // 使用后清理
      Taro.removeStorageSync('product_list_filter')
      return
    }

    // 降级方案：从URL读取基础参数
    const { categoryId } = $instance.router?.params || {}
    if (categoryId) {
      setFilter({ categoryId, categoryPath: [] })
    }
  }, [])

  // ...
}
```

#### 场景3：组合方式 - 支持分享和深度链接

```tsx
// 商品列表页：支持直接打开（分享）和带筛选打开（应用内跳转）
const ProductListPage: React.FC = () => {
  const $instance = getCurrentInstance()
  const [filter, setFilter] = useState<CategoryFilter>({
    categoryId: '',
    categoryPath: [],
    priceRange: undefined,
    sortBy: undefined
  })

  useEffect(() => {
    initFilter()
  }, [])

  const initFilter = (): void => {
    // 1. 尝试从Storage读取完整筛选条件（应用内跳转）
    const savedFilter = Taro.getStorageSync('product_list_filter')
    if (savedFilter) {
      const parsed = JSON.parse(savedFilter)
      setFilter(parsed)
      Taro.removeStorageSync('product_list_filter') // 清理
      loadProducts(parsed)
      return
    }

    // 2. 从URL读取基础参数（分享链接）
    const { categoryId, sortBy } = $instance.router?.params || {}
    if (categoryId) {
      const basicFilter: CategoryFilter = {
        categoryId,
        categoryPath: [], // 需要从接口加载
        sortBy: sortBy as any || undefined
      }
      setFilter(basicFilter)
      loadProducts(basicFilter)

      // 异步加载完整分类路径
      loadCategoryPath(categoryId).then(path => {
        setFilter(prev => ({ ...prev, categoryPath: path }))
      })
    }
  }

  // ...
}
```

### 面包屑导航状态维护

#### 方案：使用CategoryContext + Storage持久化

```tsx
// 在CategoryContext中维护面包屑路径
interface CategoryContextType {
  categoryPath: Category[] // 当前面包屑路径
  selectCategory: (category: Category) => void // 进入下级
  goBackToParent: () => void // 返回上级
  resetPath: () => void // 重置路径
}

// 路径变化时自动保存
useEffect(() => {
  if (categoryPath.length > 0) {
    Taro.setStorageSync('category_path', JSON.stringify(categoryPath))
  } else {
    Taro.removeStorageSync('category_path')
  }
}, [categoryPath])

// 页面初始化时恢复
useEffect(() => {
  const savedPath = Taro.getStorageSync('category_path')
  if (savedPath) {
    setCategoryPath(JSON.parse(savedPath))
  }
}, [])
```

### 参数传递最佳实践总结

| 场景 | 方式 | 示例 |
|------|------|------|
| 单个ID | URL Query | `?id=123` |
| 2-3个简单参数 | URL Query | `?id=123&type=new` |
| 复杂对象（筛选条件） | Storage | `setStorageSync('filter', ...)` |
| 需要支持分享 | URL Query（基础）+ API加载（完整） | `?categoryId=123` |
| 返回时保留状态 | Context + Storage | 见面包屑示例 |

---

## 5. 多级分类数据结构

### Decision（决策）

**选择方案：扁平化结构 + 双向索引（parentId + childrenMap）**

后端返回扁平数组，前端构建索引Map实现高效查询。

### Rationale（选择理由）

1. **查询性能优异**
   - O(1)时间复杂度查找父分类
   - O(1)时间复杂度查找子分类列表
   - 避免递归遍历树形结构

2. **灵活性强**
   - 易于扩展（增加level、排序等字段）
   - 支持任意层级（不限于三级）
   - 便于缓存和增量更新

3. **网络传输高效**
   - JSON体积小（无嵌套冗余）
   - 易于分页加载
   - 减少序列化/反序列化开销

4. **维护成本低**
   - 代码逻辑简单明了
   - 易于单元测试
   - 便于调试

### Alternatives Considered（其他方案及拒绝原因）

#### 方案A：纯树形结构
```typescript
// ❌ 不推荐：查询性能差
interface CategoryTree {
  id: string
  name: string
  children: CategoryTree[]
}

// 查找某个分类下的所有子分类商品需要递归
function findAllProducts(category: CategoryTree): Product[] {
  let products = getProductsByCategory(category.id)
  category.children.forEach(child => {
    products = products.concat(findAllProducts(child)) // 递归
  })
  return products
}
```

**拒绝原因**：
- 查询子分类需要递归遍历，O(n)复杂度
- 查询父分类更困难（需要额外维护parent引用）
- 不易缓存（结构复杂）
- JSON传输冗余（children嵌套）

#### 方案B：纯扁平化结构（无索引）
```typescript
// ⚠️ 性能不佳：每次查询都需要filter
interface Category {
  id: string
  name: string
  parentId: string | null
}

const categories: Category[] = [...]

// 查找子分类
const children = categories.filter(c => c.parentId === parentId) // O(n)
```

**拒绝原因**：
- 每次查询子分类都需要遍历整个数组
- 频繁查询会导致性能问题
- 虽然实现简单，但不适合生产环境

### Code Example（推荐实现）

#### 数据结构定义

```typescript
// types/category.ts

/**
 * 分类实体（扁平化）
 */
export interface Category {
  id: string
  name: string
  parentId: string | null
  level: number // 层级：1=一级, 2=二级, 3=三级
  icon?: string
  sort: number
}

/**
 * 分类索引（用于高效查询）
 */
export interface CategoryIndex {
  // ID -> Category 映射
  byId: Map<string, Category>

  // parentId -> Category[] 映射
  childrenMap: Map<string, Category[]>

  // 根分类列表
  roots: Category[]
}

/**
 * 商品实体
 */
export interface Product {
  id: string
  name: string
  price: number
  image: string
  categoryId: string // 所属分类ID
  createTime: number
}
```

#### 后端API响应格式

```typescript
// API响应示例
interface CategoryListResponse {
  categories: Category[]
}

// GET /api/categories
{
  "categories": [
    { "id": "1", "name": "糯米专区", "parentId": null, "level": 1, "sort": 1 },
    { "id": "1-1", "name": "东北糯米", "parentId": "1", "level": 2, "sort": 1 },
    { "id": "1-1-1", "name": "五常糯米", "parentId": "1-1", "level": 3, "sort": 1 },
    { "id": "1-1-2", "name": "盘锦糯米", "parentId": "1-1", "level": 3, "sort": 2 },
    { "id": "1-2", "name": "南方糯米", "parentId": "1", "level": 2, "sort": 2 },
    { "id": "2", "name": "细米专区", "parentId": null, "level": 1, "sort": 2 },
    // ...
  ]
}
```

#### 索引构建工具函数

```typescript
// utils/categoryIndex.ts

/**
 * 构建分类索引
 */
export function buildCategoryIndex(categories: Category[]): CategoryIndex {
  const byId = new Map<string, Category>()
  const childrenMap = new Map<string, Category[]>()
  const roots: Category[] = []

  // 第一遍：构建ID索引
  categories.forEach(category => {
    byId.set(category.id, category)
  })

  // 第二遍：构建children索引和根节点
  categories.forEach(category => {
    if (category.parentId === null) {
      // 根节点
      roots.push(category)
    } else {
      // 子节点：添加到父节点的children列表
      if (!childrenMap.has(category.parentId)) {
        childrenMap.set(category.parentId, [])
      }
      childrenMap.get(category.parentId)!.push(category)
    }
  })

  // 排序：根据sort字段
  roots.sort((a, b) => a.sort - b.sort)
  childrenMap.forEach(children => {
    children.sort((a, b) => a.sort - b.sort)
  })

  return { byId, childrenMap, roots }
}

/**
 * 获取子分类列表
 */
export function getChildren(
  index: CategoryIndex,
  parentId: string
): Category[] {
  return index.childrenMap.get(parentId) || []
}

/**
 * 获取父分类
 */
export function getParent(
  index: CategoryIndex,
  categoryId: string
): Category | null {
  const category = index.byId.get(categoryId)
  if (!category || !category.parentId) return null
  return index.byId.get(category.parentId) || null
}

/**
 * 获取分类路径（面包屑）
 */
export function getCategoryPath(
  index: CategoryIndex,
  categoryId: string
): Category[] {
  const path: Category[] = []
  let current = index.byId.get(categoryId)

  while (current) {
    path.unshift(current) // 插入到开头
    if (!current.parentId) break
    current = index.byId.get(current.parentId)
  }

  return path
}

/**
 * 获取某分类下所有子分类ID（递归）
 */
export function getAllDescendantIds(
  index: CategoryIndex,
  categoryId: string
): string[] {
  const result: string[] = [categoryId]
  const children = getChildren(index, categoryId)

  children.forEach(child => {
    result.push(...getAllDescendantIds(index, child.id))
  })

  return result
}
```

#### 在Context中使用

```typescript
// contexts/CategoryContext.tsx
import { buildCategoryIndex, getCategoryPath, getAllDescendantIds } from '../utils/categoryIndex'

export const CategoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>([])
  const [categoryIndex, setCategoryIndex] = useState<CategoryIndex | null>(null)

  // 初始化：加载分类数据
  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async (): Promise<void> => {
    try {
      const response = await fetch('/api/categories')
      const data: CategoryListResponse = await response.json()

      setCategories(data.categories)

      // 构建索引
      const index = buildCategoryIndex(data.categories)
      setCategoryIndex(index)

      // 缓存到本地（可选）
      Taro.setStorageSync('category_cache', JSON.stringify(data.categories))
      Taro.setStorageSync('category_cache_time', Date.now())
    } catch (error) {
      console.error('加载分类失败:', error)
    }
  }

  // 查询某分类下的所有商品（包括子分类）
  const loadProductsByCategory = async (categoryId: string): Promise<void> => {
    if (!categoryIndex) return

    // 获取该分类及所有子分类ID
    const categoryIds = getAllDescendantIds(categoryIndex, categoryId)

    try {
      const response = await fetch(`/api/products?categoryIds=${categoryIds.join(',')}`)
      const data = await response.json()
      setProducts(data.products)
    } catch (error) {
      console.error('加载商品失败:', error)
    }
  }

  // ...
}
```

#### 组件中使用

```tsx
// components/CategoryBreadcrumb.tsx
import { getCategoryPath } from '../../utils/categoryIndex'

interface CategoryBreadcrumbProps {
  categoryId: string
  onNavigate: (categoryId: string) => void
}

const CategoryBreadcrumb: React.FC<CategoryBreadcrumbProps> = ({
  categoryId,
  onNavigate
}) => {
  const { categoryIndex } = useCategory()

  if (!categoryIndex) return null

  const path = getCategoryPath(categoryIndex, categoryId)

  return (
    <View className="breadcrumb">
      <Text onClick={() => onNavigate('')}>首页</Text>
      {path.map((category, index) => (
        <React.Fragment key={category.id}>
          <Text className="separator">/</Text>
          <Text
            className={index === path.length - 1 ? 'active' : ''}
            onClick={() => onNavigate(category.id)}
          >
            {category.name}
          </Text>
        </React.Fragment>
      ))}
    </View>
  )
}
```

### 缓存策略

```typescript
// utils/categoryCache.ts
const CACHE_KEY = 'category_cache'
const CACHE_TIME_KEY = 'category_cache_time'
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24小时

/**
 * 获取缓存的分类数据
 */
export function getCachedCategories(): Category[] | null {
  try {
    const cacheTime = Taro.getStorageSync(CACHE_TIME_KEY)
    if (!cacheTime || Date.now() - cacheTime > CACHE_DURATION) {
      // 缓存过期
      return null
    }

    const cached = Taro.getStorageSync(CACHE_KEY)
    return cached ? JSON.parse(cached) : null
  } catch {
    return null
  }
}

/**
 * 保存分类数据到缓存
 */
export function setCachedCategories(categories: Category[]): void {
  try {
    Taro.setStorageSync(CACHE_KEY, JSON.stringify(categories))
    Taro.setStorageSync(CACHE_TIME_KEY, Date.now())
  } catch (error) {
    console.error('保存缓存失败:', error)
  }
}

/**
 * 清除缓存
 */
export function clearCategoryCache(): void {
  Taro.removeStorageSync(CACHE_KEY)
  Taro.removeStorageSync(CACHE_TIME_KEY)
}
```

### 性能对比

| 操作 | 树形结构 | 扁平化无索引 | 扁平化+索引（推荐） |
|------|---------|------------|------------------|
| 查找子分类 | O(n) 递归 | O(n) filter | O(1) Map查找 |
| 查找父分类 | O(n) 遍历 | O(n) filter | O(1) Map查找 |
| 构建面包屑 | O(n²) | O(n²) | O(h) h=层级深度 |
| 内存占用 | 高（嵌套） | 低 | 中（额外Map） |
| 实现复杂度 | 高 | 低 | 中 |

---

## 总结与建议

### 技术选型总结

| 技术问题 | 推荐方案 | 关键原因 |
|---------|---------|---------|
| 滚动加载 | ScrollView + onScrollToLower | 数据量小，无需虚拟滚动 |
| 图片懒加载 | Taro Image lazyLoad + NutUI Image | 原生支持，用户体验好 |
| 状态管理 | Context + useState | MVP阶段够用，后期可升级 |
| 路由传递 | URL Query + Storage组合 | 灵活适配各种场景 |
| 数据结构 | 扁平化 + 索引 | 查询性能最优 |

### MVP实施路线图

#### Phase 1: 基础功能（1周）
- [x] ScrollView滚动加载
- [x] Taro Image懒加载
- [x] CategoryContext搭建
- [x] 扁平化数据结构

#### Phase 2: 用户体验优化（3-5天）
- [ ] NutUI Skeleton骨架屏
- [ ] 图片加载失败占位
- [ ] 下拉刷新
- [ ] 面包屑导航

#### Phase 3: 性能优化（2-3天）
- [ ] 图片CDN优化
- [ ] 分类数据缓存
- [ ] React.memo优化重渲染
- [ ] 分页加载优化

### 后期优化方向

1. **状态管理升级时机**：
   - 当状态共享超过3层组件嵌套
   - 当需要复杂的状态派生逻辑
   - 推荐：Zustand（轻量）> Redux Toolkit（生态）

2. **虚拟滚动引入时机**：
   - 商品列表超过100项
   - 用户反馈滚动卡顿
   - 推荐：Taro VirtualList

3. **数据结构演进**：
   - 当前方案已足够灵活
   - 未来可考虑IndexedDB（离线支持）
   - GraphQL（按需查询）

### 参考文档

- [Taro ScrollView文档](https://taro-docs.jd.com/docs/components/viewContainer/scroll-view)
- [Taro VirtualList文档](https://taro-docs.jd.com/docs/virtual-list)
- [NutUI Image组件](https://nutui.jd.com/h5/react/2x/#/zh-CN/component/image)
- [Taro路由文档](https://taro-docs.jd.com/docs/router)
- [React Context最佳实践](https://react.dev/reference/react/useContext)
