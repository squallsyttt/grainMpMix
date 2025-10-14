/**
 * 商家 Mock 数据
 */

import { MerchantListItem, Merchant, MerchantProduct } from '../../types/merchant'

/**
 * Mock 商家列表数据
 */
export const mockMerchantList: MerchantListItem[] = [
  {
    id: 1,
    name: '五常大米直营店',
    logo: 'https://picsum.photos/seed/merchant1/200/200',
    region_id: 1,
    region_name: '黑龙江省哈尔滨市',
    province: '黑龙江省',
    city: '哈尔滨市',
    address: '哈尔滨市道里区中央大街100号',
    phone: '0451-12345678',
    business_hours: '08:00-20:00',
    description: '专营五常大米，品质保证，产地直供。我们的大米来自五常核心产区，采用传统种植方式，确保每一粒米都饱满香甜。',
    is_active: 1,
    rating: 4.8,
    years_in_business: 15,
    certification_status: 'verified',
    created_at: '2020-01-01 00:00:00',
    updated_at: '2025-01-10 10:00:00',
    distance: 2.5,
    product_tags: ['五常大米', '有机大米', '长粒香']
  },
  {
    id: 2,
    name: '黑土地粮油',
    logo: '', // 测试没有logo的情况
    region_id: 1,
    region_name: '黑龙江省哈尔滨市',
    province: '黑龙江省',
    city: '哈尔滨市',
    address: '哈尔滨市南岗区学府路50号',
    phone: '0451-87654321',
    business_hours: '09:00-21:00',
    description: '经营各类优质粮油产品，价格实惠，品质可靠。',
    is_active: 1,
    rating: 4.5,
    years_in_business: 8,
    certification_status: 'verified',
    created_at: '2020-05-15 00:00:00',
    updated_at: '2025-01-09 15:30:00',
    distance: 4.2,
    product_tags: ['东北大米', '花生油', '杂粮']
  },
  {
    id: 3,
    name: '绿色农场粮仓',
    logo: 'https://picsum.photos/seed/merchant3/200/200',
    region_id: 2,
    region_name: '黑龙江省齐齐哈尔市',
    province: '黑龙江省',
    city: '齐齐哈尔市',
    address: '齐齐哈尔市建华区中华路88号',
    phone: '0452-23456789',
    business_hours: '08:30-19:30',
    description: '绿色有机粮食专营，致力于为消费者提供健康、安全的粮食产品。',
    is_active: 1,
    rating: 4.9,
    years_in_business: 12,
    certification_status: 'verified',
    created_at: '2020-03-20 00:00:00',
    updated_at: '2025-01-08 09:00:00',
    product_tags: ['有机杂粮', '绿色大米', '黑米']
  },
  {
    id: 4,
    name: '响水大米专卖',
    logo: 'https://picsum.photos/seed/merchant4/200/200',
    region_id: 3,
    region_name: '黑龙江省牡丹江市',
    province: '黑龙江省',
    city: '牡丹江市',
    address: '牡丹江市东安区东四条路66号',
    phone: '0453-34567890',
    business_hours: '09:00-20:00',
    description: '响水大米产地直供，火山熔岩灌溉，米质优良。',
    is_active: 1,
    rating: 4.7,
    years_in_business: 10,
    certification_status: 'pending',
    created_at: '2020-07-10 00:00:00',
    updated_at: '2025-01-07 14:20:00',
    distance: 1.8,
    product_tags: ['响水大米', '火山岩大米']
  },
  {
    id: 5,
    name: '北大荒米业',
    logo: '', // 测试没有logo
    region_id: 1,
    region_name: '黑龙江省哈尔滨市',
    province: '黑龙江省',
    city: '哈尔滨市',
    address: '哈尔滨市道外区北大荒路1号',
    phone: '0451-45678901',
    business_hours: '08:00-22:00',
    description: '北大荒集团旗下直营店，品质保证，全国配送。提供多种规格的优质东北大米。',
    is_active: 1,
    rating: 4.6,
    years_in_business: 20,
    certification_status: 'verified',
    created_at: '2019-01-01 00:00:00',
    updated_at: '2025-01-11 08:00:00',
    distance: 6.5,
    product_tags: ['东北大米', '稻花香', '珍珠米']
  },
  {
    id: 6,
    name: '暂停营业的粮店',
    logo: 'https://picsum.photos/seed/merchant6/200/200',
    region_id: 1,
    region_name: '黑龙江省哈尔滨市',
    province: '黑龙江省',
    city: '哈尔滨市',
    address: '哈尔滨市香坊区红旗大街200号',
    phone: '0451-56789012',
    business_hours: '暂停营业',
    description: '因装修暂停营业，预计下月恢复。',
    is_active: 0,
    rating: 4.2,
    years_in_business: 5,
    certification_status: 'none',
    created_at: '2021-06-01 00:00:00',
    updated_at: '2025-01-05 12:00:00',
    product_tags: ['大米', '杂粮']
  }
]

/**
 * Mock 商家详情数据（按ID索引）
 */
