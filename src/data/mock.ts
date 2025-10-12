/**
 * 统一的 Mock 数据服务
 * 模拟后端 API 接口，提供异步数据访问
 */

import { Banner } from '../types/banner'
import { Category } from '../types/category'
import { Product } from '../types/product'
import {
  categories,
  rootCategories,
  subCategories,
  getSubCategoriesByParentId,
  getCategoryById,
  getCategoryPath,
} from './categories'
import {
  products,
  getFeaturedProducts,
  getProductsByCategory,
  getProductById,
} from './products'

// 模拟网络延迟（毫秒）
const MOCK_DELAY = 300

/**
 * 模拟异步延迟
 */
function delay(ms: number = MOCK_DELAY): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * API 响应包装器
 */
export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

/**
 * 分页参数
 */
export interface PaginationParams {
  page: number
  pageSize: number
}

/**
 * 分页响应
 */
export interface PaginatedResponse<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

/**
 * Mock API 服务类
 */
export class MockService {
  /**
   * 获取轮播 Banner 列表
   */
  static async getBanners(): Promise<ApiResponse<Banner[]>> {
    await delay()

    // 动态导入 banners 数据
    const { banners } = await import('./banners')

    const now = Date.now()
    // 过滤已启用且在有效期内的 banner
    const validBanners = banners
      .filter((banner) => {
        if (!banner.enabled) return false
        if (banner.startTime && banner.startTime > now) return false
        if (banner.endTime && banner.endTime < now) return false
        return true
      })
      .sort((a, b) => (a.sort || 0) - (b.sort || 0))

    return {
      code: 200,
      message: 'success',
      data: validBanners,
    }
  }

  /**
   * 获取一级分类列表
   */
  static async getRootCategories(): Promise<ApiResponse<Category[]>> {
    await delay()

    const visibleCategories = rootCategories
      .filter((cat) => cat.visible)
      .sort((a, b) => a.sort - b.sort)

    return {
      code: 200,
      message: 'success',
      data: visibleCategories,
    }
  }

  /**
   * 获取二级分类列表
   * @param parentId 父级分类 ID
   */
  static async getSubCategories(
    parentId: string
  ): Promise<ApiResponse<Category[]>> {
    await delay()

    const subs = getSubCategoriesByParentId(parentId)
      .filter((cat) => cat.visible)
      .sort((a, b) => a.sort - b.sort)

    return {
      code: 200,
      message: 'success',
      data: subs,
    }
  }

  /**
   * 获取分类详情
   * @param categoryId 分类 ID
   */
  static async getCategoryDetail(
    categoryId: string
  ): Promise<ApiResponse<Category | null>> {
    await delay()

    const category = getCategoryById(categoryId)

    if (!category) {
      return {
        code: 404,
        message: '分类不存在',
        data: null,
      }
    }

    return {
      code: 200,
      message: 'success',
      data: category,
    }
  }

  /**
   * 获取分类路径（面包屑）
   * @param categoryId 分类 ID
   */
  static async getCategoryPath(
    categoryId: string
  ): Promise<ApiResponse<Category[]>> {
    await delay()

    const path = getCategoryPath(categoryId)

    return {
      code: 200,
      message: 'success',
      data: path,
    }
  }

  /**
   * 获取精选商品列表
   * @param count 数量
   */
  static async getFeaturedProducts(
    count: number = 12
  ): Promise<ApiResponse<Product[]>> {
    await delay()

    const featured = getFeaturedProducts(count).filter(
      (p) => p.status === 'on_sale'
    )

    return {
      code: 200,
      message: 'success',
      data: featured,
    }
  }

  /**
   * 根据分类获取商品列表（支持分页）
   * @param categoryId 分类 ID
   * @param includeChildren 是否包含子分类商品
   * @param pagination 分页参数
   */
  static async getProductsByCategory(
    categoryId: string,
    includeChildren: boolean = true,
    pagination?: PaginationParams
  ): Promise<ApiResponse<PaginatedResponse<Product>>> {
    await delay()

    const allProducts = getProductsByCategory(
      categoryId,
      includeChildren
    ).filter((p) => p.status === 'on_sale')

    // 如果没有分页参数，返回全部
    if (!pagination) {
      return {
        code: 200,
        message: 'success',
        data: {
          list: allProducts,
          total: allProducts.length,
          page: 1,
          pageSize: allProducts.length,
          totalPages: 1,
        },
      }
    }

    // 分页处理
    const { page, pageSize } = pagination
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const list = allProducts.slice(start, end)
    const totalPages = Math.ceil(allProducts.length / pageSize)

    return {
      code: 200,
      message: 'success',
      data: {
        list,
        total: allProducts.length,
        page,
        pageSize,
        totalPages,
      },
    }
  }

  /**
   * 获取商品详情
   * @param productId 商品 ID
   */
  static async getProductDetail(
    productId: string
  ): Promise<ApiResponse<Product | null>> {
    await delay()

    const product = getProductById(productId)

    if (!product) {
      return {
        code: 404,
        message: '商品不存在',
        data: null,
      }
    }

    return {
      code: 200,
      message: 'success',
      data: product,
    }
  }

  /**
   * 搜索商品
   * @param keyword 搜索关键词
   * @param pagination 分页参数
   */
  static async searchProducts(
    keyword: string,
    pagination?: PaginationParams
  ): Promise<ApiResponse<PaginatedResponse<Product>>> {
    await delay()

    const searchTerm = keyword.toLowerCase().trim()

    // 搜索商品名称、描述、标签
    const searchResults = products.filter((p) => {
      if (p.status !== 'on_sale') return false

      const nameMatch = p.name.toLowerCase().includes(searchTerm)
      const descMatch = p.description.toLowerCase().includes(searchTerm)
      const tagMatch = p.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm)
      )

      return nameMatch || descMatch || tagMatch
    })

    // 如果没有分页参数，返回全部
    if (!pagination) {
      return {
        code: 200,
        message: 'success',
        data: {
          list: searchResults,
          total: searchResults.length,
          page: 1,
          pageSize: searchResults.length,
          totalPages: 1,
        },
      }
    }

    // 分页处理
    const { page, pageSize } = pagination
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const list = searchResults.slice(start, end)
    const totalPages = Math.ceil(searchResults.length / pageSize)

    return {
      code: 200,
      message: 'success',
      data: {
        list,
        total: searchResults.length,
        page,
        pageSize,
        totalPages,
      },
    }
  }

  /**
   * 获取热门搜索关键词
   */
  static async getHotKeywords(): Promise<ApiResponse<string[]>> {
    await delay()

    // 模拟热门搜索词
    const hotKeywords = [
      '东北大米',
      '五常大米',
      '有机米',
      '糯米',
      '小米',
      '燕麦',
      '特价',
    ]

    return {
      code: 200,
      message: 'success',
      data: hotKeywords,
    }
  }

  /**
   * 获取地区列表
   */
  static async getRegions(): Promise<ApiResponse<any[]>> {
    await delay()

    // 动态导入 regions 数据
    const { regions } = await import('./regions')

    return {
      code: 200,
      message: 'success',
      data: regions,
    }
  }
}

/**
 * 导出默认实例
 */
export default MockService
