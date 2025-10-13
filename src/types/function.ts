/**
 * 功能列表项类型定义
 * Feature: 核销券个人中心主页
 */

import React from 'react'

/**
 * 功能列表项
 */
export interface FunctionItem {
  /** 功能唯一标识(kebab-case格式) */
  id: string
  /** 功能标题 */
  title: string
  /** NutUI图标组件 */
  icon: React.ComponentType<{ size?: number; color?: string }>
  /** 跳转URL(可选,Taro路由格式) */
  url?: string
  /** 点击回调(可选) */
  action?: () => void
  /** 徽标数量(可选) */
  badge?: number
  /** 是否禁用 */
  disabled?: boolean
  /** 即将上线标识 */
  comingSoon?: boolean
}
