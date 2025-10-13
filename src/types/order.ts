/**
 * 订单类型定义
 *
 * 基于 FastAdmin API 合约: specs/002-/contracts/order.yaml
 */

/**
 * 订单状态枚举
 */
export enum OrderStatus {
  /** 待支付 */
  PENDING = 'pending',
  /** 已支付 */
  PAID = 'paid',
  /** 已核销 */
  VERIFIED = 'verified',
  /** 已取消 */
  CANCELLED = 'cancelled',
  /** 已退款 */
  REFUNDED = 'refunded'
}

/**
 * 配送方式枚举
 */
export enum DeliveryMode {
  /** 核销自提 */
  SELF_PICKUP = 'self_pickup',
  /** 跑腿配送 */
  DELIVERY = 'delivery'
}

/**
 * 订单列表项(用于列表显示)
 */
export interface OrderListItem {
  /** 订单ID */
  id: number
  /** 订单号 */
  order_no: string
  /** 原价(单位:元) */
  original_amount: number
  /** 优惠金额(单位:元) */
  discount_amount: number
  /** 实付金额(单位:元) */
  final_amount: number
  /** 订单状态 */
  status: OrderStatus
  /** 门店名称 */
  store_name: string
  /** 创建时间(Unix时间戳,秒) */
  createtime: number
  /** 核销时间(Unix时间戳,秒,已核销时显示) */
  verified_at?: number
  /** 配送方式 */
  delivery_mode?: DeliveryMode
}

/**
 * 订单详情(包含完整信息)
 */
export interface OrderDetail extends OrderListItem {
  /** 门店地址 */
  store_address: string
  /** 门店电话 */
  store_phone: string
  /** 核销券标题(使用券时显示) */
  voucher_title?: string
  /** 核销券类型(使用券时显示) */
  voucher_type?: string
  /** 核销员工(已核销时显示) */
  verified_by?: string
  /** 备注 */
  remark?: string
  /** 配送方式 */
  delivery_mode?: DeliveryMode
}

/**
 * 订单列表查询参数
 */
export interface GetOrderListParams {
  /** Token(可通过Header或Query传递) */
  token?: string
  /** 筛选条件(JSON字符串,如{"status":"paid"}) */
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
 * 订单列表响应(FastAdmin分页格式)
 */
export interface GetOrderListResponse {
  /** 总数 */
  total: number
  /** 每页数量 */
  per_page: number
  /** 当前页 */
  current_page: number
  /** 总页数 */
  last_page: number
  /** 订单列表 */
  data: OrderListItem[]
}

/**
 * 订单详情查询参数
 */
export interface GetOrderDetailParams {
  /** Token(可通过Header或Query传递) */
  token?: string
  /** 订单ID */
  id: number
}
