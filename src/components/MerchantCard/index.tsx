/**
 * MerchantCard - 商家卡片组件
 *
 * 展示商家核心信息,包括Logo、名称、地区、产品标签、评分、认证等
 * 支持多维度信息展示(US4增强)
 */

import React from 'react'
import { View } from '@tarojs/components'
import { Tag, Rate } from '@nutui/nutui-react-taro'
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
  const handleClick = () => {
    if (onClick) {
      onClick(merchant)
    }
  }

  return (
    <View className="merchant-card" onClick={handleClick}>
      <View className="merchant-card__logo">
        <MerchantLogo name={merchant.name} logo={merchant.logo} size={80} />
        {merchant.certification_status === 'verified' && (
          <View className="merchant-card__logo-badge">已认证</View>
        )}
      </View>

      <View className="merchant-card__content">
        <View className="merchant-card__header">
          <View className="merchant-card__name">{merchant.name}</View>
        </View>

        <View className="merchant-card__info">
          <View className="merchant-card__region">
            {merchant.city || merchant.province}
          </View>
          {merchant.years_in_business && merchant.years_in_business > 0 && (
            <View className="merchant-card__years">
              经营{merchant.years_in_business}年
            </View>
          )}
        </View>

        {/* 评分展示 */}
        {merchant.rating !== undefined && merchant.rating > 0 && (
          <View className="merchant-card__rating-wrapper">
            <Rate
              value={merchant.rating}
              readOnly
              count={5}
            />
            <View className="merchant-card__rating-text">
              {merchant.rating.toFixed(1)}
            </View>
          </View>
        )}

        {/* 产品标签 */}
        {merchant.product_tags && merchant.product_tags.length > 0 && (
          <View className="merchant-card__tags">
            {merchant.product_tags.map((tag, index) => (
              <Tag
                key={index}
                type="default"
                plain
                className="merchant-card__tag"
              >
                {tag}
              </Tag>
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
