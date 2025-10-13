/**
 * 通知管理工具
 *
 * 用于处理过期提醒等推送通知
 */

import Taro from '@tarojs/taro'

/**
 * 通知类型
 */
export enum NotificationType {
  /** 核销券即将过期 */
  VOUCHER_EXPIRING = 'voucher_expiring',
  /** 核销券已过期 */
  VOUCHER_EXPIRED = 'voucher_expired',
  /** 订单状态变更 */
  ORDER_STATUS_CHANGED = 'order_status_changed',
  /** 系统通知 */
  SYSTEM_NOTIFICATION = 'system_notification'
}

/**
 * 通知数据接口
 */
export interface NotificationData {
  /** 通知ID */
  id: string
  /** 通知类型 */
  type: NotificationType
  /** 通知标题 */
  title: string
  /** 通知内容 */
  content: string
  /** 相关数据(如券ID、订单ID等) */
  data?: Record<string, any>
  /** 创建时间戳(秒) */
  createtime: number
  /** 是否已读 */
  is_read: boolean
}

/**
 * 通知处理器函数类型
 */
export type NotificationHandler = (notification: NotificationData) => void | Promise<void>

/**
 * 通知管理类
 */
class NotificationManager {
  private handlers: Map<NotificationType, NotificationHandler[]> = new Map()
  private isInitialized: boolean = false

  /**
   * 初始化通知管理器
   *
   * TODO: 未来需要在这里:
   * 1. 请求推送通知权限
   * 2. 注册推送通知监听器
   * 3. 订阅消息模板
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('[NotificationManager] 已初始化,跳过')
      return
    }

    try {
      console.log('[NotificationManager] 初始化通知管理器')

      // TODO: 请求推送通知权限
      // await this.requestNotificationPermission()

      // TODO: 注册推送消息监听
      // this.registerPushListener()

      // TODO: 订阅消息模板
      // await this.subscribeMessageTemplate()

      this.isInitialized = true
      console.log('[NotificationManager] 初始化完成')
    } catch (error) {
      console.error('[NotificationManager] 初始化失败:', error)
      throw error
    }
  }

  /**
   * 请求通知权限(预留接口)
   *
   * TODO: 实现小程序推送通知权限请求
   */
  private async requestNotificationPermission(): Promise<boolean> {
    try {
      const setting = await Taro.getSetting()
      console.log('[NotificationManager] 当前权限设置:', setting)

      // TODO: 根据setting判断是否需要请求权限
      // if (!setting.subscriptionsSetting?.mainSwitch) {
      //   // 引导用户开启通知权限
      // }

      return true
    } catch (error) {
      console.error('[NotificationManager] 获取权限失败:', error)
      return false
    }
  }

  /**
   * 注册推送消息监听器(预留接口)
   *
   * TODO: 实现推送消息接收处理
   */
  private registerPushListener(): void {
    // TODO: 监听推送消息
    // Taro.onPushMessage((message) => {
    //   this.handlePushMessage(message)
    // })

    console.log('[NotificationManager] 推送监听器已注册(预留)')
  }

  /**
   * 订阅消息模板(预留接口)
   *
   * TODO: 实现消息模板订阅
   */
  private async subscribeMessageTemplate(): Promise<void> {
    try {
      // TODO: 调用requestSubscribeMessage订阅模板
      // const tmplIds = ['过期提醒模板ID', '订单状态模板ID']
      // await Taro.requestSubscribeMessage({ tmplIds })

      console.log('[NotificationManager] 消息模板订阅完成(预留)')
    } catch (error) {
      console.error('[NotificationManager] 订阅消息模板失败:', error)
    }
  }

