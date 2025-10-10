export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/merchant/index',
    'pages/cart/index',
    'pages/news/index',
    'pages/news/detail',
    'pages/mine/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTitleText: '粮仓Mix',
    navigationBarTextStyle: 'black'
  },
  tabBar: {
    custom: true,
    color: '#8a8a8a',
    selectedColor: '#FF6B35',
    backgroundColor: '#ffffff',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '首页'
      },
      {
        pagePath: 'pages/merchant/index',
        text: '商家'
      },
      {
        pagePath: 'pages/cart/index',
        text: '购物车'
      },
      {
        pagePath: 'pages/news/index',
        text: '资讯'
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的'
      }
    ]
  }
})
