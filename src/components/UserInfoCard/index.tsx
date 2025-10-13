/**
 * 用户信息卡片组件
 * Feature: 核销券个人中心主页
 *
 * 展示用户头像、昵称、会员等级,支持点击跳转到资料编辑页
 */

import React, { useState } from 'react'
import { View, Image, Text } from '@tarojs/components'
import { ArrowRight } from '@nutui/icons-react-taro'
import Taro from '@tarojs/taro'
import { UserInfo, MemberLevel } from '@/types/user'
import './index.less'

/**
 * 组件属性
 */
export interface UserInfoCardProps {
  /** 用户信息 */
  userInfo: UserInfo | null
  /** 是否已登录 */
  isLoggedIn: boolean
  /** 点击事件(可选) */
  onClick?: () => void
}

/**
 * 获取会员等级配置
 */
const getMemberConfig = (level: MemberLevel): { name: string; color: string } => {
  switch (level) {
    case MemberLevel.VIP1:
      return { name: 'VIP1会员', color: '#FFD700' }
    case MemberLevel.VIP2:
      return { name: 'VIP2会员', color: '#FFA500' }
    case MemberLevel.VIP3:
      return { name: 'VIP3会员', color: '#FF6B00' }
    default:
      return { name: '普通会员', color: '#999999' }
  }
}

/**
 * 用户信息卡片组件
 *
 * @example
 * ```tsx
 * <UserInfoCard
 *   userInfo={userInfo}
 *   isLoggedIn={isLoggedIn}
 *   onClick={handleProfileClick}
 * />
 * ```
 */
const UserInfoCard: React.FC<UserInfoCardProps> = React.memo(({ userInfo, isLoggedIn, onClick }) => {
  const [avatarError, setAvatarError] = useState<boolean>(false)

  /**
   * 处理卡片点击
   */
  const handleClick = (): void => {
    if (onClick) {
      onClick()
    } else if (isLoggedIn) {
      // 默认跳转到资料编辑页
      Taro.navigateTo({
        url: '/pages/profile/edit/index'
      })
    } else {
      // 未登录跳转到登录页
      Taro.navigateTo({
        url: '/pages/login/index'
      })
    }
  }

  /**
   * 处理头像加载失败
   */
  const handleAvatarError = (): void => {
    setAvatarError(true)
  }

  /**
   * 获取头像URL
   */
  const getAvatarUrl = (): string => {
    if (!isLoggedIn || !userInfo?.avatar || avatarError) {
      // 默认头像
      return 'https://img.yzcdn.cn/vant/cat.jpeg'
    }
    return userInfo.avatar
  }

  /**
   * 获取昵称
   */
  const getNickname = (): string => {
    if (!isLoggedIn) {
      return '点击登录'
    }
    return userInfo?.nickname || '未设置昵称'
  }

  /**
   * 获取会员等级配置
   */
  const memberConfig = userInfo ? getMemberConfig(userInfo.memberLevel) : null

  return (
    <View className="user-info-card" onClick={handleClick}>
      <View className="user-info-card__content">
        {/* 头像 */}
        <Image
          className="user-info-card__avatar"
          src={getAvatarUrl()}
          mode="aspectFill"
          onError={handleAvatarError}
        />

        {/* 用户信息 */}
        <View className="user-info-card__info">
          <View className="user-info-card__nickname-row">
            <Text className="user-info-card__nickname">{getNickname()}</Text>
          </View>

          {/* 会员等级 */}
          {isLoggedIn && userInfo && (
            <View className="user-info-card__member-row">
              <View
                className="user-info-card__member-badge"
                style={{ backgroundColor: memberConfig?.color }}
              >
                <Text className="user-info-card__member-text">
                  {memberConfig?.name || userInfo.memberLevelName}
                </Text>
              </View>
            </View>
          )}

          {/* 未登录提示 */}
          {!isLoggedIn && (
            <Text className="user-info-card__login-tip">登录查看更多功能</Text>
          )}
        </View>
      </View>

      {/* 右侧箭头 */}
      <ArrowRight size={20} color="#ccc" className="user-info-card__arrow" />
    </View>
  )
})

UserInfoCard.displayName = 'UserInfoCard'

export default UserInfoCard
