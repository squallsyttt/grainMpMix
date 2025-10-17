import React from 'react'
import { View, Text } from '@tarojs/components'
import { ArrowRight } from '@nutui/icons-react-taro'
import Taro from '@tarojs/taro'
import { CategoryTreeNode } from '../../types/category'
import './index.less'

/**
 * 面包屑导航组件Props
 */
interface CategoryBreadcrumbProps {
  /** 分类路径数组（从根到当前分类） */
  path: CategoryTreeNode[]
  /** 是否显示首页 */
  showHome?: boolean
}

/**
 * 面包屑导航组件
 * 显示分类层级路径，支持点击跳转
 */
const CategoryBreadcrumb: React.FC<CategoryBreadcrumbProps> = ({
  path,
  showHome = true
}) => {
  /**
   * 点击面包屑项
   */
  const handleClick = (category: CategoryTreeNode, index: number): void => {
    // 如果点击的是当前分类（最后一项），不跳转
    if (index === path.length - 1) {
      return
    }

    // 跳转到对应分类
    Taro.navigateTo({
      url: `/pages/product-list/index?categoryId=${category.id}&name=${encodeURIComponent(category.name)}`
    })
  }

  /**
   * 返回首页
   */
  const handleGoHome = (): void => {
    Taro.switchTab({ url: '/pages/index/index' })
  }

  return (
    <View className="category-breadcrumb">
      <View className="category-breadcrumb__scroll">
        {/* 首页 */}
        {showHome && (
          <>
            <Text
              className="category-breadcrumb__item category-breadcrumb__item--clickable"
              onClick={handleGoHome}
            >
              首页
            </Text>
            <ArrowRight size={12} color="#999" className="category-breadcrumb__arrow" />
          </>
        )}

        {/* 分类路径 */}
        {path.map((category, index) => {
          const isLast = index === path.length - 1

          return (
            <React.Fragment key={category.id}>
              <Text
                className={`category-breadcrumb__item ${
                  isLast ? 'category-breadcrumb__item--current' : 'category-breadcrumb__item--clickable'
                }`}
                onClick={() => handleClick(category, index)}
              >
                {category.name}
              </Text>

              {/* 不是最后一项，显示箭头 */}
              {!isLast && (
                <ArrowRight size={12} color="#999" className="category-breadcrumb__arrow" />
              )}
            </React.Fragment>
          )
        })}
      </View>
    </View>
  )
}

export default CategoryBreadcrumb
