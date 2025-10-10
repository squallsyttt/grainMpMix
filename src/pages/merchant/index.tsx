import React from 'react';
import { View, Text } from '@tarojs/components';
import RegionBar from '../../components/RegionBar';
import RegionSelector from '../../components/RegionSelector';
import { useRegion } from '../../contexts/RegionContext';
import './index.less';

function Merchant() {
  const { province, city, showSelector, closeSelector, setRegion } = useRegion();
  
  return (
    <View className='page'>
      {/* 地区选择器 */}
      <RegionBar />
      
      <View className='page__section'>
        <View className='page__title'>商家</View>
        <View className='page__desc'>
          当前地区：{city || province}
        </View>
        <View className='page__desc'>
          为您推荐 {city || province} 的本地粮食商家
        </View>
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

export default Merchant;

