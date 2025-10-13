/**
 * 最近列表相关类型定义
 * Feature: 核销券个人中心主页
 */

import { OrderStatus } from './order'

/**
 * 最近核销券列表项
 */
export interface RecentVoucher {
  /** 核销券ID */
  id: number
  /** 券标题 */
  title: string
  /** 商品图片URL */
  productImage: string
  /** 商品名称 */
  productName: string
  /** 购买时间(Unix时间戳,秒) */
  purchaseTime: number
  /** 过期时间(Unix时间戳,秒) */
  expireAt: number
  /** 剩余天数 */
  daysRemaining: number
}

/**
 * 最近订单列表项
 */
export interface RecentOrder {
  /** 订单ID */
  id: number
  /** 订单号 */
  orderNo: string
  /** 商品图片URL */
  productImage: string
  /** 商品名称 */
  productName: string
  /** 订单状态 */
  status: OrderStatus
  /** 状态显示文本 */
  statusText: string
  /** 创建时间(Unix时间戳,秒) */
  createTime: number
}
