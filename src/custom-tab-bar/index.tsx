import React, { useState, useEffect, useCallback } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { Home, Store, Cart, Notice, User } from '@nutui/icons-react-taro';
import { Badge } from '@nutui/nutui-react-taro';
import { useCart } from '../contexts/CartContext';
import './index.less';

interface TabItem {
  pagePath: string;
  text: string;
  IconComponent: any;
  showBadge?: boolean; // 是否显示徽标
}

const CustomTabBar: React.FC = () => {
  const [selected, setSelected] = useState(0);
  const { totalCartCount } = useCart();

  const tabList: TabItem[] = [
    {
      pagePath: '/pages/index/index',
      text: '首页',
      IconComponent: Home
    },
    {
      pagePath: '/pages/merchant/index',
      text: '商家',
      IconComponent: Store
    },
    {
      pagePath: '/pages/cart/index',
      text: '购物车',
      IconComponent: Cart,
      showBadge: true
    },
    {
      pagePath: '/pages/news/index',
      text: '资讯',
      IconComponent: Notice
    },
    {
      pagePath: '/pages/mine/index',
      text: '我的',
      IconComponent: User
    }
  ];

  const normalizePath = (path: string): string => path.replace(/^\//, '');

  const syncSelectedByRoute = useCallback((): void => {
    const pages = Taro.getCurrentPages();
    const current = pages[pages.length - 1];
    const route = current?.route ? `/${current.route}` : tabList[0].pagePath;
    const normalizedRoute = normalizePath(route);
    const matchedIndex = tabList.findIndex(
      (item) => normalizePath(item.pagePath) === normalizedRoute
    );
    const finalIndex = matchedIndex >= 0 ? matchedIndex : 0;

    if (finalIndex !== selected) {
      setSelected(finalIndex);
    }
  }, [selected]);

  useEffect(() => {
    syncSelectedByRoute();
  }, []);

  useEffect(() => {
    const onShow = () => {
      syncSelectedByRoute();
    };

    // 监听页面显示事件
    Taro.eventCenter.on('onShow', onShow);

    return () => {
      Taro.eventCenter.off('onShow', onShow);
    };
  }, [syncSelectedByRoute]);

  const switchTab = (index: number, path: string): void => {
    if (index === selected) {
      return;
    }

    Taro.switchTab({ url: path });
  };

  return (
    <View className='custom-tab-bar'>
      {tabList.map((item, index) => {
        const IconComponent = item.IconComponent;
        const isSelected = selected === index;

        return (
          <View
            key={index}
            className='tab-item'
            onClick={() => switchTab(index, item.pagePath)}
          >
            <View className='tab-icon'>
              {item.showBadge ? (
                <Badge
                  value={totalCartCount > 0 ? totalCartCount : undefined}
                  max={99}
                  top="0"
                  right="0"
                >
                  <IconComponent
                    size={22}
                    color={isSelected ? '#FF6B35' : '#8a8a8a'}
                  />
                </Badge>
              ) : (
                <IconComponent
                  size={22}
                  color={isSelected ? '#FF6B35' : '#8a8a8a'}
                />
              )}
            </View>
            <Text className={`tab-text ${isSelected ? 'selected' : ''}`}>
              {item.text}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

export default CustomTabBar;
