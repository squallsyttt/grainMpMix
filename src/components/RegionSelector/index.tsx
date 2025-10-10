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

  // 当弹窗打开时，根据当前选择的地区初始化状态
  useEffect(() => {
    if (visible && defaultProvince && defaultProvince !== '全国' && defaultCity) {
      // 如果已选择了具体省份和城市，直接进入城市选择页
      const province = regionData.find(p => p.name === defaultProvince);
      if (province && province.children && province.children.length > 0) {
        setSelectedProvince(province);
        setStep('city');
      }
    } else if (visible) {
      // 否则回到省份选择页
      setStep('province');
      setSelectedProvince(null);
    }
  }, [visible, defaultProvince, defaultCity]);

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
    // 不再自动重置状态，让 useEffect 处理
  };

  const handlePopupClose = () => {
    onClose();
  };

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
              {regionData.map(province => {
                // 判断地区类型
                let regionType = '';
                let regionTypeClass = '';
                if (province.name.includes('自治区')) {
                  regionType = '自治区';
                  regionTypeClass = 'autonomous';
                } else if (['北京市', '天津市', '上海市', '重庆市'].includes(province.name)) {
                  regionType = '直辖市';
                  regionTypeClass = 'municipality';
                } else if (['香港特别行政区', '澳门特别行政区'].includes(province.name)) {
                  regionType = '特别行政区';
                  regionTypeClass = 'sar';
                } else if (province.name.includes('省')) {
                  regionType = '省';
                  regionTypeClass = 'province';
                }

                return (
                  <View
                    key={province.id}
                    className={`region-item ${tempProvince === province.name ? 'active' : ''}`}
                    onClick={() => handleProvinceClick(province)}
                    hoverClass='none'
                  >
                    <Text className='region-name'>{province.name}</Text>
                    <View className='region-tags'>
                      {regionType && (
                        <Text className={`region-type ${regionTypeClass}`}>{regionType}</Text>
                      )}
                      {tempProvince === province.name && (
                        <Text className='region-check'>✓</Text>
                      )}
                    </View>
                  </View>
                );
              })}
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
