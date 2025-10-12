import { Category } from '../types/category'

/**
 * 完整的分类模拟数据
 * 包含一级分类和二级分类，使用扩展的Category接口
 */

const now = Date.now()

/**
 * 一级分类（6个主分类）
 */
export const rootCategories: Category[] = [
  {
    id: 'rice',
    name: '大米专区',
    parentId: null,
    level: 1,
    icon: 'https://img.yzcdn.cn/vant/cat.jpeg',
    cover: 'https://img.yzcdn.cn/vant/cat.jpeg',
    description: '精选优质大米，品质保证',
    sort: 1,
    visible: true,
    productCount: 10,
    createTime: now - 86400000 * 30,
    updateTime: now - 86400000 * 1,
  },
  {
    id: 'millet',
    name: '细米专区',
    parentId: null,
    level: 1,
    icon: 'https://img.yzcdn.cn/vant/cat.jpeg',
    cover: 'https://img.yzcdn.cn/vant/cat.jpeg',
    description: '营养丰富的小米系列',
    sort: 2,
    visible: true,
    productCount: 5,
    createTime: now - 86400000 * 30,
    updateTime: now - 86400000 * 2,
  },
  {
    id: 'wheat',
    name: '碎米专区',
    parentId: null,
    level: 1,
    icon: 'https://img.yzcdn.cn/vant/cat.jpeg',
    cover: 'https://img.yzcdn.cn/vant/cat.jpeg',
    description: '健康麦片和全麦产品',
    sort: 3,
    visible: true,
    productCount: 5,
    createTime: now - 86400000 * 30,
    updateTime: now - 86400000 * 3,
  },
  {
    id: 'organic',
    name: '有机米专区',
    parentId: null,
    level: 1,
    icon: 'https://img.yzcdn.cn/vant/cat.jpeg',
    cover: 'https://img.yzcdn.cn/vant/cat.jpeg',
    description: '有机认证，绿色健康',
    sort: 4,
    visible: true,
    productCount: 5,
    createTime: now - 86400000 * 30,
    updateTime: now - 86400000 * 4,
  },
  {
    id: 'glutinous',
    name: '糯米专区',
    parentId: null,
    level: 1,
    icon: 'https://img.yzcdn.cn/vant/cat.jpeg',
    cover: 'https://img.yzcdn.cn/vant/cat.jpeg',
    description: '香糯可口的糯米系列',
    sort: 5,
    visible: true,
    productCount: 3,
    createTime: now - 86400000 * 30,
    updateTime: now - 86400000 * 5,
  },
  {
    id: 'special',
    name: '特价专区',
    parentId: null,
    level: 1,
    icon: 'https://img.yzcdn.cn/vant/cat.jpeg',
    cover: 'https://img.yzcdn.cn/vant/cat.jpeg',
    description: '超值特价，限时优惠',
    sort: 6,
    visible: true,
    productCount: 2,
    createTime: now - 86400000 * 30,
    updateTime: now - 86400000 * 6,
  },
]

/**
 * 二级分类（每个一级分类下的子分类）
 */
