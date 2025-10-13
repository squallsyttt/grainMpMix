/**
 * 用户相关 Mock 数据
 * Feature: 核销券个人中心主页
 */

import { UserInfo, MemberLevel } from '@/types/user'
import { VoucherStats, OrderStats } from '@/types/stats'
import { RecentVoucher, RecentOrder } from '@/types/recent'
import { OrderStatus } from '@/types/order'

/**
 * Mock 用户信息
 */
export const mockUserInfo: UserInfo = {
  id: 1,
  avatar: 'https://img.yzcdn.cn/vant/cat.jpeg',
  nickname: '张三',
  phone: '13800138000',
  memberLevel: MemberLevel.VIP1,
  memberLevelName: 'VIP1会员',
  memberIcon: 'https://img.yzcdn.cn/vant/icon-vip.png',
  registerTime: 1672502400 // 2023-01-01
}

/**
 * Mock 核销券统计
 */
export const mockVoucherStats: VoucherStats = {
  pending: 5,
  used: 12,
  expired: 3,
  expiringSoon: 2
}

/**
 * Mock 订单统计
 */
export const mockOrderStats: OrderStats = {
  total: 20,
  pending: 2,
  verified: 15
}

/**
 * Mock 最近核销券(最多3条)
 */
export const mockRecentVouchers: RecentVoucher[] = [
  {
    id: 1,
    title: '东北大米兑换券',
    productImage: 'https://img.yzcdn.cn/vant/apple-1.jpg',
    productName: '东北大米 5kg',
    purchaseTime: 1704038400, // 2024-01-01
    expireAt: 1706630400,     // 2024-01-31
    daysRemaining: 5
  },
  {
    id: 2,
    title: '新疆和田枣兑换券',
    productImage: 'https://img.yzcdn.cn/vant/apple-2.jpg',
    productName: '新疆和田枣 500g',
    purchaseTime: 1703952000, // 2023-12-31
    expireAt: 1706544000,     // 2024-01-30
    daysRemaining: 6
  },
  {
    id: 3,
    title: '山西小米兑换券',
    productImage: 'https://img.yzcdn.cn/vant/apple-3.jpg',
    productName: '山西小米 2kg',
    purchaseTime: 1703865600, // 2023-12-30
    expireAt: 1706457600,     // 2024-01-29
    daysRemaining: 7
  }
]

/**
 * Mock 最近订单(最多3条)
 */
export const mockRecentOrders: RecentOrder[] = [
  {
    id: 1,
    orderNo: '20240101000000001',
    productImage: 'https://img.yzcdn.cn/vant/apple-1.jpg',
    productName: '东北大米 5kg',
    status: OrderStatus.VERIFIED,
    statusText: '已核销',
    createTime: 1704038400 // 2024-01-01
  },
  {
    id: 2,
    orderNo: '20240101000000002',
    productImage: 'https://img.yzcdn.cn/vant/apple-2.jpg',
    productName: '新疆和田枣 500g',
    status: OrderStatus.PAID,
    statusText: '已支付',
    createTime: 1703952000 // 2023-12-31
  },
  {
    id: 3,
    orderNo: '20240101000000003',
    productImage: 'https://img.yzcdn.cn/vant/apple-3.jpg',
    productName: '山西小米 2kg',
    status: OrderStatus.PENDING,
    statusText: '待支付',
    createTime: 1703865600 // 2023-12-30
  }
]
