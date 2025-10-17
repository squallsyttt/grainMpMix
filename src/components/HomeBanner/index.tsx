import React, { useState } from 'react';
import { View, Swiper, SwiperItem, Image, Text } from '@tarojs/components';
import { banners } from '../../data/banners';
import './index.less';

const HomeBanner: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleBannerClick = (_bannerId: string): void => {
    // TODO: 处理banner点击事件
  };

  const handleSwiperChange = (e: any): void => {
    setCurrentIndex(e.detail.current);
  };

  return (
    <View className="home-banner">
      <View className="banner-container">
        {/* 标题显示 - 移到顶部 */}
        <View className="banner-title-wrapper">
          <Text className="banner-title">
            {banners[currentIndex]?.title || ''}
          </Text>
        </View>

        <Swiper
          className="banner-swiper"
          indicatorDots={false}
          circular
          autoplay
          interval={4000}
          duration={500}
          onChange={handleSwiperChange}
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
                {/* 图片上的渐变遮罩 */}
                <View className="banner-overlay" />
              </View>
            </SwiperItem>
          ))}
        </Swiper>

        {/* 自定义指示器 - 移到底部 */}
        <View className="banner-indicator">
          {/* 进度条指示器 */}
          <View className="indicator-progress">
            {banners.map((_, index) => (
              <View
                key={index}
                className={`progress-dot ${index === currentIndex ? 'progress-dot--active' : ''} ${index < currentIndex ? 'progress-dot--passed' : ''}`}
              >
                {index === currentIndex && (
                  <View className="progress-dot-inner" />
                )}
              </View>
            ))}
          </View>

          {/* 数字指示器 */}
          <View className="indicator-counter">
            <Text className="counter-current">{currentIndex + 1}</Text>
            <Text className="counter-separator">/</Text>
            <Text className="counter-total">{banners.length}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default HomeBanner;
