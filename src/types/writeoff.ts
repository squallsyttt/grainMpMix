/**
 * 核销记录类型定义
 *
 * 用于记录核销操作的相关信息
 */

/**
 * 核销结果枚举
 */
export enum WriteOffResult {
  /** 核销成功 */
  SUCCESS = 'success',
  /** 核销失败 */
  FAILED = 'failed'
}

/**
 * 核销记录
 */
export interface WriteOffRecord {
  /** 记录ID */
  id: number
  /** 核销券ID */
  voucher_id: number
  /** 门店ID */
  store_id: number
  /** 操作员ID */
  operator_id?: number
  /** 核销结果 */
  result: WriteOffResult
  /** 失败原因(失败时显示) */
  fail_reason?: string
  /** 创建时间(Unix时间戳,秒) */
  createtime: number
}

/**
 * 核销验证请求参数
 */
export interface WriteOffScanParams {
  /** Token(可通过Header或Query传递) */
  token?: string
  /** 核销券码 */
  code: string
  /** 门店ID */
  store_id: number
}

/**
 * 核销确认请求参数
 */
export interface WriteOffConfirmParams {
  /** Token(可通过Header或Query传递) */
  token?: string
  /** 核销券ID */
  voucher_id: number
  /** 门店ID */
  store_id: number
}
