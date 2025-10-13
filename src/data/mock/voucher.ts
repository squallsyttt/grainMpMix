/**
 * 核销券 Mock 数据
 */

import { VoucherListItem, VoucherDetail, VoucherStatus, VoucherType } from '../../types/voucher'

/**
 * Mock 核销券列表数据
 */
export const mockVoucherList: VoucherListItem[] = [
  {
    id: 1,
    code: 'VCH20250112001',
    type: VoucherType.CASH,
    title: '50元代金券',
    description: '全场通用，满100可用',
    amount: 50.00,
    discount: null,
    status: VoucherStatus.UNUSED,
    expire_at: Math.floor(Date.now() / 1000) + 3600 * 5, // 5小时后过期(危险级别)
    store_name: '朝阳门店',
    store_address: '北京市朝阳区测试路1号'
  },
  {
    id: 2,
    code: 'VCH20250112002',
    type: VoucherType.DISCOUNT,
    title: '8折优惠券',
    description: '限时优惠，全场通用',
    amount: null,
    discount: 0.8,
    status: VoucherStatus.UNUSED,
    expire_at: Math.floor(Date.now() / 1000) + 86400 * 2, // 2天后过期(警告级别)
    store_name: '海淀门店',
    store_address: '北京市海淀区中关村大街100号'
  },
  {
    id: 3,
    code: 'VCH20250112003',
    type: VoucherType.CASH,
    title: '100元代金券',
    description: '满200可用',
    amount: 100.00,
    discount: null,
    status: VoucherStatus.USED,
    expire_at: Math.floor(Date.now() / 1000) + 86400 * 30,
    store_name: '西城门店',
    store_address: '北京市西城区金融街8号'
  },
  {
    id: 4,
    code: 'VCH20250112004',
    type: VoucherType.EXCHANGE,
    title: '新用户免费体验券',
    description: '免费领取500g优质大米',
    amount: null,
    discount: null,
    status: VoucherStatus.UNUSED,
    expire_at: Math.floor(Date.now() / 1000) + 86400 * 5, // 5天后过期(信息级别)
    store_name: '东城门店',
    store_address: '北京市东城区王府井大街1号'
  },
  {
    id: 5,
    code: 'VCH20250101001',
    type: VoucherType.CASH,
    title: '30元代金券',
    description: '满50可用',
    amount: 30.00,
    discount: null,
    status: VoucherStatus.EXPIRED,
    expire_at: Math.floor(Date.now() / 1000) - 86400 * 5, // 5天前过期
    store_name: '朝阳门店',
    store_address: '北京市朝阳区测试路1号'
  }
]

/**
 * Mock 核销券详情数据
 */
export const mockVoucherDetail: VoucherDetail = {
  id: 123,
  code: 'VCH20250112001',
  type: VoucherType.CASH,
  title: '50元代金券',
  description: '全场通用，满100可用。适用于所有大米商品，不可与其他优惠同时使用。',
  amount: 50.00,
  discount: null,
  status: VoucherStatus.UNUSED,
  expire_at: Math.floor(Date.now() / 1000) + 3600 * 5, // 5小时后过期(危险级别测试)
  used_at: null,
  order_id: 456,
  order_no: 'ORD20250112153045A3B7F2',
  store_id: 1,
  store_name: '朝阳门店',
  store_address: '北京市朝阳区测试路1号',
  store_phone: '010-12345678',
  business_hours: '09:00-21:00',
  longitude: 116.407526,
  latitude: 39.904030
}

/**
 * Mock 已核销的核销券详情
 */
export const mockUsedVoucherDetail: VoucherDetail = {
  ...mockVoucherDetail,
  id: 124,
  code: 'VCH20250112003',
  title: '100元代金券',
  amount: 100.00,
  status: VoucherStatus.USED,
  used_at: Math.floor(Date.now() / 1000) - 86400 * 2 // 2天前核销
}
