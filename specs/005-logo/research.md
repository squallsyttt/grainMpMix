# 研究文档: 商家列表与商家详情

**功能**: 商家列表与商家详情
**分支**: 005-logo
**日期**: 2025-10-14

本文档记录商家列表功能实现前的技术调研结果,解决实现计划中标记的所有未知问题。

---

## 1. 商家Logo图片处理策略

### 1.1 默认占位图生成方案

**决策**: 使用CSS纯色背景 + 文字首字母方案(不使用Canvas)

**理由**:
- 小程序环境Canvas API限制较多,需要异步操作
- CSS方案更简单、性能更好、可维护性高
- 首字母占位图视觉效果已足够满足需求

**实现方案**:

```tsx
// src/components/MerchantLogo/index.tsx
import React, { useState } from 'react'
import { View, Text } from '@tarojs/components'
import { Image } from '@nutui/nutui-react-taro'
import './index.less'

interface MerchantLogoProps {
  src?: string
  name: string
  size?: number
  onClick?: () => void
}

const MerchantLogo: React.FC<MerchantLogoProps> = ({
  src,
  name,
  size = 80,
  onClick
}) => {
  const [imageError, setImageError] = useState(false)

  // 获取商家名称首字母
  const getInitial = (name: string): string => {
    return name.charAt(0).toUpperCase()
  }

  // 根据名称生成背景色(确保同名商家颜色一致)
  const getBackgroundColor = (name: string): string => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
      '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'
    ]
    const index = name.charCodeAt(0) % colors.length
    return colors[index]
  }

  const showFallback = !src || imageError

  return (
    <View
      className="merchant-logo"
      style={{ width: `${size}px`, height: `${size}px` }}
      onClick={onClick}
    >
      {showFallback ? (
        <View
          className="merchant-logo__fallback"
          style={{
            backgroundColor: getBackgroundColor(name),
            width: `${size}px`,
            height: `${size}px`
          }}
        >
          <Text className="merchant-logo__initial">
            {getInitial(name)}
          </Text>
        </View>
      ) : (
        <Image
          className="merchant-logo__image"
          src={src}
          width={size}
          height={size}
          radius={8}
          lazyLoad
          onError={() => setImageError(true)}
        />
      )}
    </View>
  )
}

export default MerchantLogo
```

```less
// src/components/MerchantLogo/index.less
.merchant-logo {
  display: inline-block;
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

  &__fallback {
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
  }

  &__initial {
    color: #fff;
    font-size: 32px;
    font-weight: 600;
    text-align: center;
  }

  &__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}
```

### 1.2 CSS固定宽高比容器方案

**决策**: 使用现代CSS `aspect-ratio` 属性,降级使用 `padding-top` hack

**理由**:
- `aspect-ratio` 是现代标准,代码简洁
- 微信小程序基础库 >= 2.9.0 已支持
- padding-top hack 作为fallback确保兼容性

**实现方案**:

```less
.merchant-card {
  &__logo-container {
    width: 100%;
    aspect-ratio: 1 / 1; // 现代浏览器

    // fallback for older browsers
    @supports not (aspect-ratio: 1 / 1) {
      padding-top: 100%; // 1:1 ratio
      position: relative;

      .merchant-card__logo {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
      }
    }
  }
}
```

### 1.3 图片裁剪策略

**决策**: 使用 `object-fit: cover` + 固定宽高容器

**理由**:
- `cover` 保证容器填满,同时保持图片比例
- 极端比例图片会被裁剪中心区域,视觉效果最佳
- 配合 `border-radius` 实现统一圆角效果

**CSS实现**:

```less
.merchant-logo__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  border-radius: 8px;
}
```

**可选方案对比**:

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| `object-fit: cover` | 填满容器,视觉统一 | 极端比例会裁剪 | ✅ 推荐(商家Logo) |
| `object-fit: contain` | 显示完整图片 | 留白,视觉不统一 | 产品图(需要完整展示) |
| `object-fit: fill` | 填满容器 | 拉伸变形 | ❌ 不推荐 |

---

## 2. 区域过滤实现方案

### 2.1 RegionContext扩展

