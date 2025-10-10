import React, { Component } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { Home, Store, Cart, Notice, User } from '@nutui/icons-react-taro';
import './index.less';

interface TabItem {
  pagePath: string;
  text: string;
  IconComponent: any;
}

class CustomTabBar extends Component<{}, { selected: number }> {
  tabList: TabItem[] = [
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

  state = {
    selected: 0
  };

  componentDidMount() {
    this.syncSelectedByRoute();
  }

  componentDidShow() {
    this.syncSelectedByRoute();
  }

  normalizePath = (path: string) => path.replace(/^\//, '');

  syncSelectedByRoute = () => {
    const pages = Taro.getCurrentPages();
    const current = pages[pages.length - 1];
    const route = current?.route ? `/${current.route}` : this.tabList[0].pagePath;
    const normalizedRoute = this.normalizePath(route);
    const matchedIndex = this.tabList.findIndex(
      (item) => this.normalizePath(item.pagePath) === normalizedRoute
    );
    const finalIndex = matchedIndex >= 0 ? matchedIndex : 0;

    if (finalIndex !== this.state.selected) {
      this.setState({ selected: finalIndex });
    }
  };

  switchTab = (index: number, path: string) => {
    if (index === this.state.selected) {
      return;
    }

    Taro.switchTab({ url: path });
  };

  render() {
    const { selected } = this.state;

    return (
      <View className='custom-tab-bar'>
        {this.tabList.map((item, index) => {
          const IconComponent = item.IconComponent;
          const isSelected = selected === index;

          return (
            <View
              key={index}
              className='tab-item'
              onClick={() => this.switchTab(index, item.pagePath)}
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
  }
}

export default CustomTabBar;
