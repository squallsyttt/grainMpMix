/**
 * 订单 Mock 数据
 */

import { OrderListItem, OrderDetail, OrderStatus, DeliveryMode } from '../../types/order'

/**
 * Mock 订单列表数据
 */
export const mockOrderList: OrderListItem[] = [
  {
    id: 1,
    order_no: 'ORD20250112153045A3B7F2',
    original_amount: 198.00,
    discount_amount: 50.00,
    final_amount: 148.00,
    status: OrderStatus.PAID,
    store_name: '朝阳门店',
    createtime: Math.floor(Date.now() / 1000) - 86400 * 1, // 1天前
    verified_at: undefined,
    delivery_mode: DeliveryMode.SELF_PICKUP // 自提
  },
  {
    id: 2,
    order_no: 'ORD20250111120530B8F3D1',
    original_amount: 299.00,
    discount_amount: 100.00,
    final_amount: 199.00,
    status: OrderStatus.VERIFIED,
    store_name: '海淀门店',
    createtime: Math.floor(Date.now() / 1000) - 86400 * 3, // 3天前
    verified_at: Math.floor(Date.now() / 1000) - 86400 * 2, // 2天前核销
    delivery_mode: DeliveryMode.SELF_PICKUP // 自提
  },
  {
    id: 3,
    order_no: 'ORD20250110093015C2D4E5',
    original_amount: 158.00,
    discount_amount: 0,
    final_amount: 158.00,
    status: OrderStatus.PAID,
    store_name: '西城门店',
    createtime: Math.floor(Date.now() / 1000) - 86400 * 5,
    verified_at: undefined,
    delivery_mode: DeliveryMode.DELIVERY // 配送
  },
  {
    id: 4,
    order_no: 'ORD20250109161045D5E6F7',
    original_amount: 388.00,
    discount_amount: 50.00,
    final_amount: 338.00,
    status: OrderStatus.VERIFIED,
    store_name: '东城门店',
    createtime: Math.floor(Date.now() / 1000) - 86400 * 7,
    verified_at: Math.floor(Date.now() / 1000) - 86400 * 6,
    delivery_mode: DeliveryMode.DELIVERY // 配送
  },
  {
    id: 5,
    order_no: 'ORD20250108140020E6F7G8',
    original_amount: 128.00,
    discount_amount: 30.00,
    final_amount: 98.00,
    status: OrderStatus.CANCELLED,
    store_name: '朝阳门店',
    createtime: Math.floor(Date.now() / 1000) - 86400 * 10,
    verified_at: undefined,
    delivery_mode: DeliveryMode.SELF_PICKUP // 自提
  }
]

/**
 * Mock 订单详情数据
 */
export const mockOrderDetail: OrderDetail = {
  id: 456,
  order_no: 'ORD20250112153045A3B7F2',
  original_amount: 198.00,
  discount_amount: 50.00,
  final_amount: 148.00,
  status: OrderStatus.PAID,
  store_name: '朝阳门店',
  store_address: '北京市朝阳区测试路1号',
  store_phone: '010-12345678',
  createtime: Math.floor(Date.now() / 1000) - 86400 * 1, // 1天前
  verified_at: undefined,
  voucher_title: '50元代金券',
  voucher_type: 'cash',
  verified_by: undefined,
  remark: '请尽快配送，谢谢！',
  delivery_mode: DeliveryMode.SELF_PICKUP
}

/**
 * Mock 已核销订单详情
 */
export const mockVerifiedOrderDetail: OrderDetail = {
  ...mockOrderDetail,
  id: 457,
  order_no: 'ORD20250111120530B8F3D1',
  status: OrderStatus.VERIFIED,
  verified_at: Math.floor(Date.now() / 1000) - 86400 * 2,
  verified_by: '张三（店员）',
  store_name: '海淀门店',
  store_address: '北京市海淀区中关村大街100号',
  store_phone: '010-87654321'
}

/**
 * Mock 跑腿配送订单详情
 */
export const mockDeliveryOrderDetail: OrderDetail = {
  ...mockOrderDetail,
  id: 458,
  order_no: 'ORD20250110093015C2D4E5',
  delivery_mode: DeliveryMode.DELIVERY,
  store_name: '西城门店',
  store_address: '北京市西城区金融街8号',
  store_phone: '010-55556666',
  remark: '请送到18号楼3单元602室'
}
