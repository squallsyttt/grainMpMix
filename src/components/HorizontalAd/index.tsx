import React from 'react';
import { View, Image, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import './index.less';

interface HorizontalAdProps {
  visible?: boolean; // 控制广告位是否显示
  imageUrl?: string; // 广告图片URL
  title?: string; // 广告标题
  subtitle?: string; // 广告副标题
  linkUrl?: string; // 点击跳转链接
  backgroundColor?: string; // 背景色
}

const HorizontalAd: React.FC<HorizontalAdProps> = ({
  visible = true,
  imageUrl = 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800',
  title = '新用户专享福利',
  subtitle = '立即领取优惠券，最高减100元',
  linkUrl = '',
  backgroundColor = '#ffffff' // 白色卡片背景
}) => {
  // 如果不显示，直接返回null
  if (!visible) {
    return null;
  }

  const handleAdClick = () => {
    if (linkUrl) {
      Taro.navigateTo({
        url: linkUrl
      });
    } else {
      Taro.showToast({
        title: '敬请期待',
        icon: 'none',
        duration: 2000
      });
    }
  };

  return (
    <View className='horizontal-ad' onClick={handleAdClick}>
      <View className='ad-container' style={{ background: backgroundColor }}>
        <View className='ad-content'>
          <View className='ad-text'>
            <Text className='ad-title'>{title}</Text>
            <Text className='ad-subtitle'>{subtitle}</Text>
          </View>
          <View className='ad-action'>
            <Text className='action-text'>立即查看</Text>
            <Text className='action-arrow'>→</Text>
          </View>
        </View>
        {imageUrl && (
          <Image
            className='ad-image'
            src={imageUrl}
            mode='aspectFit'
          />
        )}
      </View>
    </View>
  );
};

export default HorizontalAd;
