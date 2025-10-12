import React from 'react'
import { View } from '@tarojs/components'
import { Skeleton } from '@nutui/nutui-react-taro'
import './index.less'

/**
 * ProductCardSkeleton 组件属性
 */
interface ProductCardSkeletonProps {
  /** 骨架屏数量 */
  count?: number
  /** 布局模式 */
  mode?: 'vertical' | 'horizontal'
}

/**
 * 商品卡片骨架屏组件
 * 在商品数据加载时显示
 */
const ProductCardSkeleton: React.FC<ProductCardSkeletonProps> = ({
  count = 6,
  mode = 'vertical',
}) => {
  /**
   * 渲染竖向骨架屏
   */
  const renderVerticalSkeleton = (): React.ReactElement => {
    return (
      <View className="product-skeleton product-skeleton--vertical">
        {/* 商品图片 */}
        <Skeleton width="100%" height="0" style={{ paddingBottom: '100%' }} animated />

        {/* 商品信息 */}
        <View className="product-skeleton__info">
          {/* 商品名称 */}
          <Skeleton width="100%" height="20px" animated />
          <Skeleton width="80%" height="20px" animated style={{ marginTop: '8px' }} />

          {/* 标签 */}
          <View className="product-skeleton__tags">
            <Skeleton width="50px" height="20px" animated radius="4px" />
            <Skeleton width="60px" height="20px" animated radius="4px" />
          </View>

          {/* 价格 */}
          <Skeleton width="80px" height="24px" animated style={{ marginTop: '8px' }} />

          {/* 销量和评分 */}
          <View className="product-skeleton__meta">
            <Skeleton width="60px" height="16px" animated />
            <Skeleton width="80px" height="16px" animated />
          </View>
        </View>
      </View>
    )
  }

  /**
   * 渲染横向骨架屏
   */
  const renderHorizontalSkeleton = (): React.ReactElement => {
    return (
      <View className="product-skeleton product-skeleton--horizontal">
        {/* 商品图片 */}
        <Skeleton width="100px" height="100px" animated radius="4px" />

        {/* 商品信息 */}
        <View className="product-skeleton__info">
          {/* 商品名称 */}
          <Skeleton width="100%" height="20px" animated />

          {/* 商品描述 */}
          <Skeleton width="80%" height="16px" animated style={{ marginTop: '8px' }} />

          {/* 标签 */}
          <View className="product-skeleton__tags">
            <Skeleton width="50px" height="18px" animated radius="4px" />
            <Skeleton width="50px" height="18px" animated radius="4px" />
          </View>

          {/* 价格和销量 */}
          <View className="product-skeleton__bottom">
            <Skeleton width="70px" height="20px" animated />
            <Skeleton width="60px" height="16px" animated />
          </View>
        </View>
      </View>
    )
  }

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} className="product-skeleton-wrapper">
          {mode === 'vertical' ? renderVerticalSkeleton() : renderHorizontalSkeleton()}
        </View>
      ))}
    </>
  )
}

export default ProductCardSkeleton
