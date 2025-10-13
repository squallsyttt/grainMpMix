/**
 * 日期时间工具
 *
 * 提供时间格式化、过期判断等功能
 */

/**
 * 格式化时间戳
 *
 * @param timestamp - Unix时间戳(秒)
 * @param format - 格式字符串(默认: YYYY-MM-DD HH:mm:ss)
 * @returns string - 格式化后的日期时间字符串
 */
export function formatTimestamp(timestamp: number, format = 'YYYY-MM-DD HH:mm:ss'): string {
  const date = new Date(timestamp * 1000) // 秒转毫秒

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

/**
 * 获取剩余有效天数
 *
 * @param expireAt - 过期时间戳(秒)
 * @returns number - 剩余天数(向下取整,已过期返回0)
 */
export function getExpireDays(expireAt: number): number {
  const now = Math.floor(Date.now() / 1000) // 当前时间(秒)
  const diff = expireAt - now

  if (diff <= 0) {
    return 0 // 已过期
  }

  const days = Math.floor(diff / (24 * 60 * 60))
  return days
}

/**
 * 判断是否即将过期
 *
 * @param expireAt - 过期时间戳(秒)
 * @param threshold - 提前提醒天数(默认7天)
 * @returns boolean - 是否即将过期
 */
export function isExpiringSoon(expireAt: number, threshold = 7): boolean {
  const days = getExpireDays(expireAt)
  return days > 0 && days <= threshold
}

/**
 * 判断是否已过期
 *
 * @param expireAt - 过期时间戳(秒)
 * @returns boolean - 是否已过期
 */
export function isExpired(expireAt: number): boolean {
  const now = Math.floor(Date.now() / 1000)
  return expireAt < now
}

/**
 * 格式化剩余时间显示
 *
 * @param expireAt - 过期时间戳(秒)
 * @returns string - 格式化后的剩余时间字符串
 */
export function formatExpireTime(expireAt: number): string {
  const days = getExpireDays(expireAt)

  if (days === 0) {
    return '已过期'
  } else if (days === 1) {
    return '今天过期'
  } else if (days === 2) {
    return '明天过期'
  } else if (days <= 7) {
    return `${days}天后过期`
  } else {
    return `剩余${days}天`
  }
}

/**
 * 格式化日期为相对时间
 *
 * @param timestamp - Unix时间戳(秒)
 * @returns string - 相对时间字符串
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Math.floor(Date.now() / 1000)
  const diff = now - timestamp

  if (diff < 60) {
    return '刚刚'
  } else if (diff < 60 * 60) {
    const minutes = Math.floor(diff / 60)
    return `${minutes}分钟前`
  } else if (diff < 24 * 60 * 60) {
    const hours = Math.floor(diff / (60 * 60))
    return `${hours}小时前`
  } else if (diff < 7 * 24 * 60 * 60) {
    const days = Math.floor(diff / (24 * 60 * 60))
    return `${days}天前`
  } else {
    return formatTimestamp(timestamp, 'YYYY-MM-DD')
  }
}

/**
 * 获取今天的开始时间戳(秒)
 *
 * @returns number - 今天00:00:00的时间戳(秒)
 */
export function getTodayStartTimestamp(): number {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return Math.floor(now.getTime() / 1000)
}

/**
 * 获取今天的结束时间戳(秒)
 *
 * @returns number - 今天23:59:59的时间戳(秒)
 */
export function getTodayEndTimestamp(): number {
  const now = new Date()
  now.setHours(23, 59, 59, 999)
  return Math.floor(now.getTime() / 1000)
}

/**
 * 判断时间戳是否在今天
 *
 * @param timestamp - Unix时间戳(秒)
 * @returns boolean - 是否在今天
 */
export function isToday(timestamp: number): boolean {
  const start = getTodayStartTimestamp()
  const end = getTodayEndTimestamp()
  return timestamp >= start && timestamp <= end
}

/**
 * 格式化营业时间显示
 *
 * @param businessHours - 营业时间字符串(如 "09:00-21:00")
 * @returns string - 格式化后的营业时间
 */
export function formatBusinessHours(businessHours: string): string {
  if (!businessHours || businessHours.trim().length === 0) {
    return '营业时间未知'
  }

  // 验证格式
  const pattern = /^\d{2}:\d{2}-\d{2}:\d{2}$/
  if (!pattern.test(businessHours)) {
    return businessHours // 格式不正确,原样返回
  }

  const [start, end] = businessHours.split('-')
  return `营业时间: ${start} - ${end}`
}

/**
 * 判断当前是否在营业时间内
 *
 * @param businessHours - 营业时间字符串(如 "09:00-21:00")
 * @returns boolean - 是否在营业时间
 */
export function isBusinessHours(businessHours: string): boolean {
  if (!businessHours || businessHours.trim().length === 0) {
    return false
  }

  const pattern = /^(\d{2}):(\d{2})-(\d{2}):(\d{2})$/
  const match = businessHours.match(pattern)
  if (!match) {
    return false
  }

  const now = new Date()
  const currentHour = now.getHours()
  const currentMinute = now.getMinutes()

  const startHour = parseInt(match[1], 10)
  const startMinute = parseInt(match[2], 10)
  const endHour = parseInt(match[3], 10)
  const endMinute = parseInt(match[4], 10)

  const current = currentHour * 60 + currentMinute
  const start = startHour * 60 + startMinute
  const end = endHour * 60 + endMinute

  return current >= start && current <= end
}

/**
 * 获取剩余时间的详细信息(天、小时、分钟)
 *
 * @param expireAt - 过期时间戳(秒)
 * @returns object - { days, hours, minutes, seconds, total } 剩余时间信息
 */
export function getTimeRemaining(expireAt: number): {
  days: number
  hours: number
  minutes: number
  seconds: number
  total: number
} {
  const now = Math.floor(Date.now() / 1000)
  const total = expireAt - now

  if (total <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 }
  }

  const days = Math.floor(total / (24 * 60 * 60))
  const hours = Math.floor((total % (24 * 60 * 60)) / (60 * 60))
  const minutes = Math.floor((total % (60 * 60)) / 60)
  const seconds = Math.floor(total % 60)

  return { days, hours, minutes, seconds, total }
}

