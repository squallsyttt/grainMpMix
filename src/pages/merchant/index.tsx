/**
 * 商家列表页
 *
 * 展示用户所在区域的商家列表,支持无限滚动加载
 */

import React, { useState, useEffect, useCallback } from 'react'
import { View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { InfiniteLoading, Skeleton } from '@nutui/nutui-react-taro'
import RegionBar from '../../components/RegionBar'
import RegionSelector from '../../components/RegionSelector'
import MerchantCard from '../../components/MerchantCard'
import EmptyState from '../../components/EmptyState'
import { useRegion } from '../../contexts/RegionContext'
import { getMerchantList } from '../../services/merchant'
import { MerchantListItem } from '../../types/merchant'
import { DEFAULT_PAGE_SIZE } from '../../utils/constants'
import './index.less'

/**
 * 商家列表页组件
 */
const Merchant: React.FC = () => {
  const { province, city, showSelector, closeSelector, setRegion } =
    useRegion()

  const [merchants, setMerchants] = useState<MerchantListItem[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState<string | null>(null)

  /**
   * 加载商家列表
   */
  const loadMerchants = useCallback(
    async (pageNum: number, isRefresh = false) => {
      if (loading) return

      try {
        setLoading(true)
        setError(null)

        const response = await getMerchantList({
          province,
          city,
          page: pageNum,
          limit: DEFAULT_PAGE_SIZE,
          filter: JSON.stringify({ is_active: 1 }),
        })

        if (response.code === 0 && response.data) {
          const newMerchants = response.data.data

          setMerchants((prev) =>
            isRefresh ? newMerchants : [...prev, ...newMerchants]
          )

          // 判断是否还有更多数据
          setHasMore(
            response.data.current_page < response.data.last_page
          )
        } else {
          throw new Error(response.msg || '获取商家列表失败')
        }
      } catch (err) {
        console.error('[Merchant] 加载商家列表失败:', err)
        const errorMessage = err instanceof Error ? err.message : '加载失败'
        setError(errorMessage)
        Taro.showToast({
          title: errorMessage,
          icon: 'none',
          duration: 2000,
        })
      } finally {
        setLoading(false)
      }
    },
    [province, city, loading]
  )

  /**
   * 处理下拉刷新
   */
  const handleRefresh = useCallback(async () => {
    setPage(1)
    setHasMore(true)
    await loadMerchants(1, true)
  }, [loadMerchants])

  /**
   * 处理加载更多
   */
  const handleLoadMore = useCallback(async () => {
    if (hasMore && !loading) {
      const nextPage = page + 1
      setPage(nextPage)
      await loadMerchants(nextPage)
    }
  }, [hasMore, loading, page, loadMerchants])

  /**
   * 处理商家卡片点击
   */
  const handleMerchantClick = useCallback((merchant: MerchantListItem) => {
    Taro.navigateTo({
      url: `/pages/merchant-detail/index?id=${merchant.id}`,
    })
  }, [])

  /**
   * 处理区域选择器打开
   */
  const handleOpenSelector = () => {
    // 由RegionBar处理
  }

  /**
   * 初始化加载
   */
  useEffect(() => {
    if (province || city) {
      handleRefresh()
    }
  }, [province, city])

  // 如果没有选择区域
  if (!province && !city) {
    return (
      <View className="merchant-page">
        <RegionBar />
        <EmptyState
          description="请先选择您所在的地区"
          imageType="empty"
          actions={[
            {
              text: '选择地区',
              type: 'primary',
              onClick: handleOpenSelector,
            },
          ]}
        />
        <RegionSelector
          visible={showSelector}
          onClose={closeSelector}
          onConfirm={setRegion}
          defaultProvince={province}
          defaultCity={city}
        />
      </View>
    )
  }

  return (
    <View className="merchant-page">
      <RegionBar />

      <View className="merchant-page__content">
        {/* 骨架屏 */}
        {loading && merchants.length === 0 && (
          <View className="merchant-page__skeleton">
            <Skeleton rows={3} animated />
            <Skeleton rows={3} animated />
            <Skeleton rows={3} animated />
          </View>
        )}

        {/* 商家列表 */}
        {merchants.length > 0 && (
          <View className="merchant-page__list">
            {merchants.map((merchant) => (
              <MerchantCard
                key={merchant.id}
                merchant={merchant}
                onClick={handleMerchantClick}
              />
            ))}
          </View>
        )}

        {/* 无限滚动加载 */}
        {merchants.length > 0 && (
          <InfiniteLoading
            target="scroller"
            hasMore={hasMore}
            onLoadMore={handleLoadMore}
          />
        )}

        {/* 空状态 */}
        {!loading && merchants.length === 0 && !error && (
          <EmptyState
            description="您所在区域暂无商家入驻,敬请期待"
            imageType="empty"
          />
        )}

        {/* 错误状态 */}
        {!loading && error && merchants.length === 0 && (
          <EmptyState
            description={error}
            imageType="error"
            actions={[
              {
                text: '重新加载',
                type: 'primary',
                onClick: handleRefresh,
              },
            ]}
          />
        )}
      </View>

      {/* 地区选择弹窗 */}
      <RegionSelector
        visible={showSelector}
        onClose={closeSelector}
        onConfirm={setRegion}
        defaultProvince={province}
        defaultCity={city}
      />
    </View>
  )
}

export default Merchant
