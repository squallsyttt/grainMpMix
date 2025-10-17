import React from 'react'
import { View, Image, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { Rate } from '@nutui/nutui-react-taro'
import { Product } from '../../types/product'
import { processImageUrl, getErrorPlaceholder } from '../../utils/imageHelper'
import { formatCount } from '../../utils/dataHelper'
import './index.less'

/**
 * ProductCard 组件属性
 */
export interface ProductCardProps {
  /** 商品数据 */
  product: Product
  /** 点击回调 */
  onClick?: (product: Product) => void
  /** 卡片模式：vertical(竖向) | horizontal(横向) */
  mode?: 'vertical' | 'horizontal'
  /** 是否显示标签 */
  showTags?: boolean
  /** 是否显示评分 */
  showRating?: boolean
  /** 自定义类名 */
  className?: string
}

/**
 * 商品卡片组件
 * 支持竖向和横向两种布局模式
 */
const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onClick,
  mode = 'vertical',
  showTags = true,
  showRating = true,
  className = '',
}) => {
  /**
   * 处理点击事件
   */
  const handleClick = (): void => {
    if (onClick) {
      onClick(product)
    } else {
      // 默认跳转到商品详情页
      Taro.navigateTo({
        url: `/pages/product/detail/index?id=${product.id}`,
      })
    }
  }

  /**
   * 获取主图 URL
   */
  const getImageUrl = (): string => {
    if (!product.images || product.images.length === 0) {
      return getErrorPlaceholder()
    }
    return processImageUrl(product.images[0], {
      size: mode === 'vertical' ? 'medium' : 'small',
      quality: 'medium',
    })
  }

  /**
   * 计算折扣率
   */
  const getDiscount = (): string | null => {
    if (!product.originalPrice || product.originalPrice <= product.price) {
      return null
    }
    const discount = Math.round((product.price / product.originalPrice) * 10 * 10) / 10
    return `${discount}折`
  }

  /**
   * 获取促销标签
   */
  const getPromotionTag = (): string | null => {
    if (product.promotion) {
      return product.promotion.label
    }
    const discount = getDiscount()
    if (discount) {
      return discount
    }
    return null
  }

  /**
   * 渲染竖向布局
   */
  const renderVertical = (): React.ReactElement => {
    return (
      <View className={`product-card product-card--vertical ${className}`} onClick={handleClick}>
        {/* 商品图片 */}
        <View className="product-card__image-wrapper">
          <Image
            className="product-card__image"
            src={getImageUrl()}
            mode="aspectFill"
            lazyLoad
          />
          {/* 促销标签 */}
          {showTags && getPromotionTag() && (
            <View className="product-card__badge">
              <Text className="product-card__badge-text">{getPromotionTag()}</Text>
            </View>
          )}
          {/* 已售信息 */}
          <View className="product-card__sales-badge">
            <Text className="product-card__sales-badge-text">已售 {formatCount(product.sales)}</Text>
          </View>
        </View>

        {/* 商品信息 */}
        <View className="product-card__info">
          {/* 商品名称 */}
          <Text className="product-card__name">{product.name}</Text>

          {/* 商品标签 */}
          {showTags && product.tags && product.tags.length > 0 && (
            <View className="product-card__tags">
              {product.tags.slice(0, 2).map((tag, index) => (
                <View key={index} className="product-card__tag">
                  <Text className="product-card__tag-text">{tag}</Text>
                </View>
              ))}
            </View>
          )}

          {/* 价格区域 */}
          <View className="product-card__price-row">
            <View className="product-card__price">
              <Text className="product-card__price-symbol">¥</Text>
              <Text className="product-card__price-value">{Math.floor(product.price)}</Text>
              <Text className="product-card__price-decimal">
                .{(product.price % 1).toFixed(2).slice(2)}
              </Text>
            </View>

            {product.originalPrice && product.originalPrice > product.price && (
              <Text className="product-card__original-price">
                ¥{product.originalPrice.toFixed(2)}
              </Text>
            )}
          </View>
        </View>
      </View>
    )
  }

  /**
   * 渲染横向布局
   */
  const renderHorizontal = (): React.ReactElement => {
    return (
      <View className={`product-card product-card--horizontal ${className}`} onClick={handleClick}>
        {/* 商品图片 */}
        <View className="product-card__image-wrapper">
          <Image
            className="product-card__image"
            src={getImageUrl()}
            mode="aspectFill"
            lazyLoad
          />
          {/* 促销标签 */}
          {showTags && getPromotionTag() && (
            <View className="product-card__badge">
              <Text className="product-card__badge-text">{getPromotionTag()}</Text>
            </View>
          )}
          {/* 已售信息 */}
          <View className="product-card__sales-badge">
            <Text className="product-card__sales-badge-text">已售 {formatCount(product.sales)}</Text>
          </View>
        </View>

        {/* 商品信息 */}
        <View className="product-card__info">
          {/* 商品名称 */}
          <Text className="product-card__name">{product.name}</Text>

          {/* 商品描述 */}
          <Text className="product-card__desc">{product.description}</Text>

          {/* 商品标签 */}
          {showTags && product.tags && product.tags.length > 0 && (
            <View className="product-card__tags">
              {product.tags.slice(0, 3).map((tag, index) => (
                <View key={index} className="product-card__tag">
                  <Text className="product-card__tag-text">{tag}</Text>
                </View>
              ))}
            </View>
          )}

          {/* 底部区域 */}
          <View className="product-card__bottom">
            {/* 价格区域 */}
            <View className="product-card__price-row">
              <View className="product-card__price">
                <Text className="product-card__price-symbol">¥</Text>
                <Text className="product-card__price-value">{Math.floor(product.price)}</Text>
                <Text className="product-card__price-decimal">
                  .{(product.price % 1).toFixed(2).slice(2)}
                </Text>
              </View>

              {product.originalPrice && product.originalPrice > product.price && (
                <Text className="product-card__original-price">
                  ¥{product.originalPrice.toFixed(2)}
                </Text>
              )}
            </View>
          </View>
        </View>
      </View>
    )
  }

  return mode === 'vertical' ? renderVertical() : renderHorizontal()
}

export default ProductCard
