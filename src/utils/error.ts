/**
 * 错误处理工具
 *
 * 提供统一的错误处理和用户友好的错误提示
 */

import Taro from '@tarojs/taro'
import { API_ERROR_CODE, API_ERROR_MESSAGE } from '../types/api'

/**
 * 错误类型枚举
 */
export enum ErrorType {
  /** 网络错误 */
  NETWORK = 'NETWORK',
  /** API错误 */
  API = 'API',
  /** 业务错误 */
  BUSINESS = 'BUSINESS',
  /** 系统错误 */
  SYSTEM = 'SYSTEM',
  /** 未知错误 */
  UNKNOWN = 'UNKNOWN'
}

/**
 * 错误信息接口
 */
export interface ErrorInfo {
  /** 错误类型 */
  type: ErrorType
  /** 错误代码 */
  code: string | number
  /** 错误消息 */
  message: string
  /** 原始错误对象 */
  originalError?: any
}

/**
 * 处理API错误
 *
 * @param code - API错误码
 * @param message - 错误消息
 * @returns ErrorInfo
 */
export function handleApiError(code: number, message?: string): ErrorInfo {
  const errorMessage = message || API_ERROR_MESSAGE[code] || '操作失败'

  return {
    type: ErrorType.API,
    code,
    message: errorMessage
  }
}

/**
 * 处理网络错误
 *
 * @param error - 错误对象
 * @returns ErrorInfo
 */
export function handleNetworkError(error: any): ErrorInfo {
  const errorMsg = error.errMsg || error.message || '网络请求失败'

  let message = '网络连接失败,请检查网络'

  if (errorMsg.includes('timeout') || errorMsg.includes('超时')) {
    message = '网络请求超时,请稍后重试'
  } else if (errorMsg.includes('fail')) {
    message = '网络连接失败,请检查网络'
  } else if (errorMsg.includes('abort')) {
    message = '请求已取消'
  }

  return {
    type: ErrorType.NETWORK,
    code: 'NETWORK_ERROR',
    message,
    originalError: error
  }
}

/**
 * 处理系统错误
 *
 * @param error - 错误对象
 * @returns ErrorInfo
 */
export function handleSystemError(error: any): ErrorInfo {
  const errorMsg = error.message || error.toString() || '系统错误'

  return {
    type: ErrorType.SYSTEM,
    code: 'SYSTEM_ERROR',
    message: `系统错误: ${errorMsg}`,
    originalError: error
  }
}

/**
 * 显示友好的错误提示
 *
 * @param error - 错误信息或错误对象
 * @param duration - 显示时长(毫秒,默认2000)
 */
export function showFriendlyError(error: ErrorInfo | any, duration = 2000): void {
  let message = '操作失败,请稍后重试'

  if (typeof error === 'string') {
    message = error
  } else if (error && typeof error === 'object') {
    if ('message' in error) {
      message = error.message
    } else if ('msg' in error) {
      message = error.msg
    } else if ('errMsg' in error) {
      message = error.errMsg
    }
  }

  Taro.showToast({
    title: message,
    icon: 'none',
    duration
  })
}

/**
 * 显示加载中提示
 *
 * @param title - 提示文本
 * @param mask - 是否显示透明蒙层,防止触摸穿透
 */
export function showLoading(title = '加载中...', mask = true): void {
  Taro.showLoading({
    title,
    mask
  })
}

/**
 * 隐藏加载中提示
 */
export function hideLoading(): void {
  Taro.hideLoading()
}

/**
 * 显示成功提示
 *
 * @param title - 提示文本
 * @param duration - 显示时长(毫秒,默认1500)
 */
export function showSuccess(title: string, duration = 1500): void {
  Taro.showToast({
    title,
    icon: 'success',
    duration
  })
}

/**
 * 显示失败提示
 *
 * @param title - 提示文本
 * @param duration - 显示时长(毫秒,默认2000)
 */
export function showError(title: string, duration = 2000): void {
  Taro.showToast({
    title,
    icon: 'error',
    duration
  })
}

/**
 * 显示警告提示
 *
 * @param title - 提示文本
 * @param duration - 显示时长(毫秒,默认2000)
 */
export function showWarning(title: string, duration = 2000): void {
  Taro.showToast({
    title,
    icon: 'none',
    duration
  })
}

/**
 * 显示确认对话框
 *
 * @param title - 标题
 * @param content - 内容
 * @param confirmText - 确认按钮文本
 * @param cancelText - 取消按钮文本
 * @returns Promise<boolean> - 用户是否点击确认
 */
export async function showConfirm(
  title: string,
  content: string,
  confirmText = '确定',
  cancelText = '取消'
): Promise<boolean> {
  try {
    const { confirm } = await Taro.showModal({
      title,
      content,
      confirmText,
      cancelText,
      showCancel: true
    })
    return confirm
  } catch (error) {
    console.error('[Error] 显示确认对话框失败:', error)
    return false
  }
}

/**
 * 记录错误日志
 *
 * @param error - 错误信息
 * @param context - 错误上下文
 */
export function logError(error: ErrorInfo | any, context?: string): void {
  const timestamp = new Date().toISOString()
  const contextStr = context ? `[${context}]` : ''

  if (typeof error === 'object' && 'type' in error) {
    console.error(
      `[Error] ${timestamp} ${contextStr} Type: ${error.type}, Code: ${error.code}, Message: ${error.message}`,
      error.originalError || ''
    )
  } else {
    console.error(
      `[Error] ${timestamp} ${contextStr}`,
      error
    )
  }

  // TODO: 可以在这里添加错误上报逻辑
  // 例如上报到Sentry、自定义错误收集平台等
}

/**
 * 捕获并处理Promise错误
 *
 * @param promise - Promise对象
 * @param errorHandler - 自定义错误处理函数
 * @returns Promise
 */
export async function catchError<T>(
  promise: Promise<T>,
  errorHandler?: (error: any) => void
): Promise<T | null> {
  try {
    return await promise
  } catch (error) {
    logError(error)

    if (errorHandler) {
      errorHandler(error)
    } else {
      showFriendlyError(error)
    }

    return null
  }
}
