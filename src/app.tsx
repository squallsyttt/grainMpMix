import React, { useEffect } from 'react'
import { RegionProvider } from './contexts/RegionContext'
import { CartProvider } from './contexts/CartContext'
import { UserProvider } from './contexts/UserContext'
import { initNotification } from './utils/notification'
import '@nutui/icons-react-taro/dist/style_icon.css'
import './app.less'

function App(props) {
  /**
   * 初始化通知管理器
   */
  useEffect(() => {
    initNotification().catch(error => {
      console.error('[App] 通知管理器初始化失败:', error)
    })
  }, [])

  return (
    <RegionProvider>
      <UserProvider>
        <CartProvider>
          {props.children}
        </CartProvider>
      </UserProvider>
    </RegionProvider>
  )
}

export default App
