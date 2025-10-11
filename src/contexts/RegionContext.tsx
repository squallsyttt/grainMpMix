import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
  const [province, setProvince] = useState<string>('全国');
  const [city, setCity] = useState<string>('');
  const [showSelector, setShowSelector] = useState<boolean>(false);

  useEffect(() => {
    try {
      const savedProvince = Taro.getStorageSync<string>('selectedProvince');
      const savedCity = Taro.getStorageSync<string>('selectedCity');
      if (savedProvince && typeof savedProvince === 'string') {
        setProvince(savedProvince);
        setCity(typeof savedCity === 'string' ? savedCity : '');
      }
    } catch (error) {
      console.error('Failed to load region from storage:', error);
    }
  }, []);

  const setRegion = (newProvince: string, newCity: string): void => {
    setProvince(newProvince);
    setCity(newCity);
    try {
      Taro.setStorageSync('selectedProvince', newProvince);
      Taro.setStorageSync('selectedCity', newCity);
    } catch (error) {
      console.error('Failed to save region to storage:', error);
    }
  };

  const openSelector = (): void => {
    setShowSelector(true);
  };

  const closeSelector = (): void => {
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

export function useRegion(): RegionContextType {
  const context = useContext(RegionContext);
  if (!context) {
    throw new Error('useRegion must be used within RegionProvider');
  }
  return context;
}
