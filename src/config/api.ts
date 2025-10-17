/**
 * API 配置
 * 根据环境自动选择 API Base URL
 */

/**
 * 获取 API Base URL
 * 开发环境和生产环境自动切换
 */
export function getApiBaseUrl(): string {
  // 开发环境
  if (process.env.NODE_ENV === 'development') {
    return 'http://grain.local.com'
  }

  // 生产环境
  // TODO: 上线前修改为真实的生产环境域名
  return 'https://api.example.com'
}

/**
 * API Base URL 常量
 */
export const API_BASE_URL = getApiBaseUrl()
