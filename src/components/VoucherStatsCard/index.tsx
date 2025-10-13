/**
 * 核销券统计卡片组件
 * Feature: 核销券个人中心主页
 *
 * 展示核销券的状态统计(待核销/已核销/已过期),支持点击跳转到对应状态的券列表
 */

import React from 'react'
import { View } from '@tarojs/components'
import { Card, Tag } from '@nutui/nutui-react-taro'
import Taro from '@tarojs/taro'
import { VoucherStats } from '@/types/stats'
import './index.less'

/**
 * 组件属性
 */
interface VoucherStatsCardProps {
  /** 核销券统计数据 */
  stats: VoucherStats | null
  /** 加载中状态 */
  loading?: boolean
  /** 加载失败回调 */
  onRetry?: () => void
}

/**
 * 核销券统计卡片组件
 *
 * @example
 * ```tsx
 * <VoucherStatsCard
 *   stats={voucherStats}
 *   loading={loading}
 *   onRetry={handleRetry}
 * />
 * ```
 */
const VoucherStatsCard: React.FC<VoucherStatsCardProps> = React.memo(({ stats, loading, onRetry }) => {
  /**
   * 处理状态卡片点击
   */
  const handleStatClick = (status: string) => {
    Taro.navigateTo({
      url: `/pages/voucher/list/index?status=${status}`
    })
  }

  /**
   * 渲染空状态
   */
  if (!loading && !stats) {
    return (
      <Card className="voucher-stats-card voucher-stats-card--empty">
        <View className="voucher-stats-card__empty-content">
          <View className="voucher-stats-card__empty-text">暂无核销券</View>
          {onRetry && (
            <View className="voucher-stats-card__retry-btn" onClick={onRetry}>
              点击重试
            </View>
          )}
        </View>
      </Card>
    )
  }

  /**
   * 渲染统计卡片
   */
  return (
    <Card className="voucher-stats-card">
      <View className="voucher-stats-card__title">我的核销券</View>
      <View className="voucher-stats-card__stats">
        {/* 待核销 */}
        <View
          className="voucher-stats-card__stat-item"
          onClick={() => handleStatClick('pending')}
        >
          <View className="voucher-stats-card__stat-value">
            {loading ? '--' : stats?.pending || 0}
            {!loading && stats && stats.expiringSoon > 0 && (
              <View className="voucher-stats-card__badge"></View>
            )}
          </View>
          <View className="voucher-stats-card__stat-label">待核销</View>
          {!loading && stats && stats.expiringSoon > 0 && (
            <Tag
              type="danger"
              size="small"
              className="voucher-stats-card__expiring-tag"
            >
              {stats.expiringSoon}张即将过期
            </Tag>
          )}
        </View>

        {/* 已核销 */}
        <View
          className="voucher-stats-card__stat-item"
          onClick={() => handleStatClick('used')}
        >
          <View className="voucher-stats-card__stat-value">
            {loading ? '--' : stats?.used || 0}
          </View>
          <View className="voucher-stats-card__stat-label">已核销</View>
        </View>

        {/* 已过期 */}
        <View
          className="voucher-stats-card__stat-item"
          onClick={() => handleStatClick('expired')}
        >
          <View className="voucher-stats-card__stat-value">
            {loading ? '--' : stats?.expired || 0}
          </View>
          <View className="voucher-stats-card__stat-label">已过期</View>
        </View>
      </View>
    </Card>
  )
})

VoucherStatsCard.displayName = 'VoucherStatsCard'

export default VoucherStatsCard
