import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Taro from '@tarojs/taro';
import {
  RegionalCart,
  CartItem,
  Product,
  CartStats,
  getRegionKey
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
  // 清空当前地区购物车
  clearCurrentCart: () => void;
  // 清空所有地区购物车
  clearAllCarts: () => void;
  // 获取指定地区购物车
  getRegionCart: (province: string, city: string) => CartItem[];
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'regional_cart_data';

interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const { province, city } = useRegion();
  const [regionalCart, setRegionalCart] = useState<RegionalCart>({});

  // 从本地存储加载购物车数据
  useEffect(() => {
    const savedCart = Taro.getStorageSync(CART_STORAGE_KEY);
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        setRegionalCart(parsed);
      } catch (e) {
        // 解析失败，使用空对象
        setRegionalCart({});
      }
    }
  }, []);

  // 保存购物车数据到本地存储
  const saveCart = (cart: RegionalCart) => {
    setRegionalCart(cart);
    Taro.setStorageSync(CART_STORAGE_KEY, JSON.stringify(cart));
  };

  // 获取当前地区的购物车键
  const getCurrentRegionKey = () => {
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
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    return {
      totalItems,
      totalAmount,
      itemCount: items.length,
    };
  };

  // 计算所有地区购物车商品总数
  const getTotalCartCount = (): number => {
    return Object.values(regionalCart).reduce((total, items) => {
      return total + items.reduce((sum, item) => sum + item.quantity, 0);
    }, 0);
  };

  // 添加商品到当前地区购物车
  const addToCart = (product: Product, quantity: number = 1) => {
    const regionKey = getCurrentRegionKey();
    const currentItems = regionalCart[regionKey] || [];

    // 检查商品是否已存在
    const existingItemIndex = currentItems.findIndex(item => item.product.id === product.id);

    let newItems: CartItem[];
    if (existingItemIndex >= 0) {
      // 商品已存在，增加数量
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
      // 新商品，添加到购物车
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

  // 获取指定地区购物车
  const getRegionCart = (province: string, city: string): CartItem[] => {
    const regionKey = getRegionKey(province, city);
    return regionalCart[regionKey] || [];
  };

  const currentCartItems = getCurrentCartItems();
  const currentCartStats = getCurrentCartStats();
  const totalCartCount = getTotalCartCount();

  return (
    <CartContext.Provider
      value={{
        currentCartItems,
        currentCartStats,
        totalCartCount,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCurrentCart,
        clearAllCarts,
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
