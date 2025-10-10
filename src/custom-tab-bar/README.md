# Custom TabBar 使用 NutUI 图标

## 已完成配置

### 1. 安装依赖
- ✅ `@nutui/icons-react-taro` 已安装

### 2. 创建组件
- ✅ `src/custom-tab-bar/index.tsx` - 自定义 TabBar 组件
- ✅ `src/custom-tab-bar/index.less` - TabBar 样式

### 3. 配置 TabBar
- ✅ `src/app.config.ts` 中设置 `custom: true`

## 使用的图标

| Tab | 图标名称 | 说明 |
|-----|----------|------|
| 首页 | Home | 房子图标 |
| 商家 | Shop | 商店图标 |
| 购物车 | Cart2 | 购物车图标 |
| 资讯 | Notice | 通知/资讯图标 |
| 我的 | My | 个人中心图标 |

## 特性

- 🎨 **品牌色**：选中态使用 #FF6B35 橙色
- 📱 **适配安全区**：自动适配 iPhone X 及以上设备底部安全区
- ✨ **交互反馈**：点击有缩放动画
- 🔄 **状态同步**：自动识别当前页面并高亮对应 Tab

## 重新构建

运行以下命令重新构建项目：

```bash
npm run build:weapp -- --watch
```

## 可选：在各个页面中同步状态（推荐）

为了确保状态完全同步，可以在各个 tab 页面的 `useEffect` 中添加：

```tsx
import Taro from '@tarojs/taro';

useEffect(() => {
  // 获取自定义 tabBar 实例并更新状态
  if (typeof Taro.getTabBar === 'function') {
    const tabBar = Taro.getTabBar();
    if (tabBar) {
      tabBar.setSelected(0); // 对应的索引：首页=0, 商家=1, 购物车=2, 资讯=3, 我的=4
    }
  }
}, []);
```

## 更换图标

如需更换其他图标，修改 `src/custom-tab-bar/index.tsx` 中的图标导入：

```tsx
import {
  Home,      // 首页
  Shop,      // 商家
  Cart2,     // 购物车
  Notice,    // 资讯
  My         // 我的
} from '@nutui/icons-react-taro';
```

可用的图标请参考：https://nutui.jd.com/h5/react/3x/#/zh-CN/component/Icon
