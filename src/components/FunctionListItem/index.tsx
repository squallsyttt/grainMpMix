/**
 * 功能列表项组件
 * Feature: 核销券个人中心主页
 *
 * 展示功能入口项,支持图标、标题、徽章、即将上线标识
 */

import React from 'react'
import { View, Text } from '@tarojs/components'
import { ArrowRight } from '@nutui/icons-react-taro'
import { FunctionItem } from '@/types/function'
import './index.less'

/**
 * 组件属性
 */
export interface FunctionListItemProps {
  /** 功能项配置 */
  item: FunctionItem
  /** 点击事件 */
  onClick?: (item: FunctionItem) => void
}

/**
 * 功能列表项组件
 *
 * @example
 * ```tsx
 * <FunctionListItem
 *   item={functionItem}
 *   onClick={handleFunctionClick}
 * />
 * ```
 */
const FunctionListItem: React.FC<FunctionListItemProps> = React.memo(({ item, onClick }) => {
  const IconComponent = item.icon

  /**
   * 处理点击事件
   */
  const handleClick = (): void => {
    if (item.disabled) {
      return
    }
    if (onClick) {
      onClick(item)
    }
  }

  return (
    <View
      className={`function-list-item ${item.disabled ? 'function-list-item--disabled' : ''}`}
      onClick={handleClick}
    >
      <View className="function-list-item__content">
        {/* 图标 */}
        <View className="function-list-item__icon">
          <IconComponent size={22} color={item.disabled ? '#cccccc' : '#666666'} />
        </View>

        {/* 标题 */}
        <Text className="function-list-item__title">{item.title}</Text>

        {/* 徽章 */}
        {item.badge && item.badge > 0 && (
          <View className="function-list-item__badge">
            <Text className="function-list-item__badge-text">
              {item.badge > 99 ? '99+' : item.badge}
            </Text>
          </View>
        )}

        {/* 即将上线标识 */}
        {item.comingSoon && (
          <View className="function-list-item__coming-soon">
            <Text className="function-list-item__coming-soon-text">即将上线</Text>
          </View>
        )}
      </View>

      {/* 右侧箭头 */}
      {!item.disabled && <ArrowRight size={16} color="#ccc" />}
    </View>
  )
})

FunctionListItem.displayName = 'FunctionListItem'

export default FunctionListItem
