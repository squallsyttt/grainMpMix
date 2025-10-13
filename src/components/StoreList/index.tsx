/**
 * 门店列表组件
 *
 * 展示可核销门店列表,支持地图导航和电话拨打
 */

import React from 'react'
import { View, Text } from '@tarojs/components'
import { Cell } from '@nutui/nutui-react-taro'
import { Location, Phone } from '@nutui/icons-react-taro'
import Taro from '@tarojs/taro'
import { StoreListItem } from '../../types/store'
import { openNavigation, formatDistance } from '../../utils/location'
import { formatBusinessHours, isBusinessHours } from '../../utils/date'
import './index.less'

/**
 * 门店列表组件Props
 */
export interface StoreListProps {
  /** 门店列表 */
  stores: StoreListItem[]
  /** 是否显示空状态(默认true) */
  showEmpty?: boolean
  /** 空状态文本 */
  emptyText?: string
}

/**
 * 门店列表组件
 *
 * @param props - 组件Props
 * @returns React组件
 */
const StoreList: React.FC<StoreListProps> = ({
  stores,
  showEmpty = true,
  emptyText = '暂无可核销门店'
}) => {
  /**
   * 打开地图导航
   *
   * @param store - 门店信息
   */
  const handleOpenMap = (store: StoreListItem) => {
    openNavigation(
      store.latitude,
      store.longitude,
      store.name,
      store.address
    )
  }

  /**
   * 拨打电话
   *
   * @param phone - 电话号码
   */
  const handleCallPhone = (phone: string) => {
    Taro.makePhoneCall({
      phoneNumber: phone
    }).catch(err => {
      console.error('[StoreList] 拨打电话失败:', err)
      Taro.showToast({
        title: '拨打失败',
        icon: 'none'
      })
    })
  }

  /**
   * 渲染空状态
   */
  const renderEmpty = () => {
    if (!showEmpty) return null

    return (
      <View className="store-list__empty">
        <Text className="store-list__empty-text">{emptyText}</Text>
      </View>
    )
  }

  /**
   * 渲染单个门店
   */
  const renderStore = (store: StoreListItem) => {
    const isBusiness = store.is_active === 1
    const inBusinessHours = isBusiness && isBusinessHours(store.business_hours)

    return (
      <View key={store.id} className="store-list__item">
        <Cell className="store-list__cell">
          {/* 门店信息 */}
          <View className="store-list__info">
            {/* 标题行 */}
            <View className="store-list__header">
              <Text className="store-list__name">{store.name}</Text>
              {store.distance !== undefined && (
                <Text className="store-list__distance">
                  {formatDistance(store.distance)}
                </Text>
              )}
            </View>

            {/* 地址 */}
            <View
              className="store-list__address-row"
              onClick={() => handleOpenMap(store)}
            >
              <Location size={14} color="#999999" />
              <Text className="store-list__address">{store.address}</Text>
            </View>

            {/* 营业时间和状态 */}
            <View className="store-list__business-row">
              <Text className="store-list__business-hours">
                {formatBusinessHours(store.business_hours)}
              </Text>
              {isBusiness ? (
                <Text
                  className={`store-list__business-status ${
                    inBusinessHours ? 'store-list__business-status--open' : 'store-list__business-status--closed'
                  }`}
                >
                  {inBusinessHours ? '营业中' : '休息中'}
                </Text>
              ) : (
                <Text className="store-list__business-status store-list__business-status--closed">
                  暂停营业
                </Text>
              )}
            </View>

            {/* 电话 */}
            {store.phone && (
              <View
                className="store-list__phone-row"
                onClick={() => handleCallPhone(store.phone)}
              >
                <Phone size={14} color="#FF6B35" />
                <Text className="store-list__phone">{store.phone}</Text>
              </View>
            )}
          </View>
        </Cell>
      </View>
    )
  }

  // 空状态
  if (stores.length === 0) {
    return renderEmpty()
  }

  return (
    <View className="store-list">
      {stores.map(store => renderStore(store))}
    </View>
  )
}

export default StoreList
