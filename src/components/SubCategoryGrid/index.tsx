import React, { useState } from 'react'
import { View, Text } from '@tarojs/components'
import { Image } from '@nutui/nutui-react-taro'
import { ArrowDown, ArrowUp } from '@nutui/icons-react-taro'
import Taro from '@tarojs/taro'
import { CategoryTreeNode } from '../../types/category'
import { getFullImageUrl } from '../../utils/imageUrl'
import './index.less'

/**
 * 子分类网格组件Props
 */
interface SubCategoryGridProps {
  /** 子分类列表 */
  categories: CategoryTreeNode[]
  /** 当前分类信息 */
  currentCategory?: CategoryTreeNode
  /** 默认显示数量(超出可展开) */
  defaultShowCount?: number
  /** 是否显示"全部"选项 */
  showAllOption?: boolean
}

/**
 * 子分类网格组件 - 紧凑标签式
 * 横向排列展示子分类，支持展开/折叠
 */
const SubCategoryGrid: React.FC<SubCategoryGridProps> = ({
  categories,
  currentCategory,
  defaultShowCount = 12,
  showAllOption = true
}) => {
  const [isExpanded, setIsExpanded] = useState(false)

  // 是否需要展开按钮
  const needsExpand = categories.length > defaultShowCount

  // 实际显示的分类列表
  const displayCategories = needsExpand && !isExpanded
    ? categories.slice(0, defaultShowCount)
    : categories

  /**
   * 点击当前分类信息卡 - 滚动到顶部
   */
  const handleCurrentCategoryClick = (): void => {
    Taro.pageScrollTo({
      scrollTop: 0,
      duration: 300
    })
  }

  /**
   * 点击子分类
   */
  const handleCategoryClick = (category: CategoryTreeNode): void => {
    Taro.navigateTo({
      url: `/pages/product-list/index?categoryId=${category.id}&name=${encodeURIComponent(category.name)}`
    })
  }

  /**
   * 切换展开/折叠
   */
  const handleToggleExpand = (): void => {
    setIsExpanded(!isExpanded)
  }

  // 如果没有子分类，不渲染
  if (categories.length === 0 && !showAllOption) {
    return null
  }

  return (
    <View className="sub-category-grid">
      {/* 当前分类卡片 - 大号醒目 */}
      {currentCategory && (
        <View
          className="sub-category-grid__current-card"
          onClick={handleCurrentCategoryClick}
        >
          <View className="sub-category-grid__current-card-image-wrapper">
            <Image
              className="sub-category-grid__current-card-image"
              src={getFullImageUrl(currentCategory.image)}
              lazyLoad
            />
          </View>
          <View className="sub-category-grid__current-card-info">
            <View className="sub-category-grid__current-card-header">
              <Text className="sub-category-grid__current-card-name">
                {currentCategory.name}
              </Text>
              <Text className="sub-category-grid__current-card-badge">当前分类</Text>
            </View>
            <Text className="sub-category-grid__current-card-desc">
              包含 {categories.length} 个子分类
            </Text>
          </View>
        </View>
      )}

      {/* 子分类列表 - 小标签密集排列 */}
      {categories.length > 0 && (
        <View className="sub-category-grid__children">
          <View className="sub-category-grid__children-header">
            <Text className="sub-category-grid__children-title">下级分类</Text>
            <Text className="sub-category-grid__children-count">{categories.length}个</Text>
          </View>

          <View className="sub-category-grid__children-list">
            {displayCategories.map((category) => (
              <View
                key={category.id}
                className="sub-category-grid__child-item"
                onClick={() => handleCategoryClick(category)}
              >
                <View className="sub-category-grid__child-item-image-wrapper">
                  <Image
                    className="sub-category-grid__child-item-image"
                    src={getFullImageUrl(category.image)}
                    lazyLoad
                  />
                </View>
                <Text className="sub-category-grid__child-item-name">{category.name}</Text>
                {category.childlist && category.childlist.length > 0 && (
                  <Text className="sub-category-grid__child-item-count">
                    ({category.childlist.length})
                  </Text>
                )}
              </View>
            ))}
          </View>

          {/* 展开/折叠按钮 */}
          {needsExpand && (
            <View
              className="sub-category-grid__expand"
              onClick={handleToggleExpand}
            >
              <Text className="sub-category-grid__expand-text">
                {isExpanded ? '收起' : `展开全部${categories.length}个`}
              </Text>
              {isExpanded ? (
                <ArrowUp size={12} color="#666" />
              ) : (
                <ArrowDown size={12} color="#666" />
              )}
            </View>
          )}
        </View>
      )}
    </View>
  )
}

export default SubCategoryGrid
