import React from 'react'
import { View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.less'

/**
 * 商品列表页
 * 根据分类ID显示商品列表
 */
const ProductList: React.FC = () => {
  // 获取路由参数
  const router = Taro.useRouter()
  const { categoryId, name } = router.params

  return (
    <View className="product-list">
      <View className="product-list__header">
        {/* TODO: 实现二级分类导航栏 */}
        <View>分类: {name || '全部'}</View>
      </View>

      <View className="product-list__content">
        {/* TODO: 实现商品列表 */}
        <View>商品列表页 - 分类ID: {categoryId}</View>
      </View>
    </View>
  )
}

export default ProductList
