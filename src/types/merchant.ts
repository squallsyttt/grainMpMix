/**
 * 商家类型定义
 *
 * 基于API合约: specs/005-logo/contracts/merchant.yaml
 * 数据模型: specs/005-logo/data-model.md
 */

/**
 * 商家实体
 */
export interface Merchant {
  /** 商家ID */
  id: number
  /** 商家名称 */
  name: string
  /** 商家Logo图片URL */
  logo?: string
  /** 所属区域ID */
  region_id: number
  /** 所属区域名称 */
  region_name: string
  /** 所属省份 */
  province: string
  /** 所属城市 */
  city: string
  /** 详细地址 */
  address?: string
  /** 联系电话 */
  phone?: string
  /** 营业时间 */
  business_hours?: string
  /** 商家简介 */
  description?: string
  /** 是否营业(1=营业,0=关闭) */
  is_active: 0 | 1
  /** 用户评分(0-5) */
  rating?: number
  /** 经营年限 */
  years_in_business?: number
  /** 认证状态 */
  certification_status?: 'verified' | 'pending' | 'none'
  /** 创建时间 */
  created_at: string
  /** 更新时间 */
  updated_at: string
}

/**
 * 商家列表项(扩展自Merchant,包含列表特有字段)
 */
export interface MerchantListItem extends Merchant {
  /** 距离用户的距离(公里),仅当用户提供位置时返回 */
  distance?: number
  /** 该商家支持的产品分类标签 */
  product_tags?: string[]
}

/**
 * 获取商家列表的查询参数
 */
export interface GetMerchantListParams {
  /** 省份名称(如"黑龙江省") */
  province?: string
  /** 城市名称(如"哈尔滨市"),优先使用city过滤 */
  city?: string
  /** 页码,从1开始 */
  page?: number
  /** 每页数量 */
  limit?: number
  /** 筛选条件(JSON字符串),如{"is_active":1} */
  filter?: string
}

/**
 * 获取商家列表的响应数据(FastAdmin分页格式)
 */
export interface GetMerchantListResponse {
  /** 响应码(0=成功,非0=失败) */
  code: number
  /** 响应消息 */
  msg: string
  /** 分页数据 */
  data: {
    /** 总记录数 */
    total: number
    /** 每页数量 */
    per_page: number
    /** 当前页码 */
    current_page: number
    /** 总页数 */
    last_page: number
    /** 商家列表 */
    data: MerchantListItem[]
  }
}

/**
 * 获取商家详情的查询参数
 */
export interface GetMerchantDetailParams {
  /** 商家ID */
  id: number
}

/**
 * 获取商家详情的响应数据
 */
export interface GetMerchantDetailResponse {
  /** 响应码(0=成功,非0=失败) */
  code: number
  /** 响应消息 */
  msg: string
  /** 商家详情 */
  data: Merchant
}

/**
 * 获取商家产品的查询参数
 */
export interface GetMerchantProductsParams {
  /** 省份名称,用于获取区域价格 */
  province?: string
  /** 城市名称,用于获取区域价格 */
  city?: string
}

/**
 * 商家供应的产品(包含产品分类信息和区域价格)
 */
export interface MerchantProduct {
  /** 产品分类ID */
  category_id: number
  /** 产品分类名称 */
  category_name: string
  /** 产品分类图片URL */
  category_image: string
  /** 产品分类描述 */
  description?: string
  /** 当前区域价格(元) */
  price: number
  /** 价格单位 */
  price_unit: string
  /** 是否有货 */
  is_available: boolean
  /** 库存状态描述 */
  stock_status?: string
}

/**
 * 获取商家产品列表的响应数据
 */
export interface GetMerchantProductsResponse {
  /** 响应码(0=成功,非0=失败) */
  code: number
  /** 响应消息 */
  msg: string
  /** 产品数据 */
  data: {
    /** 商家供应的产品列表 */
    products: MerchantProduct[]
  }
}
