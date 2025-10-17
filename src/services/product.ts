/**
 * 商品API服务
 * 提供商品相关的API请求封装
 */

import { get } from './request'
import { Product } from '../types/product'
import { PaginationData } from '../types/api'

/**
 * 商品列表筛选参数
 */
export interface ProductListFilter {
  /** 分类ID(必填) */
  categoryId: number
  /** 是否包含子分类的商品(默认true) */
  includeChildren?: boolean
  /** 页码(默认1) */
  page?: number
  /** 每页数量(默认20) */
  limit?: number
  /** 排序字段(sales=销量, price=价格, createTime=上架时间) */
  sortBy?: 'sales' | 'price' | 'createTime'
  /** 排序方式 */
  order?: 'asc' | 'desc'
}

/**
 * 获取商品列表
 *
 * @param filter 筛选参数
 * @returns Promise<PaginationData<Product>> 商品分页列表
 * @throws Error 当API请求失败时抛出错误
 */
export async function fetchProductList(filter: ProductListFilter): Promise<PaginationData<Product>> {
  const {
    categoryId,
    includeChildren = true,
    page = 1,
    limit = 20,
    sortBy = 'createTime',
    order = 'desc'
  } = filter

  try {
    const response = await get<PaginationData<Product>>(
      '/api/wanlshop/product/list',
      {
        category_id: categoryId,
        include_children: includeChildren ? 1 : 0,
        page,
        limit,
        sort: sortBy,
        order
      },
      false // 不需要Token
    )

    if (response.code === 1 && response.data) {
      return response.data
    } else {
      throw new Error(response.msg || '获取商品列表失败')
    }
  } catch (error: any) {
    console.error('[fetchProductList] 错误:', error)
    throw error
  }
}

/**
 * 获取商品详情
 *
 * @param productId 商品ID
 * @returns Promise<Product> 商品详情
 * @throws Error 当API请求失败时抛出错误
 */
export async function fetchProductDetail(productId: string): Promise<Product> {
  try {
    const response = await get<Product>(
      '/api/wanlshop/product/detail',
      {
        id: productId
      },
      false // 不需要Token
    )

    if (response.code === 1 && response.data) {
      return response.data
    } else {
      throw new Error(response.msg || '获取商品详情失败')
    }
  } catch (error: any) {
    console.error('[fetchProductDetail] 错误:', error)
    throw error
  }
}
