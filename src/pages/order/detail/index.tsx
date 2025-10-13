/**
 * 订单详情页面
 *
 * 展示订单完整信息,包括订单状态、门店、金额等
 */

import React, { useState } from 'react'
import { View, Text } from '@tarojs/components'
import { Divider, Skeleton } from '@nutui/nutui-react-taro'
import { Success, Failure, Clock, Location, Phone, ArrowRight } from '@nutui/icons-react-taro'
import Taro, { useLoad, useRouter, usePullDownRefresh } from '@tarojs/taro'
import { OrderDetail, OrderStatus, DeliveryMode } from '../../../types/order'
import { getOrderDetail } from '../../../services/order'
import { API_ERROR_CODE } from '../../../types/api'
import { formatTimestamp } from '../../../utils/date'
import { showError } from '../../../utils/error'
import { safeGoBack } from '../../../utils/navigation'
import { mockOrderDetail } from '../../../data/mock/order'
import './index.less'

/**
 * 订单详情页面
 */
const OrderDetailPage: React.FC = () => {
  const router = useRouter()
  const orderId = parseInt(router.params.id || '0', 10)

  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  /**
   * 加载订单详情
   */
  const loadOrderDetail = async () => {
    if (!orderId) {
      showError('订单ID无效')
      setTimeout(() => safeGoBack(), 1500)
      return
    }

    try {
      setLoading(true)

      // 使用Mock数据（开发调试）
      console.log('[OrderDetail] 使用Mock数据')
      await new Promise(resolve => setTimeout(resolve, 500))

      setOrder(mockOrderDetail)
    } catch (error) {
      console.error('[OrderDetail] 加载失败:', error)
      showError('加载失败,请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  /**
   * 下拉刷新
   */
  usePullDownRefresh(() => {
    loadOrderDetail().finally(() => {
      Taro.stopPullDownRefresh()
    })
  })

  /**
   * 页面加载
   */
  useLoad(() => {
    loadOrderDetail()
  })

  /**
   * 打开地图导航
   */
  const handleOpenMap = () => {
    if (!order) return

    Taro.openLocation({
      name: order.store_name,
      address: order.store_address
    }).catch(err => {
      console.error('[OrderDetail] 打开地图失败:', err)
      Taro.showToast({
        title: '打开地图失败',
        icon: 'none'
      })
    })
  }

  /**
   * 拨打电话
   */
  const handleCallPhone = () => {
    if (!order || !order.store_phone) return

    Taro.makePhoneCall({
      phoneNumber: order.store_phone
    }).catch(err => {
      console.error('[OrderDetail] 拨打电话失败:', err)
      Taro.showToast({
        title: '拨打失败',
        icon: 'none'
      })
    })
  }

  /**
   * 获取订单状态配置
   */
  const getStatusConfig = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return {
          icon: <Clock size={48} color="#ffffff" />,
          text: '待支付',
          desc: '请尽快完成支付'
        }
      case OrderStatus.PAID:
        return {
          icon: <Success size={48} color="#ffffff" />,
          text: '已支付',
          desc: '等待核销'
        }
      case OrderStatus.VERIFIED:
        return {
          icon: <Success size={48} color="#ffffff" />,
          text: '已核销',
          desc: '订单已完成'
        }
      case OrderStatus.CANCELLED:
        return {
          icon: <Failure size={48} color="#ffffff" />,
          text: '已取消',
          desc: '订单已取消'
        }
      case OrderStatus.REFUNDED:
        return {
          icon: <Failure size={48} color="#ffffff" />,
          text: '已退款',
          desc: '退款已完成'
        }
      default:
        return {
          icon: <Clock size={48} color="#ffffff" />,
          text: '未知状态',
          desc: ''
        }
    }
  }

  /**
   * 渲染骨架屏
   */
  const renderSkeleton = () => {
    return (
      <View className="order-detail__skeleton">
        <Skeleton width="100%" height="150px" animated />
        <Skeleton width="100%" height="200px" animated style={{ marginTop: '12px' }} />
        <Skeleton width="100%" height="150px" animated style={{ marginTop: '12px' }} />
      </View>
    )
  }

  if (loading || !order) {
    return renderSkeleton()
  }

  const statusConfig = getStatusConfig(order.status)
  const hasDiscount = order.discount_amount > 0

  return (
    <View className="order-detail">
      {/* 顶部状态栏 */}
      <View className="order-detail__status-bar">
        <View className="order-detail__status-icon">
          {statusConfig.icon}
        </View>
        <Text className="order-detail__status-text">{statusConfig.text}</Text>
        <Text className="order-detail__status-desc">{statusConfig.desc}</Text>
      </View>

      {/* 订单信息卡片 */}
      <View className="order-detail__card">
        <View className="order-detail__section-title">
          <Text>订单信息</Text>
        </View>

        {/* 订单号 */}
        <View className="order-detail__order-no-row">
          <Text className="order-detail__label">订单号:</Text>
          <Text className="order-detail__order-no">{order.order_no}</Text>
        </View>

        {/* 创建时间 */}
        <View className="order-detail__info-row">
          <Text className="order-detail__label">下单时间:</Text>
          <Text className="order-detail__value">
            {formatTimestamp(order.createtime, 'YYYY-MM-DD HH:mm:ss')}
          </Text>
        </View>

        {/* 核销时间 */}
        {order.verified_at && (
          <View className="order-detail__info-row">
            <Text className="order-detail__label">核销时间:</Text>
            <Text className="order-detail__value">
              {formatTimestamp(order.verified_at, 'YYYY-MM-DD HH:mm:ss')}
            </Text>
          </View>
        )}

        {/* 核销员工 */}
        {order.verified_by && (
          <View className="order-detail__info-row">
            <Text className="order-detail__label">核销员工:</Text>
            <Text className="order-detail__value">{order.verified_by}</Text>
          </View>
        )}
      </View>

      <Divider />

      {/* 门店信息卡片 */}
      <View className="order-detail__card">
        <View className="order-detail__section-title">
          <Text>门店信息</Text>
        </View>

        {/* 配送方式 */}
        {order.delivery_mode && (
          <View className={`order-detail__delivery-badge order-detail__delivery-badge--${order.delivery_mode}`}>
            {order.delivery_mode === DeliveryMode.SELF_PICKUP ? '核销自提' : '跑腿配送'}
          </View>
        )}

        {/* 门店信息(可点击打开地图) */}
        <View className="order-detail__store-clickable" onClick={handleOpenMap}>
          <Location size={16} color="#1890ff" />
          <View className="order-detail__store-info">
            <Text className="order-detail__store-name">{order.store_name}</Text>
            <Text className="order-detail__store-address">{order.store_address}</Text>
          </View>
          <ArrowRight size={14} color="#999999" />
        </View>

        {/* 电话 */}
        {order.store_phone && (
          <View className="order-detail__info-row" onClick={handleCallPhone} style={{ cursor: 'pointer' }}>
            <Phone size={14} color="#1890ff" />
            <Text className="order-detail__label">门店电话:</Text>
            <Text className="order-detail__value" style={{ color: '#1890ff' }}>
              {order.store_phone}
            </Text>
          </View>
        )}

        {/* 跑腿配送占位 */}
        {order.delivery_mode === DeliveryMode.DELIVERY && (
          <View className="order-detail__delivery-placeholder">
            <Text className="order-detail__delivery-placeholder-text">
              跑腿配送功能开发中,敬请期待{'\n'}
              配送信息将在此处显示
            </Text>
          </View>
        )}
      </View>

      <Divider />

      {/* 金额信息卡片 */}
      <View className="order-detail__card">
        <View className="order-detail__section-title">
          <Text>金额信息</Text>
        </View>

        <View className="order-detail__amount-section">
          {/* 原价 */}
          <View className="order-detail__amount-row">
            <Text className="order-detail__amount-label">原价:</Text>
            <Text className={`order-detail__amount-value ${hasDiscount ? 'order-detail__amount-value--original' : ''}`}>
              ¥{order.original_amount.toFixed(2)}
            </Text>
          </View>

          {/* 优惠 */}
          {hasDiscount && (
            <View className="order-detail__amount-row">
              <Text className="order-detail__amount-label">优惠:</Text>
              <Text className="order-detail__amount-value order-detail__amount-value--discount">
                -¥{order.discount_amount.toFixed(2)}
              </Text>
            </View>
          )}

          {/* 使用券信息 */}
          {order.voucher_title && (
            <View className="order-detail__amount-row">
              <Text className="order-detail__amount-label">使用券:</Text>
              <Text className="order-detail__amount-value">
                {order.voucher_title}
              </Text>
            </View>
          )}

          {/* 实付 */}
          <View className="order-detail__amount-row">
            <Text className="order-detail__amount-label">实付:</Text>
            <Text className="order-detail__amount-value order-detail__amount-value--final">
              ¥{order.final_amount.toFixed(2)}
            </Text>
          </View>
        </View>
      </View>

      {/* 备注 */}
      {order.remark && (
        <>
          <Divider />
          <View className="order-detail__card">
            <View className="order-detail__section-title">
              <Text>订单备注</Text>
            </View>
            <Text className="order-detail__value">{order.remark}</Text>
          </View>
        </>
      )}
    </View>
  )
}

export default OrderDetailPage
