/**
 * 图片处理工具
 * 提供图片 URL 处理、缩略图生成、占位图等功能
 */

/**
 * 图片尺寸类型
 */
export type ImageSize = 'small' | 'medium' | 'large' | 'original'

/**
 * 图片质量
 */
export type ImageQuality = 'low' | 'medium' | 'high' | 'original'

/**
 * 图片尺寸配置
 */
const IMAGE_SIZE_CONFIG: Record<ImageSize, { width: number; height?: number }> =
  {
    small: { width: 200 },
    medium: { width: 400 },
    large: { width: 800 },
    original: { width: 0 }, // 0 表示不限制
  }

/**
 * 图片质量配置（1-100）
 */
const IMAGE_QUALITY_CONFIG: Record<ImageQuality, number> = {
  low: 60,
  medium: 75,
  high: 90,
  original: 100,
}

/**
 * 默认占位图
 */
const DEFAULT_PLACEHOLDER =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE4IiBmaWxsPSIjY2NjIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIj7lm77niYfliqDovb3kuK08L3RleHQ+PC9zdmc+'

/**
 * 错误占位图
 */
const ERROR_PLACEHOLDER =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE4IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIj7lm77niYfliqDovb3lpLHotKU8L3RleHQ+PC9zdmc+'

/**
 * CDN 域名（实际项目中应从配置文件读取）
 */
const CDN_DOMAIN = 'https://img.yzcdn.cn'

/**
 * 图片处理选项
 */
export interface ImageProcessOptions {
  size?: ImageSize
  quality?: ImageQuality
  width?: number
  height?: number
  mode?: 'fill' | 'fit' | 'crop'
  format?: 'jpg' | 'png' | 'webp'
}

/**
 * 图片工具类
 */
export class ImageHelper {
  /**
   * 处理图片 URL（添加 CDN、尺寸、质量参数）
   * @param url 原始图片 URL
   * @param options 处理选项
   * @returns 处理后的图片 URL
   */
  static processUrl(
    url: string,
    options: ImageProcessOptions = {}
  ): string {
    // 如果是 data URL 或空字符串，直接返回
    if (!url || url.startsWith('data:')) {
      return url
    }

    // 如果是本地资源路径（相对路径或require返回的路径），直接返回
    // 本地路径特征：不以http开头，且包含常见的图片扩展名
    const isLocalPath = !url.startsWith('http://') &&
                        !url.startsWith('https://') &&
                        /\.(png|jpg|jpeg|gif|webp|svg)/i.test(url)

    if (isLocalPath) {
      return url
    }

    // 如果已经是完整 URL，直接使用
    const isAbsoluteUrl =
      url.startsWith('http://') || url.startsWith('https://')

    let processedUrl = isAbsoluteUrl ? url : `${CDN_DOMAIN}${url}`

    // 如果 URL 已经包含参数，使用 & 连接，否则使用 ?
    const separator = processedUrl.includes('?') ? '&' : '?'
    const params: string[] = []

    // 添加尺寸参数
    if (options.size && options.size !== 'original') {
      const sizeConfig = IMAGE_SIZE_CONFIG[options.size]
      if (sizeConfig.width > 0) {
        params.push(`w=${sizeConfig.width}`)
      }
    } else if (options.width) {
      params.push(`w=${options.width}`)
    }

    if (options.height) {
      params.push(`h=${options.height}`)
    }

    // 添加质量参数
    if (options.quality && options.quality !== 'original') {
      const quality = IMAGE_QUALITY_CONFIG[options.quality]
      params.push(`q=${quality}`)
    }

    // 添加裁剪模式
    if (options.mode) {
      params.push(`mode=${options.mode}`)
    }

    // 添加格式转换
    if (options.format) {
      params.push(`format=${options.format}`)
    }

    // 拼接参数
    if (params.length > 0) {
      processedUrl += separator + params.join('&')
    }

    return processedUrl
  }

  /**
   * 获取缩略图 URL
   * @param url 原始图片 URL
   * @param size 缩略图尺寸
   * @returns 缩略图 URL
   */
  static getThumbnail(url: string, size: ImageSize = 'small'): string {
    return this.processUrl(url, { size, quality: 'medium' })
  }