  /**
   * 注册通知处理器
   *
   * @param type - 通知类型
   * @param handler - 处理器函数
   */
  on(type: NotificationType, handler: NotificationHandler): void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, [])
    }
    this.handlers.get(type)!.push(handler)
    console.log(`[NotificationManager] 已注册 ${type} 处理器`)
  }

  /**
   * 移除通知处理器
   *
   * @param type - 通知类型
   * @param handler - 处理器函数
   */
  off(type: NotificationType, handler: NotificationHandler): void {
    const handlers = this.handlers.get(type)
    if (!handlers) return

    const index = handlers.indexOf(handler)
    if (index > -1) {
      handlers.splice(index, 1)
      console.log(`[NotificationManager] 已移除 ${type} 处理器`)
    }
  }

  /**
   * 处理推送消息(预留接口)
   *
   * @param message - 推送消息数据
   */
  async handlePushMessage(message: any): Promise<void> {
    try {
      console.log('[NotificationManager] 收到推送消息:', message)

      // TODO: 解析消息,转换为NotificationData格式
      // const notification: NotificationData = this.parsePushMessage(message)

      // TODO: 触发对应的处理器
      // await this.handleNotification(notification)

      // TODO: 保存到本地通知列表
      // await this.saveNotification(notification)
    } catch (error) {
      console.error('[NotificationManager] 处理推送消息失败:', error)
    }
  }

  /**
   * 处理通知
   *
   * @param notification - 通知数据
   */
  async handleNotification(notification: NotificationData): Promise<void> {
    const handlers = this.handlers.get(notification.type)
    if (!handlers || handlers.length === 0) {
      console.log(`[NotificationManager] 没有 ${notification.type} 类型的处理器`)
      return
    }

    console.log(`[NotificationManager] 执行 ${handlers.length} 个处理器`)

    for (const handler of handlers) {
      try {
        await handler(notification)
      } catch (error) {
        console.error('[NotificationManager] 处理器执行失败:', error)
      }
    }
  }

  /**
   * 模拟接收过期提醒通知(用于测试)
   *
   * @param voucherId - 券ID
   * @param voucherTitle - 券标题
   * @param expireAt - 过期时间
   */
  async simulateExpireNotification(
    voucherId: number,
    voucherTitle: string,
    expireAt: number
  ): Promise<void> {
    const notification: NotificationData = {
      id: `notif_${Date.now()}`,
      type: NotificationType.VOUCHER_EXPIRING,
      title: '核销券即将过期',
      content: `您的"${voucherTitle}"即将过期,请尽快使用`,
      data: {
        voucherId,
        expireAt
      },
      createtime: Math.floor(Date.now() / 1000),
      is_read: false
    }

    console.log('[NotificationManager] 模拟过期提醒:', notification)
    await this.handleNotification(notification)

    // 显示系统通知
    Taro.showToast({
      title: notification.content,
      icon: 'none',
      duration: 3000
    })
  }

  /**
   * 获取未读通知数量(预留接口)
   *
   * TODO: 从本地存储或服务器获取未读通知数
   */
  async getUnreadCount(): Promise<number> {
    // TODO: 实现获取未读通知数
    return 0
  }

  /**
   * 标记通知为已读(预留接口)
   *
   * @param notificationId - 通知ID
   */
  async markAsRead(notificationId: string): Promise<void> {
    // TODO: 实现标记已读
    console.log(`[NotificationManager] 标记通知 ${notificationId} 为已读(预留)`)
  }

  /**
   * 清除所有通知(预留接口)
   */
  async clearAll(): Promise<void> {
    // TODO: 实现清除所有通知
    console.log('[NotificationManager] 清除所有通知(预留)')
  }
}

/**
 * 导出单例实例
 */
export const notificationManager = new NotificationManager()

/**
 * 初始化通知管理器(在app启动时调用)
 */
export async function initNotification(): Promise<void> {
  await notificationManager.initialize()
}

/**
 * 注册过期提醒处理器
 *
 * @param handler - 处理器函数
 */
export function onVoucherExpiring(handler: NotificationHandler): void {
  notificationManager.on(NotificationType.VOUCHER_EXPIRING, handler)
}

/**
 * 注册订单状态变更处理器
 *
 * @param handler - 处理器函数
 */
export function onOrderStatusChanged(handler: NotificationHandler): void {
  notificationManager.on(NotificationType.ORDER_STATUS_CHANGED, handler)
}
