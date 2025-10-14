import React, { createContext, useContext, useState, useEffect, useMemo, useRef, ReactNode } from 'react';
import Taro from '@tarojs/taro';
import {
  RegionalCart,
  CartItem,
  Product,
  CartStats,
  RegionKey,
  getRegionKey,
  loadCartFromStorage,
  saveCartToStorage,
  calculateCartStats,
  getTotalItemCount,
  canIncrease,
  canDecrease,
  isOffShelf
} from '../types/cart';
import { useRegion } from './RegionContext';

interface CartContextType {
  // 获取当前地区购物车商品
  currentCartItems: CartItem[];
  // 获取当前地区购物车统计
  currentCartStats: CartStats;
  // 获取所有地区购物车商品总数
  totalCartCount: number;
  // 添加商品到当前地区购物车
  addToCart: (product: Product, quantity?: number) => void;
  // 从当前地区购物车删除商品
  removeFromCart: (productId: string) => void;
  // 更新当前地区购物车商品数量
  updateQuantity: (productId: string, quantity: number) => void;
  // 增加商品数量(带防抖和库存验证)
  handleIncrease: (productId: string) => void;
  // 减少商品数量(带防抖和库存验证)
  handleDecrease: (productId: string) => void;
  // 清空当前地区购物车
  clearCurrentCart: () => void;
  // 清空所有地区购物车
  clearAllCarts: () => void;
  // 支付成功后清空购物车(预留接口)
  clearCartAfterPayment: (regionKey: RegionKey) => void;
  // 获取指定地区购物车
  getRegionCart: (province: string, city: string) => CartItem[];
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

/**
 * 防抖工具函数
 * @param func - 需要防抖的函数
 * @param delay - 延迟时间(毫秒)
 * @returns 防抖后的函数
 */
function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
      timeoutId = null;
    }, delay);
  };
}

