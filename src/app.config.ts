export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/merchant/index',
    'pages/cart/index',
    'pages/news/index',
    'pages/news/detail',
    'pages/mine/index',
    'pages/product/detail/index',
    // 核销券相关页面
    'pages/voucher/list/index',
    'pages/voucher/detail/index',
    // 订单相关页面
    'pages/order/list/index',
    'pages/order/detail/index',
    // 商家扫码核销页面
    'pages/merchant-scan/index'
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
