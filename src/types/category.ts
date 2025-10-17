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

// ========== 后端API数据结构 ==========

/**
 * 分类树节点 (后端返回格式)
 * 对应 GET /api/wanlshop/category/tree 接口
 */
export interface CategoryTreeNode {
  /** 分类ID */
  id: number
  /** 父分类ID (0表示根分类) */
  pid: number
  /** 分类名称 */
  name: string
  /** 分类图标相对路径 */
  image: string
  /** 排序权重 (值越大越靠前) */
  weigh: number
  /** 子分类列表 */
  childlist: CategoryTreeNode[]
  /** 类型文本 (可选,暂未使用) */
  type_text?: string
  /** 标记文本 (可选,暂未使用) */
  flag_text?: string
  /** 间隔符 (可选,后端树形展示用) */
  spacer?: string
}

/**
 * 分类索引 (前端构建)
 */
export interface CategoryApiIndex {
  /** ID -> 分类节点 映射 */
  byId: Map<number, CategoryTreeNode>
  /** 父ID -> 子分类列表 映射 */
  byParentId: Map<number, CategoryTreeNode[]>
  /** 所有分类ID (按weigh排序) */
  allIds: number[]
}

/**
 * UI层分类节点 (包含展开状态)
 */
export interface CategoryUINode {
  /** 原始分类数据 */
  data: CategoryTreeNode
  /** 节点层级 (0-3,对应1-4层) */
  depth: number
  /** 是否展开 */
  isExpanded: boolean
  /** 是否有子节点 */
  hasChildren: boolean
  /** 完整图片URL */
  fullImageUrl: string
}

/**
 * 分类筛选参数
 */
export interface CategoryFilter {
  /** 分类ID */
  categoryId: number
  /** 是否包含子分类商品 */
  includeChildren?: boolean
}
