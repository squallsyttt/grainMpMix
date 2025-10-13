/**
 * 商家扫码核销页面
 *
 * 商家通过扫码核销用户的核销券
 */

import React, { useState } from 'react'
import { View, Text } from '@tarojs/components'
import { Button, Tag, Skeleton } from '@nutui/nutui-react-taro'
import { Scan, Success, Failure, Clock } from '@nutui/icons-react-taro'
import Taro, { useLoad } from '@tarojs/taro'
import { VoucherDetail, VoucherStatus, VoucherType } from '../../types/voucher'
import { getVoucherByCode, writeOffVoucher } from '../../services/voucher'
import { API_ERROR_CODE } from '../../types/api'
import { formatTimestamp, isExpiringSoon } from '../../utils/date'
import { showError, showSuccess, showLoading, hideLoading, showConfirm } from '../../utils/error'
import { mockVoucherDetail, mockUsedVoucherDetail } from '../../data/mock/voucher'
import './index.less'

/**
 * 商家扫码核销页面
 */
const MerchantScanPage: React.FC = () => {
  const [voucher, setVoucher] = useState<VoucherDetail | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [scanning, setScanning] = useState<boolean>(false)
  const [writeOffing, setWriteOffing] = useState<boolean>(false)

  /**
   * 页面加载
   */
  useLoad(() => {
    console.log('[MerchantScan] 页面加载')
  })

  /**
   * 调用扫码
   */
  const handleScanCode = async (): Promise<void> => {
    try {
      setScanning(true)

      // 开发调试：显示选择对话框模拟扫码
      const { confirm } = await Taro.showModal({
        title: '模拟扫码（开发调试）',
        content: '选择要扫描的券类型',
        confirmText: '待核销券',
        cancelText: '已核销券'
      })

      // 模拟扫码延迟
      await new Promise(resolve => setTimeout(resolve, 500))

      // 根据选择使用不同的mock数据
      const voucherCode = confirm ? 'VCH20250112001' : 'VCH20250112003'

      // 加载券详情
      await loadVoucherByCode(voucherCode)
    } catch (error: any) {
      console.error('[MerchantScan] 扫码失败:', error)

      // 用户取消扫码不显示错误
      if (error.errMsg && !error.errMsg.includes('cancel')) {
        showError('扫码失败,请重试')
      }
    } finally {
      setScanning(false)
    }
  }

  /**
   * 根据券码加载券详情
   *
   * @param code - 券码
   */
  const loadVoucherByCode = async (code: string): Promise<void> => {
    try {
      setLoading(true)

      // 使用Mock数据（开发调试）
      console.log('[MerchantScan] 使用Mock数据, 券码:', code)
      await new Promise(resolve => setTimeout(resolve, 500))

      // 根据券码返回不同的mock数据
      const mockData = code === 'VCH20250112003' ? mockUsedVoucherDetail : mockVoucherDetail
      setVoucher(mockData)
    } catch (error) {
      console.error('[MerchantScan] 获取券详情失败:', error)
      showError('获取券信息失败,请重试')
      setVoucher(null)
    } finally {
      setLoading(false)
    }
  }

  /**
   * 确认核销
   */
  const handleConfirmWriteOff = async (): Promise<void> => {
    if (!voucher) return

    // 二次确认
    const confirmed = await showConfirm(
      '确认核销',
      `确认核销券码 ${voucher.code} 吗？核销后不可撤销。`
    )

    if (!confirmed) return

    try {
      setWriteOffing(true)
      showLoading('核销中...')

      // 模拟核销（开发调试）
      console.log('[MerchantScan] 模拟核销')
      await new Promise(resolve => setTimeout(resolve, 1000))

      hideLoading()
      showSuccess('核销成功')

      // 更新券状态为已核销
      const updatedVoucher = {
        ...voucher,
        status: VoucherStatus.USED,
        used_at: Math.floor(Date.now() / 1000)
      }
      setVoucher(updatedVoucher)

      // 发送核销成功事件,通知其他页面更新
      Taro.eventCenter.trigger('voucher:writeoff:success', {
        voucherId: voucher.id,
        voucher: updatedVoucher
      })

      // 3秒后清空页面,准备扫描下一个
      setTimeout(() => {
        setVoucher(null)
      }, 3000)
    } catch (error) {
      console.error('[MerchantScan] 核销失败:', error)
      hideLoading()
      showError('核销失败,请稍后重试')
    } finally {
      setWriteOffing(false)
    }
  }

  /**
   * 渲染空状态
   */
  const renderEmpty = (): React.ReactElement => {
    return (
      <View className="merchant-scan__empty">
        <View className="merchant-scan__empty-icon">
          <Scan size={64} color="#d9d9d9" />
        </View>
        <Text className="merchant-scan__empty-text">
          点击下方按钮扫描用户核销券二维码
        </Text>
        <Button
          type="primary"
          size="large"
          loading={scanning}
          onClick={handleScanCode}
          className="merchant-scan__scan-btn"
        >
          <Scan size={20} color="#ffffff" style={{ marginRight: '8px' }} />
          {scanning ? '扫描中...' : '扫码核销'}
        </Button>
      </View>
    )
  }

  /**
   * 渲染券详情
   */
  const renderVoucherDetail = (): React.ReactElement | null => {
    if (!voucher) return null

    const expiring = isExpiringSoon(voucher.expire_at)
    const isUsed = voucher.status === VoucherStatus.USED
    const isExpired = voucher.status === VoucherStatus.EXPIRED
    const isFrozen = voucher.status === VoucherStatus.FROZEN
    const canWriteOff = !isUsed && !isExpired && !isFrozen

    return (
      <View className="merchant-scan__voucher-card">
        {/* 顶部标题和状态 */}
        <View className="merchant-scan__header">
          <Text className="merchant-scan__title">{voucher.title}</Text>
          <Tag
            type={isUsed ? 'success' : isExpired || isFrozen ? 'default' : 'primary'}
            size="small"
          >
            {isUsed ? '已核销' : isExpired ? '已过期' : isFrozen ? '已冻结' : '待核销'}
          </Tag>
        </View>

        <Text className="merchant-scan__description">{voucher.description}</Text>

        {/* 金额/折扣 */}
        <View className="merchant-scan__value-row">
          {voucher.type === VoucherType.CASH && voucher.amount && (
            <>
              <Text className="merchant-scan__value">
                ¥{voucher.amount.toFixed(2)}
              </Text>
              <Text className="merchant-scan__value-label">代金券</Text>
            </>
          )}
          {voucher.type === VoucherType.DISCOUNT && voucher.discount && (
            <>
              <Text className="merchant-scan__value">
                {(voucher.discount * 10).toFixed(1)}折
              </Text>
              <Text className="merchant-scan__value-label">折扣券</Text>
            </>
          )}
          {voucher.type === VoucherType.EXCHANGE && (
            <Text className="merchant-scan__value-label">兑换券</Text>
          )}
          {voucher.type === VoucherType.TRIAL && (
            <Text className="merchant-scan__value-label">体验券</Text>
          )}
        </View>

        {/* 券码 */}
        <View className="merchant-scan__code-row">
          <Text className="merchant-scan__label">券码:</Text>
          <Text className="merchant-scan__code">{voucher.code}</Text>
        </View>

        {/* 状态警告 */}
        {isUsed && (
          <View className="merchant-scan__warning">
            <Success size={16} color="#faad14" style={{ marginRight: '6px' }} />
            该券已于 {voucher.used_at ? formatTimestamp(voucher.used_at, 'YYYY-MM-DD HH:mm') : '未知时间'} 核销
          </View>
        )}

        {isExpired && (
          <View className="merchant-scan__error">
            <Failure size={16} color="#ff4d4f" style={{ marginRight: '6px' }} />
            该券已于 {formatTimestamp(voucher.expire_at, 'YYYY-MM-DD')} 过期
          </View>
        )}

        {isFrozen && (
          <View className="merchant-scan__error">
            <Failure size={16} color="#ff4d4f" style={{ marginRight: '6px' }} />
            该券已被冻结,无法核销
          </View>
        )}

        {expiring && canWriteOff && (
          <View className="merchant-scan__warning">
            <Clock size={16} color="#faad14" style={{ marginRight: '6px' }} />
            该券即将过期,请尽快核销
          </View>
        )}

        {/* 券信息 */}
        <View className="merchant-scan__info-section">
          <Text className="merchant-scan__section-title">券信息</Text>

          <View className="merchant-scan__info-row">
            <Text className="merchant-scan__label">有效期至:</Text>
            <Text className="merchant-scan__value-text">
              {formatTimestamp(voucher.expire_at, 'YYYY-MM-DD HH:mm')}
            </Text>
          </View>

          {voucher.store_name && (
            <View className="merchant-scan__info-row">
              <Text className="merchant-scan__label">适用门店:</Text>
              <Text className="merchant-scan__value-text">{voucher.store_name}</Text>
            </View>
          )}

          {voucher.order_no && (
            <View className="merchant-scan__info-row">
              <Text className="merchant-scan__label">订单号:</Text>
              <Text className="merchant-scan__value-text">{voucher.order_no}</Text>
            </View>
          )}
        </View>

        {/* 核销按钮 */}
        {canWriteOff && (
          <Button
            type="primary"
            size="large"
            loading={writeOffing}
            onClick={handleConfirmWriteOff}
            className="merchant-scan__confirm-btn"
          >
            {writeOffing ? '核销中...' : '确认核销'}
          </Button>
        )}

        {/* 重新扫码按钮 */}
        <Button
          type="default"
          size="large"
          loading={scanning}
          onClick={handleScanCode}
          className="merchant-scan__scan-btn"
        >
          <Scan size={20} style={{ marginRight: '8px' }} />
          {scanning ? '扫描中...' : '扫描下一个'}
        </Button>
      </View>
    )
  }

  /**
   * 渲染加载状态
   */
  const renderLoading = (): React.ReactElement => {
    return (
      <View className="merchant-scan__voucher-card">
        <Skeleton width="100%" height="200px" animated />
        <Skeleton width="100%" height="100px" animated style={{ marginTop: '12px' }} />
      </View>
    )
  }

  return (
    <View className="merchant-scan">
      {loading ? renderLoading() : voucher ? renderVoucherDetail() : renderEmpty()}
    </View>
  )
}

export default MerchantScanPage
