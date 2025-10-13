# 技术研究文档

## 研究任务概览

本文档针对购物车页面优化和功能完善中的5个关键技术问题进行深入研究,包括React防抖、localStorage错误处理、Taro Dialog组件、自定义TabBar徽标和下拉刷新实现。

---

## 1. React防抖最佳实践

### Decision (决策)

**推荐方案**: 使用 `useMemo` + `lodash.debounce` 实现防抖,延迟设置为 **300ms**

```tsx
import { useMemo } from 'react'
import { debounce } from 'lodash'

const MyComponent = () => {
  const [count, setCount] = useState(0)

  // ✅ 推荐: 使用 useMemo 确保 debounce 函数只创建一次
  const debouncedHandleClick = useMemo(
    () => debounce((newCount: number) => {
      // 执行实际操作
      console.log('Saving count:', newCount)
      // API调用等
    }, 300),
    [] // 空依赖数组,函数只创建一次
  )

  const handleClick = () => {
    const newCount = count + 1
    setCount(newCount) // 立即更新UI
    debouncedHandleClick(newCount) // 防抖执行API调用
  }

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      debouncedHandleClick.cancel()
    }
  }, [debouncedHandleClick])

  return <Button onClick={handleClick}>点击 ({count})</Button>
}
```

### Rationale (理由)

1. **useMemo vs useCallback**
   - `useMemo(() => debounce(fn, 300), [])` - 更高效,只在初始渲染时调用 `debounce()`
   - `useCallback(debounce(fn, 300), [])` - 每次重渲染都会创建新的防抖函数(错误)
   - `useCallback()` 适合缓存函数本身,而不是包裹 debounce

2. **防抖延迟建议**
   - **100ms**: 高频事件(窗口resize、滚动)
   - **300ms**: 按钮点击、表单提交(推荐)
   - **500ms**: 搜索输入框(用户打字)
   - **1000ms+**: 自动保存功能

3. **参数传递模式**
   ```tsx
   // ❌ 错误: 闭包捕获旧值
   const debouncedFn = useMemo(
     () => debounce(() => {
       console.log(count) // 永远是初始值
     }, 300),
     []
   )

   // ✅ 正确: 通过参数传递
   const debouncedFn = useMemo(
     () => debounce((value: number) => {
       console.log(value) // 获取最新值
     }, 300),
     []
   )
   ```

4. **视觉反馈策略**
   - 立即更新UI状态(乐观更新)
   - 显示 Loading 状态在防抖期间
   - 防抖完成后显示成功/失败提示

### Alternatives (替代方案)

#### 方案A: 使用 `use-debounce` 库(适合生产环境)

```tsx
import { useDebouncedCallback } from 'use-debounce'

const MyComponent = () => {
  const debouncedHandleClick = useDebouncedCallback(
    (value: number) => {
      console.log('Saving:', value)
    },
    300,
    { maxWait: 1000 } // 最长等待时间
  )

  return <Button onClick={() => debouncedHandleClick(count)}>保存</Button>
}
```

**优点**:
- 专门为React设计,API简洁
- 自动处理清理逻辑
- 支持 `maxWait`、`leading`、`trailing` 等高级选项
- TypeScript 支持完善

**缺点**:
- 需要额外依赖(但仅5KB gzipped)

#### 方案B: 自定义 Hook(适合学习/定制)

```tsx
import { useRef, useEffect } from 'react'

function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<NodeJS.Timeout>()
  const callbackRef = useRef(callback)

  // 保持 callback 引用最新
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  // 清理定时器
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return (...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      callbackRef.current(...args)
    }, delay)
  }
}

// 使用
const MyComponent = () => {
  const handleSave = useDebounce((value: number) => {
    console.log('Saving:', value)
  }, 300)

  return <Button onClick={() => handleSave(count)}>保存</Button>
}
```

**优点**:
- 无外部依赖
- 完全可控和定制
- 学习React Hooks的好例子

**缺点**:
- 功能简单,缺少 `maxWait`、`cancel`、`flush` 等方法
- 需要自己处理边界情况

### Code Example (完整示例)

```tsx
import React, { useState, useMemo, useEffect } from 'react'
import { View, Button } from '@tarojs/components'
import { debounce } from 'lodash'
import Taro from '@tarojs/taro'

interface CartItem {
  id: string
  quantity: number
}

const CartPage: React.FC = () => {
  const [items, setItems] = useState<CartItem[]>([])
  const [isUpdating, setIsUpdating] = useState(false)

  // 防抖的更新购物车API调用
  const debouncedUpdateCart = useMemo(
    () => debounce(async (updatedItems: CartItem[]) => {
      setIsUpdating(true)
      try {
        await fetch('/api/cart/update', {
          method: 'POST',
          body: JSON.stringify({ items: updatedItems })
        })

        Taro.showToast({
          title: '更新成功',
          icon: 'success',
          duration: 1500
        })
      } catch (error) {
        console.error('更新购物车失败:', error)
        Taro.showToast({
          title: '更新失败',
          icon: 'error',
          duration: 2000
        })
      } finally {
        setIsUpdating(false)
      }
    }, 300),
    []
  )

  // 增加数量
  const handleIncrease = (itemId: string) => {
    setItems(prev => {
      const newItems = prev.map(item =>
        item.id === itemId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )

      // 乐观更新UI,防抖调用API
      debouncedUpdateCart(newItems)
      return newItems
    })
  }

  // 减少数量
  const handleDecrease = (itemId: string) => {
    setItems(prev => {
      const newItems = prev.map(item =>
        item.id === itemId && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )

      debouncedUpdateCart(newItems)
      return newItems
    })
  }

  // 组件卸载时清理防抖函数
  useEffect(() => {
    return () => {
      debouncedUpdateCart.cancel()
    }
  }, [debouncedUpdateCart])

  return (
    <View className="cart-page">
      {items.map(item => (
        <View key={item.id} className="cart-item">
          <Button onClick={() => handleDecrease(item.id)} disabled={isUpdating}>
            -
          </Button>
          <View>{item.quantity}</View>
          <Button onClick={() => handleIncrease(item.id)} disabled={isUpdating}>
            +
          </Button>
        </View>
      ))}
      {isUpdating && <View className="loading-overlay">更新中...</View>}
    </View>
  )
}

export default CartPage
```

