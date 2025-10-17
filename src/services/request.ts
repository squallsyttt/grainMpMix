/**
 * Taro 网络请求封装
 *
 * 提供统一的HTTP请求接口,集成Token认证、错误处理、超时保护等功能
 */

import Taro from '@tarojs/taro'
import { ApiResponse, API_ERROR_CODE } from '../types/api'
import { API_BASE_URL } from '../config/api'

/**
 * API配置
 */
const API_CONFIG = {
  /** 基础URL (从配置文件获取，根据环境自动切换) */
  BASE_URL: API_BASE_URL,
  /** 请求超时时间(毫秒) */
  TIMEOUT: 10000,
  /** Token存储Key */
  TOKEN_KEY: 'user_token'
}

/**
 * 请求方法类型
 */
type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

/**
 * 请求选项
 */
interface RequestOptions {
  /** 请求URL */
  url: string
  /** 请求方法 */
  method?: RequestMethod
  /** 请求参数(GET请求会转为query参数,POST请求会转为body) */
  data?: Record<string, any>
  /** 请求头 */
  header?: Record<string, string>
  /** 是否需要Token认证(默认true) */
  needToken?: boolean
  /** 超时时间(默认10秒) */
  timeout?: number
}

/**
 * 获取存储的Token
 *
 * @returns Token字符串,未登录返回空字符串
 */
function getToken(): string {
  try {
    return Taro.getStorageSync(API_CONFIG.TOKEN_KEY) || ''
  } catch (error) {
    console.error('[Request] 获取Token失败:', error)
    return ''
  }
}

/**
 * 检查Token是否有效
 *
 * @returns 是否已登录
 */
export function checkTokenValid(): boolean {
  const token = getToken()
  return token.length > 0
}

/**
 * 统一请求函数
 *
 * @template T - 响应数据类型
 * @param options - 请求选项
 * @returns Promise<ApiResponse<T>>
 */
async function request<T = any>(options: RequestOptions): Promise<ApiResponse<T>> {
  const {
    url,
    method = 'GET',
    data = {},
    header = {},
    needToken = true,
    timeout = API_CONFIG.TIMEOUT
  } = options

  try {
    // 1. Token注入
    let finalHeader = { ...header }
    let finalData = { ...data }

    if (needToken) {
      const token = getToken()
      if (!token) {
        // Token不存在,跳转登录页
        Taro.showToast({
          title: '请先登录',
          icon: 'none',
          duration: 2000
        })
        setTimeout(() => {
          Taro.redirectTo({ url: '/pages/login/index' })
        }, 2000)
        throw new Error('Token不存在')
      }

      // FastAdmin支持Header或Query传递Token
      finalHeader['token'] = token
      finalData['token'] = token
    }

    // 2. 发起请求(带超时保护)
    const response = await Taro.request({
      url: `${API_CONFIG.BASE_URL}${url}`,
      method,
      data: finalData,
      header: finalHeader,
      timeout
    })

    // 3. 响应处理
    const apiResponse = response.data as ApiResponse<T>

    // 4. 业务错误处理
    if (apiResponse.code !== API_ERROR_CODE.SUCCESS) {
      // Token失效,跳转登录
      if (apiResponse.code === API_ERROR_CODE.UNAUTHORIZED) {
        Taro.removeStorageSync(API_CONFIG.TOKEN_KEY)
        Taro.showToast({
          title: 'Token已过期,请重新登录',
          icon: 'none',
          duration: 2000
        })
        setTimeout(() => {
          Taro.redirectTo({ url: '/pages/login/index' })
        }, 2000)
      } else {
        // 其他错误,显示提示
        Taro.showToast({
          title: apiResponse.msg || '操作失败',
          icon: 'none',
          duration: 2000
        })
      }
    }

    return apiResponse

  } catch (error: any) {
    console.error('[Request] 请求失败:', error)

    // 网络错误处理
    const errorMsg = error.errMsg || error.message || '网络请求失败'

    // 超时错误
    if (errorMsg.includes('timeout') || errorMsg.includes('超时')) {
      Taro.showToast({
        title: '网络请求超时,请稍后重试',
        icon: 'none',
        duration: 2000
      })
    } else if (errorMsg.includes('fail')) {
      Taro.showToast({
        title: '网络连接失败,请检查网络',
        icon: 'none',
        duration: 2000
      })
    }

    // 返回错误响应
    return {
      code: API_ERROR_CODE.FAIL,
      msg: errorMsg,
      time: Math.floor(Date.now() / 1000)
    }
  }
}

/**
 * GET请求
 *
 * @template T - 响应数据类型
 * @param url - 请求URL
 * @param params - 查询参数
 * @param needToken - 是否需要Token认证
 * @returns Promise<ApiResponse<T>>
 */
export async function get<T = any>(
  url: string,
  params?: Record<string, any>,
  needToken = true
): Promise<ApiResponse<T>> {
  return request<T>({
    url,
    method: 'GET',
    data: params,
    needToken
  })
}

/**
 * POST请求
 *
 * @template T - 响应数据类型
 * @param url - 请求URL
 * @param data - 请求体数据
 * @param needToken - 是否需要Token认证
 * @returns Promise<ApiResponse<T>>
 */
export async function post<T = any>(
  url: string,
  data?: Record<string, any>,
  needToken = true
): Promise<ApiResponse<T>> {
  return request<T>({
    url,
    method: 'POST',
    data,
    needToken
  })
}

/**
 * PUT请求
 *
 * @template T - 响应数据类型
 * @param url - 请求URL
 * @param data - 请求体数据
 * @param needToken - 是否需要Token认证
 * @returns Promise<ApiResponse<T>>
 */
export async function put<T = any>(
  url: string,
  data?: Record<string, any>,
  needToken = true
): Promise<ApiResponse<T>> {
  return request<T>({
    url,
    method: 'PUT',
    data,
    needToken
  })
}

/**
 * DELETE请求
 *
 * @template T - 响应数据类型
 * @param url - 请求URL
 * @param params - 查询参数
 * @param needToken - 是否需要Token认证
 * @returns Promise<ApiResponse<T>>
 */
export async function del<T = any>(
  url: string,
  params?: Record<string, any>,
  needToken = true
): Promise<ApiResponse<T>> {
  return request<T>({
    url,
    method: 'DELETE',
    data: params,
    needToken
  })
}

/**
 * 设置API基础URL(用于切换环境)
 *
 * @param baseUrl - 基础URL
 */
export function setBaseUrl(baseUrl: string): void {
  API_CONFIG.BASE_URL = baseUrl
}

/**
 * 设置Token
 *
 * @param token - Token字符串
 */
export function setToken(token: string): void {
  try {
    Taro.setStorageSync(API_CONFIG.TOKEN_KEY, token)
  } catch (error) {
    console.error('[Request] 设置Token失败:', error)
  }
}

/**
 * 清除Token
 */
export function clearToken(): void {
  try {
    Taro.removeStorageSync(API_CONFIG.TOKEN_KEY)
  } catch (error) {
    console.error('[Request] 清除Token失败:', error)
  }
}
