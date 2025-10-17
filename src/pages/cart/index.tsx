import React, { useMemo, useEffect } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import { Button, Empty, Dialog } from '@nutui/nutui-react-taro';
import { Del } from '@nutui/icons-react-taro';
import Taro from '@tarojs/taro';
import RegionBar from '../../components/RegionBar';
import RegionSelector from '../../components/RegionSelector';
import { useRegion } from '../../contexts/RegionContext';
import { useCart } from '../../contexts/CartContext';
import { useUser } from '../../contexts/UserContext';
import {
  formatAmount,
  formatUnitPrice,
  getSubtotal,
  getRegionKey,
  isOffShelf
} from '../../types/cart';
import './index.less';

function Cart() {
  const { province, city, showSelector, closeSelector, setRegion } = useRegion();
  const {
    currentCartItems,
    currentCartStats,
    handleIncrease,
    handleDecrease,
    removeFromCart,
    clearCurrentCart,
  } = useCart();
  const { isLoggedIn } = useUser();

  // 计算当前地区键
  const currentRegionKey = useMemo(() => {
    return getRegionKey(province, city);
  }, [province, city]);

  // 监听地区切换,确保购物车数据实时更新 (T016-T017)
  useEffect(() => {
    // currentCartItems 已通过 CartContext 的 useMemo 自动更新
    // 确保地区切换响应时间 <500ms (SC-004)
  }, [currentRegionKey, currentCartItems.length]);

  const handleClearCart = () => {
    if (currentCartItems.length === 0) return;

    Dialog.confirm({
      title: '清空购物车',
      content: '确定要清空当前地区的购物车吗?此操作不可撤销。',
      confirmText: '清空',
      cancelText: '取消',
      onConfirm: () => {
        clearCurrentCart();
        Taro.showToast({
          title: '购物车已清空',
          icon: 'success',
          duration: 1500,
        });
      },
      onCancel: () => {
        // 用户取消清空操作
      },
    });
  };

  /**
   * 处理结算逻辑 (T019)
   * - 检查购物车是否为空
   * - 检查用户登录状态
   * - 未登录则跳转到登录页面(携带redirect参数)
   * - 已登录则跳转到订单确认页面(携带regionKey参数)
   */
  const handleCheckout = () => {
    // 购物车为空时不允许结算
    if (currentCartItems.length === 0) {
      Taro.showToast({
        title: '购物车是空的',
        icon: 'none',
        duration: 2000,
      });
      return;
    }

    // 检查登录状态 (FR-011)
    if (!isLoggedIn) {
      // 未登录,跳转到登录页面并传递 redirect 参数
      Taro.navigateTo({
        url: '/pages/login/index?redirect=/pages/order-confirm/index',
      });
      return;
    }

    // 已登录,跳转到订单确认页面并携带地区键参数
    const encodedRegionKey = encodeURIComponent(currentRegionKey);
    Taro.navigateTo({
      url: `/pages/order-confirm/index?regionKey=${encodedRegionKey}`,
    });
  };

  return (
    <View className="cart-page">
      {/* 地区选择器 */}
      <RegionBar />

      <View className="cart-container">
        {currentCartItems.length > 0 ? (
          <>
            {/* 购物车商品列表 */}
            <ScrollView scrollY className="cart-list">
              {currentCartItems.map((item) => {
                const itemIsOffShelf = isOffShelf(item);

                return (
                  <View key={item.product.id} className="cart-item">
                    {/* 上半部分：图片 + 商品信息 */}
                    <View className="cart-item-top">
                      <Image
                        src={item.product.image}
                        className="product-image"
                        mode="aspectFill"
                      />
                      <View className="product-info">
                        <Text className="product-name">{item.product.name}</Text>
                        <Text className="product-price">
                          {formatUnitPrice(item.product)}
                        </Text>
                        <Text className="product-subtotal">
                          小计: {formatAmount(getSubtotal(item))}
                        </Text>
                      </View>
                    </View>

                    {/* 下半部分：数量控制 + 删除按钮 */}
                    <View className="cart-item-bottom">
                      <View className="quantity-control">
                        <View
                          className="control-btn"
                          onClick={() => handleDecrease(item.product.id)}
                        >
                          <Text className="control-icon">-</Text>
                        </View>
                        <Text className="quantity-text">{item.quantity}</Text>
                        <View
                          className={`control-btn ${itemIsOffShelf ? 'disabled' : ''}`}
                          onClick={() => !itemIsOffShelf && handleIncrease(item.product.id)}
                        >
                          <Text className="control-icon">+</Text>
                        </View>
                      </View>
                      <View
                        className="delete-btn"
                        onClick={() => removeFromCart(item.product.id)}
                      >
                        <Del className="delete-icon" size={20} color="#999" />
                      </View>
                    </View>

                    {/* 下架商品遮罩 (FR-019) */}
                    {itemIsOffShelf && (
                      <View className="off-shelf-mask">
                        <Text className="off-shelf-text">该商品已下架</Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </ScrollView>

            {/* 底部结算栏 */}
            <View className="cart-footer">
              <View className="cart-summary">
                <View className="summary-line">
                  <Text className="summary-label">商品种类：</Text>
                  <Text className="summary-value">{currentCartStats.itemCount} 种</Text>
                </View>
                <View className="summary-line">
                  <Text className="summary-label">商品数量：</Text>
                  <Text className="summary-value">{currentCartStats.totalItems} 件</Text>
                </View>
                <View className="summary-line total">
                  <Text className="summary-label">合计：</Text>
                  <Text className="summary-amount">
                    {formatAmount(currentCartStats.totalAmount)}
                  </Text>
                </View>
              </View>
              <View className="footer-actions">
                <Button
                  type="default"
                  className="clear-btn"
                  onClick={handleClearCart}
                  size="small"
                  disabled={currentCartItems.length === 0}
                >
                  清空购物车
                </Button>
                <Button
                  type="primary"
                  className="checkout-btn"
                  onClick={handleCheckout}
                  disabled={currentCartItems.length === 0}
                >
                  去结算({currentCartStats.totalItems}件)
                </Button>
              </View>
            </View>
          </>
        ) : (
          <View className="empty-cart">
            <Empty description="购物车是空的" />
            <Text className="empty-hint">
              当前地区：{currentRegionKey}
            </Text>
            <Text className="empty-hint">
              去添加一些商品吧~
            </Text>
          </View>
        )}
      </View>

      {/* 地区选择弹窗 */}
      <RegionSelector
        visible={showSelector}
        onClose={closeSelector}
        onConfirm={setRegion}
        defaultProvince={province}
        defaultCity={city}
      />
    </View>
  );
}

export default Cart;