export const mockMerchantDetails: Record<number, Merchant> = {
  1: {
    id: 1,
    name: '五常大米直营店',
    logo: 'https://picsum.photos/seed/merchant1/200/200',
    region_id: 1,
    region_name: '黑龙江省哈尔滨市',
    province: '黑龙江省',
    city: '哈尔滨市',
    address: '哈尔滨市道里区中央大街100号',
    phone: '0451-12345678',
    business_hours: '08:00-20:00',
    description: '专营五常大米，品质保证，产地直供。我们的大米来自五常核心产区，采用传统种植方式，确保每一粒米都饱满香甜。店铺成立于2010年，已服务数万家庭，获得广泛好评。我们承诺：所有大米均为产地直供，杜绝中间商，保证价格实惠。同时提供免费配送服务，让您足不出户即可享受到优质的五常大米。',
    is_active: 1,
    rating: 4.8,
    years_in_business: 15,
    certification_status: 'verified',
    created_at: '2020-01-01 00:00:00',
    updated_at: '2025-01-10 10:00:00'
  },
  2: {
    id: 2,
    name: '黑土地粮油',
    logo: '',
    region_id: 1,
    region_name: '黑龙江省哈尔滨市',
    province: '黑龙江省',
    city: '哈尔滨市',
    address: '哈尔滨市南岗区学府路50号',
    phone: '0451-87654321',
    business_hours: '09:00-21:00',
    description: '经营各类优质粮油产品，价格实惠，品质可靠。本店所有产品均经过严格筛选，确保质量。',
    is_active: 1,
    rating: 4.5,
    years_in_business: 8,
    certification_status: 'verified',
    created_at: '2020-05-15 00:00:00',
    updated_at: '2025-01-09 15:30:00'
  },
  3: {
    id: 3,
    name: '绿色农场粮仓',
    logo: 'https://picsum.photos/seed/merchant3/200/200',
    region_id: 2,
    region_name: '黑龙江省齐齐哈尔市',
    province: '黑龙江省',
    city: '齐齐哈尔市',
    address: '齐齐哈尔市建华区中华路88号',
    phone: '0452-23456789',
    business_hours: '08:30-19:30',
    description: '绿色有机粮食专营，致力于为消费者提供健康、安全的粮食产品。我们拥有自己的有机种植基地，从源头把控质量。',
    is_active: 1,
    rating: 4.9,
    years_in_business: 12,
    certification_status: 'verified',
    created_at: '2020-03-20 00:00:00',
    updated_at: '2025-01-08 09:00:00'
  }
}

/**
 * Mock 商家产品数据（按商家ID索引）
 */
export const mockMerchantProducts: Record<number, MerchantProduct[]> = {
  1: [
    {
      category_id: 1,
      category_name: '五常稻花香',
      category_image: 'https://picsum.photos/seed/rice1/300/300',
      description: '正宗五常稻花香2号，米粒饱满，香味浓郁',
      price: 25.80,
      price_unit: '元/kg',
      is_available: true,
      stock_status: '库存充足'
    },
    {
      category_id: 2,
      category_name: '五常长粒香',
      category_image: 'https://picsum.photos/seed/rice2/300/300',
      description: '优质长粒香大米，口感Q弹',
      price: 18.50,
      price_unit: '元/kg',
      is_available: true,
      stock_status: '库存充足'
    },
    {
      category_id: 5,
      category_name: '有机糙米',
      category_image: 'https://picsum.photos/seed/rice5/300/300',
      description: '有机种植，营养丰富的糙米',
      price: 22.00,
      price_unit: '元/kg',
      is_available: true,
      stock_status: '少量库存'
    }
  ],
  2: [
    {
      category_id: 1,
      category_name: '五常稻花香',
      category_image: 'https://picsum.photos/seed/rice1/300/300',
      description: '东北优质大米',
      price: 24.00,
      price_unit: '元/kg',
      is_available: true,
      stock_status: '库存充足'
    },
    {
      category_id: 3,
      category_name: '东北珍珠米',
      category_image: 'https://picsum.photos/seed/rice3/300/300',
      description: '颗粒饱满的珍珠米',
      price: 16.80,
      price_unit: '元/kg',
      is_available: true,
      stock_status: '库存充足'
    },
    {
      category_id: 6,
      category_name: '黑米',
      category_image: 'https://picsum.photos/seed/rice6/300/300',
      description: '营养丰富的黑米',
      price: 28.00,
      price_unit: '元/kg',
      is_available: false,
      stock_status: '暂无货'
    }
  ],
  3: [
    {
      category_id: 4,
      category_name: '有机杂粮',
      category_image: 'https://picsum.photos/seed/grain1/300/300',
      description: '多种杂粮组合，营养均衡',
      price: 32.00,
      price_unit: '元/kg',
      is_available: true,
      stock_status: '库存充足'
    },
    {
      category_id: 5,
      category_name: '有机糙米',
      category_image: 'https://picsum.photos/seed/rice5/300/300',
      description: '绿色有机糙米',
      price: 26.50,
      price_unit: '元/kg',
      is_available: true,
      stock_status: '库存充足'
    },
    {
      category_id: 6,
      category_name: '黑米',
      category_image: 'https://picsum.photos/seed/rice6/300/300',
      description: '有机黑米，营养价值高',
      price: 35.00,
      price_unit: '元/kg',
      is_available: true,
      stock_status: '少量库存'
    }
  ]
}
