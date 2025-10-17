import { useState, useEffect } from 'react'
import { View, Text } from '@tarojs/components'
import { ArrowRight } from '@nutui/icons-react-taro'
import Taro from '@tarojs/taro'
import RegionBar from '../../components/RegionBar'
import RegionSelector from '../../components/RegionSelector'
import HomeBanner from '../../components/HomeBanner'
import HorizontalAd from '../../components/HorizontalAd'
import ProductCategories from '../../components/ProductCategories'
import ProductList from '../../components/ProductList'
import SectionHeader from '../../components/SectionHeader'
import { useRegion } from '../../contexts/RegionContext'
import { Product } from '../../types/product'
import MockService from '../../data/mock'
import './index.less'

// 导入广告位图片
import adv1 from '../../assets/advert/pos/adv1.png'

function Index() {
  const { province, city, showSelector, closeSelector, setRegion } = useRegion()

  // 广告位配置 - 后续可以从接口获取
  const adConfig = {
    visible: true, // 是否显示广告位
    imageUrl: adv1,
    title: '新用户专享福利',
    subtitle: '立即领取优惠券，最高减100元',
    linkUrl: '',
    backgroundColor: '#ffffff' // 使用白色背景，与Banner区分
  }

  // 热门推荐商品
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [loadingProducts, setLoadingProducts] = useState(false)

  // 开发调试开关
  const [showDebug, setShowDebug] = useState(false)

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

  // 查看更多热门商品
  const handleViewMoreFeatured = (): void => {
    Taro.showToast({
      title: '功能开发中',
      icon: 'none'
    })
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
      <View className="page__section page__section--card">
        <SectionHeader
          title="热门推荐"
          subtitle="精选优质商品"
          showMore={true}
          moreText="查看全部"
          onMoreClick={handleViewMoreFeatured}
          theme="primary"
        />

        <View className="page__section-content">
          <ProductList
            products={featuredProducts}
            loading={loadingProducts}
            layout="grid"
            columns={2}
            emptyText="暂无推荐商品"
            emptyDescription="敬请期待更多优质商品"
          />
        </View>
      </View>

      {/* 开发调试入口 - 默认隐藏 */}
      {showDebug && (
        <View className="page__section page__section--debug">
          <SectionHeader
            title="快捷入口"
            subtitle="开发调试"
            theme="default"
          />

          <View className="page__debug-content">
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
        </View>
      )}

      {/* 调试开关 - 长按5次底部空白区域显示 */}
      <View
        className="page__debug-trigger"
        onClick={() => {
          const count = (window as any).__debugClickCount || 0
          ;(window as any).__debugClickCount = count + 1
          if ((window as any).__debugClickCount >= 5) {
            setShowDebug(!showDebug)
            ;(window as any).__debugClickCount = 0
            Taro.showToast({
              title: showDebug ? '已关闭调试' : '已开启调试',
              icon: 'none'
            })
          }
        }}
      />

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
