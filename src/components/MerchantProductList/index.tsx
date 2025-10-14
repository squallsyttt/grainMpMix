/**
 * MerchantProductList - 商家产品列表组件
 *
 * 展示商家供应的产品品类列表,处理"暂未上架产品"空状态
 */

import React from 'react'
import { View, Image } from '@tarojs/components'
import { Tag } from '@nutui/nutui-react-taro'
import EmptyState from '../EmptyState'
import { MerchantProduct } from '../../types/merchant'
import './index.less'

interface MerchantProductListProps {
  /** 产品列表 */
  products: MerchantProduct[]
  /** 加载状态 */
  loading?: boolean
}

/**
 * MerchantProductList组件
 *
 * @param props - 组件属性
 * @returns React组件
 */
const MerchantProductList: React.FC<MerchantProductListProps> = ({
  products,
  loading = false,
}) => {
  // 空状态
  if (!loading && products.length === 0) {
    return (
      <View className="merchant-product-list merchant-product-list--empty">
        <EmptyState description="该商家暂未上架产品" imageType="empty" />
      </View>
    )
  }

  return (
    <View className="merchant-product-list">
      <View className="merchant-product-list__header">
        <View className="merchant-product-list__title">供应产品</View>
        <View className="merchant-product-list__count">共{products.length}种</View>
      </View>

      <View className="merchant-product-list__grid">
        {products.map((product) => (
          <View
            key={product.category_id}
            className="merchant-product-list__item"
          >
            {/* 产品图片 */}
            <View className="merchant-product-list__item-image-wrapper">
              <Image
                src={product.category_image}
                mode="aspectFill"
                className="merchant-product-list__item-image"
                lazyLoad
              />
              {!product.is_available && (
                <View className="merchant-product-list__item-unavailable">
                  暂无货
                </View>
              )}
            </View>

            {/* 产品信息 */}
            <View className="merchant-product-list__item-info">
              <View className="merchant-product-list__item-name">
                {product.category_name}
              </View>
              {product.description && (
                <View className="merchant-product-list__item-desc">
                  {product.description}
                </View>
              )}
              <View className="merchant-product-list__item-footer">
                <View className="merchant-product-list__item-price">
                  <View className="merchant-product-list__item-price-value">
                    ¥{product.price.toFixed(2)}
                  </View>
                  <View className="merchant-product-list__item-price-unit">
                    {product.price_unit}
                  </View>
                </View>
                {product.stock_status && (
                  <Tag
                    type={product.is_available ? 'success' : 'default'}
                    plain
                  >
                    {product.stock_status}
                  </Tag>
                )}
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  )
}

export default React.memo(MerchantProductList)
