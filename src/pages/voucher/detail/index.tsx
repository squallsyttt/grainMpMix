/**
 * 核销券详情页面
 *
 * 展示核销券完整信息,包括二维码、门店列表等
 */

import React, { useState, useEffect } from 'react'
import { View, Text, Image } from '@tarojs/components'
import { Divider, Skeleton, Tag } from '@nutui/nutui-react-taro'
import { ArrowRight, Clock } from '@nutui/icons-react-taro'
import Taro, { useLoad, useRouter, usePullDownRefresh } from '@tarojs/taro'
import VoucherQRCode from '../../../components/VoucherQRCode'
import StoreList from '../../../components/StoreList'
import ExpireWarning from '../../../components/ExpireWarning'
import { VoucherDetail, VoucherStatus, VoucherType } from '../../../types/voucher'
import { StoreListItem } from '../../../types/store'
import { getVoucherDetail } from '../../../services/voucher'
import { getStoreList } from '../../../services/store'
import { API_ERROR_CODE } from '../../../types/api'
import {
  formatTimestamp,
  formatExpireTime,
  getExpireDays,
  isExpiringSoon
} from '../../../utils/date'
import { getCurrentLocation } from '../../../utils/location'
import { showError, showLoading, hideLoading } from '../../../utils/error'
import { safeGoBack } from '../../../utils/navigation'
import { mockVoucherDetail } from '../../../data/mock/voucher'
import { mockStoreList } from '../../../data/mock/store'
import './index.less'

/**
 * 核销券详情页面
 */
