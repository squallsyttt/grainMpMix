/**
 * 用户相关类型定义
 * Feature: 核销券个人中心主页
 */

/**
 * 会员等级枚举
 */
export enum MemberLevel {
  NORMAL = 'normal',
  VIP1 = 'vip1',
  VIP2 = 'vip2',
  VIP3 = 'vip3'
}

/**
 * 用户信息
 */
export interface UserInfo {
  /** 用户ID */
  id: number
  /** 头像URL */
  avatar: string
  /** 用户昵称 */
  nickname: string
  /** 手机号(可选) */
  phone?: string
  /** 会员等级 */
  memberLevel: MemberLevel
  /** 会员等级显示名称 */
  memberLevelName: string
  /** 会员等级图标URL(可选) */
  memberIcon?: string
  /** 注册时间(Unix时间戳,秒) */
  registerTime: number
}