export function CartProvider({ children }: CartProviderProps) {
  const { province, city } = useRegion();
  const [regionalCart, setRegionalCart] = useState<RegionalCart>({});

  // 从本地存储加载购物车数据
  useEffect(() => {
    const cart = loadCartFromStorage();
    setRegionalCart(cart);
  }, []);

  // 保存购物车数据到本地存储
  const saveCart = (cart: RegionalCart): void => {
    setRegionalCart(cart);
    const success = saveCartToStorage(cart);
    if (!success) {
      console.warn('[CartContext] Failed to save cart to localStorage');
      Taro.showToast({
        title: '购物车保存失败',
        icon: 'none',
        duration: 2000,
      });
    }
  };

  // 获取当前地区的购物车键
  const getCurrentRegionKey = (): string => {
    return getRegionKey(province, city);
  };

  // 获取当前地区购物车商品列表
  const getCurrentCartItems = (): CartItem[] => {
    const regionKey = getCurrentRegionKey();
    return regionalCart[regionKey] || [];
  };

  // 计算当前地区购物车统计
  const getCurrentCartStats = (): CartStats => {
    const items = getCurrentCartItems();
    return calculateCartStats(items);
  };

  // 计算所有地区购物车商品总数
  const getTotalCartCount = (): number => {
    return getTotalItemCount(regionalCart);
  };

  // 添加商品到当前地区购物车
  const addToCart = (product: Product, quantity: number = 1) => {
    const regionKey = getCurrentRegionKey();
    const currentItems = regionalCart[regionKey] || [];

    // 检查商品是否已存在
    const existingItemIndex = currentItems.findIndex(item => item.product.id === product.id);

    // 如果是新商品，检查购物车容量限制 (FR-020)
    if (existingItemIndex < 0 && currentItems.length >= 50) {
      Taro.showToast({
        title: '购物车已满，请先结算部分商品',
        icon: 'none',
        duration: 2000,
      });
      return;
    }

    let newItems: CartItem[];
    if (existingItemIndex >= 0) {
      // 商品已存在,增加数量
      newItems = currentItems.map((item, index) => {
        if (index === existingItemIndex) {
          return {
            ...item,
            quantity: item.quantity + quantity,
          };
        }
        return item;
      });
    } else {
      // 新商品,添加到购物车
      newItems = [
        ...currentItems,
        {
          product,
          quantity,
          addedAt: Date.now(),
        },
      ];
    }

    const newCart = {
      ...regionalCart,
      [regionKey]: newItems,
    };
    saveCart(newCart);

    Taro.showToast({
      title: '已加入购物车',
      icon: 'success',
      duration: 1500,
    });
  };

  // 从当前地区购物车删除商品
  const removeFromCart = (productId: string) => {
    const regionKey = getCurrentRegionKey();
    const currentItems = regionalCart[regionKey] || [];

    const newItems = currentItems.filter(item => item.product.id !== productId);

    const newCart = {
      ...regionalCart,
      [regionKey]: newItems,
    };
    saveCart(newCart);

    // 添加删除成功的反馈
    Taro.showToast({
      title: '已删除',
      icon: 'success',
      duration: 1500,
    });
  };

  // 更新当前地区购物车商品数量
  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const regionKey = getCurrentRegionKey();
    const currentItems = regionalCart[regionKey] || [];

    const newItems = currentItems.map(item => {
      if (item.product.id === productId) {
        return {
          ...item,
          quantity,
        };
      }
      return item;
    });

    const newCart = {
      ...regionalCart,
      [regionKey]: newItems,
    };
    saveCart(newCart);
  };

  // 防抖函数引用,保持函数引用稳定
  const debouncedUpdateQuantityRef = useRef(
    debounce((productId: string, quantity: number) => {
      updateQuantity(productId, quantity);
    }, 300)
  );

  /**
   * 增加商品数量(带防抖和库存验证)
   * @param productId - 商品ID
   */
  const handleIncrease = (productId: string): void => {
    const regionKey = getCurrentRegionKey();
    const currentItems = regionalCart[regionKey] || [];
    const item = currentItems.find(i => i.product.id === productId);

    if (!item) {
      console.warn('[CartContext] handleIncrease: Item not found:', productId);
      return;
    }

    // 检查商品是否已下架
    if (isOffShelf(item)) {
      Taro.showToast({
        title: '该商品已下架',
        icon: 'none',
        duration: 2000,
      });
      return;
    }

    // 使用 canIncrease 检查是否可以增加数量
    if (!canIncrease(item)) {
      // 如果有库存限制,显示具体库存数
      if (item.product.stock !== undefined) {
        Taro.showToast({
          title: `库存不足,当前最多可购买${item.product.stock}件`,
          icon: 'none',
          duration: 2000,
        });
      } else {
        Taro.showToast({
          title: '已达到最大购买数量(999件)',
          icon: 'none',
          duration: 2000,
        });
      }
      return;
    }

    // 使用防抖更新数量
    debouncedUpdateQuantityRef.current(productId, item.quantity + 1);
  };

  /**
   * 减少商品数量(带防抖和库存验证)
   * @param productId - 商品ID
   */
  const handleDecrease = (productId: string): void => {
    const regionKey = getCurrentRegionKey();
    const currentItems = regionalCart[regionKey] || [];
    const item = currentItems.find(i => i.product.id === productId);

    if (!item) {
      console.warn('[CartContext] handleDecrease: Item not found:', productId);
      return;
    }

    // 使用 canDecrease 检查是否可以减少数量
    if (!canDecrease(item)) {
      // 如果数量为1,提示用户删除
      Taro.showToast({
        title: '数量已为最小值,请使用删除功能',
        icon: 'none',
        duration: 2000,
      });
      return;
    }

    // 使用防抖更新数量
    debouncedUpdateQuantityRef.current(productId, item.quantity - 1);
  };

  // 清空当前地区购物车
  const clearCurrentCart = () => {
    const regionKey = getCurrentRegionKey();
    const newCart = {
      ...regionalCart,
      [regionKey]: [],
    };
    saveCart(newCart);
  };

  // 清空所有地区购物车
  const clearAllCarts = () => {
    saveCart({});
  };

  /**
   * 支付成功后清空指定地区购物车(预留接口)
   * @param regionKey - 地区键(如"江苏省-南京市")
   *
   * 该函数将在订单确认页面支付成功后调用,用于清空已支付订单对应地区的购物车
   * 这样用户在支付完成后不会看到已购买的商品仍然在购物车中
   *
   * @example
   * // 在订单确认页面支付成功后调用
   * const { clearCartAfterPayment } = useCart();
   * clearCartAfterPayment('江苏省-南京市');
   */
  const clearCartAfterPayment = (regionKey: RegionKey): void => {
    const newCart = {
      ...regionalCart,
      [regionKey]: [],
    };
    saveCart(newCart);
  };

  // 获取指定地区购物车
  const getRegionCart = (province: string, city: string): CartItem[] => {
    const regionKey = getRegionKey(province, city);
    return regionalCart[regionKey] || [];
  };

  // 使用 useMemo 优化当前地区购物车数据的计算,确保地区切换时实时更新
  const currentCartItems = useMemo(() => {
    return getCurrentCartItems();
  }, [regionalCart, province, city]);

  const currentCartStats = useMemo(() => {
    return calculateCartStats(currentCartItems);
  }, [currentCartItems]);

  const totalCartCount = useMemo(() => {
    return getTotalItemCount(regionalCart);
  }, [regionalCart]);

  return (
    <CartContext.Provider
      value={{
        currentCartItems,
        currentCartStats,
        totalCartCount,
        addToCart,
        removeFromCart,
        updateQuantity,
        handleIncrease,
        handleDecrease,
        clearCurrentCart,
        clearAllCarts,
        clearCartAfterPayment,
        getRegionCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
