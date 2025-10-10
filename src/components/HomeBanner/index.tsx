import React from 'react';
import { View, Swiper, SwiperItem, Image } from '@tarojs/components';
import { banners } from '../../data/banners';
import './index.less';

const HomeBanner: React.FC = () => {
  const handleBannerClick = (bannerId: string) => {
    // TODO: 处理banner点击事件
  };

  return (
    <View className="home-banner">
      <Swiper
        className="banner-swiper"
        indicatorColor="rgba(255, 255, 255, 0.4)"
        indicatorActiveColor="#fff"
        circular
        autoplay
        interval={3000}
        duration={500}
      >
        {banners.map((banner) => (
          <SwiperItem key={banner.id}>
            <View
              className="banner-item"
              onClick={() => handleBannerClick(banner.id)}
            >
              <Image
                src={banner.imageUrl}
                className="banner-image"
                mode="aspectFill"
              />
            </View>
          </SwiperItem>
        ))}
      </Swiper>
    </View>
  );
};

export default HomeBanner;
