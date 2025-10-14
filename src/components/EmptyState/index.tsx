/**
 * EmptyState - 空状态组件
 *
 * 封装NutUI Empty组件,支持自定义文案和操作按钮
 */

import React from 'react'
import { View } from '@tarojs/components'
import { Empty, Button } from '@nutui/nutui-react-taro'
import './index.less'

interface EmptyAction {
  /** 按钮文本 */
  text: string
  /** 按钮类型 */
  type?: 'primary' | 'default' | 'success' | 'warning' | 'danger'
  /** 点击事件 */
  onClick: () => void
}

interface EmptyStateProps {
  /** 描述文案 */
  description?: string
  /** 图片类型(NutUI内置图片类型) */
  imageType?: 'empty' | 'error' | 'network'
  /** 自定义图片URL */
  image?: string
  /** 操作按钮列表 */
  actions?: EmptyAction[]
}

/**
 * EmptyState组件
 *
 * @param props - 组件属性
 * @returns React组件
 */
const EmptyState: React.FC<EmptyStateProps> = ({
  description = '暂无数据',
  imageType = 'empty',
  image,
  actions,
}) => {
  return (
    <View className="empty-state">
      <Empty
        description={description}
        image={image || imageType}
        imageSize={160}
      />
      {actions && actions.length > 0 && (
        <View className="empty-state__actions">
          {actions.map((action, index) => (
            <Button
              key={index}
              type={action.type || 'primary'}
              onClick={action.onClick}
              className="empty-state__action-button"
            >
              {action.text}
            </Button>
          ))}
        </View>
      )}
    </View>
  )
}

export default React.memo(EmptyState)