**当前RegionContext实现**:

```tsx
// src/contexts/RegionContext.tsx (现有代码)
export interface RegionContextType {
  province: string
  city: string
  showSelector: boolean
  openSelector: () => void
  closeSelector: () => void
  setRegion: (province: string, city: string) => void
}
```

**决策**: 不需要扩展RegionContext,直接使用现有的 `province` 和 `city`

**理由**:
- 现有Context已提供province和city信息
- API请求时直接读取Context值传递给后端
- 保持Context职责单一(只管理区域选择状态)

### 2.2 API区域参数传递

**决策**: 使用 `city` 参数(优先)+ `province` 参数(fallback)

**API参数设计**:

```typescript
interface GetMerchantListParams {
  province?: string  // 省份名称,如"黑龙江省"
  city?: string      // 城市名称,如"哈尔滨市"
  page?: number      // 页码,默认1
  limit?: number     // 每页数量,默认20
}
```

**使用示例**:

```tsx
import { useRegion } from '../../contexts/RegionContext'
import { getMerchantList } from '../../services/merchant'

const MerchantList = () => {
  const { province, city } = useRegion()

  const loadMerchants = async () => {
    const params: GetMerchantListParams = {
      city: city || undefined,      // 优先使用city
      province: province || undefined, // city为空时使用province
      page: 1,
      limit: 20
    }
    const response = await getMerchantList(params)
    // ...
  }
}
```

### 2.3 区域为空的fallback策略

**决策**: 三级fallback策略

1. **优先使用city**: 用户已选择具体城市
2. **fallback到province**: 用户只选择了省份
3. **最终fallback**: 显示空状态提示用户选择区域

**实现示例**:

```tsx
const MerchantListPage = () => {
  const { province, city, openSelector } = useRegion()

  useEffect(() => {
    if (!province && !city) {
      // 未选择区域,不加载数据
      return
    }
    loadMerchants()
  }, [province, city])

  if (!province && !city) {
    return (
      <Empty
        status="empty"
        description="请先选择您所在的地区"
        actions={[
          {
            text: '选择地区',
            type: 'primary',
            onClick: openSelector
          }
        ]}
      />
    )
  }

  // 正常渲染商家列表
}
```

---

## 3. 分页与懒加载最佳实践

### 3.1 无限滚动实现方案

**决策**: 使用NutUI `InfiniteLoading` 组件

**理由**:
- NutUI 2.3.10 提供完整的InfiniteLoading组件
- 内置下拉刷新和上拉加载功能
- 自动处理滚动事件监听和阈值判断

**完整实现**:

```tsx
import React, { useState, useEffect } from 'react'
import { View } from '@tarojs/components'
import { InfiniteLoading, Skeleton, Empty } from '@nutui/nutui-react-taro'
import { getMerchantList } from '../../services/merchant'

const MerchantListPage = () => {
  const [loading, setLoading] = useState(true)
  const [merchants, setMerchants] = useState([])
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)

  useEffect(() => {
    loadMerchants(1)
  }, [])

  const loadMerchants = async (pageNum: number) => {
    if (pageNum === 1) setLoading(true)

    try {
      const response = await getMerchantList({
        page: pageNum,
        limit: 20
      })

      const newData = response.data.data

      if (pageNum === 1) {
        setMerchants(newData)
        setLoading(false)
      } else {
        setMerchants([...merchants, ...newData])
      }

      setHasMore(newData.length === 20) // 如果返回数量 < 20,说明没有更多了
      setPage(pageNum)
    } catch (error) {
      setLoading(false)
      setHasMore(false)
    }
  }

  const handleLoadMore = async (): Promise<void> => {
    await loadMerchants(page + 1)
  }

  const handleRefresh = async (): Promise<void> => {
    setPage(1)
    setHasMore(true)
    await loadMerchants(1)
  }

  return (
    <View className="merchant-list-page">
      {loading ? (
        <Skeleton rows={2} avatar avatarSize="80px" animated />
      ) : merchants.length === 0 ? (
        <Empty description="暂无商家" />
      ) : (
        <InfiniteLoading
          hasMore={hasMore}
          threshold={200}
          pullRefresh
          loadingText="加载中..."
          loadMoreText="没有更多了"
          pullingText="松手刷新"
          onLoadMore={handleLoadMore}
          onRefresh={handleRefresh}
        >
          {merchants.map(merchant => (
            <MerchantCard key={merchant.id} data={merchant} />
          ))}
        </InfiniteLoading>
      )}
    </View>
  )
}
```

