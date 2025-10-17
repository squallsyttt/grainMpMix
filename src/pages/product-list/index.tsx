import React, { useMemo } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useCategories } from '../../hooks/useCategories'
import { getCategoryPath, getChildren } from '../../utils/categoryTree'
import CategoryBreadcrumb from '../../components/CategoryBreadcrumb'
import SubCategoryGrid from '../../components/SubCategoryGrid'
import './index.less'

/**
 * 商品列表页
 * 支持多层级分类导航和商品展示
 */
const ProductListPage: React.FC = () => {
  // 获取路由参数
  const router = Taro.useRouter()
  const { categoryId, name } = router.params

  // 解码 URL 编码的分类名称
  const decodedName = name ? decodeURIComponent(name) : '全部'

  // 获取分类树数据
  const { index, loading, error } = useCategories()

  /**
   * 当前分类ID（数字）
   */
  const currentCategoryId = useMemo(() => {
    return categoryId ? Number(categoryId) : null
  }, [categoryId])

  /**
   * 分类路径（面包屑）
   */
  const categoryPath = useMemo(() => {
    if (!currentCategoryId || !index) return []
    return getCategoryPath(currentCategoryId, index)
  }, [currentCategoryId, index])

  /**
   * 子分类列表
   */
  const subCategories = useMemo(() => {
    if (!currentCategoryId || !index) return []
    return getChildren(currentCategoryId, index)
  }, [currentCategoryId, index])

  /**
   * 当前分类信息
   */
  const currentCategory = useMemo(() => {
    if (!currentCategoryId || !index) return null
    return index.byId.get(currentCategoryId) || null
  }, [currentCategoryId, index])

  /**
   * 设置页面标题
   */
  React.useEffect(() => {
    if (decodedName) {
      Taro.setNavigationBarTitle({
        title: decodedName
      })
    }
  }, [decodedName])

  /**
   * 加载状态
   */
  if (loading) {
    return (
      <View className="product-list-page">
        <View className="product-list-page__loading">加载中...</View>
      </View>
    )
  }

  /**
   * 错误状态
   */
  if (error) {
    return (
      <View className="product-list-page">
        <View className="product-list-page__error">
          <Text className="product-list-page__error-text">{error}</Text>
        </View>
      </View>
    )
  }

  /**
   * 分类不存在
   */
  if (!currentCategory && currentCategoryId) {
    return (
      <View className="product-list-page">
        <View className="product-list-page__empty">
          <Text className="product-list-page__empty-text">分类不存在</Text>
        </View>
      </View>
    )
  }

  return (
    <View className="product-list-page">
      {/* 面包屑导航 */}
      {categoryPath.length > 0 && (
        <CategoryBreadcrumb path={categoryPath} showHome />
      )}

      {/* 子分类网格 */}
      {subCategories.length > 0 && (
        <SubCategoryGrid
          categories={subCategories}
          currentCategoryId={currentCategoryId || undefined}
          showAllOption={true}
          defaultShowCount={6}
        />
      )}

      {/* 商品列表标题 */}
      <View className="product-list-page__section-header">
        <Text className="product-list-page__section-title">
          {subCategories.length > 0 ? '全部商品' : decodedName}
        </Text>
      </View>

      {/* 商品列表 */}
      <View className="product-list-page__products">
        {/* TODO: 集成真实商品列表 */}
        <View className="product-list-page__placeholder">
          <Text className="product-list-page__placeholder-text">
            商品列表开发中...
          </Text>
          <Text className="product-list-page__placeholder-desc">
            当前分类: {decodedName} (ID: {categoryId})
          </Text>
          {subCategories.length > 0 && (
            <Text className="product-list-page__placeholder-desc">
              包含 {subCategories.length} 个子分类
            </Text>
          )}
        </View>
      </View>
    </View>
  )
}

export default ProductListPage
