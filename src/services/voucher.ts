/**
 * 核销券API服务
 *
 * 封装核销券相关的API请求
 */

import { get, post } from './request'
import {
  VoucherListItem,
  VoucherDetail,
  GetVoucherListParams,
  GetVoucherListResponse,
  GetVoucherDetailParams
} from '../types/voucher'
import { WriteOffResult } from '../types/writeoff'
import { ApiResponse, PaginationData } from '../types/api'

/**
 * 获取核销券列表
 *
 * @param params - 查询参数
 * @returns Promise<ApiResponse<PaginationData<VoucherListItem>>> - 分页数据
 */
export async function getVoucherList(
  params?: GetVoucherListParams
): Promise<ApiResponse<PaginationData<VoucherListItem>>> {
  try {
    const response = await get<GetVoucherListResponse>('/api/voucher/lists', params)
    return response
  } catch (error) {
    console.error('[VoucherService] 获取核销券列表失败:', error)
    throw error
  }
}

/**
 * 获取核销券详情
 *
 * @param id - 核销券ID
 * @returns Promise<ApiResponse<VoucherDetail>> - 核销券详情
 */
export async function getVoucherDetail(
  id: number
): Promise<ApiResponse<VoucherDetail>> {
  try {
    const params: GetVoucherDetailParams = { id }
    const response = await get<VoucherDetail>('/api/voucher/detail', params)
    return response
  } catch (error) {
    console.error('[VoucherService] 获取核销券详情失败:', error)
    throw error
  }
}

/**
 * 获取待核销券列表
 *
 * @param page - 页码
 * @param limit - 每页数量
 * @returns Promise<ApiResponse<PaginationData<VoucherListItem>>>
 */
export async function getUnusedVouchers(
  page = 1,
  limit = 20
): Promise<ApiResponse<PaginationData<VoucherListItem>>> {
  const params: GetVoucherListParams = {
    filter: JSON.stringify({ status: 'unused' }),
    page,
    limit,
    sort: 'createtime',
    order: 'desc'
  }
  return getVoucherList(params)
}

/**
 * 获取已核销券列表
 *
 * @param page - 页码
 * @param limit - 每页数量
 * @returns Promise<ApiResponse<PaginationData<VoucherListItem>>>
 */
export async function getUsedVouchers(
  page = 1,
  limit = 20
): Promise<ApiResponse<PaginationData<VoucherListItem>>> {
  const params: GetVoucherListParams = {
    filter: JSON.stringify({ status: 'used' }),
    page,
    limit,
    sort: 'used_at',
    order: 'desc'
  }
  return getVoucherList(params)
}

/**
 * 获取已过期券列表
 *
 * @param page - 页码
 * @param limit - 每页数量
 * @returns Promise<ApiResponse<PaginationData<VoucherListItem>>>
 */
export async function getExpiredVouchers(
  page = 1,
  limit = 20
): Promise<ApiResponse<PaginationData<VoucherListItem>>> {
  const params: GetVoucherListParams = {
    filter: JSON.stringify({ status: 'expired' }),
    page,
    limit,
    sort: 'expire_at',
    order: 'desc'
  }
  return getVoucherList(params)
}

/**
 * 根据券码获取核销券详情（商家扫码验证）
 *
 * @param code - 核销券码
 * @returns Promise<ApiResponse<VoucherDetail>> - 核销券详情
 */
export async function getVoucherByCode(
  code: string
): Promise<ApiResponse<VoucherDetail>> {
  try {
    const response = await get<VoucherDetail>('/api/voucher/detail', { code })
    return response
  } catch (error) {
    console.error('[VoucherService] 根据券码获取详情失败:', error)
    throw error
  }
}

/**
 * 确认核销
 *
 * @param voucherId - 核销券ID
 * @param storeId - 门店ID
 * @returns Promise<ApiResponse<WriteOffResult>> - 核销结果
 */
export async function writeOffVoucher(
  voucherId: number,
  storeId: number
): Promise<ApiResponse<WriteOffResult>> {
  try {
    const response = await post<WriteOffResult>('/api/writeoff/confirm', {
      voucher_id: voucherId,
      store_id: storeId
    })
    return response
  } catch (error) {
    console.error('[VoucherService] 核销失败:', error)
    throw error
  }
}
