import React from 'react';
import { View, Text } from '@tarojs/components';
import { useRegion } from '../../contexts/RegionContext';
import './index.less';

function RegionBar() {
  const { province, city, openSelector } = useRegion();

  const displayText = province === '全国' ? '全国' : city || province;

  const handleClick = () => {
    openSelector();
  };

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
