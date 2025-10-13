/**
 * 核销券列表页面
 *
 * 展示用户的核销券列表,支持按状态筛选、下拉刷新、滚动加载
 */

import React, { useState, useEffect, useCallback } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import { Tabs, Empty, Button, Skeleton } from '@nutui/nutui-react-taro'
import { ArrowRight } from '@nutui/icons-react-taro'
import Taro, { useLoad, usePullDownRefresh, useReachBottom } from '@tarojs/taro'
import VoucherCard from '../../../components/VoucherCard'
import { VoucherListItem, VoucherStatus } from '../../../types/voucher'
import { getVoucherList } from '../../../services/voucher'
import { API_ERROR_CODE } from '../../../types/api'
import { showError, showLoading, hideLoading } from '../../../utils/error'
import { useDebounce } from '../../../utils/hooks'
import { mockVoucherList } from '../../../data/mock/voucher'
import './index.less'

/**
 * Tab标签配置
 */
const TAB_LIST = [
  { title: '全部', value: 'all' },
  { title: '待核销', value: VoucherStatus.UNUSED },
  { title: '已核销', value: VoucherStatus.USED },
  { title: '已过期', value: VoucherStatus.EXPIRED }
]

/**
 * 核销券列表页面
 */
const VoucherListPage: React.FC = () => {
  // 状态管理
  const [activeTab, setActiveTab] = useState<string>('all')
  const [voucherList, setVoucherList] = useState<VoucherListItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const [loadingMore, setLoadingMore] = useState<boolean>(false)
  const [hasMore, setHasMore] = useState<boolean>(true)
  const [page, setPage] = useState<number>(1)
  const [total, setTotal] = useState<number>(0)

  /**
   * 加载核销券列表
   *
   * @param currentPage - 当前页码
   * @param status - 筛选状态
   * @param isRefresh - 是否刷新
   */
  const loadVoucherList = useCallback(async (
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
      console.log('[VoucherList] 使用Mock数据')
      await new Promise(resolve => setTimeout(resolve, 500)) // 模拟网络延迟

      // 根据状态筛选数据
      let filteredData = mockVoucherList
      if (status !== 'all') {
        filteredData = mockVoucherList.filter(item => item.status === status)
      }

      if (isRefresh || currentPage === 1) {
        setVoucherList(filteredData)
      } else {
        setVoucherList(prev => [...prev, ...filteredData])
      }

      setTotal(filteredData.length)
      setPage(1)
      setHasMore(false) // Mock数据只有一页
    } catch (error) {
      console.error('[VoucherList] 加载失败:', error)
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
    loadVoucherList(1, value)
  }, [loadVoucherList])

  /**
   * Tab切换事件(防抖后,300ms)
   */
  const handleTabChange = useDebounce(handleTabChangeRaw, 300, [handleTabChangeRaw])

  /**
   * 下拉刷新事件
   */
  usePullDownRefresh(() => {
    console.log('[VoucherList] 下拉刷新')
    loadVoucherList(1, activeTab, true).finally(() => {
      Taro.stopPullDownRefresh()
    })
  })

  /**
   * 触底加载更多
   */
  useReachBottom(() => {
    if (!loading && !loadingMore && hasMore) {
      console.log('[VoucherList] 加载更多')
      loadVoucherList(page + 1, activeTab)
    }
  })

  /**
   * 页面加载时
   */
  useLoad(() => {
    console.log('[VoucherList] 页面加载')
    loadVoucherList(1, activeTab)
  })

  /**
   * 监听核销成功事件
   */
  useEffect(() => {
    // 核销成功事件处理
    const handleWriteOffSuccess = (data: any) => {
      console.log('[VoucherList] 收到核销成功事件:', data)

      // 自动刷新列表
      loadVoucherList(1, activeTab, true)

      // 显示提示
      Taro.showToast({
        title: '核销成功,列表已刷新',
        icon: 'success',
        duration: 2000
      })
    }

    // 注册事件监听
    Taro.eventCenter.on('voucher:writeoff:success', handleWriteOffSuccess)

    // 组件卸载时移除监听
    return () => {
      Taro.eventCenter.off('voucher:writeoff:success', handleWriteOffSuccess)
    }
  }, [activeTab, loadVoucherList])

  /**
   * 跳转到商城
   */
  const handleGoToShop = () => {
    Taro.switchTab({ url: '/pages/index/index' })
  }

  /**
   * 渲染骨架屏
   */
  const renderSkeleton = () => {
    return (
      <View className="voucher-list__skeleton">
        {[1, 2, 3].map(item => (
          <View key={item} className="voucher-list__skeleton-item">
            <Skeleton width="100%" height="140px" animated />
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
      <View className="voucher-list__empty">
        <Empty
          description="暂无核销券"
          imageSize={120}
        />
        <Button
          type="primary"
          size="small"
          className="voucher-list__empty-button"
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
    if (voucherList.length === 0) {
      return renderEmpty()
    }

    return (
      <View className="voucher-list__content">
        {voucherList.map(voucher => (
          <VoucherCard key={voucher.id} voucher={voucher} />
        ))}

        {/* 加载更多提示 */}
        {loadingMore && (
          <View className="voucher-list__loading-more">
            <Text>加载中...</Text>
          </View>
        )}

        {/* 没有更多数据提示 */}
        {!hasMore && voucherList.length > 0 && (
          <View className="voucher-list__no-more">
            <Text>没有更多了</Text>
          </View>
        )}
      </View>
    )
  }

  return (
    <View className="voucher-list">
      {/* 顶部Tab栏 */}
      <View className="voucher-list__tabs">
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
      <View className="voucher-list__container">
        {loading ? renderSkeleton() : renderList()}
      </View>
    </View>
  )
}

export default VoucherListPage