/**
 * 格式化剩余时间为倒计时显示(精确到小时/分钟)
 *
 * @param expireAt - 过期时间戳(秒)
 * @returns string - 倒计时字符串(如 "2天3小时", "5小时30分钟", "30分钟")
 */
export function formatCountdown(expireAt: number): string {
  const { days, hours, minutes, total } = getTimeRemaining(expireAt)

  if (total <= 0) {
    return '已过期'
  }

  if (days > 0) {
    if (hours > 0) {
      return `${days}天${hours}小时`
    }
    return `${days}天`
  }

  if (hours > 0) {
    if (minutes > 0) {
      return `${hours}小时${minutes}分钟`
    }
    return `${hours}小时`
  }

  if (minutes > 0) {
    return `${minutes}分钟`
  }

  return '即将过期'
}

/**
 * 获取过期警告等级
 *
 * @param expireAt - 过期时间戳(秒)
 * @returns string - 警告等级: 'danger'(1天内), 'warning'(3天内), 'info'(7天内), 'normal'(7天以上)
 */
export function getExpireWarningLevel(expireAt: number): 'danger' | 'warning' | 'info' | 'normal' {
  const days = getExpireDays(expireAt)
  const { hours } = getTimeRemaining(expireAt)

  if (days === 0) {
    return 'danger' // 24小时内
  }

  if (days === 1 && hours < 12) {
    return 'danger' // 不到36小时
  }

  if (days <= 3) {
    return 'warning' // 3天内
  }

  if (days <= 7) {
    return 'info' // 7天内
  }

  return 'normal' // 7天以上
}
