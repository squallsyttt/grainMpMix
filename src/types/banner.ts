/**
 * Banner链接类型
 */
export type BannerLinkType = 'none' | 'product' | 'category' | 'web' | 'miniprogram'

/**
 * 轮播Banner实体
 */
export interface Banner {
  /** Banner ID */
  id: string

  /** Banner图片URL */
  imageUrl: string

  /** Banner标题 */
  title: string

  /** 链接类型 */
  linkType: BannerLinkType

  /** 链接值(根据linkType不同而不同:product为商品ID,category为分类ID,web为URL等) */
  linkValue: string

  /** 排序权重(数字越小越靠前) */
  sort?: number

  /** 生效开始时间(时间戳) */
  startTime?: number

  /** 生效结束时间(时间戳) */
  endTime?: number

  /** 是否启用 */
  enabled?: boolean
}
