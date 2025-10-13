/**
 * 导航工具
 *
 * 提供安全的页面导航方法
 */

import Taro from '@tarojs/taro'

/**
 * 安全返回上一页
 *
 * 如果当前页面是页面栈中的第一个页面(通过快捷入口直接打开),
 * 则返回首页,否则正常返回上一页
 *
 * @param fallbackUrl - 没有上一页时的回退URL(默认首页)
 */
export function safeGoBack(fallbackUrl = '/pages/index/index'): void {
  const pages = Taro.getCurrentPages()

  if (pages.length > 1) {
    // 有上一页,正常返回
    Taro.navigateBack().catch(err => {
      console.error('[Navigation] navigateBack失败:', err)
      // 返回失败时跳转到fallback页面
      Taro.switchTab({ url: fallbackUrl })
    })
  } else {
    // 第一个页面,返回fallback页面
    Taro.switchTab({ url: fallbackUrl })
  }
}

/**
 * 获取当前页面栈深度
 *
 * @returns 页面栈中的页面数量
 */
export function getPageStackDepth(): number {
  const pages = Taro.getCurrentPages()
  return pages.length
}

/**
 * 判断是否可以返回上一页
 *
 * @returns 如果页面栈深度大于1则返回true
 */
export function canGoBack(): boolean {
  return getPageStackDepth() > 1
}

/**
 * 安全跳转到页面
 *
 * 自动处理页面栈限制(小程序最多10层),
 * 如果超过限制则使用redirectTo替代navigateTo
 *
 * @param url - 目标页面URL
 * @param useRedirect - 是否强制使用redirectTo
 */
export async function safeNavigateTo(url: string, useRedirect = false): Promise<void> {
  const depth = getPageStackDepth()
  const MAX_STACK_DEPTH = 10

  try {
    if (useRedirect || depth >= MAX_STACK_DEPTH - 1) {
      // 页面栈接近限制或强制redirect,使用redirectTo
      await Taro.redirectTo({ url })
    } else {
      // 正常跳转
      await Taro.navigateTo({ url })
    }
  } catch (error) {
    console.error('[Navigation] safeNavigateTo失败:', error)
    // 跳转失败时尝试使用redirectTo
    try {
      await Taro.redirectTo({ url })
    } catch (retryError) {
      console.error('[Navigation] redirectTo也失败:', retryError)
      throw retryError
    }
  }
}

/**
 * 返回多级页面
 *
 * @param delta - 返回的页面数,默认1
 */
export async function navigateBackWithDelta(delta = 1): Promise<void> {
  const depth = getPageStackDepth()

  if (depth <= delta) {
    // 要返回的层数超过页面栈深度,返回首页
    Taro.switchTab({ url: '/pages/index/index' })
    return
  }

  try {
    await Taro.navigateBack({ delta })
  } catch (error) {
    console.error('[Navigation] navigateBack失败:', error)
    // 失败时返回首页
    Taro.switchTab({ url: '/pages/index/index' })
  }
}

/**
 * 清空页面栈并跳转
 *
 * 使用reLaunch清空所有页面栈,然后跳转到指定页面
 *
 * @param url - 目标页面URL
 */
export async function reLaunchTo(url: string): Promise<void> {
  try {
    await Taro.reLaunch({ url })
  } catch (error) {
    console.error('[Navigation] reLaunch失败:', error)
    throw error
  }
}

/**
 * 获取当前页面路由信息
 *
 * @returns 当前页面的路由、参数等信息
 */
export function getCurrentPageInfo(): {
  route: string
  options: Record<string, any>
  depth: number
} | null {
  const pages = Taro.getCurrentPages()
  if (pages.length === 0) {
    return null
  }

  const currentPage = pages[pages.length - 1]
  return {
    route: currentPage.route || '',
    options: currentPage.options || {},
    depth: pages.length
  }
}
