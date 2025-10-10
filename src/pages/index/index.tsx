import React, { useState, useEffect } from 'react'
import { View, Text } from '@tarojs/components'
import { Button } from "@nutui/nutui-react-taro"
import RegionBar from '../../components/RegionBar'
import RegionSelector from '../../components/RegionSelector'
import HomeBanner from '../../components/HomeBanner'
import HorizontalAd from '../../components/HorizontalAd'
import ProductCategories from '../../components/ProductCategories'
import { useRegion } from '../../contexts/RegionContext'
import './index.less'

function Index() {
  const { province, city, showSelector, closeSelector, setRegion } = useRegion()

  // 广告位配置 - 后续可以从接口获取
  const [adConfig, setAdConfig] = useState({
    visible: true, // 是否显示广告位
    imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800',
    title: '新用户专享福利',
    subtitle: '立即领取优惠券，最高减100元',
    linkUrl: '',
    backgroundColor: '#ffffff' // 使用白色背景，与Banner区分
  })

  // 模拟从接口获取广告位配置
  useEffect(() => {
    // TODO: 后续替换为真实接口调用
    // fetchAdConfig().then(config => setAdConfig(config))
  }, [])

  return (
    <View className="page">
      {/* 地区选择器 */}
      <RegionBar />

      {/* 轮播Banner */}
      <HomeBanner />

      {/* 横幅广告位 */}
      <HorizontalAd
        visible={adConfig.visible}
        imageUrl={adConfig.imageUrl}
        title={adConfig.title}
        subtitle={adConfig.subtitle}
        linkUrl={adConfig.linkUrl}
        backgroundColor={adConfig.backgroundColor}
      />

      {/* 产品分类 */}
      <ProductCategories />

      <View className="page__section">
        <View className="page__title">粮仓Mix - 首页</View>
        <View className="page__desc">
          当前地区：{city || province}
        </View>
        <View className="page__desc">
          为您推荐 {city || province} 的优质粮食商品
        </View>

        <View className="page__content">
          <Button type="primary" className="btn">
            查看当地粮食行情
          </Button>
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
  )
}

export default Index
