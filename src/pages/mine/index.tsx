/**
 * 个人中心主页
 * Feature: 核销券个人中心主页
 *
 * 核心功能:
 * - 用户信息展示
 * - 核销券状态统计
 * - 最近核销券列表
 * - 订单入口
 * - 常用功能列表
 */

import React, { useState, useEffect, useCallback } from 'react'
import { View, Image, Text } from '@tarojs/components'
import Taro, { usePullDownRefresh } from '@tarojs/taro'
import { Empty, Skeleton, Button } from '@nutui/nutui-react-taro'
import { ArrowRight, Location, Service, Message, Setting, Del, Transit } from '@nutui/icons-react-taro'
import { useUser } from '@/contexts/UserContext'
import VoucherStatsCard from '@/components/VoucherStatsCard'
import UserInfoCard from '@/components/UserInfoCard'
import FunctionListItem from '@/components/FunctionListItem'
import { getVoucherStats, getRecentVouchers, getOrderStats, getRecentOrders } from '@/services/user'
import { VoucherStats, OrderStats } from '@/types/stats'
import { RecentVoucher, RecentOrder } from '@/types/recent'
import { FunctionItem } from '@/types/function'
import './index.less'

/**
 * 个人中心页面组件
 */
function Mine(): React.ReactElement {
  const { userInfo, isLoggedIn, logout } = useUser()
  const [voucherStats, setVoucherStats] = useState<VoucherStats | null>(null)
  const [orderStats, setOrderStats] = useState<OrderStats | null>(null)
  const [recentVouchers, setRecentVouchers] = useState<RecentVoucher[]>([])
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [vouchersLoading, setVouchersLoading] = useState<boolean>(true)
  const [ordersLoading, setOrdersLoading] = useState<boolean>(true)
  const [error, setError] = useState<boolean>(false)

  /**
   * 功能列表配置
   */
  const functionList: FunctionItem[] = [
    {
      id: 'address',
      title: '收货地址',
      icon: Location,
      url: '/pages/address/list/index'
    },
    {
      id: 'service',
      title: '联系客服',
      icon: Service,
      action: () => {
        Taro.showModal({
          title: '联系客服',
          content: '客服电话: 400-123-4567',
          showCancel: true,
          confirmText: '拨打',
          success: (res) => {
            if (res.confirm) {
              Taro.makePhoneCall({
                phoneNumber: '400-123-4567'
              })
            }
          }
        })
      }
    },
    {
      id: 'feedback',
      title: '意见反馈',
      icon: Message,
      url: '/pages/feedback/index'
    },
    {
      id: 'settings',
      title: '设置',
      icon: Setting,
      url: '/pages/settings/index'
    },
    {
      id: 'delivery',
      title: '跑腿配送',
      icon: Transit,
      comingSoon: true,
      action: () => {
        Taro.showToast({
          title: '即将上线,敬请期待',
          icon: 'none',
          duration: 2000
        })
      }
    }
  ]

  /**
   * 如果已登录,添加退出登录选项
   */
  if (isLoggedIn) {
    functionList.push({
      id: 'logout',
      title: '退出登录',
      icon: Del,
      action: () => {
        Taro.showModal({
          title: '提示',
          content: '确定要退出登录吗?',
          success: (res) => {
            if (res.confirm) {
              logout()
              Taro.showToast({
                title: '已退出登录',
                icon: 'success',
                duration: 2000
              })
            }
          }
        })
      }
    })
  }

  /**
   * 加载核销券统计数据
   */
  const loadVoucherStats = useCallback(async () => {
    try {
      setLoading(true)
      setError(false)

      const stats = await getVoucherStats()

      if (stats) {
        setVoucherStats(stats)
      } else {
        setError(true)
        Taro.showToast({
          title: '加载失败,请下拉刷新重试',
          icon: 'none',
          duration: 2000
        })
      }
    } catch (err) {
      console.error('[MinePage] 加载核销券统计失败:', err)
      setError(true)
      Taro.showToast({
        title: '网络请求失败',
        icon: 'none',
        duration: 2000
      })
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * 加载最近核销券列表
   */
  const loadRecentVouchers = useCallback(async () => {
    try {
      setVouchersLoading(true)

      const vouchers = await getRecentVouchers(3)
      setRecentVouchers(vouchers)
    } catch (err) {
      console.error('[MinePage] 加载最近核销券失败:', err)
    } finally {
      setVouchersLoading(false)
    }
  }, [])

  /**
   * 加载订单统计数据
   */
  const loadOrderStats = useCallback(async () => {
    try {
      const stats = await getOrderStats()
      if (stats) {
        setOrderStats(stats)
      }
    } catch (err) {
      console.error('[MinePage] 加载订单统计失败:', err)
    }
  }, [])

  /**
   * 加载最近订单列表
   */
  const loadRecentOrders = useCallback(async () => {
    try {
      setOrdersLoading(true)

      const orders = await getRecentOrders(3)
      setRecentOrders(orders)
    } catch (err) {
      console.error('[MinePage] 加载最近订单失败:', err)
    } finally {
      setOrdersLoading(false)
    }
  }, [])

  /**
   * 加载所有数据
   */
  const loadAllData = useCallback(async () => {
    await Promise.all([
      loadVoucherStats(),
      loadRecentVouchers(),
      loadOrderStats(),
      loadRecentOrders()
    ])
  }, [loadVoucherStats, loadRecentVouchers, loadOrderStats, loadRecentOrders])

  /**
   * 页面初始化
   */
  useEffect(() => {
    if (isLoggedIn) {
      loadAllData()
    } else {
      setLoading(false)
      setVouchersLoading(false)
      setOrdersLoading(false)
    }
  }, [isLoggedIn, loadAllData])

  /**
   * 下拉刷新
   */
  usePullDownRefresh(() => {
    loadAllData().finally(() => {
      Taro.stopPullDownRefresh()
    })
  })

  /**
   * 重试加载
   */
  const handleRetry = useCallback(() => {
    loadVoucherStats()
  }, [loadVoucherStats])

  /**
   * 处理券卡片点击
   */
  const handleVoucherClick = useCallback((voucher: RecentVoucher) => {
    Taro.navigateTo({
      url: `/pages/voucher/detail/index?id=${voucher.id}`
    })
  }, [])

  /**
   * 查看全部核销券
   */
  const handleViewAllVouchers = useCallback(() => {
    Taro.navigateTo({
      url: '/pages/voucher/list/index?status=pending'
    })
  }, [])

  /**
   * 处理订单统计入口点击
   */
  const handleOrdersClick = useCallback(() => {
    Taro.navigateTo({
      url: '/pages/order/list/index'
    })
  }, [])

  /**
   * 处理订单卡片点击
   */
  const handleOrderClick = useCallback((order: RecentOrder) => {
    Taro.navigateTo({
      url: `/pages/order/detail/index?id=${order.id}`
    })
  }, [])

  /**
   * 处理功能项点击
   */
  const handleFunctionClick = useCallback((item: FunctionItem) => {
    if (item.action) {
      // 执行自定义action
      item.action()
    } else if (item.url) {
      // 跳转到指定页面
      Taro.navigateTo({
        url: item.url
      })
    }
  }, [])

  /**
   * 渲染主页面内容(登录和未登录都显示)
   */
  return (
    <View className="mine-page">
      {/* 用户信息卡片(未登录时显示"点击登录") */}
      <UserInfoCard userInfo={userInfo} isLoggedIn={isLoggedIn} />

      {/* 核销券统计卡片 */}
      {isLoggedIn ? (
        <VoucherStatsCard
          stats={voucherStats}
          loading={loading}
          onRetry={error ? handleRetry : undefined}
        />
      ) : (
        <View className="mine-page__login-guide" onClick={() => Taro.navigateTo({ url: '/pages/login/index' })}>
          <View className="mine-page__login-guide-content">
            <Text className="mine-page__login-guide-title">登录查看核销券</Text>
            <Text className="mine-page__login-guide-desc">查看待核销、已核销等券信息</Text>
          </View>
          <ArrowRight size={16} color="#999" />
        </View>
      )}

      {/* 订单统计入口 */}
      {isLoggedIn ? (
        <View className="mine-page__order-entry" onClick={handleOrdersClick}>
          <View className="mine-page__order-entry-content">
            <Text className="mine-page__order-entry-title">我的订单</Text>
            {orderStats && orderStats.total > 0 && (
              <Text className="mine-page__order-entry-count">共 {orderStats.total} 单</Text>
            )}
          </View>
          <View className="mine-page__order-entry-action">
            {orderStats && orderStats.pending > 0 && (
              <View className="mine-page__order-entry-badge">{orderStats.pending}</View>
            )}
            <ArrowRight size={16} color="#999" />
          </View>
        </View>
      ) : (
        <View className="mine-page__login-guide" onClick={() => Taro.navigateTo({ url: '/pages/login/index' })}>
          <View className="mine-page__login-guide-content">
            <Text className="mine-page__login-guide-title">登录查看订单</Text>
            <Text className="mine-page__login-guide-desc">查看订单状态、物流信息等</Text>
          </View>
          <ArrowRight size={16} color="#999" />
        </View>
      )}

      {/* 最近核销券列表 - 仅登录后显示 */}
      {isLoggedIn && (
        <View className="mine-page__recent-section">
          <View className="mine-page__section-header">
            <Text className="mine-page__section-title">最近核销券</Text>
            {!vouchersLoading && recentVouchers.length > 0 && voucherStats && voucherStats.pending > 3 && (
              <View className="mine-page__view-all" onClick={handleViewAllVouchers}>
                <Text className="mine-page__view-all-text">查看全部</Text>
                <ArrowRight size={14} color="#999" />
              </View>
            )}
          </View>

          {/* 骨架屏加载 */}
          {vouchersLoading && (
            <View className="mine-page__voucher-list">
              {[1, 2, 3].map((item) => (
                <View key={item} className="mine-page__voucher-skeleton">
                  <Skeleton width="80px" height="80px" animated />
                  <View className="mine-page__voucher-skeleton-content">
                    <Skeleton width="60%" height="20px" animated />
                    <Skeleton width="40%" height="16px" animated style={{ marginTop: '8px' }} />
                    <Skeleton width="50%" height="14px" animated style={{ marginTop: '8px' }} />
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* 券列表 */}
          {!vouchersLoading && recentVouchers.length > 0 && (
            <View className="mine-page__voucher-list">
              {recentVouchers.map((voucher) => (
                <View
                  key={voucher.id}
                  className="mine-page__voucher-item"
                  onClick={() => handleVoucherClick(voucher)}
                >
                  <Image
                    className="mine-page__voucher-image"
                    src={voucher.productImage}
                    mode="aspectFill"
                    lazyLoad
                  />
                  <View className="mine-page__voucher-content">
                    <Text className="mine-page__voucher-title">{voucher.title}</Text>
                    <Text className="mine-page__voucher-product">{voucher.productName}</Text>
                    <View className="mine-page__voucher-footer">
                      <Text className="mine-page__voucher-expire">
                        剩余 {voucher.daysRemaining} 天
                      </Text>
                    </View>
                  </View>
                  <ArrowRight size={16} color="#ccc" className="mine-page__voucher-arrow" />
                </View>
              ))}
            </View>
          )}

          {/* 空状态 */}
          {!vouchersLoading && recentVouchers.length === 0 && (
            <View className="mine-page__empty-vouchers">
              <Empty description="暂无待核销券" />
              <Button
                type="primary"
                size="small"
                onClick={handleViewAllVouchers}
                style={{ marginTop: '16px' }}
              >
                查看已核销券
              </Button>
            </View>
          )}
        </View>
      )}

      {/* 最近订单列表 - 仅登录后显示 */}
      {isLoggedIn && (
        <View className="mine-page__recent-section">
          <View className="mine-page__section-header">
            <Text className="mine-page__section-title">最近订单</Text>
            {!ordersLoading && recentOrders.length > 0 && (
              <View className="mine-page__view-all" onClick={handleOrdersClick}>
                <Text className="mine-page__view-all-text">查看全部</Text>
                <ArrowRight size={14} color="#999" />
              </View>
            )}
          </View>

          {/* 骨架屏加载 */}
          {ordersLoading && (
            <View className="mine-page__voucher-list">
              {[1, 2, 3].map((item) => (
                <View key={item} className="mine-page__voucher-skeleton">
                  <Skeleton width="80px" height="80px" animated />
                  <View className="mine-page__voucher-skeleton-content">
                    <Skeleton width="60%" height="20px" animated />
                    <Skeleton width="40%" height="16px" animated style={{ marginTop: '8px' }} />
                    <Skeleton width="50%" height="14px" animated style={{ marginTop: '8px' }} />
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* 订单列表 */}
          {!ordersLoading && recentOrders.length > 0 && (
            <View className="mine-page__voucher-list">
              {recentOrders.map((order) => (
                <View
                  key={order.id}
                  className="mine-page__voucher-item"
                  onClick={() => handleOrderClick(order)}
                >
                  <Image
                    className="mine-page__voucher-image"
                    src={order.productImage}
                    mode="aspectFill"
                    lazyLoad
                  />
                  <View className="mine-page__voucher-content">
                    <Text className="mine-page__voucher-title">订单号: {order.orderNo}</Text>
                    <Text className="mine-page__voucher-product">{order.productName}</Text>
                    <View className="mine-page__voucher-footer">
                      <Text className="mine-page__voucher-expire">{order.statusText}</Text>
                    </View>
                  </View>
                  <ArrowRight size={16} color="#ccc" className="mine-page__voucher-arrow" />
                </View>
              ))}
            </View>
          )}

          {/* 空状态 */}
          {!ordersLoading && recentOrders.length === 0 && (
            <View className="mine-page__empty-vouchers">
              <Empty description="暂无订单" />
              <Button
                type="primary"
                size="small"
                onClick={handleOrdersClick}
                style={{ marginTop: '16px' }}
              >
                去购买
              </Button>
            </View>
          )}
        </View>
      )}

      {/* 功能列表 */}
      <View className="mine-page__function-section">
        {functionList.map((item) => (
          <FunctionListItem key={item.id} item={item} onClick={handleFunctionClick} />
        ))}
      </View>

      {/* 其他功能区域 - 待后续实现 */}
    </View>
  )
}

export default Mine