const VoucherDetailPage: React.FC = () => {
  const router = useRouter()
  const voucherId = parseInt(router.params.id || '0', 10)

  const [voucher, setVoucher] = useState<VoucherDetail | null>(null)
  const [stores, setStores] = useState<StoreListItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [storesLoading, setStoresLoading] = useState<boolean>(true)

  /**
   * 加载核销券详情
   */
  const loadVoucherDetail = async () => {
    if (!voucherId) {
      showError('券ID无效')
      setTimeout(() => safeGoBack(), 1500)
      return
    }

    try {
      setLoading(true)

      // 使用Mock数据（开发调试）
      console.log('[VoucherDetail] 使用Mock数据')
      await new Promise(resolve => setTimeout(resolve, 500))

      setVoucher(mockVoucherDetail)

      // 加载门店列表
      loadStores(mockVoucherDetail.store_id)
    } catch (error) {
      console.error('[VoucherDetail] 加载失败:', error)
      showError('加载失败,请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  /**
   * 加载门店列表
   */
  const loadStores = async (storeId: number) => {
    try {
      setStoresLoading(true)

      // 使用Mock数据（开发调试）
      console.log('[VoucherDetail] 使用Mock门店数据')
      await new Promise(resolve => setTimeout(resolve, 300))

      setStores(mockStoreList)
    } catch (error) {
      console.error('[VoucherDetail] 加载门店失败:', error)
    } finally {
      setStoresLoading(false)
    }
  }

  /**
   * 下拉刷新
   */
  usePullDownRefresh(() => {
    loadVoucherDetail().finally(() => {
      Taro.stopPullDownRefresh()
    })
  })

  /**
   * 页面加载
   */
  useLoad(() => {
    loadVoucherDetail()
  })

  /**
   * 监听核销成功事件
   */
  useEffect(() => {
    // 核销成功事件处理
    const handleWriteOffSuccess = (data: any) => {
      console.log('[VoucherDetail] 收到核销成功事件:', data)

      // 如果是当前查看的券,更新状态
      if (data.voucherId === voucherId) {
        setVoucher(data.voucher)

        // 显示提示
        Taro.showToast({
          title: '该券已被核销',
          icon: 'success',
          duration: 2000
        })
      }
    }

    // 注册事件监听
    Taro.eventCenter.on('voucher:writeoff:success', handleWriteOffSuccess)

    // 组件卸载时移除监听
    return () => {
      Taro.eventCenter.off('voucher:writeoff:success', handleWriteOffSuccess)
    }
  }, [voucherId])

  /**
   * 跳转订单详情
   */
  const handleGoToOrder = () => {
    if (voucher?.order_id) {
      Taro.navigateTo({
        url: `/pages/order/detail/index?id=${voucher.order_id}`
      })
    }
  }

  /**
   * 渲染骨架屏
   */
  const renderSkeleton = () => {
    return (
      <View className="voucher-detail__skeleton">
        <Skeleton width="100%" height="200px" animated />
        <Skeleton width="100%" height="300px" animated style={{ marginTop: '12px' }} />
        <Skeleton width="100%" height="200px" animated style={{ marginTop: '12px' }} />
      </View>
    )
  }

  if (loading || !voucher) {
    return renderSkeleton()
  }

  const expireDays = getExpireDays(voucher.expire_at)
  const expiring = isExpiringSoon(voucher.expire_at)
  const isUsed = voucher.status === VoucherStatus.USED
  const isExpired = voucher.status === VoucherStatus.EXPIRED

  return (
    <View className="voucher-detail">
      {/* 基本信息卡片 */}
      <View className="voucher-detail__card">
        <View className="voucher-detail__header">
          <Text className="voucher-detail__title">{voucher.title}</Text>
          <Tag
            type={isUsed || isExpired ? 'default' : 'primary'}
            size="small"
          >
            {isUsed ? '已核销' : isExpired ? '已过期' : '待核销'}
          </Tag>
        </View>

        <Text className="voucher-detail__description">{voucher.description}</Text>

        {/* 金额/折扣 */}
        <View className="voucher-detail__value-row">
          {voucher.type === VoucherType.CASH && voucher.amount && (
            <Text className="voucher-detail__value">
              ¥{voucher.amount.toFixed(2)}
            </Text>
          )}
          {voucher.type === VoucherType.DISCOUNT && voucher.discount && (
            <Text className="voucher-detail__value">
              {(voucher.discount * 10).toFixed(1)}折
            </Text>
          )}
        </View>

        {/* 有效期 */}
        <View className="voucher-detail__expire-row">
          <Clock size={14} color="#999999" />
          <Text className={`voucher-detail__expire ${expiring ? 'voucher-detail__expire--warning' : ''}`}>
            {isExpired
              ? `已于 ${formatTimestamp(voucher.expire_at, 'YYYY-MM-DD')} 过期`
              : `有效期至 ${formatTimestamp(voucher.expire_at, 'YYYY-MM-DD HH:mm')}`
            }
          </Text>
        </View>

        {/* 过期警告(使用新组件) */}
        {!isExpired && !isUsed && (
          <ExpireWarning
            expireAt={voucher.expire_at}
            showCountdown={true}
            autoRefresh={true}
            refreshInterval={30000}
          />
        )}
      </View>

      <Divider />

      {/* 二维码 */}
      <View className="voucher-detail__qrcode-section">
        <View className="voucher-detail__section-title">
          <Text>核销二维码</Text>
        </View>
        <VoucherQRCode
          code={voucher.code}
          status={voucher.status}
        />
      </View>

      <Divider />

      {/* 订单信息 */}
      {voucher.order_no && (
        <>
          <View className="voucher-detail__section">
            <View className="voucher-detail__section-title">
              <Text>订单信息</Text>
            </View>
            <View className="voucher-detail__order-row" onClick={handleGoToOrder}>
              <Text className="voucher-detail__label">订单号:</Text>
              <Text className="voucher-detail__order-no">{voucher.order_no}</Text>
              <ArrowRight size={14} />
            </View>
          </View>
          <Divider />
        </>
      )}

      {/* 核销记录(已核销券) */}
      {isUsed && voucher.used_at && (
        <>
          <View className="voucher-detail__section">
            <View className="voucher-detail__section-title">
              <Text>核销记录</Text>
            </View>
            <View className="voucher-detail__info-row">
              <Text className="voucher-detail__label">核销时间:</Text>
              <Text className="voucher-detail__value-text">
                {formatTimestamp(voucher.used_at, 'YYYY-MM-DD HH:mm')}
              </Text>
            </View>
            {voucher.store_name && (
              <View className="voucher-detail__info-row">
                <Text className="voucher-detail__label">核销门店:</Text>
                <Text className="voucher-detail__value-text">{voucher.store_name}</Text>
              </View>
            )}
          </View>
          <Divider />
        </>
      )}

      {/* 可核销门店列表 */}
      {!isExpired && (
        <View className="voucher-detail__section">
          <View className="voucher-detail__section-title">
            <Text>可核销门店</Text>
          </View>
          {storesLoading ? (
            <Skeleton width="100%" height="150px" animated />
          ) : (
            <StoreList stores={stores} />
          )}
        </View>
      )}
    </View>
  )
}

export default VoucherDetailPage
