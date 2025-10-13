/**
 * 用户上下文
 * Feature: 核销券个人中心主页
 * 管理用户登录状态和用户信息
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { UserInfo } from '@/types/user'

/**
 * 用户上下文类型
 */
interface UserContextType {
  /** 用户信息 */
  userInfo: UserInfo | null
  /** 是否已登录 */
  isLoggedIn: boolean
  /** 登录状态加载中 */
  loading: boolean
  /** 登录函数 */
  login: (userInfo: UserInfo) => void
  /** 退出登录函数 */
  logout: () => void
  /** 更新用户信息 */
  updateUserInfo: (userInfo: Partial<UserInfo>) => void
}

/**
 * 本地存储键名
 */
const STORAGE_KEY_USER_INFO = 'userInfo'
const STORAGE_KEY_TOKEN = 'token'

/**
 * 创建用户上下文
 */
const UserContext = createContext<UserContextType | undefined>(undefined)

/**
 * 用户上下文提供者属性
 */
interface UserProviderProps {
  children: React.ReactNode
}

/**
 * 用户上下文提供者
 *
 * 管理用户登录状态,支持:
 * - 用户信息持久化存储(localStorage)
 * - 登录/退出登录
 * - 用户信息更新
 */
export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  /**
   * 从本地存储恢复用户信息
   */
  useEffect(() => {
    try {
      const storedUserInfo = Taro.getStorageSync(STORAGE_KEY_USER_INFO)
      const token = Taro.getStorageSync(STORAGE_KEY_TOKEN)

      if (storedUserInfo && token) {
        setUserInfo(JSON.parse(storedUserInfo))
      }
    } catch (error) {
      console.error('[UserContext] 恢复用户信息失败:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * 登录函数
   */
  const login = useCallback((newUserInfo: UserInfo) => {
    try {
      setUserInfo(newUserInfo)
      Taro.setStorageSync(STORAGE_KEY_USER_INFO, JSON.stringify(newUserInfo))
      console.log('[UserContext] 用户登录成功:', newUserInfo.nickname)
    } catch (error) {
      console.error('[UserContext] 保存用户信息失败:', error)
      Taro.showToast({
        title: '登录失败',
        icon: 'none',
        duration: 2000
      })
    }
  }, [])

  /**
   * 退出登录函数
   */
  const logout = useCallback(() => {
    try {
      setUserInfo(null)
      Taro.removeStorageSync(STORAGE_KEY_USER_INFO)
      Taro.removeStorageSync(STORAGE_KEY_TOKEN)
      console.log('[UserContext] 用户已退出登录')

      Taro.showToast({
        title: '已退出登录',
        icon: 'success',
        duration: 2000
      })
    } catch (error) {
      console.error('[UserContext] 退出登录失败:', error)
    }
  }, [])

  /**
   * 更新用户信息
   */
  const updateUserInfo = useCallback((updates: Partial<UserInfo>) => {
    if (!userInfo) {
      console.warn('[UserContext] 用户未登录,无法更新信息')
      return
    }

    try {
      const updatedUserInfo = { ...userInfo, ...updates }
      setUserInfo(updatedUserInfo)
      Taro.setStorageSync(STORAGE_KEY_USER_INFO, JSON.stringify(updatedUserInfo))
      console.log('[UserContext] 用户信息已更新')
    } catch (error) {
      console.error('[UserContext] 更新用户信息失败:', error)
    }
  }, [userInfo])

  const value: UserContextType = {
    userInfo,
    isLoggedIn: !!userInfo,
    loading,
    login,
    logout,
    updateUserInfo
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

/**
 * 使用用户上下文的 Hook
 *
 * @example
 * ```tsx
 * const { userInfo, isLoggedIn, login, logout } = useUser()
 * ```
 */
export const useUser = (): UserContextType => {
  const context = useContext(UserContext)

  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }

  return context
}

export default UserContext
