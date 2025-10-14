/**
 * 商家列表与商家详情 - 常量定义
 *
 * 定义商家功能模块使用的常量,包括分页、Logo尺寸、颜色等
 */

/**
 * 分页相关常量
 */
export const DEFAULT_PAGE_SIZE = 20 // 默认每页数量
export const DEFAULT_PAGE = 1 // 默认页码

/**
 * Logo相关常量
 */
export const LOGO_SIZE = 80 // Logo默认尺寸(px)
export const LOGO_BORDER_RADIUS = 8 // Logo圆角(px)
export const LOGO_ASPECT_RATIO = '1 / 1' // Logo宽高比

/**
 * Logo占位图品牌色数组
 *
 * 当商家logo缺失或加载失败时,根据商家名称首字符编码取模选择颜色
 * 色值来源: spec.md Assumptions 第1条
 */
export const LOGO_FALLBACK_COLORS = [
  '#FF6B6B', // 珊瑚红
  '#4ECDC4', // 青色
  '#45B7D1', // 天蓝
  '#FFA07A', // 浅珊瑚
  '#98D8C8', // 薄荷绿
  '#F7DC6F', // 柠檬黄
  '#BB8FCE', // 薰衣草紫
  '#85C1E2', // 淡蓝
]

/**
 * 间距相关常量(8px倍数)
 */
export const SPACING_UNIT = 8 // 基础间距单位
export const SPACING_XS = SPACING_UNIT // 8px
export const SPACING_SM = SPACING_UNIT * 2 // 16px
export const SPACING_MD = SPACING_UNIT * 3 // 24px
export const SPACING_LG = SPACING_UNIT * 4 // 32px
export const SPACING_XL = SPACING_UNIT * 5 // 40px

/**
 * 网络请求相关常量
 */
export const API_TIMEOUT = 10000 // 网络请求超时时间(毫秒)

/**
 * 商家状态
 */
export const MERCHANT_STATUS = {
  ACTIVE: 1, // 营业中
  INACTIVE: 0, // 已关闭
} as const

/**
 * 认证状态
 */
export const CERTIFICATION_STATUS = {
  VERIFIED: 'verified', // 已认证
  PENDING: 'pending', // 审核中
  NONE: 'none', // 未认证
} as const

/**
 * 评分范围
 */
export const RATING_MIN = 0 // 最低评分
export const RATING_MAX = 5 // 最高评分
