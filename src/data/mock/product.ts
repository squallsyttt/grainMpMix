/**
 * 商品Mock数据
 */

import { Product } from '../../types/product'
import { PaginationData } from '../../types/api'

/**
 * Mock商品数据
 * 覆盖不同分类的商品
 */
export const mockProducts: Product[] = [
  // 精米分类(104) - 东北精米(115)
  {
    id: '1',
    name: '东北珍珠米 5kg',
    description: '粒粒饱满，晶莹剔透，口感香甜软糯',
    price: 49.90,
    originalPrice: 59.90,
    stock: 500,
    categoryId: '115',
    tags: ['热销', '产地直供'],
    images: [
      '/uploads/products/rice-pearl-01.jpg',
      '/uploads/products/rice-pearl-02.jpg'
    ],
    sales: 1580,
    rating: 4.8,
    reviewCount: 356,
    createTime: 1697875200,
    updateTime: 1697875200,
    status: 'on_sale',
    specs: {
      '产地': '黑龙江',
      '规格': '5kg',
      '保质期': '12个月'
    }
  },
  {
    id: '2',
    name: '东北长粒香 10kg',
    description: '米粒修长，清香扑鼻，营养丰富',
    price: 98.00,
    stock: 320,
    categoryId: '115',
    tags: ['新品'],
    images: [
      '/uploads/products/rice-long-01.jpg'
    ],
    sales: 850,
    rating: 4.6,
    reviewCount: 182,
    createTime: 1698480000,
    updateTime: 1698480000,
    status: 'on_sale',
    specs: {
      '产地': '黑龙江',
      '规格': '10kg',
      '保质期': '12个月'
    }
  },

  // 香米分类(106) - 东北五常精品(108) - 无常精品A类(114)
  {
    id: '3',
    name: '五常稻花香 2.5kg',
    description: '正宗五常稻花香，米香浓郁，口感极佳',
    price: 89.90,
    originalPrice: 99.90,
    stock: 180,
    categoryId: '114',
    tags: ['精品', '有机认证'],
    images: [
      '/uploads/products/wuchang-01.jpg',
      '/uploads/products/wuchang-02.jpg'
    ],
    sales: 2350,
    rating: 4.9,
    reviewCount: 568,
    promotion: {
      type: 'discount',
      label: '限时特惠',
      discount: 0.9,
      description: '满100减10'
    },
    createTime: 1697270400,
    updateTime: 1697270400,
    status: 'on_sale',
    specs: {
      '产地': '黑龙江五常',
      '规格': '2.5kg',
      '等级': 'A级',
      '保质期': '6个月'
    }
  },
  {
    id: '4',
    name: '五常稻花香礼盒装 5kg',
    description: '高端礼盒包装，送礼自用两相宜',
    price: 188.00,
    stock: 95,
    categoryId: '114',
    tags: ['礼盒', '精品'],
    images: [
      '/uploads/products/wuchang-gift-01.jpg'
    ],
    sales: 450,
    rating: 5.0,
    reviewCount: 89,
    createTime: 1698048000,
    updateTime: 1698048000,
    status: 'on_sale',
    specs: {
      '产地': '黑龙江五常',
      '规格': '5kg(礼盒)',
      '等级': 'A级',
      '保质期': '6个月'
    }
  },

  // 香米分类(106) - 东北五常精品(108)
  {
    id: '5',
    name: '五常有机香米 3kg',
    description: '有机种植，无农药无化肥，健康首选',
    price: 128.00,
    stock: 120,
    categoryId: '108',
    tags: ['有机', '健康'],
    images: [
      '/uploads/products/organic-rice-01.jpg'
    ],
    sales: 680,
    rating: 4.7,
    reviewCount: 145,
    createTime: 1698134400,
    updateTime: 1698134400,
    status: 'on_sale',
    specs: {
      '产地': '黑龙江五常',
      '规格': '3kg',
      '认证': '有机认证',
      '保质期': '6个月'
    }
  },

  // 碎米分类(105)
  {
    id: '6',
    name: '优质碎米 10kg',
    description: '碎米也有好品质，实惠又好吃',
    price: 39.90,
    stock: 800,
    categoryId: '105',
    tags: ['实惠'],
    images: [
      '/uploads/products/broken-rice-01.jpg'
    ],
    sales: 1250,
    rating: 4.5,
    reviewCount: 267,
    createTime: 1697616000,
    updateTime: 1697616000,
    status: 'on_sale',
    specs: {
      '产地': '东北',
      '规格': '10kg',
      '保质期': '12个月'
    }
  },

  // 新米分类(107)
  {
    id: '7',
    name: '2024年新米 5kg',
    description: '当季新米，新鲜上市，香味十足',
    price: 68.00,
    stock: 450,
    categoryId: '107',
    tags: ['新米', '当季'],
    images: [
      '/uploads/products/new-rice-01.jpg'
    ],
    sales: 980,
    rating: 4.7,
    reviewCount: 198,
    promotion: {
      type: 'flash_sale',
      label: '秒杀',
      description: '限时秒杀中'
    },
    createTime: 1698652800,
    updateTime: 1698652800,
    status: 'on_sale',
    specs: {
      '产地': '黑龙江',
      '规格': '5kg',
      '年份': '2024年',
      '保质期': '12个月'
    }
  },
  {
    id: '8',
    name: '2024年头茬新米 10kg',
    description: '当季第一茬新米，品质上乘',
    price: 138.00,
    stock: 200,
    categoryId: '107',
    tags: ['新米', '头茬', '精品'],
    images: [
      '/uploads/products/first-crop-rice-01.jpg'
    ],
    sales: 520,
    rating: 4.8,
    reviewCount: 112,
    createTime: 1698739200,
    updateTime: 1698739200,
    status: 'on_sale',
    specs: {
      '产地': '黑龙江',
      '规格': '10kg',
      '年份': '2024年头茬',
      '保质期': '12个月'
    }
  }
]

/**
 * 根据分类ID获取商品列表(包含子分类)
 */
export function getMockProductsByCategoryId(
  categoryId: number,
  includeChildren: boolean,
  descendantIds: number[]
): Product[] {
  if (includeChildren) {
    // 获取所有子孙分类的商品
    return mockProducts.filter(product =>
      descendantIds.includes(Number(product.categoryId))
    )
  } else {
    // 只获取当前分类的商品
    return mockProducts.filter(product =>
      Number(product.categoryId) === categoryId
    )
  }
}

/**
 * 模拟分页数据
 */
export function getMockPaginatedProducts(
  products: Product[],
  page: number = 1,
  limit: number = 20
): PaginationData<Product> {
  const start = (page - 1) * limit
  const end = start + limit
  const data = products.slice(start, end)

  return {
    total: products.length,
    per_page: limit,
    current_page: page,
    last_page: Math.ceil(products.length / limit),
    data
  }
}
