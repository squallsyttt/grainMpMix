/**
 * 购物车相关类型定义
 * Feature: 地区化购物车功能完善
 */

// ==================== 商品实体 ====================

/**
 * 商品状态枚举
 */
export type ProductStatus = 'on_sale' | 'off_sale' | 'sold_out' | 'pre_sale';

/**
 * 商品实体 - 购物车中的商品信息
 */
export interface Product {
  /** 商品ID - 唯一标识符 */
  id: string;
  /** 商品名称 - 最大50字符 */
  name: string;
  /** 商品价格(元) - 精确到分,两位小数 */
  price: number;
  /** 商品主图URL - 用于购物车展示 */
  image: string;
  /** 商品单位 - 例如:"斤"、"kg"、"袋" */
  unit: string;
  /** 库存数量(可选) - 用于库存不足提示,不强制校验 */
  stock?: number;
  /** 商品状态 - 用于标记下架商品 */
  status?: ProductStatus;
  /** 商品描述(可选) - 简短描述 */
  description?: string;
}

// ==================== 购物车项实体 ====================

/**
 * 购物车项 - 购物车中的单个商品条目
 */
export interface CartItem {
  /** 商品信息 - 完整的Product对象 */
  product: Product;
  /** 购买数量 - 最小1,最大999 */
  quantity: number;
  /** 添加时间戳(毫秒) - 用于排序和过期清理 */
  addedAt: number;
}

// ==================== 地区键 ====================

/**
 * 地区键 - 格式为 "省份-城市"
 * 用于隔离不同地区的购物车
 */
export type RegionKey = string;

/**
 * 生成地区键
 * @param province - 省份名称(如"江苏省")
 * @param city - 城市名称(如"南京市")
 * @returns 地区键(如"江苏省-南京市")
 */
export const getRegionKey = (province: string, city: string): RegionKey => {
  return `${province}-${city}`;
};

/**
 * 解析地区键
 * @param regionKey - 地区键(如"江苏省-南京市")
 * @returns 省份和城市对象
 */
export const parseRegionKey = (regionKey: RegionKey): { province: string; city: string } => {
  const [province, city] = regionKey.split('-');
  return { province, city };
};

/**
 * 验证地区键格式
 * @param regionKey - 地区键
 * @returns 是否有效
 */
export const isValidRegionKey = (regionKey: RegionKey): boolean => {
  if (!regionKey || typeof regionKey !== 'string') return false;
  const parts = regionKey.split('-');
  return parts.length === 2 && parts[0].length > 0 && parts[1].length > 0;
};

// ==================== 地区化购物车 ====================

/**
 * 地区化购物车 - 按地区键分组的购物车数据结构
 * 键为RegionKey,值为CartItem数组
 */
export interface RegionalCart {
  [regionKey: RegionKey]: CartItem[];
}

/**
 * 获取指定地区的购物车数据
 * @param regionalCart - 完整的地区化购物车
 * @param regionKey - 地区键
 * @returns 该地区的购物车项数组,不存在时返回空数组
 */
export const getRegionCart = (
  regionalCart: RegionalCart,
  regionKey: RegionKey
): CartItem[] => {
  return regionalCart[regionKey] || [];
};

/**
 * 设置指定地区的购物车数据
 * @param regionalCart - 完整的地区化购物车
 * @param regionKey - 地区键
 * @param items - 购物车项数组
 * @returns 更新后的地区化购物车
 */
export const setRegionCart = (
  regionalCart: RegionalCart,
  regionKey: RegionKey,
  items: CartItem[]
): RegionalCart => {
  return {
    ...regionalCart,
    [regionKey]: items
  };
};

/**
 * 清空指定地区的购物车
 * @param regionalCart - 完整的地区化购物车
 * @param regionKey - 地区键
 * @returns 更新后的地区化购物车
 */
export const clearRegionCart = (
  regionalCart: RegionalCart,
  regionKey: RegionKey
): RegionalCart => {
  const newCart = { ...regionalCart };
  delete newCart[regionKey];
  return newCart;
};

/**
 * 获取所有地区的购物车商品种类总数
 * @param regionalCart - 完整的地区化购物车
 * @returns 所有地区购物车商品种类总数
 */
export const getTotalItemCount = (regionalCart: RegionalCart): number => {
  return Object.values(regionalCart).reduce((sum, items) => sum + items.length, 0);
};

// ==================== 购物车统计 ====================

