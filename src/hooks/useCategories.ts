/**
 * 分类数据Hook
 * 提供分类数据加载和索引构建功能
 */

import { useState, useEffect, useCallback } from 'react'
import Taro from '@tarojs/taro'
import { CategoryTreeNode, CategoryApiIndex } from '../types/category'
import { fetchCategoryTree } from '../services/category'
import { buildCategoryIndex } from '../utils/categoryTree'

/**
 * Hook返回值类型
 */
export interface UseCategoriesResult {
  /** 分类树 (后端原始数据) */
  tree: CategoryTreeNode[]
  /** 分类索引 (前端构建) */
  index: CategoryApiIndex | null
  /** 加载中 */
  loading: boolean
  /** 错误信息 */
  error: string | null
  /** 重新获取 */
  refetch: () => Promise<void>
}

/**
 * 使用分类数据
 *
 * @returns UseCategoriesResult
 */
export function useCategories(): UseCategoriesResult {
  const [tree, setTree] = useState<CategoryTreeNode[]>([])
  const [index, setIndex] = useState<CategoryApiIndex | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * 获取分类数据
   */
  const fetchCategories = useCallback(async (): Promise<void> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetchCategoryTree()
      setTree(response)
      setIndex(buildCategoryIndex(response))
    } catch (err: any) {
      const errorMsg = err.message || '获取分类失败'
      setError(errorMsg)

      Taro.showToast({
        title: errorMsg,
        icon: 'none',
        duration: 2000
      })
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * 初始加载
   */
  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  return {
    tree,
    index,
    loading,
    error,
    refetch: fetchCategories
  }
}
