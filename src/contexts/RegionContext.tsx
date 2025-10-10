import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Taro from '@tarojs/taro';

interface RegionContextType {
  province: string;
  city: string;
  showSelector: boolean;
  setRegion: (province: string, city: string) => void;
  openSelector: () => void;
  closeSelector: () => void;
}

const RegionContext = createContext<RegionContextType | undefined>(undefined);

interface RegionProviderProps {
  children: ReactNode;
}

export function RegionProvider({ children }: RegionProviderProps) {
  const [province, setProvince] = useState('全国');
  const [city, setCity] = useState('');
  const [showSelector, setShowSelector] = useState(false);

  useEffect(() => {
    const savedProvince = Taro.getStorageSync('selectedProvince');
    const savedCity = Taro.getStorageSync('selectedCity');
    if (savedProvince) {
      setProvince(savedProvince);
      setCity(savedCity || '');
    }
  }, []);

  const setRegion = (newProvince: string, newCity: string) => {
    setProvince(newProvince);
    setCity(newCity);
    Taro.setStorageSync('selectedProvince', newProvince);
    Taro.setStorageSync('selectedCity', newCity);
  };

  const openSelector = () => {
    setShowSelector(true);
  };

  const closeSelector = () => {
    setShowSelector(false);
  };

  return (
    <RegionContext.Provider
      value={{
        province,
        city,
        showSelector,
        setRegion,
        openSelector,
        closeSelector
      }}
    >
      {children}
    </RegionContext.Provider>
  );
}

export function useRegion() {
  const context = useContext(RegionContext);
  if (!context) {
    throw new Error('useRegion must be used within RegionProvider');
  }
  return context;
}
