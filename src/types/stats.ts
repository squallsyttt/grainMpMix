/**
 * 核销券和订单统计相关类型定义
 * Feature: 核销券个人中心主页
 */

/**
 * 核销券状态统计
 */
export interface VoucherStats {
  /** 待核销数量 */
  pending: number
  /** 已核销数量 */
  used: number
  /** 已过期数量 */
  expired: number
  /** 即将过期数量(7天内) */
  expiringSoon: number
}

/**
 * 订单状态统计
 */
export interface OrderStats {
  /** 总订单数 */
  total: number
  /** 待支付数量 */
  pending: number
  /** 已核销数量 */
  verified: number
}
