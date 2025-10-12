import React from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import { Empty, Loading } from '@nutui/nutui-react-taro'
import { Product } from '../../types/product'
import ProductCard from '../ProductCard'
import ProductCardSkeleton from '../ProductCardSkeleton'
import './index.less'

/**
 * ProductList 组件属性
 */
export interface ProductListProps {
  /** 商品列表 */
  products: Product[]
  /** 加载状态 */
  loading?: boolean
  /** 布局模式：grid(网格) | list(列表) */
  layout?: 'grid' | 'list'
  /** 网格列数（仅在 grid 模式下生效） */
  columns?: 2 | 3 | 4
  /** 是否显示标签 */
  showTags?: boolean
  /** 是否显示评分 */
  showRating?: boolean
  /** 空状态文案 */
  emptyText?: string
  /** 空状态描述 */
  emptyDescription?: string
  /** 自定义类名 */
  className?: string
  /** 商品点击回调 */
  onProductClick?: (product: Product) => void
  /** 滚动到底部回调（用于加载更多） */
  onScrollToLower?: () => void
  /** 下拉刷新回调 */
  onRefresh?: () => void
}

/**
 * 商品列表组件
 * 支持网格和列表两种布局模式，支持加载更多和下拉刷新
 */
const ProductList: React.FC<ProductListProps> = ({
  products,
  loading = false,
  layout = 'grid',
  columns = 2,
  showTags = true,
  showRating = true,
  emptyText = '暂无商品',
  emptyDescription = '换个条件试试吧',
  className = '',
  onProductClick,
  onScrollToLower,
  onRefresh,
}) => {
  /**
   * 渲染加载状态
   */
  const renderLoading = (): React.ReactElement => {
    return (
      <View className={layout === 'grid' ? 'product-list__grid product-list__grid--2-columns' : 'product-list__list'}>
        <ProductCardSkeleton
          count={columns === 2 ? 6 : columns === 3 ? 9 : 8}
          mode={layout === 'grid' ? 'vertical' : 'horizontal'}
        />
      </View>
    )
  }

  /**
   * 渲染空状态
   */
  const renderEmpty = (): React.ReactElement => {
    return (
      <View className="product-list__empty">
        <Empty description={emptyText} imageSize={120}>
          {emptyDescription && (
            <Text className="product-list__empty-desc">{emptyDescription}</Text>
          )}
        </Empty>
      </View>
    )
  }

  /**
   * 渲染网格布局
   */
  const renderGrid = (): React.ReactElement => {
    const gridClass = `product-list__grid product-list__grid--${columns}-columns`

    return (
      <View className={gridClass}>
        {products.map((product) => (
          <View key={product.id} className="product-list__grid-item">
            <ProductCard
              product={product}
              mode="vertical"
              showTags={showTags}
              showRating={showRating}
              onClick={onProductClick}
            />
          </View>
        ))}
      </View>
    )
  }

  /**
   * 渲染列表布局
   */
  const renderList = (): React.ReactElement => {
    return (
      <View className="product-list__list">
        {products.map((product) => (
          <View key={product.id} className="product-list__list-item">
            <ProductCard
              product={product}
              mode="horizontal"
              showTags={showTags}
              showRating={showRating}
              onClick={onProductClick}
            />
          </View>
        ))}
      </View>
    )
  }

  /**
   * 处理滚动到底部
   */
  const handleScrollToLower = (): void => {
    if (onScrollToLower && !loading) {
      onScrollToLower()
    }
  }

  /**
   * 处理下拉刷新
   */
  const handleRefresh = (): void => {
    if (onRefresh && !loading) {
      onRefresh()
    }
  }

  return (
    <View className={`product-list ${className}`}>
      {/* 加载状态 */}
      {loading && products.length === 0 && renderLoading()}

      {/* 空状态 */}
      {!loading && products.length === 0 && renderEmpty()}

      {/* 商品列表 */}
      {products.length > 0 && (
        <ScrollView
          className="product-list__scroll"
          scrollY
          lowerThreshold={100}
          onScrollToLower={handleScrollToLower}
          enableBackToTop
        >
          {layout === 'grid' ? renderGrid() : renderList()}

          {/* 加载更多状态 */}
          {loading && products.length > 0 && (
            <View className="product-list__load-more">
              <Loading type="spinner" size={16} />
              <Text className="product-list__load-more-text">加载更多...</Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  )
}

export default ProductList