---

## 2. localStorage错误处理模式

### Decision (决策)

**推荐方案**: 实现完整的错误处理和降级策略,支持容量超限、隐私模式、数据损坏等场景

```tsx
// src/utils/storage.ts
interface StorageOptions {
  fallbackToMemory?: boolean
  onError?: (error: Error) => void
}

class SafeStorage {
  private memoryStorage: Map<string, string> = new Map()
  private useMemoryFallback = false

  constructor(private options: StorageOptions = {}) {
    // 检测 localStorage 是否可用
    if (!this.isStorageAvailable()) {
      this.useMemoryFallback = true
      console.warn('localStorage 不可用,使用内存存储降级')
    }
  }

  /**
   * 检测 localStorage 是否可用
   */
  private isStorageAvailable(): boolean {
    try {
      const testKey = '__storage_test__'
      localStorage.setItem(testKey, 'test')
      localStorage.removeItem(testKey)
      return true
    } catch (e) {
      return false
    }
  }

  /**
   * 检测错误类型
   */
  private getErrorType(error: any): string {
    // QuotaExceededError 的多种表现形式
    if (
      error.code === 22 || // 所有浏览器(除Firefox)
      error.code === 1014 || // Firefox
      error.name === 'QuotaExceededError' || // 标准名称
      error.name === 'NS_ERROR_DOM_QUOTA_REACHED' // Firefox旧版本
    ) {
      return 'QUOTA_EXCEEDED'
    }

    // SecurityError - 隐私模式/无痕模式
    if (error.name === 'SecurityError') {
      return 'SECURITY_ERROR'
    }

    return 'UNKNOWN_ERROR'
  }

  /**
   * 获取存储使用情况
   */
  getStorageUsage(): { used: number; total: number; percentage: number } {
    if (this.useMemoryFallback) {
      return { used: 0, total: 0, percentage: 0 }
    }

    let used = 0
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        used += localStorage[key].length + key.length
      }
    }

    // localStorage 通常限制为 5-10MB
    const total = 5 * 1024 * 1024 // 5MB
    const percentage = (used / total) * 100

    return { used, total, percentage }
  }

  /**
   * 清理旧数据(按时间戳)
   */
  private cleanupOldData(): void {
    try {
      const keys = Object.keys(localStorage)
      const itemsWithTimestamp: Array<{ key: string; timestamp: number }> = []

      keys.forEach(key => {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '{}')
          if (data._timestamp) {
            itemsWithTimestamp.push({
              key,
              timestamp: data._timestamp
            })
          }
        } catch {
          // 跳过无法解析的项
        }
      })

      // 按时间排序,删除最旧的20%
      itemsWithTimestamp.sort((a, b) => a.timestamp - b.timestamp)
      const toRemove = Math.ceil(itemsWithTimestamp.length * 0.2)

      for (let i = 0; i < toRemove; i++) {
        localStorage.removeItem(itemsWithTimestamp[i].key)
      }

      console.log(`已清理 ${toRemove} 个旧数据项`)
    } catch (error) {
      console.error('清理旧数据失败:', error)
    }
  }

  /**
   * 设置数据
   */
  setItem<T>(key: string, value: T): boolean {
    // 添加时间戳用于清理策略
    const dataWithMeta = {
      _timestamp: Date.now(),
      _version: '1.0',
      data: value
    }

    const serialized = JSON.stringify(dataWithMeta)

    // 使用内存降级
    if (this.useMemoryFallback) {
      this.memoryStorage.set(key, serialized)
      return true
    }

    try {
      localStorage.setItem(key, serialized)
      return true
    } catch (error) {
      const errorType = this.getErrorType(error)

      if (errorType === 'QUOTA_EXCEEDED') {
        console.warn('localStorage 容量已满,尝试清理旧数据')

        // 尝试清理后重试
        this.cleanupOldData()

        try {
          localStorage.setItem(key, serialized)
          return true
        } catch (retryError) {
          console.error('清理后仍无法保存,切换到内存存储')
          this.useMemoryFallback = true
          this.memoryStorage.set(key, serialized)

          if (this.options.onError) {
            this.options.onError(new Error('localStorage 容量已满且清理失败'))
          }

          return false
        }
      } else if (errorType === 'SECURITY_ERROR') {
        console.warn('localStorage 被安全策略阻止(可能是隐私模式),使用内存存储')
        this.useMemoryFallback = true
        this.memoryStorage.set(key, serialized)

        if (this.options.onError) {
          this.options.onError(new Error('localStorage 在隐私模式下不可用'))
        }

        return false
      } else {
        console.error('localStorage 写入失败:', error)

        if (this.options.onError) {
          this.options.onError(error as Error)
        }

        return false
      }
    }
  }

  /**
   * 获取数据
   */
  getItem<T>(key: string): T | null {
    try {
      const serialized = this.useMemoryFallback
        ? this.memoryStorage.get(key)
        : localStorage.getItem(key)

      if (!serialized) {
        return null
      }

      const parsed = JSON.parse(serialized)

      // 提取实际数据
      return parsed.data ?? parsed // 兼容旧格式
    } catch (error) {
      console.error(`读取 localStorage [${key}] 失败:`, error)

      if (this.options.onError) {
        this.options.onError(error as Error)
      }

      return null
    }
  }

  /**
   * 删除数据
   */
  removeItem(key: string): void {
    try {
      if (this.useMemoryFallback) {
        this.memoryStorage.delete(key)
      } else {
        localStorage.removeItem(key)
      }
    } catch (error) {
      console.error(`删除 localStorage [${key}] 失败:`, error)
    }
  }

  /**
   * 清空所有数据
   */
  clear(): void {
    try {
      if (this.useMemoryFallback) {
        this.memoryStorage.clear()
      } else {
        localStorage.clear()
      }
    } catch (error) {
      console.error('清空 localStorage 失败:', error)
    }
  }

  /**
   * 检查是否正在使用降级存储
   */
  isUsingFallback(): boolean {
    return this.useMemoryFallback
  }
}

// 导出单例
export const safeStorage = new SafeStorage({
  fallbackToMemory: true,
  onError: (error) => {
    // 可以上报到监控系统
    console.error('Storage Error:', error.message)
  }
})
```

