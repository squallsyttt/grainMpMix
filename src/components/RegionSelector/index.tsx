import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import { Popup } from '@nutui/nutui-react-taro';
import { regionData, getProvinceShortName, Region } from '../../data/regions';
import './index.less';

interface RegionSelectorProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (province: string, city: string) => void;
  defaultProvince?: string;
  defaultCity?: string;
}

function RegionSelector(props: RegionSelectorProps) {
  const { visible, onClose, onConfirm, defaultProvince = '', defaultCity = '' } = props;
  
  const [step, setStep] = useState<'province' | 'city'>('province');
  const [selectedProvince, setSelectedProvince] = useState<Region | null>(null);
  const [tempProvince, setTempProvince] = useState(defaultProvince);
  const [tempCity, setTempCity] = useState(defaultCity);

  // 同步外部 props 到内部状态
  useEffect(() => {
    setTempProvince(defaultProvince);
    setTempCity(defaultCity);
  }, [defaultProvince, defaultCity]);

  const handleProvinceClick = (province: Region) => {
    console.log('点击省份：', province.name);
    setSelectedProvince(province);
    setTempProvince(province.name);
    
    if (province.children && province.children.length > 0) {
      console.log('进入城市选择，城市数量：', province.children.length);
      setStep('city');
    } else {
      setTempCity(province.name);
      onConfirm(province.name, province.name);
      onClose();
      resetState();
    }
  };

  const handleCityClick = (city: Region) => {
    console.log('点击城市：', city.name, '省份：', tempProvince);
    setTempCity(city.name);
    onConfirm(tempProvince, city.name);
    onClose();
    resetState();
  };

  const handleBack = () => {
    setStep('province');
    setSelectedProvince(null);
  };

  const resetState = () => {
    setTimeout(() => {
      setStep('province');
      setSelectedProvince(null);
    }, 300);
  };

  const handlePopupClose = () => {
    onClose();
    resetState();
  };

  console.log('RegionSelector 渲染, visible:', visible);

  return (
    <Popup
      visible={visible}
      position='right'
      closeable
      closeIcon='close'
      onClose={handlePopupClose}
      style={{ width: '80%', height: '100%' }}
      destroyOnClose={false}
      zIndex={999}
    >
      <View className='region-selector'>
        {/* 标题栏 */}
        <View className='region-header'>
          {step === 'city' && (
            <View className='back-btn' onClick={handleBack}>
              <Text className='back-icon'>←</Text>
            </View>
          )}
          <Text className='region-title'>
            {step === 'province' ? '选择省份' : `${getProvinceShortName(tempProvince)} - 选择城市`}
          </Text>
        </View>

        {/* 列表内容 */}
        <ScrollView 
          scrollY 
          className='region-content'
          enableBackToTop
          scrollWithAnimation
        >
          {step === 'province' ? (
            <View className='region-list'>
              {regionData.map(province => (
                <View
                  key={province.id}
                  className={`region-item ${tempProvince === province.name ? 'active' : ''}`}
                  onClick={() => handleProvinceClick(province)}
                  hoverClass='none'
                >
                  <Text className='region-name'>{province.name}</Text>
                  {province.children && province.children.length > 0 && (
                    <Text className='region-arrow'>→</Text>
                  )}
                  {tempProvince === province.name && (
                    <Text className='region-check'>✓</Text>
                  )}
                </View>
              ))}
            </View>
          ) : (
            <View className='region-list'>
              {selectedProvince?.children?.map(city => (
                <View
                  key={city.id}
                  className={`region-item ${tempCity === city.name ? 'active' : ''}`}
                  onClick={() => handleCityClick(city)}
                  hoverClass='none'
                >
                  <Text className='region-name'>{city.name}</Text>
                  {tempCity === city.name && (
                    <Text className='region-check'>✓</Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </Popup>
  );
}

export default RegionSelector;
