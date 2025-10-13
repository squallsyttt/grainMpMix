/**
 * 核销券二维码组件
 *
 * 展示核销券二维码,支持保存到相册
 */

import React, { useState, useEffect, useRef } from 'react'
import { View, Text, Canvas } from '@tarojs/components'
import { Button } from '@nutui/nutui-react-taro'
import { Save } from '@nutui/icons-react-taro'
import Taro from '@tarojs/taro'
import { VoucherStatus } from '../../types/voucher'
import { saveQRCodeToAlbum } from '../../utils/qrcode'
import { showSuccess, showError } from '../../utils/error'
import './index.less'

/**
 * 二维码组件Props
 */
export interface VoucherQRCodeProps {
  /** 核销码内容 */
  code: string
  /** 券状态 */
  status: VoucherStatus
  /** 二维码尺寸(默认260px) */
  size?: number
  /** 是否显示保存按钮(默认true) */
  showSaveButton?: boolean
}

/**
 * 核销券二维码组件
 *
 * @param props - 组件Props
 * @returns React组件
 */
const VoucherQRCode: React.FC<VoucherQRCodeProps> = ({
  code,
  status,
  size = 260,
  showSaveButton = true
}) => {
  const [qrImagePath, setQrImagePath] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<boolean>(false)
  const [saving, setSaving] = useState<boolean>(false)
  const canvasId = `qrcode-canvas-${code}`

  /**
   * 判断是否不可用状态
   */
  const isDisabled = status === VoucherStatus.USED || status === VoucherStatus.EXPIRED

  /**
   * 生成二维码
   */
  useEffect(() => {
    generateQRCode()
  }, [code])

  /**
   * 生成二维码
   */
  const generateQRCode = async () => {
    try {
      setLoading(true)
      setError(false)

      // TODO: 实际生成二维码逻辑
      // 由于 weapp-qrcode-canvas-2d 需要安装,这里先使用模拟实现
      // 实际项目中需要:
      // 1. npm install weapp-qrcode-canvas-2d
      // 2. 使用 qrcode.ts 中的 generateQRCode 函数

      // 模拟生成延迟
      await new Promise(resolve => setTimeout(resolve, 500))

      // 模拟生成成功
      console.log('[VoucherQRCode] 二维码内容:', code)
      setLoading(false)

      // 实际实现示例(需要安装库后取消注释):
      /*
      const tempFilePath = await generateQRCode({
        text: code,
        canvasId: canvasId,
        size: size,
        correctLevel: 2, // H级别,30%容错率
        foreground: isDisabled ? '#999999' : '#000000',
        background: '#FFFFFF'
      })
      setQrImagePath(tempFilePath)
      setLoading(false)
      */

    } catch (err) {
      console.error('[VoucherQRCode] 生成失败:', err)
      setError(true)
      setLoading(false)
    }
  }

  /**
   * 保存到相册
   */
  const handleSave = async () => {
    if (!qrImagePath && !error) {
      showError('二维码尚未生成')
      return
    }

    try {
      setSaving(true)

      // 实际项目中使用保存功能
      // const success = await saveQRCodeToAlbum(qrImagePath)
      // if (success) {
      //   showSuccess('已保存到相册')
      // }

      // 模拟保存
      await new Promise(resolve => setTimeout(resolve, 500))
      showSuccess('已保存到相册')
    } catch (err) {
      showError('保存失败,请稍后重试')
    } finally {
      setSaving(false)
    }
  }

  /**
   * 重新生成
   */
  const handleRetry = () => {
    generateQRCode()
  }

  /**
   * 渲染二维码区域
   */
  const renderQRCode = () => {
    if (loading) {
      return (
        <View className="voucher-qrcode__loading" style={{ width: `${size}px`, height: `${size}px` }}>
          <Text>生成中...</Text>
        </View>
      )
    }

    if (error) {
      return (
        <View className="voucher-qrcode__error" style={{ width: `${size}px`, height: `${size}px` }}>
          <Text className="voucher-qrcode__error-text">二维码生成失败</Text>
          <Button size="small" type="primary" onClick={handleRetry}>
            重新生成
          </Button>
        </View>
      )
    }

    return (
      <View className="voucher-qrcode__canvas-wrapper">
        {/* Canvas用于生成二维码(隐藏) */}
        <Canvas
          type="2d"
          id={canvasId}
          canvasId={canvasId}
          className="voucher-qrcode__canvas"
          style={{ width: `${size}px`, height: `${size}px`, display: 'none' }}
        />

        {/* 显示二维码占位(实际项目中显示生成的图片) */}
        <View
          className={`voucher-qrcode__placeholder ${isDisabled ? 'voucher-qrcode__placeholder--disabled' : ''}`}
          style={{ width: `${size}px`, height: `${size}px` }}
        >
          <Text className="voucher-qrcode__placeholder-text">二维码占位</Text>
          {isDisabled && (
            <View className="voucher-qrcode__watermark">
              <Text>{status === VoucherStatus.USED ? '已核销' : '已过期'}</Text>
            </View>
          )}
        </View>
      </View>
    )
  }

  return (
    <View className="voucher-qrcode">
      {/* 二维码显示区域 */}
      <View className="voucher-qrcode__container">
        {renderQRCode()}
      </View>

      {/* 核销码文本 */}
      <View className="voucher-qrcode__code">
        <Text className="voucher-qrcode__code-label">核销码:</Text>
        <Text className="voucher-qrcode__code-value">{code}</Text>
      </View>

      {/* 保存按钮 */}
      {showSaveButton && !isDisabled && !error && (
        <View className="voucher-qrcode__actions">
          <Button
            type="primary"
            size="small"
            loading={saving}
            onClick={handleSave}
            block
          >
            <Save />
            保存到相册
          </Button>
        </View>
      )}

      {/* 不可用提示 */}
      {isDisabled && (
        <View className="voucher-qrcode__tips">
          <Text className="voucher-qrcode__tips-text">
            {status === VoucherStatus.USED ? '此券已核销,无法再次使用' : '此券已过期,无法使用'}
          </Text>
        </View>
      )}
    </View>
  )
}

export default VoucherQRCode
