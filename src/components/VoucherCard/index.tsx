/**
 * 核销券卡片组件
 *
 * 用于在列表中展示核销券信息
 */

import React from 'react'
import { View, Text } from '@tarojs/components'
import { Card, Tag } from '@nutui/nutui-react-taro'
import Taro from '@tarojs/taro'
import { VoucherListItem, VoucherStatus, VoucherType } from '../../types/voucher'
import { formatTimestamp, isExpiringSoon, isExpired } from '../../utils/date'
import ExpireWarning from '../ExpireWarning'
import './index.less'

/**
 * 核销券卡片组件Props
 */
export interface VoucherCardProps {
  /** 核销券数据 */
  voucher: VoucherListItem
  /** 点击回调 */
  onClick?: (voucher: VoucherListItem) => void
}

/**
 * 获取券类型显示文本
 *
 * @param type - 券类型
 * @returns 显示文本
 */
const getVoucherTypeText = (type: VoucherType): string => {
  const typeMap: Record<VoucherType, string> = {
    [VoucherType.CASH]: '代金券',
    [VoucherType.DISCOUNT]: '折扣券',
    [VoucherType.EXCHANGE]: '兑换券',
    [VoucherType.TRIAL]: '体验券'
  }
  return typeMap[type] || '未知类型'
}

/**
 * 获取券状态配置
 *
 * @param status - 券状态
 * @returns 状态配置
 */
const getStatusConfig = (status: VoucherStatus) => {
  const statusMap: Record<VoucherStatus, { text: string; type: 'primary' | 'success' | 'warning' | 'danger' | 'default' }> = {
    [VoucherStatus.UNUSED]: { text: '待核销', type: 'primary' },
    [VoucherStatus.USED]: { text: '已核销', type: 'default' },
    [VoucherStatus.EXPIRED]: { text: '已过期', type: 'default' },
    [VoucherStatus.FROZEN]: { text: '已冻结', type: 'danger' }
  }
  return statusMap[status] || { text: '未知', type: 'default' }
}

/**
 * 核销券卡片组件
 *
 * @param props - 组件Props
 * @returns React组件
 */
const VoucherCard: React.FC<VoucherCardProps> = React.memo(({ voucher, onClick }) => {
  const statusConfig = getStatusConfig(voucher.status)
  const typeText = getVoucherTypeText(voucher.type)
  const expiring = isExpiringSoon(voucher.expire_at)
  const expired = isExpired(voucher.expire_at)

  /**
   * 处理卡片点击
   */
  const handleClick = () => {
    if (onClick) {
      onClick(voucher)
    } else {
      // 默认跳转到详情页
      Taro.navigateTo({
        url: `/pages/voucher/detail/index?id=${voucher.id}`
      })
    }
  }

  /**
   * 渲染金额或折扣信息
   */
  const renderValue = () => {
    if (voucher.type === VoucherType.CASH && voucher.amount) {
      return (
        <View className="voucher-card__value">
          <Text className="voucher-card__value-symbol">¥</Text>
          <Text className="voucher-card__value-amount">{voucher.amount.toFixed(2)}</Text>
        </View>
      )
    } else if (voucher.type === VoucherType.DISCOUNT && voucher.discount) {
      return (
        <View className="voucher-card__value">
          <Text className="voucher-card__value-amount">{(voucher.discount * 10).toFixed(1)}</Text>
          <Text className="voucher-card__value-unit">折</Text>
        </View>
      )
    }
    return null
  }

  return (
    <View className="voucher-card" onClick={handleClick}>
      <Card className="voucher-card__container">
        <View className="voucher-card__content">
          {/* 左侧：金额/折扣 */}
          <View className="voucher-card__left">
            {renderValue()}
            <Text className="voucher-card__type">{typeText}</Text>
          </View>

          {/* 右侧：详细信息 */}
          <View className="voucher-card__right">
            {/* 标题和标签 */}
            <View className="voucher-card__header">
              <Text className="voucher-card__title">{voucher.title}</Text>
              <View className="voucher-card__tags">
                <Tag type={statusConfig.type} plain size="small">
                  {statusConfig.text}
                </Tag>
                {expiring && !expired && (
                  <Tag type="warning" plain size="small" className="voucher-card__tag-expiring">
                    即将过期
                  </Tag>
                )}
              </View>
            </View>

            {/* 描述 */}
            {voucher.description && (
              <Text className="voucher-card__description">{voucher.description}</Text>
            )}

            {/* 门店信息 */}
            <View className="voucher-card__store">
              <Text className="voucher-card__store-name">{voucher.store_name}</Text>
            </View>

            {/* 有效期 */}
            <View className="voucher-card__footer">
              <Text className="voucher-card__expire">
                有效期至: {formatTimestamp(voucher.expire_at, 'YYYY-MM-DD HH:mm')}
              </Text>
            </View>

            {/* 过期警告 */}
            {voucher.status === VoucherStatus.UNUSED && (
              <ExpireWarning
                expireAt={voucher.expire_at}
                showCountdown={true}
                autoRefresh={true}
              />
            )}
          </View>
        </View>
      </Card>
    </View>
  )
})

VoucherCard.displayName = 'VoucherCard'

export default VoucherCard
