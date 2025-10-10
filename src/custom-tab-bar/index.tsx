import React, { useState, useEffect } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { Home, Store, Cart, Notice, User } from '@nutui/icons-react-taro';
import './index.less';

const CustomTabBar = () => {
  const [selected, setSelected] = useState(0);

  const tabList = [
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
      IconComponent: Cart
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

  useEffect(() => {
    // 获取当前页面路径
    const pages = Taro.getCurrentPages();
    const currentPage = pages[pages.length - 1];
    const route = currentPage ? `/${currentPage.route}` : '';

    // 找到对应的 tab 索引
    const index = tabList.findIndex(item => item.pagePath === route);
    if (index !== -1) {
      setSelected(index);
    }
  }, []);

  const switchTab = (index: number, path: string) => {
    setSelected(index);
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
              <IconComponent
                size={22}
                color={isSelected ? '#FF6B35' : '#8a8a8a'}
              />
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