### 3.2 图片懒加载配置

**决策**: 使用NutUI `Image` 组件的 `lazyLoad` 属性

**配置参数**:

```tsx
<Image
  src={merchant.logo}
  width={80}
  height={80}
  radius={8}
  lazyLoad={true}        // 开启懒加载
  loading={<LoadingPlaceholder />}  // 加载中占位
  error={<ErrorPlaceholder />}      // 加载失败占位
/>
```

**懒加载触发时机**: 图片进入视口上下三屏范围时开始加载

**Placeholder处理**:

```tsx
// 加载中占位 - 使用CSS渐变动画
const LoadingPlaceholder = () => (
  <View className="image-loading">
    <View className="loading-shimmer" />
  </View>
)

// 加载失败占位 - 显示默认图标
const ErrorPlaceholder = () => (
  <View className="image-error">
    <Text className="error-text">加载失败</Text>
  </View>
)
```

```less
.image-loading {
  width: 100%;
  height: 100%;
  background: #f5f5f5;
  overflow: hidden;

  .loading-shimmer {
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.3) 50%,
      rgba(255, 255, 255, 0) 100%
    );
    animation: shimmer 1.5s infinite;
  }
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
```

### 3.3 分页参数命名约定

**决策**: 使用 `page` + `limit` 命名

**理由**:
- 现有项目store.ts已使用 `page` + `limit`
- FastAdmin后端使用相同命名规范
- 保持项目内一致性

**标准参数**:

```typescript
interface PaginationParams {
  page: number   // 页码,从1开始
  limit: number  // 每页数量,默认20
}
```

---

## 4. 商家-产品关联展示逻辑

### 4.1 商家详情页产品展示方案

**决策**: 新增API接口 `GET /api/merchant/:id/products`,返回该商家已上架的平台产品

**数据流设计**:

```
[用户] -> 点击商家卡片
  -> [商家详情页]
    -> 调用 GET /api/merchant/:id
    -> 调用 GET /api/merchant/:id/products?region_id=xxx
  -> 展示商家基本信息 + 已上架产品列表
```

**API响应结构**:

```typescript
// GET /api/merchant/:id/products
interface MerchantProductsResponse {
  code: number
  msg: string
  data: {
    products: Array<{
      category_id: number       // 产品分类ID
      category_name: string     // 产品分类名称,如"大米"
      category_image: string    // 产品分类图片
      price: number            // 当前区域价格
      price_unit: string       // 价格单位,如"元/斤"
      is_available: boolean    // 是否有货
    }>
  }
}
```

### 4.2 产品列表组件复用

**决策**: 创建新的 `MerchantProductList` 组件,不复用ProductCard

**理由**:
- 商家详情页展示的是"商家支持的品类",而非具体商品
- 数据结构不同:产品分类 vs 具体商品SPU
- UI需求不同:简化卡片 vs 完整商品卡片

**组件设计**:

```tsx
// src/components/MerchantProductList/index.tsx
import React from 'react'
import { View, Text } from '@tarojs/components'
import { Image, Tag } from '@nutui/nutui-react-taro'
import './index.less'

interface ProductCategory {
  category_id: number
  category_name: string
  category_image: string
  price: number
  price_unit: string
  is_available: boolean
}

interface MerchantProductListProps {
  products: ProductCategory[]
}

const MerchantProductList: React.FC<MerchantProductListProps> = ({
  products
}) => {
  if (products.length === 0) {
    return (
      <View className="product-list-empty">
        <Text className="empty-text">该商家暂未上架产品</Text>
      </View>
    )
  }

  return (
    <View className="merchant-product-list">
      <View className="product-list-title">供应产品</View>
      <View className="product-list-items">
        {products.map(product => (
          <View key={product.category_id} className="product-item">
            <Image
              className="product-image"
              src={product.category_image}
              width={60}
              height={60}
              radius={8}
            />
            <View className="product-info">
              <Text className="product-name">{product.category_name}</Text>
              <View className="product-price">
                <Text className="price-value">¥{product.price}</Text>
                <Text className="price-unit">/{product.price_unit}</Text>
              </View>
            </View>
            {!product.is_available && (
              <Tag type="warning" size="small">暂无库存</Tag>
            )}
          </View>
        ))}
      </View>
    </View>
  )
}

export default MerchantProductList
```

