/**
 * 数据处理工具
 * 提供数据过滤、排序、格式化等通用功能
 */

import { Product } from '../types/product'
import { Category } from '../types/category'

/**
 * 排序方向
 */
export type SortOrder = 'asc' | 'desc'

/**
 * 商品排序类型
 */
export type ProductSortType =
  | 'default'
  | 'price-asc'
  | 'price-desc'
  | 'sales-desc'
  | 'rating-desc'
  | 'newest'

/**
 * 价格区间
 */
export interface PriceRange {
  min?: number
  max?: number
}

/**
 * 商品过滤条件
 */
export interface ProductFilter {
  categoryId?: string
  priceRange?: PriceRange
  tags?: string[]
  status?: string
  minRating?: number
  keyword?: string
}

/**
 * 数据处理工具类
 */
export class DataHelper {
  /**
   * 格式化价格（保留两位小数）
   * @param price 价格
   * @param symbol 货币符号
   * @returns 格式化后的价格字符串
   */
  static formatPrice(price: number, symbol: string = '¥'): string {
    return `${symbol}${price.toFixed(2)}`
  }

  /**
   * 格式化整数价格（不显示小数）
   * @param price 价格
   * @param symbol 货币符号
   * @returns 格式化后的价格字符串
   */
  static formatIntPrice(price: number, symbol: string = '¥'): string {
    return `${symbol}${Math.floor(price)}`
  }

