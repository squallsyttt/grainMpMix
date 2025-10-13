/**
 * 订单API服务
 *
 * 封装订单相关的API请求
 */

import { get } from './request'
import {
  OrderListItem,
  OrderDetail,
  GetOrderListParams,
  GetOrderListResponse,
  GetOrderDetailParams
} from '../types/order'
import { ApiResponse, PaginationData } from '../types/api'

/**
 * 获取订单列表
 *
 * @param params - 查询参数
 * @returns Promise<ApiResponse<PaginationData<OrderListItem>>> - 分页数据
 */
export async function getOrderList(
  params?: GetOrderListParams
): Promise<ApiResponse<PaginationData<OrderListItem>>> {
  try {
    const response = await get<GetOrderListResponse>('/api/order/lists', params)
    return response
  } catch (error) {
    console.error('[OrderService] 获取订单列表失败:', error)
    throw error
  }
}

/**
 * 获取订单详情
 *
 * @param id - 订单ID
 * @returns Promise<ApiResponse<OrderDetail>> - 订单详情
 */
export async function getOrderDetail(
  id: number
): Promise<ApiResponse<OrderDetail>> {
  try {
    const params: GetOrderDetailParams = { id }
    const response = await get<OrderDetail>('/api/order/detail', params)
    return response
  } catch (error) {
    console.error('[OrderService] 获取订单详情失败:', error)
    throw error
  }
}

/**
 * 获取已支付订单列表
 *
 * @param page - 页码
 * @param limit - 每页数量
 * @returns Promise<ApiResponse<PaginationData<OrderListItem>>>
 */
export async function getPaidOrders(
  page = 1,
  limit = 20
): Promise<ApiResponse<PaginationData<OrderListItem>>> {
  const params: GetOrderListParams = {
    filter: JSON.stringify({ status: 'paid' }),
    page,
    limit,
    sort: 'createtime',
    order: 'desc'
  }
  return getOrderList(params)
}

/**
 * 获取已核销订单列表
 *
 * @param page - 页码
 * @param limit - 每页数量
 * @returns Promise<ApiResponse<PaginationData<OrderListItem>>>
 */
export async function getVerifiedOrders(
  page = 1,
  limit = 20
): Promise<ApiResponse<PaginationData<OrderListItem>>> {
  const params: GetOrderListParams = {
    filter: JSON.stringify({ status: 'verified' }),
    page,
    limit,
    sort: 'verified_at',
    order: 'desc'
  }
  return getOrderList(params)
}
