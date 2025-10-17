/**
 * 商家操作页 - 绑定上级用户
 * Feature: 商家绑定上级用户功能
 *
 * 核心功能:
 * - 输入上级用户ID或邀请码
 * - 提交绑定请求
 * - 显示绑定状态
 * - 查看当前绑定关系
 */

import React, { useState, useEffect, useCallback } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { Input, Button, Cell, CellGroup } from '@nutui/nutui-react-taro'
import { User, Success, Tips } from '@nutui/icons-react-taro'
import { useUser } from '@/contexts/UserContext'
import './index.less'

/**
 * 绑定信息接口
 */
interface BindInfo {
  isBound: boolean
  superiorId?: string
  superiorName?: string
  bindTime?: string
}

/**
 * 商家绑定页面组件
 */
function MerchantBind(): React.ReactElement {
  const { userInfo, isLoggedIn } = useUser()
  const [inviteCode, setInviteCode] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [bindInfo, setBindInfo] = useState<BindInfo | null>(null)
  const [fetchingInfo, setFetchingInfo] = useState<boolean>(true)

  /**
   * 获取当前绑定信息
   */
  const fetchBindInfo = useCallback(async () => {
    try {
      setFetchingInfo(true)

      // TODO: 调用实际的API获取绑定信息
      // 这里使用模拟数据
      await new Promise(resolve => setTimeout(resolve, 500))

      const mockBindInfo: BindInfo = {
        isBound: false
        // 如果已绑定,会有以下字段:
        // superiorId: 'USER123456',
        // superiorName: '张三',
        // bindTime: '2025-01-15 10:30:00'
      }

      setBindInfo(mockBindInfo)
    } catch (error) {
      console.error('[MerchantBind] 获取绑定信息失败:', error)
      Taro.showToast({
        title: '获取绑定信息失败,请稍后重试',
        icon: 'none',
        duration: 2000
      })
    } finally {
      setFetchingInfo(false)
    }
  }, [])

  /**
   * 提交绑定
   */
  const handleSubmitBind = useCallback(async () => {
    if (!inviteCode.trim()) {
      Taro.showToast({
        title: '请输入邀请码或上级用户ID',
        icon: 'none',
        duration: 2000
      })
      return
    }

    try {
      setLoading(true)

      // TODO: 调用实际的API提交绑定
      // const response = await bindSuperiorUser(inviteCode)

      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))

      // 模拟成功响应
      const success = true

      if (success) {
        Taro.showToast({
          title: '绑定成功!',
          icon: 'success',
          duration: 2000
        })
        setInviteCode('')
        // 重新获取绑定信息
        fetchBindInfo()
      } else {
        Taro.showToast({
          title: '绑定失败,请检查邀请码是否正确',
          icon: 'none',
          duration: 2000
        })
      }
    } catch (error) {
      console.error('[MerchantBind] 绑定失败:', error)
      Taro.showToast({
        title: '绑定失败,请稍后重试',
        icon: 'none',
        duration: 2000
      })
    } finally {
      setLoading(false)
    }
  }, [inviteCode, fetchBindInfo])

  /**
   * 解绑上级
   */
  const handleUnbind = useCallback(async () => {
    try {
      const { confirm } = await Taro.showModal({
        title: '确认解绑',
        content: '解绑后需要重新绑定上级用户,确定要解绑吗?'
      })

      if (!confirm) {
        return
      }

      setLoading(true)

      // TODO: 调用实际的API解绑
      await new Promise(resolve => setTimeout(resolve, 1000))

      Taro.showToast({
        title: '解绑成功',
        icon: 'success',
        duration: 2000
      })
      fetchBindInfo()
    } catch (error) {
      console.error('[MerchantBind] 解绑失败:', error)
      Taro.showToast({
        title: '解绑失败,请稍后重试',
        icon: 'none',
        duration: 2000
      })
    } finally {
      setLoading(false)
    }
  }, [fetchBindInfo])

  /**
   * 页面初始化
   */
  useEffect(() => {
    // 配置页面标题
    Taro.setNavigationBarTitle({ title: '商家操作页' })

    if (isLoggedIn) {
      fetchBindInfo()
    } else {
      setFetchingInfo(false)
    }
  }, [isLoggedIn, fetchBindInfo])

  /**
   * 未登录提示
   */
  if (!isLoggedIn) {
    return (
      <View className="merchant-bind-page">
        <View className="merchant-bind-page__not-login">
          <User size={80} color="#d1d5db" />
          <Text className="merchant-bind-page__not-login-text">请先登录</Text>
          <Button
            type="primary"
            size="large"
            onClick={() => Taro.navigateTo({ url: '/pages/login/index' })}
            className="merchant-bind-page__login-btn"
          >
            去登录
          </Button>
        </View>
      </View>
    )
  }

  /**
   * 加载中状态
   */
  if (fetchingInfo) {
    return (
      <View className="merchant-bind-page">
        <View className="merchant-bind-page__loading">
          <Text>加载中...</Text>
        </View>
      </View>
    )
  }

  /**
   * 主要内容
   */
  return (
    <View className="merchant-bind-page">
      {/* 用户信息卡片 */}
      <View className="merchant-bind-page__user-card">
        <View className="merchant-bind-page__user-avatar">
          <User size={40} color="#667eea" />
        </View>
        <View className="merchant-bind-page__user-info">
          <Text className="merchant-bind-page__user-name">{userInfo?.nickname || '用户'}</Text>
          <Text className="merchant-bind-page__user-id">ID: {userInfo?.id || 'N/A'}</Text>
        </View>
      </View>

      {/* 绑定状态显示 */}
      {bindInfo?.isBound ? (
        <View className="merchant-bind-page__status-card merchant-bind-page__status-card--bound">
          <View className="merchant-bind-page__status-header">
            <Success size={24} color="#52c41a" />
            <Text className="merchant-bind-page__status-title">已绑定上级</Text>
          </View>
          <CellGroup className="merchant-bind-page__info-group">
            <Cell title="上级用户ID" extra={bindInfo.superiorId} />
            <Cell title="上级用户名称" extra={bindInfo.superiorName} />
            <Cell title="绑定时间" extra={bindInfo.bindTime} />
          </CellGroup>
          <Button
            type="danger"
            size="large"
            loading={loading}
            onClick={handleUnbind}
            className="merchant-bind-page__unbind-btn"
          >
            解除绑定
          </Button>
        </View>
      ) : (
        <View className="merchant-bind-page__status-card merchant-bind-page__status-card--unbound">
          <View className="merchant-bind-page__status-header">
            <Tips size={24} color="#ff9800" />
            <Text className="merchant-bind-page__status-title">未绑定上级</Text>
          </View>
          <Text className="merchant-bind-page__status-desc">
            请输入上级用户的邀请码或用户ID进行绑定
          </Text>
        </View>
      )}

      {/* 绑定表单 */}
      {!bindInfo?.isBound && (
        <View className="merchant-bind-page__form-card">
          <View className="merchant-bind-page__form-title">
            <Text className="merchant-bind-page__form-title-text">绑定上级用户</Text>
          </View>
          <View className="merchant-bind-page__form-content">
            <Input
              className="merchant-bind-page__input"
              placeholder="请输入邀请码或用户ID"
              value={inviteCode}
              onChange={(value) => setInviteCode(value)}
              clearable
            />
            <Button
              type="primary"
              size="large"
              loading={loading}
              onClick={handleSubmitBind}
              className="merchant-bind-page__submit-btn"
            >
              {loading ? '绑定中...' : '确认绑定'}
            </Button>
          </View>
        </View>
      )}

      {/* 说明信息 */}
      <View className="merchant-bind-page__tips">
        <View className="merchant-bind-page__tips-title">
          <Tips size={16} color="#999" />
          <Text className="merchant-bind-page__tips-title-text">绑定说明</Text>
        </View>
        <View className="merchant-bind-page__tips-list">
          <Text className="merchant-bind-page__tips-item">• 绑定上级后,您的订单将关联到上级账户</Text>
          <Text className="merchant-bind-page__tips-item">• 绑定后可以享受上级提供的专属优惠</Text>
          <Text className="merchant-bind-page__tips-item">• 如需更换上级,请先解绑当前上级</Text>
          <Text className="merchant-bind-page__tips-item">• 邀请码由上级用户提供,请确保准确输入</Text>
        </View>
      </View>
    </View>
  )
}

export default MerchantBind
