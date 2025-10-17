/**
 * MerchantCard - 商家卡片组件
 *
 * 展示商家核心信息,包括Logo、名称、地区、产品标签、评分、认证等
 * 支持多维度信息展示,专业精致的设计风格
 */

import React from 'react'
import { View, Text } from '@tarojs/components'
import { CheckNormal, StarFill } from '@nutui/icons-react-taro'
import { MerchantListItem } from '../../types/merchant'
import MerchantLogo from '../MerchantLogo'
import './index.less'

interface MerchantCardProps {
  /** 商家数据 */
  merchant: MerchantListItem
  /** 点击事件 */
  onClick?: (merchant: MerchantListItem) => void
}

/**
 * MerchantCard组件
 *
 * @param props - 组件属性
 * @returns React组件
 */
const MerchantCard: React.FC<MerchantCardProps> = ({ merchant, onClick }) => {
  const handleClick = (): void => {
    if (onClick) {
      onClick(merchant)
    }
  }

  return (
    <View className="merchant-card" onClick={handleClick}>
      <View className="merchant-card__logo-wrapper">
        <MerchantLogo name={merchant.name} logo={merchant.logo} size={120} />
      </View>

      <View className="merchant-card__content">
        <View className="merchant-card__header">
          <Text className="merchant-card__name">{merchant.name}</Text>
          {merchant.certification_status === 'verified' && (
            <View className="merchant-card__badge">
              <CheckNormal size={10} color="#fff" />
            </View>
          )}
        </View>

        <View className="merchant-card__info">
          <Text className="merchant-card__region">
            {merchant.city || merchant.province}
          </Text>
          {merchant.years_in_business && merchant.years_in_business > 0 && (
            <Text className="merchant-card__years">
              经营{merchant.years_in_business}年
            </Text>
          )}
        </View>

        {/* 评分展示 */}
        {merchant.rating !== undefined && merchant.rating > 0 && (
          <View className="merchant-card__rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <StarFill
                key={star}
                size={16}
                color={star <= merchant.rating ? '#FF6B35' : '#E5E5E5'}
              />
            ))}
            <Text className="merchant-card__rating-text">
              {merchant.rating.toFixed(1)}
            </Text>
          </View>
        )}

        {/* 产品标签 */}
        {merchant.product_tags && merchant.product_tags.length > 0 && (
          <View className="merchant-card__tags">
            {merchant.product_tags.slice(0, 3).map((tag, index) => (
              <View key={index} className="merchant-card__tag">
                <Text className="merchant-card__tag-text">{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  )
}

// 使用React.memo优化性能,仅在merchant数据变化时重新渲染
export default React.memo(MerchantCard, (prevProps, nextProps) => {
  return (
    prevProps.merchant.id === nextProps.merchant.id &&
    prevProps.merchant.updated_at === nextProps.merchant.updated_at
  )
})