### Rationale (理由)

1. **QuotaExceededError 处理**
   - 浏览器对 localStorage 通常限制 5-10MB
   - 不同浏览器的错误码不同:
     - Chrome/Safari: `error.code === 22`, `error.name === 'QuotaExceededError'`
     - Firefox: `error.code === 1014`, `error.name === 'NS_ERROR_DOM_QUOTA_REACHED'`
   - Safari 隐私模式下即使存储为空也会抛出此错误

2. **SecurityError 场景**
   - 隐私模式/无痕模式: Safari、Firefox、Chrome 都可能禁用 localStorage
   - 跨域 iframe: 第三方 Cookie 被阻止时
   - 浏览器安全设置: 用户手动禁用存储

3. **降级策略**
   - 优先使用 localStorage
   - 失败时自动切换到 Map(内存存储)
   - 内存存储的数据在页面刷新后丢失,但不影响用户当前会话

4. **数据清理策略**
   - 添加时间戳元数据
   - 容量超限时自动删除最旧的 20% 数据
   - 也可以按访问频率、数据优先级清理

### Alternatives (替代方案)

#### 方案A: 使用 IndexedDB 作为降级

```tsx
class StorageWithIndexDB {
  private db: IDBDatabase | null = null

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('AppStorage', 1)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve(this.db)
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains('data')) {
          db.createObjectStore('data', { keyPath: 'key' })
        }
      }
    })
  }

  async setItem(key: string, value: any): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['data'], 'readwrite')
      const store = transaction.objectStore('data')
      const request = store.put({ key, value, timestamp: Date.now() })

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  // getItem, removeItem 实现...
}
```

**优点**:
- 存储容量更大(通常 50MB+)
- 异步操作,不阻塞主线程
- 支持复杂数据类型(不需要序列化)

**缺点**:
- API 复杂,需要封装
- 异步操作,使用不如 localStorage 简单
- 不是所有浏览器都支持

#### 方案B: 使用 Taro.setStorage (小程序环境)

```tsx
import Taro from '@tarojs/taro'

const setItem = async (key: string, value: any): Promise<boolean> => {
  try {
    await Taro.setStorage({
      key,
      data: value
    })
    return true
  } catch (error) {
    console.error('Taro.setStorage 失败:', error)
    return false
  }
}

const getItem = async <T,>(key: string): Promise<T | null> => {
  try {
    const result = await Taro.getStorage({ key })
    return result.data as T
  } catch (error) {
    return null
  }
}
```

**优点**:
- 跨平台(H5、小程序统一API)
- 小程序环境容量更大(通常 10MB)
- Promise 风格,现代化

**缺点**:
- 异步操作
- 依赖 Taro 环境

### Code Example (实际使用)

```tsx
// src/store/cartStore.ts
import { safeStorage } from '@/utils/storage'

interface CartItem {
  id: string
  name: string
  quantity: number
  price: number
}

const CART_STORAGE_KEY = 'app_cart_items'

export const cartStore = {
  // 保存购物车到 localStorage
  saveCart(items: CartItem[]): boolean {
    const success = safeStorage.setItem(CART_STORAGE_KEY, items)

    if (!success) {
      console.warn('购物车数据保存失败,使用临时存储')
      // 可以显示提示给用户
    }

    return success
  },

  // 从 localStorage 加载购物车
  loadCart(): CartItem[] {
    const items = safeStorage.getItem<CartItem[]>(CART_STORAGE_KEY)
    return items || []
  },

  // 清空购物车
  clearCart(): void {
    safeStorage.removeItem(CART_STORAGE_KEY)
  },

  // 检查存储使用情况
  checkStorageHealth(): void {
    const usage = safeStorage.getStorageUsage()

    if (usage.percentage > 80) {
      console.warn(`localStorage 使用率: ${usage.percentage.toFixed(1)}%`)
      // 可以显示警告给用户
    }

    if (safeStorage.isUsingFallback()) {
      console.warn('当前使用内存存储,数据将在页面刷新后丢失')
      // 提示用户启用存储或使用非隐私模式
    }
  }
}
```

