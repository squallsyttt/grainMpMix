/**
 * 订单列表页面
 *
 * 展示用户的订单列表,支持按状态筛选、下拉刷新、滚动加载
 */

import React, { useState, useCallback } from 'react'
import { View, Text } from '@tarojs/components'
import { Tabs, Empty, Button, Skeleton } from '@nutui/nutui-react-taro'
import { ArrowRight } from '@nutui/icons-react-taro'
import Taro, { useLoad, usePullDownRefresh, useReachBottom } from '@tarojs/taro'
import OrderCard from '../../../components/OrderCard'
import { OrderListItem, OrderStatus } from '../../../types/order'
import { getOrderList } from '../../../services/order'
import { API_ERROR_CODE } from '../../../types/api'
import { showError } from '../../../utils/error'
import { useDebounce } from '../../../utils/hooks'
import { mockOrderList } from '../../../data/mock/order'
import './index.less'

/**
 * Tab标签配置
 */
const TAB_LIST = [
  { title: '全部', value: 'all' },
  { title: '已支付', value: OrderStatus.PAID },
  { title: '已核销', value: OrderStatus.VERIFIED }
]

/**
 * 订单列表页面
 */
const OrderListPage: React.FC = () => {
  // 状态管理
  const [activeTab, setActiveTab] = useState<string>('all')
  const [orderList, setOrderList] = useState<OrderListItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const [loadingMore, setLoadingMore] = useState<boolean>(false)
  const [hasMore, setHasMore] = useState<boolean>(true)
  const [page, setPage] = useState<number>(1)
  const [total, setTotal] = useState<number>(0)

  /**
   * 加载订单列表
   *
   * @param currentPage - 当前页码
   * @param status - 筛选状态
   * @param isRefresh - 是否刷新
   */
  const loadOrderList = useCallback(async (
    currentPage: number,
    status: string,
    isRefresh = false
  ) => {
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else if (currentPage === 1) {
        setLoading(true)
      } else {
        setLoadingMore(true)
      }

      // 使用Mock数据（开发调试）
      console.log('[OrderList] 使用Mock数据')
      await new Promise(resolve => setTimeout(resolve, 500))

      // 根据状态筛选数据
      let filteredData = mockOrderList
      if (status !== 'all') {
        filteredData = mockOrderList.filter(item => item.status === status)
      }

      if (isRefresh || currentPage === 1) {
        setOrderList(filteredData)
      } else {
        setOrderList(prev => [...prev, ...filteredData])
      }

      setTotal(filteredData.length)
      setPage(1)
      setHasMore(false) // Mock数据只有一页
    } catch (error) {
      console.error('[OrderList] 加载失败:', error)
      showError('加载失败,请稍后重试')
      setHasMore(false)
    } finally {
      setLoading(false)
      setRefreshing(false)
      setLoadingMore(false)
    }
  }, [])

  /**
   * Tab切换事件(防抖前)
   *
   * @param value - Tab值
   */
  const handleTabChangeRaw = useCallback((value: string) => {
    setActiveTab(value)
    setPage(1)
    setHasMore(true)
    loadOrderList(1, value)
  }, [loadOrderList])

  /**
   * Tab切换事件(防抖后,300ms)
   */
  const handleTabChange = useDebounce(handleTabChangeRaw, 300, [handleTabChangeRaw])

  /**
   * 下拉刷新事件
   */
  usePullDownRefresh(() => {
    console.log('[OrderList] 下拉刷新')
    loadOrderList(1, activeTab, true).finally(() => {
      Taro.stopPullDownRefresh()
    })
  })

  /**
   * 触底加载更多
   */
  useReachBottom(() => {
    if (!loading && !loadingMore && hasMore) {
      console.log('[OrderList] 加载更多')
      loadOrderList(page + 1, activeTab)
    }
  })

  /**
   * 页面加载时
   */
  useLoad(() => {
    console.log('[OrderList] 页面加载')
    loadOrderList(1, activeTab)
  })

  /**
   * 跳转到首页商城
   */
  const handleGoToShop = () => {
    Taro.switchTab({ url: '/pages/index/index' })
  }

  /**
   * 渲染骨架屏
   */
  const renderSkeleton = () => {
    return (
      <View className="order-list__skeleton">
        {[1, 2, 3].map(item => (
          <View key={item} className="order-list__skeleton-item">
            <Skeleton width="100%" height="160px" animated />
          </View>
        ))}
      </View>
    )
  }

  /**
   * 渲染空状态
   */
  const renderEmpty = () => {
    return (
      <View className="order-list__empty">
        <Empty
          description="暂无订单"
          imageSize={120}
        />
        <Button
          type="primary"
          size="small"
          className="order-list__empty-button"
          onClick={handleGoToShop}
        >
          去商城逛逛吧
          <ArrowRight />
        </Button>
      </View>
    )
  }

  /**
   * 渲染列表
   */
  const renderList = () => {
    if (orderList.length === 0) {
      return renderEmpty()
    }

    return (
      <View className="order-list__content">
        {orderList.map(order => (
          <OrderCard key={order.id} order={order} />
        ))}

        {/* 加载更多提示 */}
        {loadingMore && (
          <View className="order-list__loading-more">
            <Text>加载中...</Text>
          </View>
        )}

        {/* 没有更多数据提示 */}
        {!hasMore && orderList.length > 0 && (
          <View className="order-list__no-more">
            <Text>没有更多了</Text>
          </View>
        )}
      </View>
    )
  }

  return (
    <View className="order-list">
      {/* 顶部Tab栏 */}
      <View className="order-list__tabs">
        <Tabs
          value={activeTab}
          onChange={(value) => handleTabChange(value as string)}
        >
          {TAB_LIST.map(tab => (
            <Tabs.TabPane key={tab.value} title={tab.title} value={tab.value}>
              {/* Tab内容在下方统一渲染 */}
            </Tabs.TabPane>
          ))}
        </Tabs>
      </View>

      {/* 列表内容 */}
      <View className="order-list__container">
        {loading ? renderSkeleton() : renderList()}
      </View>
    </View>
  )
}

export default OrderListPage
