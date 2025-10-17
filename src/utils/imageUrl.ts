/**
 * 图片URL处理工具
 * 用于拼接API返回的相对路径为完整URL
 */

import { API_BASE_URL } from '../config/api'

/**
 * 拼接完整的图片URL
 *
 * @param relativePath - 相对路径 (如 "/uploads/xxx.jpg")
 * @returns 完整的图片URL
 */
export function getFullImageUrl(relativePath: string): string {
  if (!relativePath) {
    return ''
  }

  // 已经是完整URL,直接返回
  if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
    return relativePath
  }

  // 拼接基础URL和相对路径
  const cleanPath = relativePath.startsWith('/') ? relativePath : `/${relativePath}`
  return `${API_BASE_URL}${cleanPath}`
}