---

## 3. Taro小程序Dialog组件使用

### Decision (决策)

**推荐方案**: 使用 NutUI React Taro 的 `Dialog.confirm()` 实现确认对话框

```tsx
import { Dialog } from '@nutui/nutui-react-taro'

// 基础用法
const handleDelete = () => {
  Dialog.confirm({
    title: '确认删除',
    content: '删除后将无法恢复,确定要删除吗?',
    onConfirm: () => {
      // 用户点击"确定"
      console.log('执行删除操作')
      deleteItem()
    },
    onCancel: () => {
      // 用户点击"取消"
      console.log('取消删除')
    }
  })
}

// 异步确认(带 Loading)
const handleSubmit = () => {
  Dialog.confirm({
    title: '提交订单',
    content: '确认提交订单?',
    onConfirm: async () => {
      try {
        // 显示 loading
        Taro.showLoading({ title: '提交中...' })

        await submitOrder()

        Taro.hideLoading()
        Taro.showToast({ title: '提交成功', icon: 'success' })
      } catch (error) {
        Taro.hideLoading()
        Taro.showToast({ title: '提交失败', icon: 'error' })
      }
    }
  })
}
```

### Rationale (理由)

1. **Dialog API 对比**

| API | 用途 | 按钮 | 自定义程度 |
|-----|------|------|-----------|
| `Dialog.alert()` | 提示信息 | 仅"确定" | 低 |
| `Dialog.confirm()` | 确认操作 | "取消"+"确定" | 中 |
| `<Dialog visible={}>` | 复杂内容 | 完全自定义 | 高 |

2. **按钮文本自定义**

```tsx
Dialog.confirm({
  title: '提示',
  content: '确定要退出登录吗?',
  confirmText: '退出', // 自定义确定按钮
  cancelText: '再想想', // 自定义取消按钮
  onConfirm: () => logout()
})
```

3. **自定义样式**

```tsx
Dialog.confirm({
  title: '警告',
  content: '此操作不可撤销',
  className: 'custom-dialog',
  overlayClassName: 'custom-overlay',
  style: {
    width: '80%'
  }
})
```

### Alternatives (替代方案)

#### 方案A: 使用 Taro 原生 Modal API

```tsx
import Taro from '@tarojs/taro'

const handleDelete = () => {
  Taro.showModal({
    title: '确认删除',
    content: '删除后将无法恢复',
    confirmText: '确定',
    cancelText: '取消',
    confirmColor: '#FF6B35',
    success: (res) => {
      if (res.confirm) {
        // 用户点击确定
        deleteItem()
      } else if (res.cancel) {
        // 用户点击取消
        console.log('取消删除')
      }
    }
  })
}
```

**优点**:
- 原生API,性能好
- 跨平台一致性强
- 无额外依赖

**缺点**:
- 样式定制能力弱
- 只支持文本内容,不支持自定义组件
- 回调风格,不支持 Promise

#### 方案B: 受控 Dialog 组件(复杂场景)

```tsx
import { useState } from 'react'
import { Dialog, Input } from '@nutui/nutui-react-taro'

const MyComponent = () => {
  const [visible, setVisible] = useState(false)
  const [inputValue, setInputValue] = useState('')

  const handleConfirm = () => {
    console.log('输入的值:', inputValue)
    setVisible(false)
  }

  return (
    <>
      <Button onClick={() => setVisible(true)}>打开对话框</Button>

      <Dialog
        visible={visible}
        title="请输入备注"
        onConfirm={handleConfirm}
        onCancel={() => setVisible(false)}
      >
        <Input
          placeholder="请输入备注内容"
          value={inputValue}
          onChange={setInputValue}
        />
      </Dialog>
    </>
  )
}
```

**优点**:
- 完全控制 Dialog 状态
- 支持复杂的自定义内容
- 可以在 Dialog 内使用任何组件

**缺点**:
- 需要手动管理 `visible` 状态
- 代码量更多

### Code Example (完整示例)

