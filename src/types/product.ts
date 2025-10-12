/**
 * 商品促销信息
 */
export interface ProductPromotion {
  type: 'discount' | 'coupon' | 'gift' | 'flash_sale'
  label: string
  discount?: number
  description?: string
}

/**
 * 商品状态
 */
export type ProductStatus = 'on_sale' | 'off_sale' | 'sold_out' | 'pre_sale'

/**
 * 商品实体
 */
export interface Product {
  /** 商品ID */
  id: string

  /** 商品名称 */
  name: string

  /** 商品描述 */
  description: string

  /** 当前价格 */
  price: number

  /** 原价(用于显示划线价) */
  originalPrice?: number

  /** 库存数量 */
  stock: number

  /** 所属分类ID */
  categoryId: string

  /** 商品标签(如"热卖"、"产地直供") */
  tags: string[]

  /** 商品图片列表(第一张为主图) */
  images: string[]

  /** 销量 */
  sales: number

  /** 评分(0-5分) */
  rating: number

  /** 评论数量 */
  reviewCount: number

  /** 促销信息 */
  promotion?: ProductPromotion

  /** 创建时间(时间戳) */
  createTime: number

  /** 更新时间(时间戳) */
  updateTime: number

  /** 商品状态 */
  status: ProductStatus

  /** 规格参数(可选,如"产地: 黑龙江") */
  specs?: Record<string, string>
}
