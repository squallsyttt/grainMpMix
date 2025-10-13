/**
 * 订单卡片组件
 *
 * 用于订单列表中展示订单信息
 */

import React from 'react'
import { View, Text } from '@tarojs/components'
import { Card, Tag, Button } from '@nutui/nutui-react-taro'
import { Location, Clock, ArrowRight } from '@nutui/icons-react-taro'
import Taro from '@tarojs/taro'
import { OrderListItem, OrderStatus, DeliveryMode } from '../../types/order'
import { formatTimestamp } from '../../utils/date'
import './index.less'

/**
 * 订单卡片组件Props
 */
export interface OrderCardProps {
  /** 订单数据 */
  order: OrderListItem
  /** 点击事件(可选) */
  onClick?: (order: OrderListItem) => void
}

/**
 * 获取订单状态配置
 *
 * @param status - 订单状态
 * @returns 状态配置对象
 */
const getStatusConfig = (status: OrderStatus): { text: string; type: 'default' | 'primary' | 'success' | 'warning' | 'danger' } => {
  switch (status) {
    case OrderStatus.PENDING:
      return { text: '待支付', type: 'warning' }
    case OrderStatus.PAID:
      return { text: '已支付', type: 'primary' }
    case OrderStatus.VERIFIED:
      return { text: '已核销', type: 'success' }
    case OrderStatus.CANCELLED:
      return { text: '已取消', type: 'default' }
    case OrderStatus.REFUNDED:
      return { text: '已退款', type: 'default' }
    default:
      return { text: '未知', type: 'default' }
  }
}

/**
 * 订单卡片组件
 *
 * @param props - 组件Props
 * @returns React组件
 */
const OrderCard: React.FC<OrderCardProps> = React.memo(({ order, onClick }) => {
  const statusConfig = getStatusConfig(order.status)

  /**
   * 处理卡片点击
   */
  const handleClick = (): void => {
    if (onClick) {
      onClick(order)
    } else {
      // 默认跳转到订单详情页
      Taro.navigateTo({
        url: `/pages/order/detail/index?id=${order.id}`
      })
    }
  }

  /**
   * 渲染配送方式标识
   */
  const renderDeliveryBadge = (): React.ReactElement | null => {
    if (!order.delivery_mode) {
      return null
    }

    const isSelfPickup = order.delivery_mode === DeliveryMode.SELF_PICKUP
    const badgeClass = isSelfPickup
      ? 'order-card__delivery-badge order-card__delivery-badge--pickup'
      : 'order-card__delivery-badge order-card__delivery-badge--delivery'

    return (
      <View className={badgeClass}>
        <Text className="order-card__delivery-text">
          {isSelfPickup ? '自提' : '配送'}
        </Text>
      </View>
    )
  }

  return (
    <View className="order-card" onClick={handleClick}>
      <Card className="order-card__container">
        <View className="order-card__content">
          {/* 顶部标题行 */}
          <View className="order-card__header">
            <Text className="order-card__order-no">订单号: {order.order_no}</Text>
            <Tag type={statusConfig.type} size="small">
              {statusConfig.text}
            </Tag>
          </View>

          {/* 门店信息 */}
          <View className="order-card__store-row">
            <Location size={14} color="#999999" />
            <Text className="order-card__store-name">{order.store_name}</Text>
            {renderDeliveryBadge()}
          </View>

          {/* 金额信息 */}
          <View className="order-card__amount-section">
            {/* 原价 */}
            {order.discount_amount > 0 && (
              <View className="order-card__amount-row">
                <Text className="order-card__amount-label">原价:</Text>
                <Text className="order-card__amount-value order-card__amount-value--original">
                  ¥{order.original_amount.toFixed(2)}
                </Text>
              </View>
            )}

            {/* 优惠 */}
            {order.discount_amount > 0 && (
              <View className="order-card__amount-row">
                <Text className="order-card__amount-label">优惠:</Text>
                <Text className="order-card__amount-value order-card__amount-value--discount">
                  -¥{order.discount_amount.toFixed(2)}
                </Text>
              </View>
            )}

            {/* 实付 */}
            <View className="order-card__amount-row">
              <Text className="order-card__amount-label">
                {order.discount_amount > 0 ? '实付:' : '金额:'}
              </Text>
              <Text className="order-card__amount-value order-card__amount-value--final">
                ¥{order.final_amount.toFixed(2)}
              </Text>
            </View>
          </View>

          {/* 时间信息 */}
          <View className="order-card__time-row">
            <View className="order-card__time-item">
              <Clock size={12} color="#999999" />
              <Text className="order-card__time-label">下单:</Text>
              <Text className="order-card__time-value">
                {formatTimestamp(order.createtime, 'MM-DD HH:mm')}
              </Text>
            </View>

            {order.verified_at && (
              <View className="order-card__time-item">
                <Text className="order-card__time-label">核销:</Text>
                <Text className="order-card__time-value">
                  {formatTimestamp(order.verified_at, 'MM-DD HH:mm')}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* 底部操作栏 */}
        <View className="order-card__footer">
          <Button
            type="default"
            size="small"
            className="order-card__action-btn"
            onClick={(e) => {
              e.stopPropagation()
              handleClick()
            }}
          >
            查看详情
            <ArrowRight size={12} />
          </Button>
        </View>
      </Card>
    </View>
  )
})

OrderCard.displayName = 'OrderCard'

export default OrderCard