```tsx
import React from 'react'
import { View, Button } from '@tarojs/components'
import { Dialog } from '@nutui/nutui-react-taro'
import Taro from '@tarojs/taro'

const CartPage: React.FC = () => {
  // 清空购物车
  const handleClearCart = () => {
    Dialog.confirm({
      title: '清空购物车',
      content: '确定要清空购物车吗?此操作不可撤销。',
      confirmText: '清空',
      cancelText: '取消',
      onConfirm: () => {
        // 清空购物车逻辑
        clearCart()
        Taro.showToast({
          title: '购物车已清空',
          icon: 'success'
        })
      },
      onCancel: () => {
        console.log('取消清空')
      }
    })
  }

  // 删除单个商品
  const handleDeleteItem = (itemId: string, itemName: string) => {
    Dialog.confirm({
      title: '删除商品',
      content: `确定要删除"${itemName}"吗?`,
      confirmText: '删除',
      cancelText: '取消',
      onConfirm: async () => {
        try {
          Taro.showLoading({ title: '删除中...' })

          await deleteCartItem(itemId)

          Taro.hideLoading()
          Taro.showToast({
            title: '删除成功',
            icon: 'success'
          })
        } catch (error) {
          Taro.hideLoading()
          Taro.showToast({
            title: '删除失败',
            icon: 'error'
          })
        }
      }
    })
  }

  // 结算确认
  const handleCheckout = (totalAmount: number) => {
    Dialog.confirm({
      title: '确认结算',
      content: `订单总额: ¥${totalAmount.toFixed(2)}\n确认提交订单?`,
      confirmText: '提交订单',
      cancelText: '再看看',
      onConfirm: async () => {
        try {
          Taro.showLoading({ title: '提交中...' })

          const orderId = await submitOrder()

          Taro.hideLoading()
          Taro.showToast({
            title: '订单提交成功',
            icon: 'success'
          })

          // 跳转到订单详情
          setTimeout(() => {
            Taro.navigateTo({
              url: `/pages/order/detail/index?orderId=${orderId}`
            })
          }, 1500)
        } catch (error) {
          Taro.hideLoading()
          Taro.showToast({
            title: '提交失败,请重试',
            icon: 'error'
          })
        }
      }
    })
  }

  return (
    <View className="cart-page">
      <Button onClick={handleClearCart}>清空购物车</Button>
      <Button onClick={() => handleCheckout(199.99)}>去结算</Button>
    </View>
  )
}

// 模拟 API 函数
const clearCart = async () => {
  return new Promise(resolve => setTimeout(resolve, 500))
}

const deleteCartItem = async (itemId: string) => {
  return new Promise(resolve => setTimeout(resolve, 500))
}

const submitOrder = async (): Promise<string> => {
  return new Promise(resolve => setTimeout(() => resolve('ORDER_123'), 1000))
}

export default CartPage
```

---

## 4. 自定义TabBar徽标实现

### Decision (决策)

**推荐方案**: 使用 React Context + 自定义 TabBar 组件实现徽标功能

```tsx
// src/contexts/TabBarContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react'

interface TabBarBadge {
  index: number
  count?: number // 数字徽标
  dot?: boolean  // 红点徽标
}

interface TabBarContextType {
  badges: Map<number, TabBarBadge>
  setBadge: (index: number, count?: number, dot?: boolean) => void
  clearBadge: (index: number) => void
}

const TabBarContext = createContext<TabBarContextType | undefined>(undefined)

export const TabBarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [badges, setBadges] = useState<Map<number, TabBarBadge>>(new Map())

  const setBadge = (index: number, count?: number, dot?: boolean) => {
    setBadges(prev => {
      const newBadges = new Map(prev)
      newBadges.set(index, { index, count, dot })
      return newBadges
    })
  }

  const clearBadge = (index: number) => {
    setBadges(prev => {
      const newBadges = new Map(prev)
      newBadges.delete(index)
      return newBadges
    })
  }

  return (
    <TabBarContext.Provider value={{ badges, setBadge, clearBadge }}>
      {children}
    </TabBarContext.Provider>
  )
}

export const useTabBar = () => {
  const context = useContext(TabBarContext)
  if (!context) {
    throw new Error('useTabBar must be used within TabBarProvider')
  }
  return context
}
```

```tsx
// src/custom-tab-bar/index.tsx
import React, { useEffect, useState } from 'react'
import { View, Image } from '@tarojs/components'
import { useTabBar } from '@/contexts/TabBarContext'
import Taro from '@tarojs/taro'
import { Home, Store, Cart, News, User } from '@nutui/icons-react-taro'
import './index.less'

const tabList = [
  { pagePath: '/pages/index/index', text: '首页', Icon: Home },
  { pagePath: '/pages/merchant/index', text: '商家', Icon: Store },
  { pagePath: '/pages/cart/index', text: '购物车', Icon: Cart },
  { pagePath: '/pages/news/index', text: '资讯', Icon: News },
  { pagePath: '/pages/mine/index', text: '我的', Icon: User }
]

const CustomTabBar: React.FC = () => {
  const [selected, setSelected] = useState(0)
  const { badges } = useTabBar()

  useEffect(() => {
    // 获取当前页面路径并设置选中状态
    const pages = Taro.getCurrentPages()
    const currentPage = pages[pages.length - 1]
    const currentPath = `/${currentPage.route}`

    const index = tabList.findIndex(item => item.pagePath === currentPath)
    if (index !== -1) {
      setSelected(index)
    }
  }, [])

  const switchTab = (index: number, url: string) => {
    setSelected(index)
    Taro.switchTab({ url })
  }

  return (
    <View className="custom-tab-bar">
      {tabList.map((item, index) => {
        const isSelected = selected === index
        const badge = badges.get(index)

        return (
          <View
            key={index}
            className="tab-item"
            onClick={() => switchTab(index, item.pagePath)}
          >
            {/* 图标容器 */}
            <View className="tab-icon-wrapper">
              <item.Icon
                size={24}
                color={isSelected ? '#FF6B35' : '#8a8a8a'}
              />

              {/* 徽标 */}
              {badge && (
                <View className="tab-badge">
                  {badge.dot ? (
                    <View className="badge-dot" />
                  ) : (
                    <View className="badge-count">
                      {badge.count! > 99 ? '99+' : badge.count}
                    </View>
                  )}
                </View>
              )}
            </View>

            {/* 文本 */}
            <View className={`tab-text ${isSelected ? 'selected' : ''}`}>
              {item.text}
            </View>
          </View>
        )
      })}
    </View>
  )
}

export default CustomTabBar
```

