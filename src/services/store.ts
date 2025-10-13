/**
 * 门店API服务
 *
 * 封装门店相关的API请求
 */

import { get } from './request'
import {
  StoreListItem,
  StoreDetail,
  GetStoreListParams,
  GetStoreListResponse,
  GetStoreDetailParams
} from '../types/store'
import { ApiResponse, PaginationData } from '../types/api'

/**
 * 获取门店列表
 *
 * @param params - 查询参数
 * @returns Promise<ApiResponse<PaginationData<StoreListItem>>> - 分页数据
 */
export async function getStoreList(
  params?: GetStoreListParams
): Promise<ApiResponse<PaginationData<StoreListItem>>> {
  try {
    const response = await get<GetStoreListResponse>('/api/store/lists', params)
    return response
  } catch (error) {
    console.error('[StoreService] 获取门店列表失败:', error)
    throw error
  }
}

/**
 * 获取门店详情
 *
 * @param id - 门店ID
 * @returns Promise<ApiResponse<StoreDetail>> - 门店详情
 */
export async function getStoreDetail(
  id: number
): Promise<ApiResponse<StoreDetail>> {
  try {
    const params: GetStoreDetailParams = { id }
    const response = await get<StoreDetail>('/api/store/detail', params)
    return response
  } catch (error) {
    console.error('[StoreService] 获取门店详情失败:', error)
    throw error
  }
}

/**
 * 获取附近门店列表(按距离排序)
 *
 * @param longitude - 经度
 * @param latitude - 纬度
 * @param page - 页码
 * @param limit - 每页数量
 * @returns Promise<ApiResponse<PaginationData<StoreListItem>>>
 */
export async function getNearbyStores(
  longitude: number,
  latitude: number,
  page = 1,
  limit = 20
): Promise<ApiResponse<PaginationData<StoreListItem>>> {
  const params: GetStoreListParams = {
    longitude,
    latitude,
    filter: JSON.stringify({ is_active: 1 }),
    page,
    limit,
    sort: 'distance',
    order: 'asc'
  }
  return getStoreList(params)
}

/**
 * 获取营业中的门店列表
 *
 * @param page - 页码
 * @param limit - 每页数量
 * @returns Promise<ApiResponse<PaginationData<StoreListItem>>>
 */
export async function getActiveStores(
  page = 1,
  limit = 20
): Promise<ApiResponse<PaginationData<StoreListItem>>> {
  const params: GetStoreListParams = {
    filter: JSON.stringify({ is_active: 1 }),
    page,
    limit
  }
  return getStoreList(params)
}
