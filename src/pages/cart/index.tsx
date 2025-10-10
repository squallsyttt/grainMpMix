import React from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import { Button } from '@nutui/nutui-react-taro';
import RegionBar from '../../components/RegionBar';
import RegionSelector from '../../components/RegionSelector';
import { useRegion } from '../../contexts/RegionContext';
import { useCart } from '../../contexts/CartContext';
import './index.less';

function Cart() {
  const { province, city, showSelector, closeSelector, setRegion } = useRegion();
  const {
    currentCartItems,
    currentCartStats,
    updateQuantity,
    removeFromCart,
    clearCurrentCart,
  } = useCart();

  const handleIncrease = (productId: string, currentQuantity: number) => {
    updateQuantity(productId, currentQuantity + 1);
  };

  const handleDecrease = (productId: string, currentQuantity: number) => {
    if (currentQuantity > 1) {
      updateQuantity(productId, currentQuantity - 1);
    }
  };

  const handleDelete = (productId: string) => {
    removeFromCart(productId);
  };

  const handleClearCart = () => {
    if (currentCartItems.length === 0) return;

    // TODO: 添加确认对话框
    clearCurrentCart();
  };

  const handleCheckout = () => {
    if (currentCartItems.length === 0) return;

    // TODO: 跳转到结算页面
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
              {currentCartItems.map((item) => (
                <View key={item.product.id} className="cart-item">
                  <Image
                    src={item.product.image}
                    className="product-image"
                    mode="aspectFill"
                  />
                  <View className="product-info">
                    <Text className="product-name">{item.product.name}</Text>
                    <Text className="product-price">
                      ¥{item.product.price.toFixed(2)}/{item.product.unit}
                    </Text>
                  </View>
                  <View className="quantity-control">
                    <View
                      className="control-btn"
                      onClick={() => handleDecrease(item.product.id, item.quantity)}
                    >
                      <Text className="control-icon">-</Text>
                    </View>
                    <Text className="quantity-text">{item.quantity}</Text>
                    <View
                      className="control-btn"
                      onClick={() => handleIncrease(item.product.id, item.quantity)}
                    >
                      <Text className="control-icon">+</Text>
                    </View>
                  </View>
                  <View
                    className="delete-btn"
                    onClick={() => handleDelete(item.product.id)}
                  >
                    <Text className="delete-icon">🗑️</Text>
                  </View>
                </View>
              ))}
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
                    ¥{currentCartStats.totalAmount.toFixed(2)}
                  </Text>
                </View>
              </View>
              <View className="footer-actions">
                <Button
                  type="default"
                  className="clear-btn"
                  onClick={handleClearCart}
                  size="small"
                >
                  清空购物车
                </Button>
                <Button
                  type="primary"
                  className="checkout-btn"
                  onClick={handleCheckout}
                >
                  去结算
                </Button>
              </View>
            </View>
          </>
        ) : (
          <View className="empty-cart">
            <Text className="empty-icon">🛒</Text>
            <Text className="empty-text">购物车是空的</Text>
            <Text className="empty-hint">
              当前地区：{city || province}
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
