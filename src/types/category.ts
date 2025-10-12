/**
 * 分类层级
 */
export type CategoryLevel = 1 | 2 | 3

/**
 * 分类实体(扩展版)
 */
export interface Category {
  /** 分类ID */
  id: string

  /** 分类名称 */
  name: string

  /** 父级分类ID(null表示根分类) */
  parentId: string | null

  /** 分类层级 */
  level: CategoryLevel

  /** 分类图标(NutUI图标名称或图片URL) */
  icon?: string

  /** 分类封面图 */
  cover?: string

  /** 分类描述 */
  description?: string

  /** 排序权重(数字越小越靠前) */
  sort: number

  /** 是否可见 */
  visible: boolean

  /** 商品数量 */
  productCount: number

  /** 创建时间(时间戳) */
  createTime: number

  /** 更新时间(时间戳) */
  updateTime: number
}

/**
 * 简化的分类接口(用于列表展示)
 */
export interface CategorySimple {
  id: string
  name: string
  productCount: number
  icon?: string
}

/**
 * 分类路径项(用于面包屑)
 */
export interface CategoryPathItem {
  id: string
  name: string
  level: CategoryLevel
}
