import React, { useState, useEffect } from 'react'
import { View, Text, Image, Swiper, SwiperItem } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { Button, Rate, Tag, Divider, Toast, ActionSheet } from '@nutui/nutui-react-taro'
import { Cart, Star, Service, Location } from '@nutui/icons-react-taro'
import { Product } from '../../../types/product'
import { Product as CartProduct } from '../../../types/cart'
import MockService from '../../../data/mock'
import { processImageUrl } from '../../../utils/imageHelper'
import { formatPrice, formatCount } from '../../../utils/dataHelper'
import { useCart } from '../../../contexts/CartContext'
import './index.less'

/**
 * 商品详情页面
 */
const ProductDetail: React.FC = () => {
  const router = useRouter()
  const { id } = router.params
  const { addToCart } = useCart()

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showSpecs, setShowSpecs] = useState(false)

  /**
   * 加载商品详情
   */
  useEffect(() => {
    loadProductDetail()
  }, [id])

  /**
   * 加载商品详情数据
   */
  const loadProductDetail = async (): Promise<void> => {
    if (!id) {
      Taro.showToast({
        title: '商品ID不存在',
        icon: 'none',
      })
      setTimeout(() => {
        Taro.navigateBack()
      }, 1500)
      return
    }

    try {
      setLoading(true)
      const response = await MockService.getProductDetail(id)

      if (response.code === 200 && response.data) {
        setProduct(response.data)
      } else {
        Taro.showToast({
          title: response.message || '商品不存在',
          icon: 'none',
        })
        setTimeout(() => {
          Taro.navigateBack()
        }, 1500)
      }
    } catch (error) {
      console.error('加载商品详情失败:', error)
      Taro.showToast({
        title: '加载失败',
        icon: 'none',
      })
    } finally {
      setLoading(false)
    }
  }

  /**
   * 加入购物车
   */
  const handleAddToCart = (): void => {
    if (!product) return

    // 转换商品详情的 Product 为购物车的 Product 格式
    const cartProduct: CartProduct = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0], // 使用第一张图片
      unit: '件', // 默认单位，实际项目中应该从商品数据中获取
      stock: product.stock,
      status: product.status,
      description: product.description,
    }

    // 调用 CartContext 的 addToCart 方法
    addToCart(cartProduct, 1)
  }

  /**
   * 立即购买
   */
  const handleBuyNow = (): void => {
    if (!product) return

    // TODO: 实际项目中需要跳转到订单确认页
    Taro.showToast({
      title: '功能开发中',
      icon: 'none',
    })
  }

  /**
   * 查看规格参数
   */
  const handleShowSpecs = (): void => {
    setShowSpecs(true)
  }

  /**
   * 联系客服
   */
  const handleContactService = (): void => {
    Taro.showToast({
      title: '客服功能开发中',
      icon: 'none',
    })
  }

  /**
   * 收藏商品
   */
  const handleFavorite = (): void => {
    Taro.showToast({
      title: '已收藏',
      icon: 'success',
    })
  }

  /**
   * 轮播图切换
   */
  const handleSwiperChange = (e: any): void => {
    setCurrentImageIndex(e.detail.current)
  }

  if (loading) {
    return (
      <View className="product-detail">
        <View className="product-detail__loading">加载中...</View>
      </View>
    )
  }

  if (!product) {
    return (
      <View className="product-detail">
        <View className="product-detail__error">商品不存在</View>
      </View>
    )
  }

  return (
    <View className="product-detail">
      {/* 商品图片轮播 */}
      <View className="product-detail__images">
        <Swiper
          className="product-detail__swiper"
          indicatorDots={false}
          circular
          autoplay={false}
          onChange={handleSwiperChange}
        >
          {(product.images || []).map((image, index) => (
            <SwiperItem key={index}>
              <Image
                className="product-detail__image"
                src={processImageUrl(image, { size: 'large', quality: 'high' })}
                mode="aspectFill"
              />
            </SwiperItem>
          ))}
        </Swiper>

        {/* 图片指示器 */}
        <View className="product-detail__indicator">
          {currentImageIndex + 1} / {(product.images || []).length}
        </View>
      </View>

      {/* 商品信息 */}
      <View className="product-detail__info">
        {/* 价格区域 */}
        <View className="product-detail__price-section">
          <View className="product-detail__price">
            <Text className="product-detail__price-symbol">¥</Text>
            <Text className="product-detail__price-value">{Math.floor(product.price)}</Text>
            <Text className="product-detail__price-decimal">
              .{(product.price % 1).toFixed(2).slice(2)}
            </Text>
          </View>

          {product.originalPrice && product.originalPrice > product.price && (
            <View className="product-detail__original-price">
              <Text className="product-detail__original-price-text">
                ¥{product.originalPrice.toFixed(2)}
              </Text>
              <Tag type="danger" size="small">
                {Math.round((product.price / product.originalPrice) * 10 * 10) / 10}折
              </Tag>
            </View>
          )}
        </View>

        {/* 商品名称 */}
        <Text className="product-detail__name">{product.name}</Text>

        {/* 商品标签 */}
        {product.tags && product.tags.length > 0 && (
          <View className="product-detail__tags">
            {product.tags.map((tag, index) => (
              <Tag key={index} type="primary" size="small" plain>
                {tag}
              </Tag>
            ))}
          </View>
        )}

        {/* 促销信息 */}
        {product.promotion && (
          <View className="product-detail__promotion">
            <Tag type="danger" size="small">
              {product.promotion.label}
            </Tag>
            {product.promotion.description && (
              <Text className="product-detail__promotion-desc">
                {product.promotion.description}
              </Text>
            )}
          </View>
        )}
      </View>

      {/* 商品评价 */}
      <View className="product-detail__rating-section">
        <View className="product-detail__rating">
          <Rate
            defaultValue={product.rating}
            readOnly
          />
          <Text className="product-detail__rating-text">{product.rating.toFixed(1)}</Text>
          <Text className="product-detail__review-count">
            ({formatCount(product.reviewCount)}条评价)
          </Text>
        </View>
        <View className="product-detail__sales">
          已售 {formatCount(product.sales)}
        </View>
      </View>

      <Divider />

      {/* 规格参数 */}
      {product.specs && Object.keys(product.specs).length > 0 && (
        <View className="product-detail__specs-section" onClick={handleShowSpecs}>
          <Text className="product-detail__specs-title">规格参数</Text>
          <View className="product-detail__specs-preview">
            {Object.entries(product.specs)
              .slice(0, 2)
              .map(([key, value]) => (
                <Text key={key} className="product-detail__spec-item">
                  {key}: {value}
                </Text>
              ))}
          </View>
          <Text className="product-detail__specs-more">查看全部 &gt;</Text>
        </View>
      )}

      <Divider />

      {/* 商品描述 */}
      <View className="product-detail__desc-section">
        <Text className="product-detail__section-title">商品详情</Text>
        <Text className="product-detail__description">{product.description}</Text>
      </View>

      {/* 底部操作栏 */}
      <View className="product-detail__footer">
        <View className="product-detail__footer-left">
          <View className="product-detail__footer-icon" onClick={handleContactService}>
            <Service size={20} />
            <Text className="product-detail__footer-icon-text">客服</Text>
          </View>
          <View className="product-detail__footer-icon" onClick={handleFavorite}>
            <Star size={20} />
            <Text className="product-detail__footer-icon-text">收藏</Text>
          </View>
        </View>

        <View className="product-detail__footer-right">
          <Button
            className="product-detail__cart-btn"
            type="warning"
            size="small"
            onClick={handleAddToCart}
          >
            <Cart size={16} />
            加入购物车
          </Button>
          <Button
            className="product-detail__buy-btn"
            type="primary"
            size="small"
            onClick={handleBuyNow}
          >
            立即购买
          </Button>
        </View>
      </View>

      {/* 规格参数弹窗 */}
      {product.specs && (
        <ActionSheet
          visible={showSpecs}
          onClose={() => setShowSpecs(false)}
          title="规格参数"
        >
          <View className="product-detail__specs-modal">
            {Object.entries(product.specs).map(([key, value]) => (
              <View key={key} className="product-detail__specs-row">
                <Text className="product-detail__specs-key">{key}</Text>
                <Text className="product-detail__specs-value">{value}</Text>
              </View>
            ))}
          </View>
        </ActionSheet>
      )}
    </View>
  )
}

export default ProductDetail
