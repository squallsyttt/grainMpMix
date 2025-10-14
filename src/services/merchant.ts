/**
 * 商家API服务
 *
 * 封装商家相关的API请求
 * API合约: specs/005-logo/contracts/merchant.yaml
 *
 * 开发模式: 使用mock数据，无需登录和后端
 */

import { get } from './request'
import {
  GetMerchantListParams,
  GetMerchantListResponse,
  GetMerchantDetailResponse,
  GetMerchantProductsResponse,
  GetMerchantProductsParams,
} from '../types/merchant'
import {
  mockMerchantList,
  mockMerchantDetails,
  mockMerchantProducts,
} from '../data/mock/merchant'

/**
 * 是否使用Mock数据（开发模式）
 */
const USE_MOCK = true

/**
 * 获取商家列表
 *
 * @param params - 查询参数(province, city, page, limit, filter)
 * @returns Promise<GetMerchantListResponse> - 商家列表响应(FastAdmin分页格式)
 */
export async function getMerchantList(
  params?: GetMerchantListParams
): Promise<GetMerchantListResponse> {
  // 开发模式：使用Mock数据
  if (USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => {
        // 模拟网络延迟
        let filteredList = [...mockMerchantList]

        // 过滤省份
        if (params?.province) {
          filteredList = filteredList.filter(
            (m) => m.province === params.province
          )
        }

        // 过滤城市
        if (params?.city) {
          filteredList = filteredList.filter((m) => m.city === params.city)
        }

        // 过滤激活状态
        if (params?.filter) {
          try {
            const filterObj = JSON.parse(params.filter)
            if (filterObj.is_active !== undefined) {
              filteredList = filteredList.filter(
                (m) => m.is_active === filterObj.is_active
              )
            }
          } catch (e) {
            console.warn('[MerchantService] 解析filter参数失败:', e)
          }
        }

        // 分页
        const page = params?.page || 1
        const limit = params?.limit || 20
        const start = (page - 1) * limit
        const end = start + limit
        const paginatedList = filteredList.slice(start, end)

        resolve({
          code: 0,
          msg: '获取成功',
          data: {
            total: filteredList.length,
            per_page: limit,
            current_page: page,
            last_page: Math.ceil(filteredList.length / limit),
            data: paginatedList,
          },
        })
      }, 500) // 500ms延迟模拟网络请求
    })
  }

  // 生产模式：调用真实API
  try {
    const response = await get<GetMerchantListResponse['data']>(
      '/api/merchant/list',
      params
    )
    return response as GetMerchantListResponse
  } catch (error) {
    console.error('[MerchantService] 获取商家列表失败:', error)
    throw error
  }
}

/**
 * 获取商家详情
 *
 * @param id - 商家ID
 * @returns Promise<GetMerchantDetailResponse> - 商家详情响应
 */
export async function getMerchantDetail(
  id: number
): Promise<GetMerchantDetailResponse> {
  // 开发模式：使用Mock数据
  if (USE_MOCK) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const merchant = mockMerchantDetails[id]
        if (merchant) {
          resolve({
            code: 0,
            msg: '获取成功',
            data: merchant,
          })
        } else {
          reject({
            code: 1,
            msg: '商家不存在',
            data: null,
          })
        }
      }, 300) // 300ms延迟
    })
  }

  // 生产模式：调用真实API
  try {
    const response = await get<GetMerchantDetailResponse['data']>(
      '/api/merchant/detail',
      { id }
    )
    return response as GetMerchantDetailResponse
  } catch (error) {
    console.error('[MerchantService] 获取商家详情失败:', error)
    throw error
  }
}

/**
 * 获取商家供应的产品列表
 *
 * @param id - 商家ID
 * @param params - 查询参数(province, city)
 * @returns Promise<GetMerchantProductsResponse> - 商家产品列表响应
 */
export async function getMerchantProducts(
  id: number,
  params?: GetMerchantProductsParams
): Promise<GetMerchantProductsResponse> {
  // 开发模式：使用Mock数据
  if (USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const products = mockMerchantProducts[id] || []
        resolve({
          code: 0,
          msg: '获取成功',
          data: {
            products,
          },
        })
      }, 400) // 400ms延迟
    })
  }

  // 生产模式：调用真实API
  try {
    const response = await get<GetMerchantProductsResponse['data']>(
      `/api/merchant/${id}/products`,
      params
    )
    return response as GetMerchantProductsResponse
  } catch (error) {
    console.error('[MerchantService] 获取商家产品列表失败:', error)
    throw error
  }
}
