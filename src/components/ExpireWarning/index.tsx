/**
 * 过期警告组件
 *
 * 根据有效期显示不同等级的过期提醒
 */

import React, { useState, useEffect } from 'react'
import { View, Text } from '@tarojs/components'
import { Clock } from '@nutui/icons-react-taro'
import { formatCountdown, getExpireWarningLevel } from '../../utils/date'
import './index.less'

interface ExpireWarningProps {
  /** 过期时间戳(秒) */
  expireAt: number
  /** 是否显示倒计时(默认true) */
  showCountdown?: boolean
  /** 是否启用自动刷新(默认true) */
  autoRefresh?: boolean
  /** 自动刷新间隔(毫秒,默认60000=1分钟) */
  refreshInterval?: number
}

/**
 * 过期警告组件
 */
const ExpireWarning: React.FC<ExpireWarningProps> = ({
  expireAt,
  showCountdown = true,
  autoRefresh = true,
  refreshInterval = 60000
}) => {
  const [countdown, setCountdown] = useState<string>(formatCountdown(expireAt))
  const [warningLevel, setWarningLevel] = useState<string>(getExpireWarningLevel(expireAt))

  /**
   * 更新倒计时显示
   */
  const updateCountdown = () => {
    setCountdown(formatCountdown(expireAt))
    setWarningLevel(getExpireWarningLevel(expireAt))
  }

  /**
   * 自动刷新倒计时
   */
  useEffect(() => {
    if (!autoRefresh) return

    // 立即更新一次
    updateCountdown()

    // 设置定时器
    const timer = setInterval(updateCountdown, refreshInterval)

    return () => {
      clearInterval(timer)
    }
  }, [expireAt, autoRefresh, refreshInterval])

  /**
   * 获取警告文案
   */
  const getWarningText = (): string => {
    switch (warningLevel) {
      case 'danger':
        return '即将过期,请尽快使用'
      case 'warning':
        return '即将过期,请注意有效期'
      case 'info':
        return '请注意有效期'
      default:
        return ''
    }
  }

  // 不显示警告
  if (warningLevel === 'normal') {
    return null
  }

  return (
    <View className={`expire-warning expire-warning--${warningLevel}`}>
      <Clock size={14} className="expire-warning__icon" />
      <View className="expire-warning__content">
        <Text className="expire-warning__text">{getWarningText()}</Text>
        {showCountdown && (
          <Text className="expire-warning__countdown">剩余 {countdown}</Text>
        )}
      </View>
    </View>
  )
}

export default ExpireWarning
