/**
 * React Hooks 工具函数
 *
 * 提供常用的自定义 Hooks
 */

import { useRef, useEffect, useCallback, DependencyList } from 'react'

/**
 * 防抖Hook
 *
 * @param fn - 要防抖的函数
 * @param delay - 延迟时间(毫秒)
 * @param deps - 依赖项数组
 * @returns 防抖后的函数
 */
export function useDebounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number,
  deps: DependencyList = []
): T {
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  const debouncedFn = useCallback((...args: Parameters<T>) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    timerRef.current = setTimeout(() => {
      fn(...args)
    }, delay)
  }, [fn, delay, ...deps]) as T

  return debouncedFn
}

/**
 * 节流Hook
 *
 * @param fn - 要节流的函数
 * @param delay - 延迟时间(毫秒)
 * @param deps - 依赖项数组
 * @returns 节流后的函数
 */
export function useThrottle<T extends (...args: any[]) => any>(
  fn: T,
  delay: number,
  deps: DependencyList = []
): T {
  const lastRunRef = useRef<number>(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  const throttledFn = useCallback((...args: Parameters<T>) => {
    const now = Date.now()

    if (now - lastRunRef.current >= delay) {
      lastRunRef.current = now
      fn(...args)
    } else {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }

      timerRef.current = setTimeout(() => {
        lastRunRef.current = Date.now()
        fn(...args)
      }, delay - (now - lastRunRef.current))
    }
  }, [fn, delay, ...deps]) as T

  return throttledFn
}
