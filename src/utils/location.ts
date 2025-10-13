/**
 * 地理位置工具
 *
 * 提供地理位置获取、距离计算等功能
 */

import Taro from '@tarojs/taro'

/**
 * 地理位置信息
 */
export interface LocationInfo {
  /** 纬度 */
  latitude: number
  /** 经度 */
  longitude: number
  /** 速度(m/s) */
  speed?: number
  /** 位置精度(米) */
  accuracy?: number
  /** 高度(米) */
  altitude?: number
  /** 水平精度(米) */
  horizontalAccuracy?: number
  /** 垂直精度(米) */
  verticalAccuracy?: number
}

/**
 * 位置缓存
 */
interface LocationCache {
  /** 位置信息 */
  location: LocationInfo
  /** 缓存时间戳(毫秒) */
  timestamp: number
}

/** 缓存Key */
const CACHE_KEY = 'user_location_cache'
/** 缓存有效期(5分钟) */
const CACHE_DURATION = 5 * 60 * 1000

/**
 * 获取用户当前位置
 *
 * @param useCache - 是否使用缓存(默认true,5分钟有效期)
 * @returns Promise<LocationInfo | null> - 位置信息,获取失败返回null
 */
export async function getCurrentLocation(useCache = true): Promise<LocationInfo | null> {
  try {
    // 1. 尝试从缓存读取
    if (useCache) {
      const cached = getCachedLocation()
      if (cached) {
        console.log('[Location] 使用缓存位置')
        return cached
      }
    }

    // 2. 检查位置权限
    const { authSetting } = await Taro.getSetting()

    if (authSetting['scope.userLocation'] === false) {
      // 权限被拒绝过,引导用户打开设置
      const { confirm } = await Taro.showModal({
        title: '需要位置权限',
        content: '开启位置权限后,可为您推荐附近门店',
        confirmText: '去设置',
        cancelText: '取消'
      })

      if (confirm) {
        await Taro.openSetting()
      }

      return null
    }

    // 3. 获取位置信息
    const res = await Taro.getLocation({
      type: 'gcj02', // 火星坐标系(高德、腾讯地图使用)
      isHighAccuracy: true, // 高精度模式
      altitude: false // 不需要高度信息
    })

    const location: LocationInfo = {
      latitude: res.latitude,
      longitude: res.longitude,
      speed: res.speed,
      accuracy: res.accuracy,
      altitude: res.altitude,
      horizontalAccuracy: res.horizontalAccuracy,
      verticalAccuracy: res.verticalAccuracy
    }

    // 4. 缓存位置信息
    cacheLocation(location)

    console.log('[Location] 获取位置成功:', location)
    return location

  } catch (error: any) {
    console.error('[Location] 获取位置失败:', error)

    // 用户拒绝授权
    if (error.errMsg && error.errMsg.includes('auth deny')) {
      console.log('[Location] 用户拒绝授权位置权限')
    }

    return null
  }
}

/**
 * 计算两点之间的距离(Haversine公式)
 *
 * @param lat1 - 起点纬度
 * @param lng1 - 起点经度
 * @param lat2 - 终点纬度
 * @param lng2 - 终点经度
 * @returns number - 距离(千米,保留1位小数)
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371 // 地球半径(千米)

  const toRad = (deg: number) => (deg * Math.PI) / 180

  const φ1 = toRad(lat1)
  const φ2 = toRad(lat2)
  const Δφ = toRad(lat2 - lat1)
  const Δλ = toRad(lng2 - lng1)

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  const distance = R * c

  // 返回1位小数
  return Math.round(distance * 10) / 10
}

/**
 * 打开地图导航
 *
 * @param latitude - 目标纬度
 * @param longitude - 目标经度
 * @param name - 目标名称
 * @param address - 目标地址
 * @returns Promise<void>
 */
export async function openNavigation(
  latitude: number,
  longitude: number,
  name: string,
  address: string
): Promise<void> {
  try {
    await Taro.openLocation({
      latitude,
      longitude,
      name,
      address,
      scale: 18 // 缩放级别(5-18)
    })
  } catch (error) {
    console.error('[Location] 打开地图失败:', error)
    Taro.showToast({
      title: '打开地图失败',
      icon: 'none'
    })
  }
}

/**
 * 格式化距离显示
 *
 * @param distanceKm - 距离(千米)
 * @returns string - 格式化后的距离字符串
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 0.1) {
    return '<100m'
  } else if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m`
  } else if (distanceKm < 10) {
    return `${distanceKm.toFixed(1)}km`
  } else {
    return `${Math.round(distanceKm)}km`
  }
}

/**
 * 从缓存读取位置信息
 *
 * @returns LocationInfo | null
 */
function getCachedLocation(): LocationInfo | null {
  try {
    const cachedStr = Taro.getStorageSync(CACHE_KEY)
    if (!cachedStr) return null

    const cached: LocationCache = JSON.parse(cachedStr)

    // 检查缓存是否过期
    const now = Date.now()
    if (now - cached.timestamp > CACHE_DURATION) {
      console.log('[Location] 缓存已过期')
      Taro.removeStorageSync(CACHE_KEY)
      return null
    }

    return cached.location
  } catch (error) {
    console.error('[Location] 读取缓存失败:', error)
    return null
  }
}

/**
 * 缓存位置信息
 *
 * @param location - 位置信息
 */
function cacheLocation(location: LocationInfo): void {
  try {
    const cache: LocationCache = {
      location,
      timestamp: Date.now()
    }
    Taro.setStorageSync(CACHE_KEY, JSON.stringify(cache))
  } catch (error) {
    console.error('[Location] 缓存位置失败:', error)
  }
}

/**
 * 清除位置缓存
 */
export function clearLocationCache(): void {
  try {
    Taro.removeStorageSync(CACHE_KEY)
    console.log('[Location] 缓存已清除')
  } catch (error) {
    console.error('[Location] 清除缓存失败:', error)
  }
}