```less
// src/custom-tab-bar/index.less
.custom-tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  background-color: #ffffff;
  border-top: 1px solid #e5e5e5;
  padding-bottom: env(safe-area-inset-bottom); // 适配 iPhone X 底部
  z-index: 1000;

  .tab-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 10px 0;
    cursor: pointer;

    .tab-icon-wrapper {
      position: relative;

      .tab-badge {
        position: absolute;
        top: -8px;
        right: -12px;

        .badge-dot {
          width: 8px;
          height: 8px;
          background-color: #ff0000;
          border-radius: 50%;
          border: 2px solid #ffffff;
        }

        .badge-count {
          min-width: 18px;
          height: 18px;
          padding: 0 4px;
          background-color: #ff0000;
          color: #ffffff;
          font-size: 10px;
          font-weight: bold;
          text-align: center;
          line-height: 18px;
          border-radius: 9px;
          border: 2px solid #ffffff;
        }
      }
    }

    .tab-text {
      margin-top: 4px;
      font-size: 12px;
      color: #8a8a8a;

      &.selected {
        color: #FF6B35;
      }
    }
  }
}
```

### Rationale (理由)

1. **为什么使用 Context?**
   - Taro 的自定义 TabBar 是独立组件,每个 Tab 页面切换都会创建新实例
   - Context 提供全局状态,确保徽标在所有页面保持一致
   - 避免使用 Redux 等重量级状态管理库

2. **徽标类型**
   - **数字徽标**: 显示具体数量(如购物车商品数)
   - **红点徽标**: 仅显示有新内容(如资讯有更新)
   - 超过99显示 "99+"

3. **徽标位置**
   - 相对于图标定位:`position: absolute`
   - 右上角偏移:`top: -8px; right: -12px`
   - 白色边框与背景分离

4. **更新时机**
   - 购物车数量变化时立即更新
   - 页面 onShow 时检查并更新
   - 登录/登出时清空/恢复徽标

### Alternatives (替代方案)

#### 方案A: 使用 Taro.setTabBarBadge API(仅H5和部分小程序)

```tsx
import Taro from '@tarojs/taro'

// 设置徽标
Taro.setTabBarBadge({
  index: 2, // 购物车 Tab
  text: '5'
})

// 移除徽标
Taro.removeTabBarBadge({
  index: 2
})

// 显示红点
Taro.showTabBarRedDot({
  index: 3 // 资讯 Tab
})

// 隐藏红点
Taro.hideTabBarRedDot({
  index: 3
})
```

**优点**:
- API 简单,无需自定义 TabBar
- 原生支持,性能好

**缺点**:
- **不支持自定义 TabBar**(custom: true 时无效)
- 样式固定,无法自定义
- 本项目已使用自定义 TabBar,此方案不适用

#### 方案B: 使用 Redux 管理徽标状态

```tsx
// store/tabBarSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface BadgeState {
  badges: Record<number, { count?: number; dot?: boolean }>
}

const tabBarSlice = createSlice({
  name: 'tabBar',
  initialState: { badges: {} } as BadgeState,
  reducers: {
    setBadge(state, action: PayloadAction<{ index: number; count?: number; dot?: boolean }>) {
      state.badges[action.payload.index] = {
        count: action.payload.count,
        dot: action.payload.dot
      }
    },
    clearBadge(state, action: PayloadAction<number>) {
      delete state.badges[action.payload]
    }
  }
})

export const { setBadge, clearBadge } = tabBarSlice.actions
export default tabBarSlice.reducer
```

**优点**:
- Redux DevTools 调试
- 状态持久化(可配合 redux-persist)
- 适合大型项目

**缺点**:
- 引入 Redux 增加复杂度
- 对于徽标这种简单状态,Context 更轻量

### Code Example (实际使用)

```tsx
// src/app.tsx
import { TabBarProvider } from '@/contexts/TabBarContext'

const App: React.FC = ({ children }) => {
  return (
    <TabBarProvider>
      {children}
    </TabBarProvider>
  )
}

export default App
```

```tsx
// src/pages/cart/index.tsx - 购物车页面
import React, { useEffect } from 'react'
import { View } from '@tarojs/components'
import { useTabBar } from '@/contexts/TabBarContext'

const CartPage: React.FC = () => {
  const { setBadge, clearBadge } = useTabBar()
  const [cartItems, setCartItems] = useState([])

  useEffect(() => {
    // 页面显示时更新徽标
    const itemCount = cartItems.length

    if (itemCount > 0) {
      setBadge(2, itemCount) // index=2 是购物车 Tab
    } else {
      clearBadge(2)
    }
  }, [cartItems])

  const handleAddToCart = (item: any) => {
    setCartItems(prev => [...prev, item])
    // 徽标会自动更新(通过 useEffect)
  }

  const handleRemoveFromCart = (itemId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId))
  }

  return <View>购物车内容</View>
}

export default CartPage
```

```tsx
// src/pages/news/index.tsx - 资讯页面
import { useTabBar } from '@/contexts/TabBarContext'

const NewsPage: React.FC = () => {
  const { setBadge, clearBadge } = useTabBar()

  useEffect(() => {
    // 检查是否有未读资讯
    checkUnreadNews().then(hasUnread => {
      if (hasUnread) {
        setBadge(3, undefined, true) // 显示红点
      } else {
        clearBadge(3)
      }
    })
  }, [])

  const handleMarkAllRead = () => {
    clearBadge(3) // 清除红点
  }

  return <View>资讯列表</View>
}
```

