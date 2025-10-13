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
import { View } from '@tarojs/components'
import Taro, { usePullDownRefresh } from '@tarojs/taro'
import { Empty } from '@nutui/nutui-react-taro'
import { useUser } from '@/contexts/UserContext'
import VoucherStatsCard from '@/components/VoucherStatsCard'
import { getVoucherStats } from '@/services/user'
import { VoucherStats } from '@/types/stats'
import './index.less'

/**
 * 个人中心页面组件
 */
function Mine(): React.ReactElement {
  const { userInfo, isLoggedIn } = useUser()
  const [voucherStats, setVoucherStats] = useState<VoucherStats | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<boolean>(false)

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
   * 页面初始化
   */
  useEffect(() => {
    if (isLoggedIn) {
      loadVoucherStats()
    } else {
      setLoading(false)
    }
  }, [isLoggedIn, loadVoucherStats])

  /**
   * 下拉刷新
   */
  usePullDownRefresh(() => {
    loadVoucherStats().finally(() => {
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
   * 未登录状态
   */
  if (!isLoggedIn) {
    return (
      <View className="mine-page">
        <View className="mine-page__login-prompt">
          <Empty description="请先登录" />
          <View
            className="mine-page__login-btn"
            onClick={() => Taro.navigateTo({ url: '/pages/login/index' })}
          >
            立即登录
          </View>
        </View>
      </View>
    )
  }

  /**
   * 已登录状态
   */
  return (
    <View className="mine-page">
      {/* 用户信息区域 - 待后续实现 */}
      <View className="mine-page__header">
        <View className="mine-page__user-info">
          <View className="mine-page__nickname">{userInfo?.nickname || '用户'}</View>
        </View>
      </View>

      {/* 核销券统计卡片 */}
      <VoucherStatsCard
        stats={voucherStats}
        loading={loading}
        onRetry={error ? handleRetry : undefined}
      />

      {/* 其他功能区域 - 待后续实现 */}
    </View>
  )
}

export default Mine


