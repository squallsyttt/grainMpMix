/**
 * 区域定价类型定义
 *
 * 定义平台产品的区域定价相关类型
 * 数据模型: specs/005-logo/data-model.md
 */

/**
 * 产品分类实体(平台统一管理)
 */
export interface ProductCategory {
  /** 产品分类ID */
  id: number
  /** 产品分类名称(如"大米"、"碎米") */
  name: string
  /** 产品分类图片URL */
  image: string
  /** 产品分类描述 */
  description?: string
  /** 排序权重 */
  sort_order?: number
  /** 是否启用(1=启用,0=禁用) */
  is_active: 0 | 1
  /** 创建时间 */
  created_at: string
  /** 更新时间 */
  updated_at: string
}

/**
 * 商家-产品关联实体
 *
 * 表示商家上架了哪些平台产品分类
 */
export interface MerchantProductMapping {
  /** 关联ID */
  id: number
  /** 商家ID */
  merchant_id: number
  /** 产品分类ID */
  category_id: number
  /** 上架状态(1=已上架,0=已下架) */
  is_available: 0 | 1
  /** 库存状态描述(如"充足"、"紧张") */
  stock_status?: string
  /** 上架时间 */
  created_at: string
  /** 更新时间 */
  updated_at: string
}

/**
 * 区域定价实体
 *
 * 平台产品按区域的统一定价
 */
export interface RegionalPricing {
  /** 定价ID */
  id: number
  /** 产品分类ID */
  category_id: number
  /** 区域ID */
  region_id: number
  /** 价格(分,存储时为整数) */
  price: number
  /** 价格单位(如"元/斤"、"元/公斤") */
  price_unit: string
  /** 生效时间 */
  effective_date: string
  /** 失效时间(可选,null表示长期有效) */
  expiry_date?: string
  /** 是否当前生效(1=生效,0=失效) */
  is_active: 0 | 1
  /** 创建时间 */
  created_at: string
  /** 更新时间 */
  updated_at: string
}

/**
 * 区域实体
 */
export interface Region {
  /** 区域ID */
  id: number
  /** 区域名称 */
  name: string
  /** 所属省份 */
  province: string
  /** 所属城市 */
  city: string
  /** 区域编码(行政区划代码) */
  code?: string
  /** 父级区域ID */
  parent_id?: number
  /** 创建时间 */
  created_at: string
  /** 更新时间 */
  updated_at: string
}

/**
 * 产品价格展示数据(包含格式化后的价格)
 */
export interface ProductPriceDisplay {
  /** 原始价格(分) */
  price: number
  /** 格式化后的价格(元,保留2位小数) */
  formatted_price: string
  /** 价格单位 */
  price_unit: string
  /** 完整显示文本(如"5.00元/斤") */
  display_text: string
}
