import React from 'react'
import { View, Text } from '@tarojs/components'
import { Button } from "@nutui/nutui-react-taro"
import RegionBar from '../../components/RegionBar'
import RegionSelector from '../../components/RegionSelector'
import HomeBanner from '../../components/HomeBanner'
import ProductCategories from '../../components/ProductCategories'
import { useRegion } from '../../contexts/RegionContext'
import './index.less'

function Index() {
  const { province, city, showSelector, closeSelector, setRegion } = useRegion()

  return (
    <View className="page">
      {/* 地区选择器 */}
      <RegionBar />

      {/* 轮播Banner */}
      <HomeBanner />

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
