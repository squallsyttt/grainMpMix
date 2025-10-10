# HorizontalAd 横幅广告位组件

## 功能说明

在首页的轮播Banner和产品分类之间添加的横幅广告位组件，支持接口控制显示/隐藏。

## 组件位置

- **文件路径**: `src/components/HorizontalAd/`
- **使用位置**: `src/pages/index/index.tsx` (Banner 和 ProductCategories 之间)

## Props 参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| visible | boolean | true | 控制广告位是否显示 |
| imageUrl | string | - | 广告图片URL |
| title | string | '新用户专享福利' | 广告标题 |
| subtitle | string | '立即领取优惠券，最高减100元' | 广告副标题 |
| linkUrl | string | '' | 点击跳转链接 |
| backgroundColor | string | 'linear-gradient(...)' | 背景色/渐变色 |

## 使用示例

### 1. 基础使用

```tsx
<HorizontalAd
  visible={true}
  title="限时优惠"
  subtitle="全场商品8折起"
/>
```

### 2. 从接口获取配置

```tsx
const [adConfig, setAdConfig] = useState({
  visible: true,
  imageUrl: 'https://example.com/ad.png',
  title: '新用户专享福利',
  subtitle: '立即领取优惠券，最高减100元',
  linkUrl: '/pages/promotion/index',
  backgroundColor: 'linear-gradient(135deg, #FFA45B 0%, #FF6B35 100%)'
});

useEffect(() => {
  // 从接口获取广告位配置
  fetchAdConfig().then(config => {
    setAdConfig(config);
  });
}, []);

<HorizontalAd {...adConfig} />
```

### 3. 控制显示/隐藏

```tsx
// 通过接口返回的 visible 字段控制
<HorizontalAd visible={adConfig.visible} />

// 不显示时组件返回 null，不占用DOM空间
```

## 接口数据格式示例

```json
{
  "code": 200,
  "data": {
    "visible": true,
    "imageUrl": "https://cdn.example.com/ad/banner.png",
    "title": "双十一狂欢节",
    "subtitle": "全场5折起，满300减50",
    "linkUrl": "/pages/activity/double11",
    "backgroundColor": "linear-gradient(135deg, #FF6B6B 0%, #FF5252 100%)"
  }
}
```

## 设计特点

1. **精美设计**
   - 渐变色背景
   - 装饰性光晕效果
   - 毛玻璃质感按钮
   - 阴影和高光增强立体感

2. **交互反馈**
   - 点击缩放动画
   - 箭头滑动效果
   - 按钮点击反馈

3. **响应式适配**
   - 支持小屏设备（320px以下）
   - 图片和文字自适应调整

4. **用户体验**
   - 无内容时不显示（visible=false返回null）
   - 点击有提示（无链接时显示"敬请期待"）
   - 支持页面跳转

## 后续优化建议

1. **接口对接**
   - 创建 `src/services/ad.ts` 封装广告位接口
   - 添加接口错误处理
   - 添加加载状态

2. **数据缓存**
   - 使用 Taro.setStorageSync 缓存配置
   - 减少接口调用频率

3. **埋点统计**
   - 添加广告位曝光埋点
   - 添加点击转化统计

4. **A/B测试**
   - 支持多个广告位轮换
   - 记录不同样式的转化率

## 文件结构

```
src/components/HorizontalAd/
├── index.tsx      # 组件逻辑
└── index.less     # 组件样式
```