  /**
   * 格式化数量（添加单位，如 1k, 1w）
   * @param count 数量
   * @returns 格式化后的数量字符串
   */
  static formatCount(count: number): string {
    if (count >= 10000) {
      return `${(count / 10000).toFixed(1)}w`
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`
    }
    return count.toString()
  }

  /**
   * 格式化时间戳为日期字符串
   * @param timestamp 时间戳
   * @param format 格式（YYYY-MM-DD 或 YYYY-MM-DD HH:mm:ss）
   * @returns 格式化后的日期字符串
   */
  static formatDate(
    timestamp: number,
    format: 'date' | 'datetime' = 'date'
  ): string {
    const date = new Date(timestamp)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    if (format === 'date') {
      return `${year}-${month}-${day}`
    }

    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  }

  /**
   * 格式化相对时间（如"3天前"）
   * @param timestamp 时间戳
   * @returns 相对时间字符串
   */
  static formatRelativeTime(timestamp: number): string {
    const now = Date.now()
    const diff = now - timestamp
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    const months = Math.floor(days / 30)
    const years = Math.floor(days / 365)

    if (years > 0) return `${years}年前`
    if (months > 0) return `${months}个月前`
    if (days > 0) return `${days}天前`
    if (hours > 0) return `${hours}小时前`
    if (minutes > 0) return `${minutes}分钟前`
    return '刚刚'
  }

  /**
   * 过滤商品
   * @param products 商品列表
   * @param filter 过滤条件
   * @returns 过滤后的商品列表
   */
  static filterProducts(
    products: Product[],
    filter: ProductFilter
  ): Product[] {
    return products.filter((product) => {
      // 分类过滤
      if (filter.categoryId && product.categoryId !== filter.categoryId) {
        return false
      }

      // 价格区间过滤
      if (filter.priceRange) {
        const { min, max } = filter.priceRange
        if (min !== undefined && product.price < min) return false
        if (max !== undefined && product.price > max) return false
      }

      // 标签过滤（商品必须包含所有指定标签）
      if (filter.tags && filter.tags.length > 0) {
        const hasAllTags = filter.tags.every((tag) =>
          product.tags.includes(tag)
        )
        if (!hasAllTags) return false
      }

      // 状态过滤
      if (filter.status && product.status !== filter.status) {
        return false
      }

      // 评分过滤
      if (filter.minRating && product.rating < filter.minRating) {
        return false
      }

      // 关键词过滤
      if (filter.keyword) {
        const keyword = filter.keyword.toLowerCase()
        const nameMatch = product.name.toLowerCase().includes(keyword)
        const descMatch = product.description.toLowerCase().includes(keyword)
        const tagMatch = product.tags.some((tag) =>
          tag.toLowerCase().includes(keyword)
        )
        if (!nameMatch && !descMatch && !tagMatch) {
          return false
        }
      }

      return true
    })
  }

  /**
   * 排序商品
   * @param products 商品列表
   * @param sortType 排序类型
   * @returns 排序后的商品列表
   */
  static sortProducts(
    products: Product[],
    sortType: ProductSortType = 'default'
  ): Product[] {
    const sorted = [...products]

    switch (sortType) {
      case 'price-asc':
        return sorted.sort((a, b) => a.price - b.price)

      case 'price-desc':
        return sorted.sort((a, b) => b.price - a.price)

      case 'sales-desc':
        return sorted.sort((a, b) => b.sales - a.sales)

      case 'rating-desc':
        return sorted.sort((a, b) => b.rating - a.rating)

      case 'newest':
        return sorted.sort((a, b) => b.createTime - a.createTime)

      case 'default':
      default:
        // 默认排序：有促销的在前，然后按销量
        return sorted.sort((a, b) => {
          const aHasPromotion = a.promotion ? 1 : 0
          const bHasPromotion = b.promotion ? 1 : 0

          if (aHasPromotion !== bHasPromotion) {
            return bHasPromotion - aHasPromotion
          }

          return b.sales - a.sales
        })
    }
  }

  /**
   * 按字段分组
   * @param array 数组
   * @param keyGetter 获取分组键的函数
   * @returns 分组后的 Map
   */
  static groupBy<T>(
    array: T[],
    keyGetter: (item: T) => string | number
  ): Map<string | number, T[]> {
    const map = new Map<string | number, T[]>()

    array.forEach((item) => {
      const key = keyGetter(item)
      const collection = map.get(key)

      if (!collection) {
        map.set(key, [item])
      } else {
        collection.push(item)
      }
    })

    return map
  }

  /**
   * 数组去重（基于指定字段）
   * @param array 数组
   * @param keyGetter 获取唯一键的函数
   * @returns 去重后的数组
   */
  static uniqueBy<T>(
    array: T[],
    keyGetter: (item: T) => string | number
  ): T[] {
    const seen = new Set<string | number>()
    return array.filter((item) => {
      const key = keyGetter(item)
      if (seen.has(key)) {
        return false
      }
      seen.add(key)
      return true
    })
  }

  /**
   * 数组分页
   * @param array 数组
   * @param page 页码（从 1 开始）
   * @param pageSize 每页数量
   * @returns 分页后的数组
   */
  static paginate<T>(array: T[], page: number, pageSize: number): T[] {
    const start = (page - 1) * pageSize
    const end = start + pageSize
    return array.slice(start, end)
  }

  /**
   * 计算折扣率
   * @param originalPrice 原价
   * @param currentPrice 现价
   * @returns 折扣率（如 8.5 表示 8.5 折）
   */
  static calculateDiscount(
    originalPrice: number,
    currentPrice: number
  ): number {
    if (originalPrice <= 0) return 0
    return Math.round((currentPrice / originalPrice) * 10 * 10) / 10
  }

  /**
   * 格式化折扣率
   * @param originalPrice 原价
   * @param currentPrice 现价
   * @returns 折扣率字符串（如 "8.5折"）
   */
  static formatDiscount(originalPrice: number, currentPrice: number): string {
    const discount = this.calculateDiscount(originalPrice, currentPrice)
    return `${discount}折`
  }

  /**
   * 检查商品是否有库存
   * @param product 商品
   * @returns 是否有库存
   */
  static hasStock(product: Product): boolean {
    return product.stock > 0 && product.status === 'on_sale'
  }

  /**
   * 检查商品是否为新品（创建时间在 7 天内）
   * @param product 商品
   * @param days 天数（默认 7 天）
   * @returns 是否为新品
   */
  static isNewProduct(product: Product, days: number = 7): boolean {
    const now = Date.now()
    const diff = now - product.createTime
    const daysDiff = diff / (1000 * 60 * 60 * 24)
    return daysDiff <= days
  }

  /**
   * 获取商品标签（自动添加"新品"、"热卖"等标签）
   * @param product 商品
   * @returns 标签数组
   */
  static getProductTags(product: Product): string[] {
    const tags = [...product.tags]

    // 添加"新品"标签
    if (this.isNewProduct(product)) {
      tags.unshift('新品')
    }

    // 添加"热卖"标签
    if (product.sales > 100) {
      tags.unshift('热卖')
    }

    // 添加"优惠"标签
    if (product.promotion) {
      tags.unshift('优惠')
    }

    return tags
  }

  /**
   * 防抖函数
   * @param func 要执行的函数
   * @param wait 等待时间（毫秒）
   * @returns 防抖后的函数
   */
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null

    return function (this: any, ...args: Parameters<T>) {
      const context = this

      if (timeout) {
        clearTimeout(timeout)
      }

      timeout = setTimeout(() => {
        func.apply(context, args)
      }, wait)
    }
  }

  /**
   * 节流函数
   * @param func 要执行的函数
   * @param limit 限制时间（毫秒）
   * @returns 节流后的函数
   */
  static throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean = false

    return function (this: any, ...args: Parameters<T>) {
      const context = this

      if (!inThrottle) {
        func.apply(context, args)
        inThrottle = true

        setTimeout(() => {
          inThrottle = false
        }, limit)
      }
    }
  }

  /**
   * 深度克隆对象
   * @param obj 要克隆的对象
   * @returns 克隆后的对象
   */
  static deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') {
      return obj
    }

    if (obj instanceof Date) {
      return new Date(obj.getTime()) as any
    }

    if (obj instanceof Array) {
      return obj.map((item) => this.deepClone(item)) as any
    }

    if (obj instanceof Object) {
      const clonedObj = {} as T
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          clonedObj[key] = this.deepClone(obj[key])
        }
      }
      return clonedObj
    }

    return obj
  }

  /**
   * 生成唯一 ID
   * @param prefix 前缀
   * @returns 唯一 ID
   */
  static generateId(prefix: string = 'id'): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
}

/**
 * 便捷函数：格式化价格
 */
export function formatPrice(price: number, symbol?: string): string {
  return DataHelper.formatPrice(price, symbol)
}

/**
 * 便捷函数：格式化数量
 */
export function formatCount(count: number): string {
  return DataHelper.formatCount(count)
}

/**
 * 便捷函数：格式化日期
 */
export function formatDate(
  timestamp: number,
  format?: 'date' | 'datetime'
): string {
  return DataHelper.formatDate(timestamp, format)
}

/**
 * 便捷函数：过滤商品
 */
export function filterProducts(
  products: Product[],
  filter: ProductFilter
): Product[] {
  return DataHelper.filterProducts(products, filter)
}

/**
 * 便捷函数：排序商品
 */
export function sortProducts(
  products: Product[],
  sortType?: ProductSortType
): Product[] {
  return DataHelper.sortProducts(products, sortType)
}

/**
 * 导出默认工具类
 */
export default DataHelper
