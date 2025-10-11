import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Input } from '@tarojs/components';
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

// 搜索结果项接口
interface SearchResult {
  province: Region;
  city?: Region;
  matchType: 'province' | 'city'; // 匹配类型
}

function RegionSelector(props: RegionSelectorProps) {
  const { visible, onClose, onConfirm, defaultProvince = '', defaultCity = '' } = props;

  const [step, setStep] = useState<'province' | 'city'>('province');
  const [selectedProvince, setSelectedProvince] = useState<Region | null>(null);
  const [tempProvince, setTempProvince] = useState(defaultProvince);
  const [tempCity, setTempCity] = useState(defaultCity);
  const [searchKeyword, setSearchKeyword] = useState('');

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
    // 打开时清空搜索
    setSearchKeyword('');
  }, [visible, defaultProvince, defaultCity]);

  // 搜索地区
  const searchRegions = (): SearchResult[] => {
    if (!searchKeyword.trim()) return [];

    const keyword = searchKeyword.toLowerCase();
    const results: SearchResult[] = [];

    regionData.forEach(province => {
      // 搜索省份名称
      if (province.name.toLowerCase().includes(keyword)) {
        results.push({
          province,
          matchType: 'province'
        });
      }

      // 搜索城市名称
      if (province.children) {
        province.children.forEach(city => {
          if (city.name.toLowerCase().includes(keyword)) {
            results.push({
              province,
              city,
              matchType: 'city'
            });
          }
        });
      }
    });

    return results;
  };

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

  // 处理搜索结果点击
  const handleSearchResultClick = (result: SearchResult) => {
    if (result.matchType === 'province') {
      // 点击的是省份
      handleProvinceClick(result.province);
    } else if (result.city) {
      // 点击的是城市，直接确认
      onConfirm(result.province.name, result.city.name);
      onClose();
      resetState();
    }
  };

  const handleBack = () => {
    setStep('province');
    setSelectedProvince(null);
    setSearchKeyword(''); // 返回时清空搜索
  };

  const resetState = () => {
    // 不再自动重置状态，让 useEffect 处理
    setSearchKeyword('');
  };

  const handlePopupClose = () => {
    onClose();
  };

  const handleSearchChange = (e) => {
    setSearchKeyword(e.detail.value);
  };

  const handleClearSearch = () => {
    setSearchKeyword('');
  };

  // 判断地区类型并返回类型标签信息
  const getRegionTypeInfo = (region: Region, isCity: boolean = false) => {
    let regionType = '';
    let regionTypeClass = '';

    if (isCity) {
      // 城市类型判断
      if (region.name.includes('自治州')) {
        regionType = '自治州';
        regionTypeClass = 'autonomous-prefecture';
      } else if (region.name.includes('地区')) {
        regionType = '地区';
        regionTypeClass = 'district';
      } else if (region.name.includes('盟')) {
        regionType = '盟';
        regionTypeClass = 'league';
      } else if (region.name.includes('市')) {
        regionType = '市';
        regionTypeClass = 'city';
      } else if (region.name.includes('县')) {
        regionType = '县';
        regionTypeClass = 'county';
      } else if (region.name.includes('岛') || region.name.includes('半岛') || region.name === '九龙' || region.name === '新界') {
        regionType = '区域';
        regionTypeClass = 'area';
      } else {
        regionType = '市';
        regionTypeClass = 'city';
      }
    } else {
      // 省份类型判断
      if (region.name.includes('自治区')) {
        regionType = '自治区';
        regionTypeClass = 'autonomous';
      } else if (['北京市', '天津市', '上海市', '重庆市'].includes(region.name)) {
        regionType = '直辖市';
        regionTypeClass = 'municipality';
      } else if (['香港特别行政区', '澳门特别行政区'].includes(region.name)) {
        regionType = '特别行政区';
        regionTypeClass = 'sar';
      } else if (region.name.includes('省')) {
        regionType = '省';
        regionTypeClass = 'province';
      }
    }

    return { regionType, regionTypeClass };
  };

  const searchResults = searchRegions();

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
          {step === 'city' && !searchKeyword && (
            <View className='back-btn' onClick={handleBack}>
              <Text className='back-icon'>←</Text>
            </View>
          )}
          <Text className='region-title'>
            {searchKeyword ? '搜索地区' : (step === 'province' ? '选择省份' : `${getProvinceShortName(tempProvince)} - 选择城市`)}
          </Text>
        </View>

        {/* 搜索框 */}
        <View className='search-box'>
          <View className='search-input-wrapper'>
            <Text className='search-icon'>🔍</Text>
            <Input
              className='search-input'
              type='text'
              placeholder='搜索省份或城市'
              value={searchKeyword}
              onInput={handleSearchChange}
              confirmType='search'
            />
            {searchKeyword && (
              <View className='clear-btn' onClick={handleClearSearch}>
                <Text className='clear-icon'>✕</Text>
              </View>
            )}
          </View>
        </View>

        {/* 列表内容 */}
        <ScrollView
          scrollY
          className='region-content'
          enableBackToTop
          scrollWithAnimation
        >
          {searchKeyword ? (
            // 搜索结果
            <View className='region-list'>
              {searchResults.length > 0 ? (
                searchResults.map((result, index) => {
                  const isCity = result.matchType === 'city';
                  const displayRegion = isCity ? result.city! : result.province;
                  const { regionType, regionTypeClass } = getRegionTypeInfo(displayRegion, isCity);

                  return (
                    <View
                      key={`search-${index}`}
                      className='region-item'
                      onClick={() => handleSearchResultClick(result)}
                      hoverClass='none'
                    >
                      <View className='region-info'>
                        <Text className='region-name'>{displayRegion.name}</Text>
                        {isCity && (
                          <Text className='region-path'>{result.province.name}</Text>
                        )}
                      </View>
                      <View className='region-tags'>
                        {regionType && (
                          <Text className={`region-type ${regionTypeClass}`}>{regionType}</Text>
                        )}
                      </View>
                    </View>
                  );
                })
              ) : (
                <View className='empty-result'>
                  <Text className='empty-icon'>🔍</Text>
                  <Text className='empty-text'>未找到相关地区</Text>
                  <Text className='empty-hint'>试试搜索其他关键词</Text>
                </View>
              )}
            </View>
          ) : step === 'province' ? (
            <View className='region-list'>
              {regionData.map(province => {
                const { regionType, regionTypeClass } = getRegionTypeInfo(province, false);

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
              {selectedProvince?.children?.map(city => {
                const { regionType: cityType, regionTypeClass: cityTypeClass } = getRegionTypeInfo(city, true);

                return (
                  <View
                    key={city.id}
                    className={`region-item ${tempCity === city.name ? 'active' : ''}`}
                    onClick={() => handleCityClick(city)}
                    hoverClass='none'
                  >
                    <Text className='region-name'>{city.name}</Text>
                    <View className='region-tags'>
                      {cityType && (
                        <Text className={`region-type ${cityTypeClass}`}>{cityType}</Text>
                      )}
                      {tempCity === city.name && (
                        <Text className='region-check'>✓</Text>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>
      </View>
    </Popup>
  );
}

export default RegionSelector;
