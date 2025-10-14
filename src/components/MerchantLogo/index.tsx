/**
 * MerchantLogo - 商家Logo组件
 *
 * 展示商家Logo,支持图片加载失败时的默认占位图
 * 使用CSS方案实现占位图(品牌色块+首字母)
 */

import React, { useState } from 'react'
import { View, Image } from '@tarojs/components'
import { getLogoPlaceholder, isValidImageUrl } from '../../utils/image'
import './index.less'

interface MerchantLogoProps {
  /** 商家名称 */
  name: string
  /** 商家Logo URL */
  logo?: string
  /** Logo尺寸(px) */
  size?: number
  /** 是否启用懒加载 */
  lazyLoad?: boolean
}

/**
 * MerchantLogo组件
 *
 * @param props - 组件属性
 * @returns React组件
 */
const MerchantLogo: React.FC<MerchantLogoProps> = ({
  name,
  logo,
  size = 80,
  lazyLoad = true,
}) => {
  const [imageError, setImageError] = useState(false)
  const hasValidLogo = isValidImageUrl(logo) && !imageError

  // 获取占位图配置
  const placeholder = getLogoPlaceholder(name)

  // 处理图片加载错误
  const handleImageError = () => {
    setImageError(true)
  }

  return (
    <View
      className="merchant-logo"
      style={{
        width: `${size}px`,
        height: `${size}px`,
      }}
    >
      {hasValidLogo ? (
        <Image
          src={logo!}
          mode="aspectFill"
          className="merchant-logo__image"
          lazyLoad={lazyLoad}
          onError={handleImageError}
        />
      ) : (
        <View
          className="merchant-logo__placeholder"
          style={{
            backgroundColor: placeholder.backgroundColor,
          }}
        >
          <View className="merchant-logo__initial">{placeholder.initial}</View>
        </View>
      )}
    </View>
  )
}

export default React.memo(MerchantLogo)
