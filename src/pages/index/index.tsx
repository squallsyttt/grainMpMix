import React, { useState, useEffect } from 'react'
import { View, Text } from '@tarojs/components'
import { Button } from "@nutui/nutui-react-taro"
import { ArrowRight } from '@nutui/icons-react-taro'
import Taro from '@tarojs/taro'
import RegionBar from '../../components/RegionBar'
import RegionSelector from '../../components/RegionSelector'
import HomeBanner from '../../components/HomeBanner'
import HorizontalAd from '../../components/HorizontalAd'
import ProductCategories from '../../components/ProductCategories'
import ProductList from '../../components/ProductList'
import { useRegion } from '../../contexts/RegionContext'
import { Product } from '../../types/product'
import MockService from '../../data/mock'
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

  // 热门推荐商品
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [loadingProducts, setLoadingProducts] = useState(false)

  // 加载热门推荐商品
  const loadFeaturedProducts = async (): Promise<void> => {
    try {
      setLoadingProducts(true)
      const response = await MockService.getFeaturedProducts(6)
      if (response.code === 200) {
        setFeaturedProducts(response.data)
      }
    } catch (error) {
      console.error('加载热门商品失败:', error)
    } finally {
      setLoadingProducts(false)
    }
  }

  // 模拟从接口获取广告位配置
  useEffect(() => {
    // TODO: 后续替换为真实接口调用
    // fetchAdConfig().then(config => setAdConfig(config))

    // 加载热门推荐商品
    loadFeaturedProducts()
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

      {/* 热门推荐 */}
      <View className="page__section">
        <View className="page__section-header">
          <Text className="page__section-title">热门推荐</Text>
          <Text className="page__section-more">更多 &gt;</Text>
        </View>

        <ProductList
          products={featuredProducts}
          loading={loadingProducts}
          layout="grid"
          columns={2}
          emptyText="暂无推荐商品"
          emptyDescription="敬请期待更多优质商品"
        />
      </View>

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

      {/* 快捷入口 - 开发调试用 */}
      <View className="page__section page__debug-section">
        <View className="page__section-header">
          <Text className="page__section-title">🚀 快捷入口（开发调试）</Text>
        </View>

        <View className="page__quick-links">
          {/* 核销券相关 */}
          <View className="page__quick-category">
            <Text className="page__quick-category-title">核销券功能</Text>
            <View className="page__quick-links-grid">
              <View
                className="page__quick-link"
                onClick={() => Taro.navigateTo({ url: '/pages/voucher/list/index' })}
              >
                <Text className="page__quick-link-text">核销券列表</Text>
                <ArrowRight size={14} />
              </View>
              <View
                className="page__quick-link"
                onClick={() => Taro.navigateTo({ url: '/pages/voucher/detail/index?id=123' })}
              >
                <Text className="page__quick-link-text">核销券详情</Text>
                <ArrowRight size={14} />
              </View>
              <View
                className="page__quick-link"
                onClick={() => Taro.navigateTo({ url: '/pages/merchant-scan/index' })}
              >
                <Text className="page__quick-link-text">商家扫码核销</Text>
                <ArrowRight size={14} />
              </View>
            </View>
          </View>

          {/* 订单相关 */}
          <View className="page__quick-category">
            <Text className="page__quick-category-title">订单功能</Text>
            <View className="page__quick-links-grid">
              <View
                className="page__quick-link"
                onClick={() => Taro.navigateTo({ url: '/pages/order/list/index' })}
              >
                <Text className="page__quick-link-text">订单列表</Text>
                <ArrowRight size={14} />
              </View>
              <View
                className="page__quick-link"
                onClick={() => Taro.navigateTo({ url: '/pages/order/detail/index?id=456' })}
              >
                <Text className="page__quick-link-text">订单详情</Text>
                <ArrowRight size={14} />
              </View>
            </View>
          </View>

          {/* 商品相关 */}
          <View className="page__quick-category">
            <Text className="page__quick-category-title">商品功能</Text>
            <View className="page__quick-links-grid">
              <View
                className="page__quick-link"
                onClick={() => Taro.navigateTo({ url: '/pages/product/detail/index?id=1' })}
              >
                <Text className="page__quick-link-text">商品详情</Text>
                <ArrowRight size={14} />
              </View>
            </View>
          </View>
        </View>

        <View className="page__debug-note">
          <Text className="page__debug-note-text">
            💡 提示：这些入口用于开发调试，方便快速访问各个页面查看效果
          </Text>
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
