import React from 'react'
import { View, Text } from '@tarojs/components'
import { ArrowRight } from '@nutui/icons-react-taro'
import './index.less'

/**
 * 区块标题组件Props
 */
interface SectionHeaderProps {
  /** 主标题 */
  title: string
  /** 副标题/描述 */
  subtitle?: string
  /** 是否显示"更多"按钮 */
  showMore?: boolean
  /** 更多按钮文字 */
  moreText?: string
  /** 点击更多的回调 */
  onMoreClick?: () => void
  /** 自定义样式类名 */
  className?: string
  /** 主题色 */
  theme?: 'default' | 'primary' | 'gradient'
}

/**
 * 精致的区块标题组件
 * 提供统一的视觉风格和交互体验
 */
const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  showMore = false,
  moreText = '更多',
  onMoreClick,
  className = '',
  theme = 'default'
}) => {
  return (
    <View className={`section-header section-header--${theme} ${className}`}>
      <View className="section-header__left">
        <View className="section-header__title-wrapper">
          <Text className="section-header__title">{title}</Text>
          {subtitle && (
            <Text className="section-header__subtitle">{subtitle}</Text>
          )}
        </View>
      </View>

      {showMore && (
        <View className="section-header__right" onClick={onMoreClick}>
          <Text className="section-header__more-text">{moreText}</Text>
          <ArrowRight size={14} color="#999" />
        </View>
      )}
    </View>
  )
}

export default SectionHeader
