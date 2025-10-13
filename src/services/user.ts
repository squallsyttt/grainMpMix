/**
 * 用户服务
 * Feature: 核销券个人中心主页
 *
 * 提供用户相关的API调用,包括:
 * - 用户信息查询
 * - 核销券统计
 * - 订单统计
 * - 最近核销券列表
 * - 最近订单列表
 */

import { get } from './request'
import { UserInfo } from '@/types/user'
import { VoucherStats, OrderStats } from '@/types/stats'
import { RecentVoucher, RecentOrder } from '@/types/recent'
import { ApiResponse } from '@/types/api'

// Mock数据导入(开发阶段使用)
import {
  mockUserInfo,
  mockVoucherStats,
  mockOrderStats,
  mockRecentVouchers,
  mockRecentOrders
} from '@/data/mock/user'

/**
 * 是否使用Mock数据(开发阶段)
 */
const USE_MOCK = process.env.NODE_ENV === 'development'

/**
 * 获取用户信息
 *
 * @returns Promise<UserInfo | null> 用户信息,获取失败返回null
 */
export async function getUserInfo(): Promise<UserInfo | null> {
  try {
    // 开发阶段使用Mock数据
    if (USE_MOCK) {
      console.log('[UserService] 使用Mock用户信息')
      return Promise.resolve(mockUserInfo)
    }

    // 生产环境调用API
    const response: ApiResponse<UserInfo> = await get('/api/user/info')

    if (response.code === 1 && response.data) {
      // FastAdmin返回snake_case,需要转换为camelCase
      const userData = response.data as any
      return {
        id: userData.id,
        avatar: userData.avatar,
        nickname: userData.nickname,
        phone: userData.phone,
        memberLevel: userData.member_level,
        memberLevelName: userData.member_level_name,
        memberIcon: userData.member_icon,
        registerTime: userData.register_time
      }
    }

    return null
  } catch (error) {
    console.error('[UserService] 获取用户信息失败:', error)
    return null
  }
}

/**
 * 获取核销券统计
 *
 * @returns Promise<VoucherStats | null> 核销券统计,获取失败返回null
 */
export async function getVoucherStats(): Promise<VoucherStats | null> {
  try {
    // 开发阶段使用Mock数据
    if (USE_MOCK) {
      console.log('[UserService] 使用Mock核销券统计')
      return Promise.resolve(mockVoucherStats)
    }

    // 生产环境调用API
    const response: ApiResponse<any> = await get('/api/user/voucher_stats')

    if (response.code === 1 && response.data) {
      // FastAdmin返回snake_case,需要转换为camelCase
      return {
        pending: response.data.pending,
        used: response.data.used,
        expired: response.data.expired,
        expiringSoon: response.data.expiring_soon
      }
    }

    return null
  } catch (error) {
    console.error('[UserService] 获取核销券统计失败:', error)
    return null
  }
}

/**
 * 获取订单统计
 *
 * @returns Promise<OrderStats | null> 订单统计,获取失败返回null
 */
export async function getOrderStats(): Promise<OrderStats | null> {
  try {
    // 开发阶段使用Mock数据
    if (USE_MOCK) {
      console.log('[UserService] 使用Mock订单统计')
      return Promise.resolve(mockOrderStats)
    }

    // 生产环境调用API
    const response: ApiResponse<OrderStats> = await get('/api/user/order_stats')

    if (response.code === 1 && response.data) {
      return response.data
    }

    return null
  } catch (error) {
    console.error('[UserService] 获取订单统计失败:', error)
    return null
  }
}

/**
 * 获取最近核销券列表
 *
 * @param limit - 返回数量,默认3
 * @returns Promise<RecentVoucher[]> 最近核销券列表
 */
export async function getRecentVouchers(limit: number = 3): Promise<RecentVoucher[]> {
  try {
    // 开发阶段使用Mock数据
    if (USE_MOCK) {
      console.log('[UserService] 使用Mock最近核销券')
      return Promise.resolve(mockRecentVouchers.slice(0, limit))
    }

    // 生产环境调用API
    const response: ApiResponse<any[]> = await get('/api/user/recent_vouchers', { limit })

    if (response.code === 1 && response.data) {
      // FastAdmin返回snake_case,需要转换为camelCase
      return response.data.map((item: any) => ({
        id: item.id,
        title: item.title,
        productImage: item.product_image,
        productName: item.product_name,
        purchaseTime: item.purchase_time,
        expireAt: item.expire_at,
        // 计算剩余天数
        daysRemaining: Math.ceil((item.expire_at - Math.floor(Date.now() / 1000)) / 86400)
      }))
    }

    return []
  } catch (error) {
    console.error('[UserService] 获取最近核销券失败:', error)
    return []
  }
}

/**
 * 获取最近订单列表
 *
 * @param limit - 返回数量,默认3
 * @returns Promise<RecentOrder[]> 最近订单列表
 */
export async function getRecentOrders(limit: number = 3): Promise<RecentOrder[]> {
  try {
    // 开发阶段使用Mock数据
    if (USE_MOCK) {
      console.log('[UserService] 使用Mock最近订单')
      return Promise.resolve(mockRecentOrders.slice(0, limit))
    }

    // 生产环境调用API
    const response: ApiResponse<any[]> = await get('/api/user/recent_orders', { limit })

    if (response.code === 1 && response.data) {
      // FastAdmin返回snake_case,需要转换为camelCase
      return response.data.map((item: any) => ({
        id: item.id,
        orderNo: item.order_no,
        productImage: item.product_image,
        productName: item.product_name,
        status: item.status,
        statusText: item.status_text,
        createTime: item.create_time
      }))
    }

    return []
  } catch (error) {
    console.error('[UserService] 获取最近订单失败:', error)
    return []
  }
}
