import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import { regionData, getProvinceShortName, Region } from '../../data/regions';
import './index-v2.less';

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

  useEffect(() => {
    setTempProvince(defaultProvince);
    setTempCity(defaultCity);
  }, [defaultProvince, defaultCity]);

  const handleProvinceClick = (province: Region) => {
    setSelectedProvince(province);
    setTempProvince(province.name);

    if (province.children && province.children.length > 0) {
      setStep('city');
    } else {
      setTempCity(province.name);
      onConfirm(province.name, province.name);
      onClose();
      resetState();
    }
  };

  const handleCityClick = (city: Region) => {
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

  const handleMaskClick = () => {
    onClose();
    resetState();
  };

  if (!visible) {
    return null;
  }

  return (
    <View className='region-selector-wrapper'>
      {/* 遮罩层 */}
      <View className='region-mask' onClick={handleMaskClick} />
      
      {/* 侧边栏内容 */}
      <View className='region-sidebar'>
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
            <View className='close-btn' onClick={handleMaskClick}>
              <Text className='close-icon'>✕</Text>
            </View>
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
      </View>
    </View>
  );
}

export default RegionSelector;
