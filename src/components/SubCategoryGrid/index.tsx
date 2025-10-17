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
  /** 默认显示数量(超出可展开) */
  defaultShowCount?: number
  /** 是否显示"全部"选项 */
  showAllOption?: boolean
  /** 当前选中的分类ID */
  currentCategoryId?: number
}

/**
 * 子分类网格组件
 * 网格布局展示子分类，支持展开/折叠
 */
const SubCategoryGrid: React.FC<SubCategoryGridProps> = ({
  categories,
  defaultShowCount = 6,
  showAllOption = true,
  currentCategoryId
}) => {
  const [isExpanded, setIsExpanded] = useState(false)

  // 是否需要展开按钮
  const needsExpand = categories.length > defaultShowCount

  // 实际显示的分类列表
  const displayCategories = needsExpand && !isExpanded
    ? categories.slice(0, defaultShowCount)
    : categories

  /**
   * 点击子分类
   */
  const handleCategoryClick = (category: CategoryTreeNode): void => {
    Taro.navigateTo({
      url: `/pages/product-list/index?categoryId=${category.id}&name=${encodeURIComponent(category.name)}`
    })
  }

  /**
   * 点击"全部"
   */
  const handleAllClick = (): void => {
    if (!currentCategoryId) return

    // 刷新当前页面，回到父分类的"全部商品"视图
    Taro.redirectTo({
      url: `/pages/product-list/index?categoryId=${currentCategoryId}&showAll=true`
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
      <View className="sub-category-grid__header">
        <Text className="sub-category-grid__title">子分类</Text>
        <Text className="sub-category-grid__count">{categories.length}个</Text>
      </View>

      <View className="sub-category-grid__content">
        {/* "全部"选项 */}
        {showAllOption && (
          <View
            className="sub-category-grid__item"
            onClick={handleAllClick}
          >
            <View className="sub-category-grid__item-image-wrapper">
              <View className="sub-category-grid__item-all">
                全部
              </View>
            </View>
            <Text className="sub-category-grid__item-name">全部商品</Text>
          </View>
        )}

        {/* 子分类列表 */}
        {displayCategories.map((category) => (
          <View
            key={category.id}
            className="sub-category-grid__item"
            onClick={() => handleCategoryClick(category)}
          >
            <View className="sub-category-grid__item-image-wrapper">
              <Image
                className="sub-category-grid__item-image"
                src={getFullImageUrl(category.image)}
                lazyLoad
              />
            </View>
            <Text className="sub-category-grid__item-name">{category.name}</Text>
            {category.childlist && category.childlist.length > 0 && (
              <Text className="sub-category-grid__item-count">
                {category.childlist.length}个子分类
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
            {isExpanded ? '收起' : `展开全部${categories.length}个分类`}
          </Text>
          {isExpanded ? (
            <ArrowUp size={14} color="#666" />
          ) : (
            <ArrowDown size={14} color="#666" />
          )}
        </View>
      )}
    </View>
  )
}

export default SubCategoryGrid