/**
 * 购物车统计信息 - 实时计算,不存储
 */
export interface CartStats {
  /** 商品种类数 - 购物车中不同商品的数量 */
  itemCount: number;
  /** 商品总数量 - 所有商品数量的总和 */
  totalItems: number;
  /** 总金额(元) - 所有商品小计的总和,精确到分 */
  totalAmount: number;
}

/**
 * 计算购物车统计信息
 * @param items - 购物车项数组
 * @returns 统计信息
 */
export const calculateCartStats = (items: CartItem[]): CartStats => {
  const itemCount = items.length;
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const roundedTotalAmount = Math.round(totalAmount * 100) / 100;

  return { itemCount, totalItems, totalAmount: roundedTotalAmount };
};

/**
 * 格式化金额显示
 * @param amount - 金额(元)
 * @returns 格式化的金额字符串(如"¥29.90")
 */
export const formatAmount = (amount: number): string => {
  return `¥${amount.toFixed(2)}`;
};

/**
 * 格式化商品单价显示
 * @param product - 商品信息
 * @returns 格式化的单价字符串(如"¥5.00/斤")
 */
export const formatUnitPrice = (product: Product): string => {
  return `¥${product.price.toFixed(2)}/${product.unit}`;
};

// ==================== localStorage 操作 ====================

const STORAGE_KEY = 'regional_cart_data';

/**
 * 从localStorage安全读取购物车数据
 * @returns 购物车数据,读取失败返回空对象
 */
export const loadCartFromStorage = (): RegionalCart => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return {};

    const parsed = JSON.parse(data);
    if (typeof parsed !== 'object' || parsed === null) {
      console.warn('[Cart] Invalid cart data format, resetting to empty');
      return {};
    }

    const validated: RegionalCart = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (isValidRegionKey(key) && Array.isArray(value)) {
        validated[key] = value.filter(
          (item: any) => item.product?.id && item.quantity >= 1
        );
      }
    }

    return validated;
  } catch (error) {
    console.error('[Cart] Failed to load cart from storage:', error);
    return {};
  }
};

/**
 * 安全保存购物车数据到localStorage
 * @param cart - 购物车数据
 * @returns 是否保存成功
 */
export const saveCartToStorage = (cart: RegionalCart): boolean => {
  try {
    const serialized = JSON.stringify(cart);
    localStorage.setItem(STORAGE_KEY, serialized);
    return true;
  } catch (error) {
    if ((error as any).name === 'QuotaExceededError') {
      console.error('[Cart] localStorage quota exceeded');
      const cleaned = cleanExpiredCartItems(cart, 7 * 24 * 60 * 60 * 1000);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
        return true;
      } catch (retryError) {
        console.error('[Cart] Failed to save even after cleaning');
      }
    }
    console.error('[Cart] Failed to save cart to storage:', error);
    return false;
  }
};

/**
 * 清理过期的购物车项
 * @param cart - 购物车数据
 * @param maxAge - 最大保留时间(毫秒)
 * @returns 清理后的购物车数据
 */
const cleanExpiredCartItems = (cart: RegionalCart, maxAge: number): RegionalCart => {
  const now = Date.now();
  const cleaned: RegionalCart = {};

  for (const [key, items] of Object.entries(cart)) {
    const validItems = items.filter(item => now - item.addedAt < maxAge);
    if (validItems.length > 0) {
      cleaned[key] = validItems;
    }
  }

  return cleaned;
};

// ==================== 辅助函数 ====================

/**
 * 计算购物车项的小计金额
 * @param item - 购物车项
 * @returns 小计金额,精确到分
 */
export const getSubtotal = (item: CartItem): number => {
  return Math.round(item.product.price * item.quantity * 100) / 100;
};

/**
 * 检查商品是否可增加数量
 * @param item - 购物车项
 * @returns 是否可增加
 */
export const canIncrease = (item: CartItem): boolean => {
  if (!item.product.stock) return item.quantity < 999;
  return item.quantity < item.product.stock && item.quantity < 999;
};

/**
 * 检查商品是否可减少数量
 * @param item - 购物车项
 * @returns 是否可减少
 */
export const canDecrease = (item: CartItem): boolean => {
  return item.quantity > 1;
};

/**
 * 检查商品是否已下架
 * @param item - 购物车项
 * @returns 是否下架
 */
export const isOffShelf = (item: CartItem): boolean => {
  return item.product.status === 'off_sale' || item.product.status === 'sold_out';
};