### 4.3 区域定价数据结构

**决策**: 区域定价由后端根据用户区域返回,前端不存储完整价格表

**数据模型**:

```typescript
// src/types/regional-pricing.ts

/**
 * 区域定价信息
 * 注意:前端只接收当前用户区域的价格,不存储全量价格表
 */
export interface RegionalPrice {
  /** 产品分类ID */
  category_id: number
  /** 产品分类名称 */
  category_name: string
  /** 当前区域价格 */
  price: number
  /** 价格单位 */
  price_unit: string
  /** 区域ID(用于缓存key) */
  region_id: number
  /** 区域名称 */
  region_name: string
}

/**
 * 区域定价查询参数
 */
export interface GetRegionalPriceParams {
  /** 产品分类ID列表 */
  category_ids: number[]
  /** 区域ID(从RegionContext获取) */
  region_id: number
}
```

**查询方式**:

```tsx
// 商家详情页加载流程
const MerchantDetailPage = () => {
  const { city, province } = useRegion()
  const [products, setProducts] = useState([])

  useEffect(() => {
    loadMerchantProducts()
  }, [])

  const loadMerchantProducts = async () => {
    // API会根据region_id返回对应区域的价格
    const response = await getMerchantProducts(merchantId, {
      city,
      province
    })
    setProducts(response.data.products)
  }
}
```

---

## 5. 性能优化策略

### 5.1 React.memo使用场景

**决策**: 为 `MerchantCard` 和 `MerchantLogo` 组件使用 `React.memo`

**理由**:
- 列表项组件,会被大量渲染
- Props更新频率低(仅在数据加载时更新)
- 避免父组件状态变化导致所有卡片重渲染

**实现示例**:

```tsx
import React, { memo } from 'react'

interface MerchantCardProps {
  id: number
  name: string
  logo: string
  address: string
  onClick?: (id: number) => void
}

const MerchantCard: React.FC<MerchantCardProps> = memo(({
  id,
  name,
  logo,
  address,
  onClick
}) => {
  return (
    <View className="merchant-card" onClick={() => onClick?.(id)}>
      {/* ... */}
    </View>
  )
}, (prevProps, nextProps) => {
  // 自定义比较函数:只比较关键props
  return (
    prevProps.id === nextProps.id &&
    prevProps.name === nextProps.name &&
    prevProps.logo === nextProps.logo
  )
})

export default MerchantCard
```

### 5.2 useCallback依赖项管理

**决策**: 为事件处理器使用 `useCallback`,依赖项包含所有闭包引用的变量

**正确示例**:

```tsx
const MerchantListPage = () => {
  const [merchants, setMerchants] = useState([])
  const [page, setPage] = useState(1)

  // ✅ 正确:依赖项包含page和merchants
  const handleLoadMore = useCallback(async (): Promise<void> => {
    const newPage = page + 1
    const response = await getMerchantList({ page: newPage })
    setMerchants([...merchants, ...response.data.data])
    setPage(newPage)
  }, [page, merchants])

  // ✅ 正确:使用函数式更新,无需依赖
  const handleLoadMoreOptimized = useCallback(async (): Promise<void> => {
    setPage(prev => prev + 1)
    const response = await getMerchantList({ page: page + 1 })
    setMerchants(prev => [...prev, ...response.data.data])
  }, []) // 空依赖项
}
```

**错误示例**:

```tsx
// ❌ 错误:缺少依赖项page和merchants
const handleLoadMore = useCallback(async (): Promise<void> => {
  const newPage = page + 1 // 闭包引用page
  setMerchants([...merchants, ...newData]) // 闭包引用merchants
  setPage(newPage)
}, []) // ⚠️ ESLint会警告
```

