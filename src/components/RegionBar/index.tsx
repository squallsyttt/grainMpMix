import React from 'react';
import { View, Text, Input } from '@tarojs/components';
import { Location, ArrowDown, Search } from '@nutui/icons-react-taro';
import { useRegion } from '../../contexts/RegionContext';
import Taro from '@tarojs/taro';
import './index.less';

function RegionBar() {
  const { province, city, openSelector } = useRegion();

  const displayText = province === '全国' ? '全国' : city || province;

  const handleRegionClick = (): void => {
    openSelector();
  };

  const handleSearchFocus = (): void => {
    // 搜索功能暂未实现，显示提示
    Taro.showToast({
      title: '搜索功能开发中',
      icon: 'none',
      duration: 1500
    });
  };

  return (
    <View className='region-bar'>
      {/* 左侧：地区选择器 */}
      <View className='region-bar__left'>
        <View className='region-selector-btn' onClick={handleRegionClick}>
          <Location size={16} className='region-selector-btn__icon' />
          <Text className='region-selector-btn__text'>{displayText}</Text>
          <ArrowDown size={12} className='region-selector-btn__arrow' />
        </View>
      </View>

      {/* 右侧：搜索框 */}
      <View className='region-bar__right'>
        <View className='search-box' onClick={handleSearchFocus}>
          <Search size={16} className='search-box__icon' />
          <Input
            className='search-box__input'
            placeholder='搜索'
            placeholderClass='search-box__placeholder'
            disabled
          />
        </View>
      </View>
    </View>
  );
}

export default RegionBar;