export const subCategories: Category[] = [
  // 大米专区 - 二级分类
  {
    id: 'rice-northeast',
    name: '东北大米',
    parentId: 'rice',
    level: 2,
    description: '东北黑土地出产的优质大米',
    sort: 1,
    visible: true,
    productCount: 3,
    createTime: now - 86400000 * 25,
    updateTime: now - 86400000 * 1,
  },
  {
    id: 'rice-wuchang',
    name: '五常大米',
    parentId: 'rice',
    level: 2,
    description: '黑龙江五常特产',
    sort: 2,
    visible: true,
    productCount: 2,
    createTime: now - 86400000 * 25,
    updateTime: now - 86400000 * 1,
  },
  {
    id: 'rice-thai',
    name: '泰国香米',
    parentId: 'rice',
    level: 2,
    description: '进口泰国茉莉香米',
    sort: 3,
    visible: true,
    productCount: 3,
    createTime: now - 86400000 * 25,
    updateTime: now - 86400000 * 1,
  },
  {
    id: 'rice-jasmine',
    name: '茉莉香米',
    parentId: 'rice',
    level: 2,
    description: '浓郁茉莉花香',
    sort: 4,
    visible: true,
    productCount: 2,
    createTime: now - 86400000 * 25,
    updateTime: now - 86400000 * 1,
  },

  // 细米专区 - 二级分类
  {
    id: 'millet-yellow',
    name: '小黄米',
    parentId: 'millet',
    level: 2,
    description: '营养丰富的小黄米',
    sort: 1,
    visible: true,
    productCount: 3,
    createTime: now - 86400000 * 25,
    updateTime: now - 86400000 * 2,
  },
  {
    id: 'millet-white',
    name: '白小米',
    parentId: 'millet',
    level: 2,
    description: '细腻柔滑的白小米',
    sort: 2,
    visible: true,
    productCount: 2,
    createTime: now - 86400000 * 25,
    updateTime: now - 86400000 * 2,
  },

  // 碎米专区 - 二级分类
  {
    id: 'wheat-oats',
    name: '燕麦片',
    parentId: 'wheat',
    level: 2,
    description: '健康营养的燕麦片',
    sort: 1,
    visible: true,
    productCount: 3,
    createTime: now - 86400000 * 25,
    updateTime: now - 86400000 * 3,
  },
  {
    id: 'wheat-whole',
    name: '全麦产品',
    parentId: 'wheat',
    level: 2,
    description: '高纤维全麦食品',
    sort: 2,
    visible: true,
    productCount: 2,
    createTime: now - 86400000 * 25,
    updateTime: now - 86400000 * 3,
  },

  // 有机米专区 - 二级分类
  {
    id: 'organic-northeast',
    name: '有机东北米',
    parentId: 'organic',
    level: 2,
    description: '有机认证的东北大米',
    sort: 1,
    visible: true,
    productCount: 3,
    createTime: now - 86400000 * 25,
    updateTime: now - 86400000 * 4,
  },
  {
    id: 'organic-multi',
    name: '有机杂粮',
    parentId: 'organic',
    level: 2,
    description: '多种有机杂粮组合',
    sort: 2,
    visible: true,
    productCount: 2,
    createTime: now - 86400000 * 25,
    updateTime: now - 86400000 * 4,
  },

  // 糯米专区 - 二级分类
  {
    id: 'glutinous-round',
    name: '圆糯米',
    parentId: 'glutinous',
    level: 2,
    description: '香糯圆润的糯米',
    sort: 1,
    visible: true,
    productCount: 2,
    createTime: now - 86400000 * 25,
    updateTime: now - 86400000 * 5,
  },
  {
    id: 'glutinous-long',
    name: '长糯米',
    parentId: 'glutinous',
    level: 2,
    description: '细长香糯的糯米',
    sort: 2,
    visible: true,
    productCount: 1,
    createTime: now - 86400000 * 25,
    updateTime: now - 86400000 * 5,
  },

  // 特价专区 - 二级分类
  {
    id: 'special-deals',
    name: '限时特价',
    parentId: 'special',
    level: 2,
    description: '限时优惠商品',
    sort: 1,
    visible: true,
    productCount: 1,
    createTime: now - 86400000 * 25,
    updateTime: now - 86400000 * 6,
  },
  {
    id: 'special-combo',
    name: '组合优惠',
    parentId: 'special',
    level: 2,
    description: '超值组合套餐',
    sort: 2,
    visible: true,
    productCount: 1,
    createTime: now - 86400000 * 25,
    updateTime: now - 86400000 * 6,
  },
]

/**
 * 所有分类（一级 + 二级）
 */
export const categories: Category[] = [...rootCategories, ...subCategories]

/**
 * 工具函数：根据父级ID获取子分类
 */
export function getSubCategoriesByParentId(parentId: string): Category[] {
  return subCategories.filter((cat) => cat.parentId === parentId)
}

/**
 * 工具函数：获取一级分类列表
 */
export function getRootCategories(): Category[] {
  return rootCategories
}

/**
 * 工具函数：根据ID获取分类
 */
export function getCategoryById(categoryId: string): Category | undefined {
  return categories.find((cat) => cat.id === categoryId)
}

/**
 * 工具函数：获取分类路径（用于面包屑导航）
 */
export function getCategoryPath(categoryId: string): Category[] {
  const path: Category[] = []
  let currentCat = getCategoryById(categoryId)

  while (currentCat) {
    path.unshift(currentCat)
    if (currentCat.parentId) {
      currentCat = getCategoryById(currentCat.parentId)
    } else {
      break
    }
  }

  return path
}

/**
 * 兼容旧代码的简化接口（保持向后兼容）
 */
export interface CategorySimple {
  id: string
  name: string
  count: number
  icon?: string
}

/**
 * 兼容旧代码：将完整分类转换为简化格式
 */
export const categoriesSimple: CategorySimple[] = rootCategories.map((cat) => ({
  id: cat.id,
  name: cat.name,
  count: cat.productCount,
  icon: cat.icon,
}))