### 5.3 骨架屏实现方案

**决策**: 使用NutUI `Skeleton` 组件

**配置**:

```tsx
import { Skeleton } from '@nutui/nutui-react-taro'

// 商家卡片骨架屏
<Skeleton
  rows={2}              // 显示2行文本占位
  avatar                // 显示头像占位
  avatarSize="80px"     // 头像大小
  avatarShape="square"  // 方形头像(商家logo)
  animated              // 开启动画效果
/>
```

**完整使用模式**:

```tsx
const MerchantListPage = () => {
  const [loading, setLoading] = useState(true)
  const [merchants, setMerchants] = useState([])

  return (
    <View>
      {loading ? (
        // 首次加载显示3个骨架屏
        <>
          <Skeleton rows={2} avatar avatarSize="80px" animated />
          <Skeleton rows={2} avatar avatarSize="80px" animated />
          <Skeleton rows={2} avatar avatarSize="80px" animated />
        </>
      ) : (
        // 加载完成显示真实数据
        <InfiniteLoading /* ... */>
          {merchants.map(merchant => (
            <MerchantCard key={merchant.id} data={merchant} />
          ))}
        </InfiniteLoading>
      )}
    </View>
  )
}
```

---

## 6. 补充决策

### 6.1 常量定义

将魔术数字提取为常量:

```typescript
// src/utils/constants.ts
export const MERCHANT_CONSTANTS = {
  // 分页相关
  DEFAULT_PAGE_SIZE: 20,
  INFINITE_SCROLL_THRESHOLD: 200, // 距离底部200px时触发加载

  // Logo相关
  DEFAULT_LOGO_SIZE: 80,
  FALLBACK_COLORS: [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
    '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'
  ],

  // 性能相关
  SKELETON_COUNT: 3, // 首次加载显示3个骨架屏
  IMAGE_LAZY_LOAD_THRESHOLD: 3 // 图片懒加载阈值(上下3屏)
} as const
```

### 6.2 错误处理规范

所有API调用必须包含错误处理:

```tsx
const loadMerchants = async () => {
  try {
    setLoading(true)
    const response = await getMerchantList(params)
    setMerchants(response.data.data)
  } catch (error) {
    console.error('[MerchantList] 加载商家列表失败:', error)
    Taro.showToast({
      title: '加载失败,请重试',
      icon: 'none',
      duration: 2000
    })
  } finally {
    setLoading(false)
  }
}
```

---

## 总结

### 所有待研究问题已解决 ✅

| 问题 | 决策 | 实现方式 |
|------|------|---------|
| 默认占位图生成 | CSS + 首字母 | 纯CSS方案,根据名称生成颜色 |
| 固定宽高比容器 | aspect-ratio | 现代CSS属性 + padding fallback |
| 图片裁剪策略 | object-fit: cover | 居中裁剪,保持比例 |
| 区域过滤 | RegionContext直接使用 | city优先,province fallback |
| 无限滚动 | NutUI InfiniteLoading | 内置组件,支持下拉刷新 |
| 图片懒加载 | NutUI Image lazyLoad | 上下三屏触发加载 |
| 分页参数 | page + limit | 与现有API保持一致 |
| 产品展示 | 独立组件 | MerchantProductList |
| React.memo | 列表组件优化 | MerchantCard, MerchantLogo |
| useCallback | 函数式更新 | 减少依赖项 |
| 骨架屏 | NutUI Skeleton | avatar + rows配置 |

### 技术栈确认

- ✅ NutUI InfiniteLoading 组件可用
- ✅ NutUI Skeleton 组件可用
- ✅ NutUI Empty 组件可用
- ✅ NutUI Image 支持懒加载
- ✅ RegionContext 可直接复用
- ✅ 所有方案符合项目宪法要求

### 下一步

进入 **Phase 1: Design & Contracts**,生成:
1. data-model.md (数据模型)
2. contracts/merchant.yaml (API合约)
3. quickstart.md (快速开始指南)
