import React, { useState, useMemo } from 'react'
import { View, Text, Input } from '@tarojs/components'
import { Image } from '@nutui/nutui-react-taro'
import { Search } from '@nutui/icons-react-taro'
import Taro from '@tarojs/taro'
import { useCategories } from '../../hooks/useCategories'
import { getRootCategories, getChildrenCount } from '../../utils/categoryTree'
import { getFullImageUrl } from '../../utils/imageUrl'
import './index.less'

/**
 * 分类导航页
 * 展示完整的分类树形结构，提供快速导航
 */
const CategoryNav: React.FC = () => {
  const { tree, index, loading, error } = useCategories()
  const [searchKeyword, setSearchKeyword] = useState('')

  /**
   * 获取所有一级分类
   */
  const rootCategories = useMemo(() => {
    if (!index) return []
    return getRootCategories(index)
  }, [index])

  /**
   * 过滤后的分类列表
   */
  const filteredCategories = useMemo(() => {
    if (!searchKeyword.trim()) return rootCategories

    return rootCategories.filter(category =>
      category.name.toLowerCase().includes(searchKeyword.toLowerCase())
    )
  }, [rootCategories, searchKeyword])

  /**
   * 处理搜索输入
   */
  const handleSearchInput = (e: any): void => {
    setSearchKeyword(e.detail.value)
  }

  /**
   * 点击分类卡片
   */
  const handleCategoryClick = (categoryId: number, categoryName: string): void => {
    Taro.navigateTo({
      url: `/pages/product-list/index?categoryId=${categoryId}&name=${encodeURIComponent(categoryName)}`
    })
  }

  /**
   * 加载状态
   */
  if (loading) {
    return (
      <View className="category-nav">
        <View className="category-nav__loading">
          <Text className="category-nav__loading-text">加载中...</Text>
        </View>
      </View>
    )
  }

  /**
   * 错误状态
   */
  if (error) {
    return (
      <View className="category-nav">
        <View className="category-nav__error">
          <Text className="category-nav__error-text">{error}</Text>
        </View>
      </View>
    )
  }

  /**
   * 空状态
   */
  if (rootCategories.length === 0) {
    return (
      <View className="category-nav">
        <View className="category-nav__empty">
          <Text className="category-nav__empty-text">暂无分类数据</Text>
        </View>
      </View>
    )
  }

  return (
    <View className="category-nav">
      {/* 页面头部 */}
      <View className="category-nav__header">
        {/* 搜索框 */}
        <View className="category-nav__search">
          <Search size={16} className="category-nav__search-icon" />
          <Input
            className="category-nav__search-input"
            placeholder="搜索分类"
            placeholderClass="category-nav__search-placeholder"
            value={searchKeyword}
            onInput={handleSearchInput}
          />
        </View>

        {/* 分类统计 */}
        <View className="category-nav__stats">
          <Text className="category-nav__stats-text">
            共 <Text className="category-nav__stats-number">{filteredCategories.length}</Text> 个分类
          </Text>
        </View>
      </View>

      {/* 分类网格 */}
      <View className="category-nav__grid">
        {filteredCategories.map((category) => {
          const childrenCount = getChildrenCount(category.id, index)

          return (
            <View
              key={category.id}
              className="category-nav__card"
              onClick={() => handleCategoryClick(category.id, category.name)}
            >
              <View className="category-nav__card-image-wrapper">
                <Image
                  className="category-nav__card-image"
                  src={getFullImageUrl(category.image)}
                  lazyLoad
                />
              </View>
              <View className="category-nav__card-content">
                <Text className="category-nav__card-name">{category.name}</Text>
                {childrenCount > 0 && (
                  <Text className="category-nav__card-count">
                    {childrenCount} 个子分类
                  </Text>
                )}
              </View>
            </View>
          )
        })}
      </View>

      {/* 搜索无结果提示 */}
      {searchKeyword && filteredCategories.length === 0 && (
        <View className="category-nav__no-result">
          <Text className="category-nav__no-result-text">
            未找到匹配的分类
          </Text>
          <Text className="category-nav__no-result-desc">
            试试其他关键词吧
          </Text>
        </View>
      )}
    </View>
  )
}

export default CategoryNav
