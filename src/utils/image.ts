/**
 * 图片处理工具函数
 *
 * 提供商家Logo占位图颜色生成等图片相关工具函数
 */

import { LOGO_FALLBACK_COLORS } from './constants'

/**
 * 获取商家名称首字母
 *
 * @param name - 商家名称
 * @returns 商家名称的首字母(大写)
 */
export const getInitial = (name: string): string => {
  if (!name || name.length === 0) {
    return '商'
  }
  return name.charAt(0).toUpperCase()
}

/**
 * 根据商家名称生成占位图背景色
 *
 * 使用商家名称首字符的Unicode编码对颜色数组长度取模,
 * 确保同一商家始终使用相同颜色
 *
 * @param name - 商家名称
 * @returns 十六进制颜色值(如 '#FF6B6B')
 */
export const getBackgroundColor = (name: string): string => {
  if (!name || name.length === 0) {
    return LOGO_FALLBACK_COLORS[0]
  }

  const charCode = name.charCodeAt(0)
  const index = charCode % LOGO_FALLBACK_COLORS.length
  return LOGO_FALLBACK_COLORS[index]
}

/**
 * 获取Logo占位图的完整配置
 *
 * @param name - 商家名称
 * @returns Logo占位图配置对象
 */
export const getLogoPlaceholder = (
  name: string
): { initial: string; backgroundColor: string } => {
  return {
    initial: getInitial(name),
    backgroundColor: getBackgroundColor(name),
  }
}

/**
 * 判断字符串是否为有效的图片URL
 *
 * @param url - 待验证的URL字符串
 * @returns 是否为有效URL
 */
export const isValidImageUrl = (url: string | undefined | null): boolean => {
  if (!url || typeof url !== 'string' || url.trim().length === 0) {
    return false
  }

  // 检查是否为http/https开头的URL
  const urlPattern = /^https?:\/\/.+/i
  return urlPattern.test(url.trim())
}
