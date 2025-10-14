/**
 * 商家详情页
 *
 * 展示商家完整信息,智能处理缺失字段
 */

import React, { useState, useEffect } from 'react'
import { View, Text } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { Skeleton, Cell, CellGroup } from '@nutui/nutui-react-taro'
import MerchantLogo from '../../components/MerchantLogo'
import EmptyState from '../../components/EmptyState'
import MerchantProductList from '../../components/MerchantProductList'
import { useRegion } from '../../contexts/RegionContext'
import { getMerchantDetail, getMerchantProducts } from '../../services/merchant'
import { Merchant, MerchantProduct } from '../../types/merchant'
import './index.less'

/**
 * 商家详情页组件
 */
const MerchantDetail: React.FC = () => {
  const router = useRouter()
  const merchantId = parseInt(router.params.id || '0', 10)
  const { province, city } = useRegion()

  const [merchant, setMerchant] = useState<Merchant | null>(null)
  const [products, setProducts] = useState<MerchantProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [productsLoading, setProductsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  /**
   * 加载商家详情
   */
  const loadMerchantDetail = async () => {
    if (!merchantId || merchantId <= 0) {
      setError('商家ID无效')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await getMerchantDetail(merchantId)

      if (response.code === 0 && response.data) {
        setMerchant(response.data)
      } else {
        throw new Error(response.msg || '获取商家详情失败')
      }
    } catch (err) {
      console.error('[MerchantDetail] 加载商家详情失败:', err)
      const errorMessage = err instanceof Error ? err.message : '加载失败'
      setError(errorMessage)
      Taro.showToast({
        title: errorMessage,
        icon: 'none',
        duration: 2000,
      })
    } finally {
      setLoading(false)
    }
  }

  /**
   * 加载商家产品列表
   */
  const loadMerchantProducts = async () => {
    if (!merchantId || merchantId <= 0) {
      setProductsLoading(false)
      return
    }

    try {
      setProductsLoading(true)

      const response = await getMerchantProducts(merchantId, {
        province,
        city,
      })

      if (response.code === 0 && response.data && response.data.products) {
        setProducts(response.data.products)
      } else {
        // 产品列表加载失败不影响页面显示,只记录日志
        console.warn('[MerchantDetail] 获取商家产品列表失败:', response.msg)
        setProducts([])
      }
    } catch (err) {
      console.error('[MerchantDetail] 加载商家产品列表失败:', err)
      setProducts([])
    } finally {
      setProductsLoading(false)
    }
  }

  /**
   * 处理返回
   */
  const handleBack = () => {
    Taro.navigateBack()
  }

  /**
   * 初始化加载
   */
  useEffect(() => {
    // 设置页面标题
    Taro.setNavigationBarTitle({
      title: '商家详情',
    })

    loadMerchantDetail()
  }, [merchantId])

  /**
   * 加载产品列表(依赖商家详情加载完成和区域信息)
   */
  useEffect(() => {
    if (merchant && (province || city)) {
      loadMerchantProducts()
    }
  }, [merchant, province, city])

  // 加载中状态
  if (loading) {
    return (
      <View className="merchant-detail">
        <View className="merchant-detail__skeleton">
          <Skeleton rows={6} animated />
        </View>
      </View>
    )
  }

  // 错误状态
  if (error || !merchant) {
    return (
      <View className="merchant-detail">
        <EmptyState
          description={error || '商家不存在'}
          imageType="error"
          actions={[
            {
              text: '返回',
              type: 'primary',
              onClick: handleBack,
            },
            {
              text: '重新加载',
              type: 'default',
              onClick: loadMerchantDetail,
            },
          ]}
        />
      </View>
    )
  }

  return (
    <View className="merchant-detail">
      {/* 商家头部信息 */}
      <View className="merchant-detail__header">
        <MerchantLogo
          name={merchant.name}
          logo={merchant.logo}
          size={100}
          lazyLoad={false}
        />
        <View className="merchant-detail__header-info">
          <View className="merchant-detail__name">{merchant.name}</View>
          {merchant.certification_status === 'verified' && (
            <View className="merchant-detail__badge">已认证商家</View>
          )}
        </View>
      </View>

      {/* 商家基本信息 */}
      <CellGroup className="merchant-detail__info-group">
        {merchant.address && (
          <Cell title="地址" description={merchant.address} />
        )}
        {merchant.phone && (
          <Cell title="电话" description={merchant.phone} />
        )}
        {merchant.business_hours && (
          <Cell title="营业时间" description={merchant.business_hours} />
        )}
        <Cell
          title="所在地区"
          description={`${merchant.province} ${merchant.city}`}
        />
        {merchant.years_in_business && (
          <Cell
            title="经营年限"
            description={`${merchant.years_in_business}年`}
          />
        )}
        {merchant.rating !== undefined && merchant.rating > 0 && (
          <Cell title="用户评分" description={`${merchant.rating.toFixed(1)}分`} />
        )}
      </CellGroup>

      {/* 商家简介 */}
      {merchant.description && (
        <View className="merchant-detail__description">
          <View className="merchant-detail__section-title">商家简介</View>
          <View className="merchant-detail__description-text">
            {merchant.description}
          </View>
        </View>
      )}

      {/* 商家产品列表 */}
      <View className="merchant-detail__products">
        {productsLoading ? (
          <Skeleton rows={3} animated />
        ) : (
          <MerchantProductList products={products} loading={productsLoading} />
        )}
      </View>

      {/* 营业状态提示 */}
      {merchant.is_active === 0 && (
        <View className="merchant-detail__notice">
          <Text>该商家暂停营业</Text>
        </View>
      )}
    </View>
  )
}

export default MerchantDetail