  /**
   * 获取默认占位图
   * @param width 宽度（可选）
   * @param height 高度（可选）
   * @param text 占位文字（可选）
   * @returns 占位图 Data URL
   */
  static getPlaceholder(
    width: number = 200,
    height: number = 200,
    text: string = '图片加载中'
  ): string {
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${width}" height="${height}" fill="#f0f0f0"/>
        <text
          x="50%"
          y="50%"
          font-size="14"
          fill="#ccc"
          text-anchor="middle"
          dominant-baseline="middle"
        >${text}</text>
      </svg>
    `
    return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`
  }

  /**
   * 获取错误占位图
   * @returns 错误占位图 Data URL
   */
  static getErrorPlaceholder(): string {
    return ERROR_PLACEHOLDER
  }

  /**
   * 获取默认加载占位图
   * @returns 加载占位图 Data URL
   */
  static getDefaultPlaceholder(): string {
    return DEFAULT_PLACEHOLDER
  }

  /**
   * 批量处理图片 URL
   * @param urls 图片 URL 数组
   * @param options 处理选项
   * @returns 处理后的图片 URL 数组
   */
  static processBatch(
    urls: string[],
    options: ImageProcessOptions = {}
  ): string[] {
    return urls.map((url) => this.processUrl(url, options))
  }

  /**
   * 获取图片的主图（第一张）
   * @param images 图片数组
   * @param options 处理选项
   * @returns 主图 URL
   */
  static getPrimaryImage(
    images: string[],
    options: ImageProcessOptions = {}
  ): string {
    if (!images || images.length === 0) {
      return this.getDefaultPlaceholder()
    }
    return this.processUrl(images[0], options)
  }

  /**
   * 预加载图片
   * @param url 图片 URL
   * @returns Promise，图片加载完成时 resolve
   */
  static preload(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve()
      img.onerror = () => reject(new Error(`Failed to load image: ${url}`))
      img.src = url
    })
  }

  /**
   * 批量预加载图片
   * @param urls 图片 URL 数组
   * @returns Promise，所有图片加载完成时 resolve
   */
  static preloadBatch(urls: string[]): Promise<void[]> {
    return Promise.all(urls.map((url) => this.preload(url)))
  }

  /**
   * 判断是否为有效的图片 URL
   * @param url 图片 URL
   * @returns 是否有效
   */
  static isValidImageUrl(url: string): boolean {
    if (!url) return false

    // Data URL
    if (url.startsWith('data:image/')) return true

    // HTTP/HTTPS URL
    if (url.startsWith('http://') || url.startsWith('https://')) {
      // 检查常见图片扩展名
      const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']
      return imageExts.some((ext) => url.toLowerCase().includes(ext))
    }

    return false
  }

  /**
   * 从 URL 中提取文件扩展名
   * @param url 图片 URL
   * @returns 文件扩展名（不含点号）
   */
  static getExtension(url: string): string {
    const match = url.match(/\.([a-zA-Z0-9]+)(?:\?|$)/)
    return match ? match[1].toLowerCase() : ''
  }

  /**
   * 转换图片格式
   * @param url 原始图片 URL
   * @param format 目标格式
   * @returns 转换后的图片 URL
   */
  static convertFormat(
    url: string,
    format: 'jpg' | 'png' | 'webp'
  ): string {
    return this.processUrl(url, { format })
  }

  /**
   * 生成响应式图片 srcset
   * @param url 原始图片 URL
   * @param sizes 尺寸数组（宽度）
   * @returns srcset 字符串
   */
  static generateSrcSet(url: string, sizes: number[] = [200, 400, 800]): string {
    return sizes
      .map((width) => {
        const processedUrl = this.processUrl(url, { width })
        return `${processedUrl} ${width}w`
      })
      .join(', ')
  }
}

/**
 * 便捷函数：处理图片 URL
 */
export function processImageUrl(
  url: string,
  options?: ImageProcessOptions
): string {
  return ImageHelper.processUrl(url, options)
}

/**
 * 便捷函数：获取缩略图
 */
export function getThumbnail(url: string, size: ImageSize = 'small'): string {
  return ImageHelper.getThumbnail(url, size)
}

/**
 * 便捷函数：获取占位图
 */
export function getPlaceholder(
  width?: number,
  height?: number,
  text?: string
): string {
  return ImageHelper.getPlaceholder(width, height, text)
}

/**
 * 便捷函数：获取错误占位图
 */
export function getErrorPlaceholder(): string {
  return ImageHelper.getErrorPlaceholder()
}

/**
 * 导出默认工具类
 */
export default ImageHelper
