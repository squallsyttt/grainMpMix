/**
 * 门店类型定义
 *
 * 基于 FastAdmin API 合约: specs/002-/contracts/store.yaml
 */

/**
 * 门店详情
 */
export interface StoreDetail {
  /** 门店ID */
  id: number
  /** 门店名称 */
  name: string
  /** 门店地址 */
  address: string
  /** 联系电话 */
  phone: string
  /** 经度 */
  longitude: number
  /** 纬度 */
  latitude: number
  /** 营业时间(格式:HH:MM-HH:MM,如 09:00-21:00) */
  business_hours: string
  /** 是否营业中(1=营业,0=关闭) */
  is_active: 0 | 1
}

/**
 * 门店列表项(包含距离信息)
 */
export interface StoreListItem extends StoreDetail {
  /** 距离当前位置的距离(公里),仅当提供了经纬度参数时返回 */
  distance?: number
}

/**
 * 门店列表查询参数
 */
export interface GetStoreListParams {
  /** Token(可通过Header或Query传递) */
  token?: string
  /** 筛选条件(JSON字符串,如{"is_active":1}) */
  filter?: string
  /** 当前位置经度(用于距离排序) */
  longitude?: number
  /** 当前位置纬度(用于距离排序) */
  latitude?: number
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
 * 门店列表响应(FastAdmin分页格式)
 */
export interface GetStoreListResponse {
  /** 总数 */
  total: number
  /** 每页数量 */
  per_page: number
  /** 当前页 */
  current_page: number
  /** 总页数 */
  last_page: number
  /** 门店列表 */
  data: StoreListItem[]
}

/**
 * 门店详情查询参数
 */
export interface GetStoreDetailParams {
  /** Token(可通过Header或Query传递) */
  token?: string
  /** 门店ID */
  id: number
}