---

## 5. Taro下拉刷新实现

### Decision (决策)

**推荐方案**: 在页面配置中启用下拉刷新,并实现 `onPullDownRefresh` 生命周期

```tsx
// src/pages/cart/index.config.ts
export default definePageConfig({
  navigationBarTitleText: '购物车',
  enablePullDownRefresh: true, // 启用下拉刷新
  backgroundTextStyle: 'dark', // 下拉loading样式: dark | light
  backgroundColor: '#f5f5f5' // 下拉背景色
})
```

```tsx
// src/pages/cart/index.tsx
import React, { useState, useEffect } from 'react'
import { View } from '@tarojs/components'
import Taro, { useDidShow, usePullDownRefresh } from '@tarojs/taro'

interface CartItem {
  id: string
  name: string
  quantity: number
}

const CartPage: React.FC = () => {
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)

  // 加载购物车数据
  const loadCartData = async () => {
    try {
      setLoading(true)

      const response = await fetch('/api/cart/list')
      const data = await response.json()

      setItems(data.items)
    } catch (error) {
      console.error('加载购物车失败:', error)
      Taro.showToast({
        title: '加载失败',
        icon: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  // 页面初始加载
  useDidShow(() => {
    loadCartData()
  })

  // 下拉刷新
  usePullDownRefresh(async () => {
    console.log('触发下拉刷新')

    try {
      await loadCartData()

      // 显示刷新成功提示
      Taro.showToast({
        title: '刷新成功',
        icon: 'success',
        duration: 1500
      })
    } catch (error) {
      console.error('刷新失败:', error)
    } finally {
      // 停止下拉刷新动画
      Taro.stopPullDownRefresh()
    }
  })

  return (
    <View className="cart-page">
      {loading && <View className="loading">加载中...</View>}

      {items.map(item => (
        <View key={item.id} className="cart-item">
          {item.name} x {item.quantity}
        </View>
      ))}

      {items.length === 0 && !loading && (
        <View className="empty">购物车是空的</View>
      )}
    </View>
  )
}

export default CartPage
```

### Rationale (理由)

1. **配置说明**
   - `enablePullDownRefresh: true` - 必须启用,否则 `usePullDownRefresh` 不会触发
   - `backgroundTextStyle` - 下拉时的 loading 样式(深色/浅色)
   - `backgroundColor` - 下拉区域的背景色

2. **usePullDownRefresh Hook**
   - Taro 3.x 推荐使用 Hook 代替类组件的 `onPullDownRefresh`
   - 自动注册和清理事件监听
   - 支持异步操作

3. **停止刷新动画**
   - **必须调用** `Taro.stopPullDownRefresh()`,否则动画不会停止
   - 在 `finally` 中调用,确保成功和失败都会停止
   - 延迟调用可以让用户看到刷新完成

4. **刷新时机**
   - 用户下拉触发
   - 可以主动调用 `Taro.startPullDownRefresh()` 触发
   - 通常在数据加载完成后调用 `stopPullDownRefresh()`

### Alternatives (替代方案)

#### 方案A: 使用类组件实现

```tsx
import React, { Component } from 'react'
import Taro from '@tarojs/taro'

class CartPage extends Component {
  state = {
    items: []
  }

  // 页面配置
  config = {
    navigationBarTitleText: '购物车',
    enablePullDownRefresh: true
  }

  componentDidShow() {
    this.loadCartData()
  }

  // 下拉刷新生命周期
  onPullDownRefresh() {
    console.log('触发下拉刷新')

    this.loadCartData().finally(() => {
      Taro.stopPullDownRefresh()
    })
  }

  async loadCartData() {
    try {
      const response = await fetch('/api/cart/list')
      const data = await response.json()

      this.setState({ items: data.items })

      Taro.showToast({ title: '刷新成功', icon: 'success' })
    } catch (error) {
      Taro.showToast({ title: '刷新失败', icon: 'error' })
    }
  }

  render() {
    return <View>{/* 页面内容 */}</View>
  }
}

export default CartPage
```

**优点**:
- 类组件生命周期清晰
- 适合熟悉类组件的开发者

**缺点**:
- Taro 3.x 推荐使用函数组件和 Hooks
- 代码量更多

#### 方案B: 使用 ScrollView 自定义下拉刷新

```tsx
import { ScrollView } from '@tarojs/components'

const CartPage: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = async () => {
    setRefreshing(true)

    try {
      await loadCartData()
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <ScrollView
      scrollY
      refresherEnabled // 启用自定义下拉刷新
      refresherTriggered={refreshing}
      onRefresherRefresh={handleRefresh}
    >
      {/* 页面内容 */}
    </ScrollView>
  )
}
```

**优点**:
- 更灵活的控制
- 可以自定义刷新UI

**缺点**:
- 需要 ScrollView 包裹整个页面
- 部分小程序平台不支持

#### 方案C: 手动触发刷新(不依赖下拉)

```tsx
import { Button } from '@nutui/nutui-react-taro'

const CartPage: React.FC = () => {
  const handleManualRefresh = async () => {
    // 显示 Loading
    Taro.showLoading({ title: '刷新中...' })

    try {
      await loadCartData()

      Taro.hideLoading()
      Taro.showToast({ title: '刷新成功', icon: 'success' })
    } catch (error) {
      Taro.hideLoading()
      Taro.showToast({ title: '刷新失败', icon: 'error' })
    }
  }

  return (
    <View>
      <Button onClick={handleManualRefresh}>刷新</Button>
      {/* 页面内容 */}
    </View>
  )
}
```

