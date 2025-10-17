/**
 * 分类API服务
 * 提供分类相关的API请求封装
 */

import { get } from './request'
import { CategoryTreeNode } from '../types/category'

/**
 * 获取分类树
 *
 * @returns Promise<CategoryTreeNode[]> 分类树数组
 * @throws Error 当API请求失败时抛出错误
 */
export async function fetchCategoryTree(): Promise<CategoryTreeNode[]> {
  try {
    const response = await get<CategoryTreeNode[]>(
      '/api/wanlshop/category/tree',
      {},
      false // 不需要Token
    )

    if (response.code === 1 && response.data) {
      return response.data
    } else {
      throw new Error(response.msg || '获取分类失败')
    }
  } catch (error: any) {
    console.error('[fetchCategoryTree] 错误:', error)
    throw error
  }
}
