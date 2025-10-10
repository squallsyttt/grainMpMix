import React from 'react'
import { RegionProvider } from './contexts/RegionContext'
import './app.less'

function App(props) {
  return (
    <RegionProvider>
      {props.children}
    </RegionProvider>
  )
}

export default App