**优点**:
- 不需要配置下拉刷新
- 适合不支持下拉的场景

**缺点**:
- 用户体验不如下拉刷新自然
- 需要额外的按钮占用空间

### Code Example (完整示例)

```tsx
// src/pages/cart/index.config.ts
export default definePageConfig({
  navigationBarTitleText: '购物车',
  enablePullDownRefresh: true,
  backgroundTextStyle: 'dark',
  backgroundColor: '#f5f5f5'
})
```

```tsx
// src/pages/cart/index.tsx
import React, { useState } from 'react'
import { View, Text } from '@tarojs/components'
import Taro, { useDidShow, usePullDownRefresh } from '@tarojs/taro'
import { Button } from '@nutui/nutui-react-taro'
import { useTabBar } from '@/contexts/TabBarContext'
import './index.less'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  imageUrl: string
}

const CartPage: React.FC = () => {
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)
  const [totalAmount, setTotalAmount] = useState(0)
  const { setBadge, clearBadge } = useTabBar()

  // 加载购物车数据
  const loadCartData = async () => {
    try {
      setLoading(true)

      // 模拟 API 调用
      await new Promise(resolve => setTimeout(resolve, 1000))

      const response = await fetch('/api/cart/list')
      const data = await response.json()

      setItems(data.items)

      // 计算总金额
      const total = data.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      )
      setTotalAmount(total)

      // 更新 TabBar 徽标
      if (data.items.length > 0) {
        setBadge(2, data.items.length) // index=2 是购物车
      } else {
        clearBadge(2)
      }

      return data.items
    } catch (error) {
      console.error('加载购物车失败:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // 页面显示时加载数据
  useDidShow(() => {
    loadCartData()
  })

  // 下拉刷新
  usePullDownRefresh(async () => {
    console.log('用户触发下拉刷新')

    try {
      const items = await loadCartData()

      // 短暂延迟让用户看到刷新完成
      await new Promise(resolve => setTimeout(resolve, 500))

      Taro.showToast({
        title: items.length > 0 ? '刷新成功' : '购物车为空',
        icon: items.length > 0 ? 'success' : 'none',
        duration: 1500
      })
    } catch (error) {
      console.error('刷新失败:', error)
      Taro.showToast({
        title: '刷新失败,请重试',
        icon: 'error',
        duration: 2000
      })
    } finally {
      // 停止下拉刷新动画
      Taro.stopPullDownRefresh()
    }
  })

  // 手动刷新(备用方案)
  const handleManualRefresh = async () => {
    // 主动触发下拉刷新
    Taro.startPullDownRefresh()
  }

  return (
    <View className="cart-page">
      {/* 顶部工具栏 */}
      <View className="toolbar">
        <Text>购物车 ({items.length})</Text>
        <Button size="small" onClick={handleManualRefresh}>
          刷新
        </Button>
      </View>

      {/* Loading 状态 */}
      {loading && (
        <View className="loading-overlay">
          <Text>加载中...</Text>
        </View>
      )}

      {/* 商品列表 */}
      {!loading && items.length > 0 && (
        <View className="cart-items">
          {items.map(item => (
            <View key={item.id} className="cart-item">
              <Text>{item.name}</Text>
              <Text>¥{item.price} x {item.quantity}</Text>
            </View>
          ))}
        </View>
      )}

      {/* 空状态 */}
      {!loading && items.length === 0 && (
        <View className="empty-state">
          <Text>购物车是空的</Text>
          <Text>快去添加商品吧~</Text>
        </View>
      )}

      {/* 底部结算栏 */}
      {items.length > 0 && (
        <View className="checkout-bar">
          <View>
            <Text>总计: ¥{totalAmount.toFixed(2)}</Text>
          </View>
          <Button type="primary">去结算</Button>
        </View>
      )}
    </View>
  )
}

export default CartPage
```

```less
// src/pages/cart/index.less
.cart-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 120px; // 为底部结算栏留空间

  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    background-color: #ffffff;
  }

  .loading-overlay {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 999;
  }

  .cart-items {
    padding: 16px;

    .cart-item {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 12px;
    }
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding-top: 100px;
    color: #999;
  }

  .checkout-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    background-color: #ffffff;
    border-top: 1px solid #e5e5e5;
    padding-bottom: calc(16px + env(safe-area-inset-bottom));
  }
}
```

---

## 总结

本研究文档涵盖了购物车页面优化的5个关键技术点:

1. **React防抖**: 使用 `useMemo` + `lodash.debounce`,延迟300ms,适合按钮点击场景
2. **localStorage错误处理**: 完整处理 QuotaExceededError、SecurityError,实现内存降级和自动清理
3. **Dialog组件**: 使用 `Dialog.confirm()` 实现确认对话框,支持异步操作
4. **TabBar徽标**: 使用 React Context 实现全局徽标状态管理,支持数字和红点两种类型
5. **下拉刷新**: 配置 `enablePullDownRefresh` + `usePullDownRefresh` Hook 实现

所有方案都提供了完整的代码示例、理由说明和替代方案,可直接应用到项目中。

---

**文档生成时间**: 2025-01-XX
**研究人员**: Claude Code
**项目**: 粮仓Mix 小程序
