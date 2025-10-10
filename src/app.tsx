import React from 'react'
import { RegionProvider } from './contexts/RegionContext'
import { CartProvider } from './contexts/CartContext'
import '@nutui/icons-react-taro/dist/style_icon.css'
import './app.less'

function App(props) {
  return (
    <RegionProvider>
      <CartProvider>
        {props.children}
      </CartProvider>
    </RegionProvider>
  )
}

export default App
