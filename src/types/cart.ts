// 购物车相关类型定义

// 商品信息
export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  unit: string; // 单位：斤、kg等
  stock?: number; // 库存
  description?: string;
}

// 购物车项
export interface CartItem {
  product: Product;
  quantity: number;
  addedAt: number; // 添加时间戳
}

// 地区键（province-city）
export type RegionKey = string;

// 按地区分组的购物车数据
export interface RegionalCart {
  [regionKey: RegionKey]: CartItem[];
}

// 购物车统计信息
export interface CartStats {
  totalItems: number; // 总商品数量
  totalAmount: number; // 总金额
  itemCount: number; // 商品种类数
}

// 生成地区键
export const getRegionKey = (province: string, city: string): RegionKey => {
  return `${province}-${city}`;
};

// 解析地区键
export const parseRegionKey = (regionKey: RegionKey): { province: string; city: string } => {
  const [province, city] = regionKey.split('-');
  return { province, city };
};
