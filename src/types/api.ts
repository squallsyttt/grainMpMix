/**
 * FastAdmin API 通用类型定义
 *
 * 统一的API响应格式和通用类型
 */

/**
 * FastAdmin API 响应格式
 *
 * @template T - 响应数据类型
 */
export interface ApiResponse<T = any> {
  /**
   * 状态码
   * - 1: 成功
   * - 0: 失败
   * - -1: 参数错误
   * - -2: 未授权
   * - -3: 无权限
   * - -4: 资源不存在
   */
  code: 1 | 0 | -1 | -2 | -3 | -4
  /** 响应消息 */
  msg: string
  /** 响应时间戳(秒) */
  time: number
  /** 响应数据(可选) */
  data?: T
}

/**
 * FastAdmin 分页数据格式
 *
 * @template T - 列表项类型
 */
export interface PaginationData<T = any> {
  /** 总数 */
  total: number
  /** 每页数量 */
  per_page: number
  /** 当前页 */
  current_page: number
  /** 总页数 */
  last_page: number
  /** 数据列表 */
  data: T[]
}

/**
 * 分页查询通用参数
 */
export interface PaginationParams {
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
 * Token 参数(可通过Header或Query传递)
 */
export interface TokenParams {
  /** 用户Token */
  token?: string
}

/**
 * 地理位置参数
 */
export interface LocationParams {
  /** 经度 */
  longitude: number
  /** 纬度 */
  latitude: number
}

/**
 * 筛选参数
 */
export interface FilterParams {
  /** 筛选条件(JSON字符串) */
  filter?: string
}

/**
 * API错误码映射
 */
export const API_ERROR_CODE = {
  /** 成功 */
  SUCCESS: 1,
  /** 失败 */
  FAIL: 0,
  /** 参数错误 */
  PARAM_ERROR: -1,
  /** 未授权 */
  UNAUTHORIZED: -2,
  /** 无权限 */
  NO_PERMISSION: -3,
  /** 资源不存在 */
  NOT_FOUND: -4
} as const

/**
 * API错误消息映射
 */
export const API_ERROR_MESSAGE: Record<number, string> = {
  [API_ERROR_CODE.FAIL]: '操作失败',
  [API_ERROR_CODE.PARAM_ERROR]: '参数错误',
  [API_ERROR_CODE.UNAUTHORIZED]: 'Token无效或已过期',
  [API_ERROR_CODE.NO_PERMISSION]: '无权限访问',
  [API_ERROR_CODE.NOT_FOUND]: '请求的资源不存在'
}
