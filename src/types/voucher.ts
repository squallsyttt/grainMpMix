/**
 * 核销券类型定义
 *
 * 基于 FastAdmin API 合约: specs/002-/contracts/voucher.yaml
 */

/**
 * 核销券类型枚举
 */
export enum VoucherType {
  /** 代金券 */
  CASH = 'cash',
  /** 折扣券 */
  DISCOUNT = 'discount',
  /** 兑换券 */
  EXCHANGE = 'exchange',
  /** 体验券 */
  TRIAL = 'trial'
}

/**
 * 核销券状态枚举
 */
export enum VoucherStatus {
  /** 未使用 */
  UNUSED = 'unused',
  /** 已使用 */
  USED = 'used',
  /** 已过期 */
  EXPIRED = 'expired',
  /** 已冻结 */
  FROZEN = 'frozen'
}

/**
 * 核销券列表项(用于列表显示)
 */
export interface VoucherListItem {
  /** 核销券ID */
  id: number
  /** 核销码 */
  code: string
  /** 券类型 */
  type: VoucherType
  /** 券标题 */
  title: string
  /** 券描述 */
  description: string
  /** 金额(代金券专用,单位:元) */
  amount?: number
  /** 折扣(折扣券专用,0.1-0.99) */
  discount?: number
  /** 状态 */
  status: VoucherStatus
  /** 过期时间(Unix时间戳,秒) */
  expire_at: number
  /** 门店名称 */
  store_name: string
  /** 门店地址 */
  store_address: string
}

/**
 * 核销券详情(包含完整信息)
 */
export interface VoucherDetail extends VoucherListItem {
  /** 使用时间(Unix时间戳,秒,已使用时显示) */
  used_at?: number
  /** 关联订单ID(已使用时显示) */
  order_id?: number
  /** 关联订单号(已使用时显示) */
  order_no?: string
  /** 门店ID */
  store_id: number
  /** 门店电话 */
  store_phone: string
  /** 营业时间 */
  business_hours: string
  /** 门店经度 */
  longitude: number
  /** 门店纬度 */
  latitude: number
}

/**
 * 核销券列表查询参数
 */
export interface GetVoucherListParams {
  /** Token(可通过Header或Query传递) */
  token?: string
  /** 筛选条件(JSON字符串,如{"status":"unused"}) */
  filter?: string
  /** 页码(从1开始) */
  page?: number
  /** 每页数量(FastAdmin使用limit) */
  limit?: number
  /** 排序字段 */
  sort?: string
  /** 排序方式(asc/desc) */
  order?: 'asc' | 'desc'
}

/**
 * 核销券列表响应(FastAdmin分页格式)
 */
export interface GetVoucherListResponse {
  /** 总数 */
  total: number
  /** 每页数量 */
  per_page: number
  /** 当前页 */
  current_page: number
  /** 总页数 */
  last_page: number
  /** 核销券列表 */
  data: VoucherListItem[]
}

/**
 * 核销券详情查询参数
 */
export interface GetVoucherDetailParams {
  /** Token(可通过Header或Query传递) */
  token?: string
  /** 核销券ID */
  id: number
}
