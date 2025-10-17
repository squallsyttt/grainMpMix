import React, { useCallback } from 'react'
import { View, Text } from '@tarojs/components'
import { Image } from '@nutui/nutui-react-taro'
import { ArrowRight } from '@nutui/icons-react-taro'
import Taro from '@tarojs/taro'
import { useCategories } from '../../hooks/useCategories'
import { getRootCategories, getChildrenCount } from '../../utils/categoryTree'
import { getFullImageUrl } from '../../utils/imageUrl'
import { HOME_DISPLAY_COUNT } from '../../constants/category'
import { CategoryTreeNode } from '../../types/category'
import './index.less'

/**
 * 分类卡片组件
 * 使用React.memo优化性能
 */
interface CategoryCardProps {
  category: CategoryTreeNode
  childrenCount: number
  onClick: (id: number, name: string) => void
}

const CategoryCard = React.memo<CategoryCardProps>(
  ({ category, childrenCount, onClick }) => {
    return (
      <View
        className="category-card"
        onClick={() => onClick(category.id, category.name)}
      >
        <View className="category-card__image-wrapper">
          <Image
            className="category-card__image"
            src={getFullImageUrl(category.image)}
            lazyLoad
          />
        </View>
        <View className="category-card__content">
          <Text className="category-card__name">{category.name}</Text>
          {childrenCount > 0 && (
            <Text className="category-card__count">{childrenCount} 个子分类</Text>
          )}
        </View>
      </View>
    )
  }
)

CategoryCard.displayName = 'CategoryCard'

/**
 * 首页商品分类组件
 */
const ProductCategories: React.FC = () => {
  const { tree, index, loading, error, refetch } = useCategories()

  /**
   * 点击分类卡片
   */
  const handleCategoryClick = useCallback((id: number, name: string): void => {
    Taro.navigateTo({
      url: `/pages/product-list/index?categoryId=${id}&name=${encodeURIComponent(name)}`
    })
  }, [])

  /**
   * 点击"查看更多"
   */
  const handleViewMore = useCallback((): void => {
    Taro.navigateTo({
      url: '/pages/category-nav/index'
    })
  }, [])

  /**
   * 加载状态
   */
  if (loading) {
    return (
      <View className="product-categories">
        <View className="category-header">
          <View className="category-header__left">
            <Text className="category-header__title">产品分类</Text>
            <View className="category-header__decoration" />
          </View>
        </View>
        <View className="category-loading">加载中...</View>
      </View>
    )
  }

  /**
   * 错误状态
   */
  if (error) {
    return (
      <View className="product-categories">
        <View className="category-header">
          <View className="category-header__left">
            <Text className="category-header__title">产品分类</Text>
            <View className="category-header__decoration" />
          </View>
        </View>
        <View className="category-error">
          <Text className="category-error__text">{error}</Text>
          <View className="category-error__retry" onClick={refetch}>
            重试
          </View>
        </View>
      </View>
    )
  }

  /**
   * 空状态
   */
  if (!index || tree.length === 0) {
    return (
      <View className="product-categories">
        <View className="category-header">
          <View className="category-header__left">
            <Text className="category-header__title">产品分类</Text>
            <View className="category-header__decoration" />
          </View>
        </View>
        <View className="category-empty">暂无分类数据</View>
      </View>
    )
  }

  // 获取根分类列表 (一级分类)
  const rootCategories = getRootCategories(index)

  // 只显示前6个分类
  const displayCategories = rootCategories.slice(0, HOME_DISPLAY_COUNT)

  // 是否显示"查看更多"
  const hasMore = rootCategories.length > HOME_DISPLAY_COUNT

  return (
    <View className="product-categories">
      {/* 标题栏：标题 + 查看更多 */}
      <View className="category-header">
        <View className="category-header__left">
          <Text className="category-header__title">产品分类</Text>
          <View className="category-header__decoration" />
        </View>

        {hasMore && (
          <View className="category-header__more" onClick={handleViewMore}>
            <Text className="category-header__more-text">查看更多</Text>
            <ArrowRight size={14} className="category-header__more-icon" />
          </View>
        )}
      </View>

      <View className="category-grid">
        {displayCategories.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            childrenCount={getChildrenCount(category.id, index)}
            onClick={handleCategoryClick}
          />
        ))}
      </View>
    </View>
  )
}

export default ProductCategories
