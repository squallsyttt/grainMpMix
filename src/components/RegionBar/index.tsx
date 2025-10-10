import React from 'react';
import { View, Text } from '@tarojs/components';
import { useRegion } from '../../contexts/RegionContext';
import './index.less';

function RegionBar() {
  const { province, city, openSelector } = useRegion();

  const displayText = province === '全国' ? '全国' : city || province;

  const handleClick = () => {
    console.log('RegionBar 被点击');
    console.log('当前状态 - province:', province, 'city:', city);
    console.log('调用 openSelector...');
    openSelector();
  };

  console.log('RegionBar 渲染，displayText:', displayText);

  return (
    <View className='region-bar'>
      <View className='region-selector-btn' onClick={handleClick}>
        <Text className='location-icon'>📍</Text>
        <Text className='region-text'>{displayText}</Text>
        <Text className='arrow-icon'>▼</Text>
      </View>
    </View>
  );
}

export default RegionBar;
