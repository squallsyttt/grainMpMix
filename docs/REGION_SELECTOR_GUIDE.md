# 地区选择功能使用指南

## 📊 为什么自己实现而不用 NutUI 组件？

### 技术原因
1. **版本差异**：项目使用 `@nutui/nutui-react-taro`（React 版本）
   - NutUI React 版本的 Cascader 功能有限
   - 完整的省市区级联选择只在 Vue 版本（nutui-uniapp）中提供
   - Picker 组件只支持单列选择，不适合省市两级联动

2. **自定义需求**：
   - 需要省份→城市的两级联动交互
   - 需要返回按钮和选中高亮效果
   - 样式需要与项目主题完全统一

3. **实现方案**：
   - 使用 NutUI 的 **Popup** 组件作为基础（遵循 NutUI 设计规范）
   - 自己实现两级选择逻辑
   - 样式完全可控，与项目橙色主题统一

---

## 🏗️ 架构设计：全局共享方案

### 方案对比

| 方案 | 优点 | 缺点 | 推荐度 |
|------|------|------|--------|
| **每页面独立加组件** | 简单直接 | 代码重复、状态不同步、维护成本高 | ❌ 不推荐 |
| **全局共享组件** | 代码复用、状态统一、性能好 | 需要状态管理 | ✅ **强烈推荐** |

### 当前架构（全局共享）

```
📦 架构设计
├── src/app.tsx                     # 全局注入 RegionSelector
├── src/contexts/RegionContext.tsx  # 地区状态管理（React Context）
├── src/data/regions.ts             # 省市数据（31个省级行政区）
├── src/components/
│   ├── RegionSelector/             # 地区选择弹窗（全局唯一实例）
│   │   ├── index.tsx
│   │   └── index.less
│   └── RegionBar/                  # 地区按钮组件（多页面复用）
│       ├── index.tsx
│       └── index.less
└── src/pages/
    ├── index/      # 使用 RegionBar
    ├── merchant/   # 使用 RegionBar  
    └── news/       # 使用 RegionBar（已接入）
```

### 优势

1. ✅ **组件复用**：三个页面共享同一个 RegionSelector 实例
2. ✅ **状态统一**：选一次，所有页面的地区都同步更新
3. ✅ **代码精简**：每个页面只需引入 `<RegionBar />`
4. ✅ **性能优化**：只渲染一个弹窗组件，减少内存占用
5. ✅ **维护便捷**：修改一处，所有页面生效

---

## 🚀 如何在其他页面使用？

### 步骤 1：导入组件

```tsx
import RegionBar from '../../components/RegionBar';
```

### 步骤 2：在页面中使用

```tsx
function MyPage() {
  return (
    <View className='my-page'>
      {/* 添加地区选择按钮 */}
      <RegionBar />
      
      {/* 其他页面内容 */}
      <View>...</View>
    </View>
  );
}
```

### 步骤 3：获取选中的地区（可选）

如果需要在页面中使用当前选中的地区，可以使用 `useRegion` Hook：

```tsx
import { useRegion } from '../../contexts/RegionContext';

function MyPage() {
  const { province, city } = useRegion();
  
  console.log('当前选中：', province, city);
  
  return (
    <View className='my-page'>
      <RegionBar />
      <Text>当前地区：{city || province}</Text>
    </View>
  );
}
```

---

## 🎯 核心 API

### RegionContext

全局地区状态管理，提供以下 API：

| API | 类型 | 说明 |
|-----|------|------|
| `province` | `string` | 当前选中的省份名称 |
| `city` | `string` | 当前选中的城市名称 |
| `showSelector` | `boolean` | 选择器是否显示（内部使用） |
| `setRegion(province, city)` | `function` | 设置地区并保存到本地存储 |
| `openSelector()` | `function` | 打开选择器 |
| `closeSelector()` | `function` | 关闭选择器 |

### useRegion Hook

```tsx
const { province, city, openSelector } = useRegion();
```

---

## 📝 数据持久化

地区选择会自动保存到微信本地存储：

- 存储键名：`selectedProvince`、`selectedCity`
- 自动恢复：下次打开小程序自动加载上次选择
- 跨页面同步：所有页面的地区状态实时同步

---

## 🎨 样式定制

RegionBar 组件样式位于 `src/components/RegionBar/index.less`，可以根据项目需求修改：

```less
.region-bar {
  background: linear-gradient(135deg, #ffffff 0%, #fefefe 100%);
  // 可以调整背景、边距等
}

.region-selector-btn {
  // 按钮样式
  background: linear-gradient(135deg, rgba(255, 107, 53, 0.08) 0%, rgba(255, 136, 86, 0.08) 100%);
  // 可以调整颜色、圆角、阴影等
}
```

---

## 🔧 扩展建议

### 1. 根据地区筛选内容

```tsx
function NewsList() {
  const { province, city } = useRegion();
  
  // 根据地区过滤文章
  const filteredArticles = articles.filter(article => 
    article.region === province || article.region === city
  );
  
  return <View>{/* 渲染过滤后的文章 */}</View>;
}
```

### 2. 添加"全国"选项

在 `RegionContext` 中添加重置方法：

```tsx
const resetRegion = () => setRegion('全国', '');
```

### 3. 自动定位

可以集成微信小程序的定位 API，自动选择当前所在地：

```tsx
Taro.getLocation({
  type: 'gcj02',
  success: (res) => {
    // 使用逆地理编码获取省市信息
    // 然后调用 setRegion(province, city)
  }
});
```

---

## ✅ 测试清单

在微信开发者工具中测试：

- [ ] 点击地区按钮，弹窗是否从右侧滑入
- [ ] 选择省份后，是否正确显示城市列表
- [ ] 城市列表的返回按钮是否正常
- [ ] 选中项是否高亮显示
- [ ] 关闭弹窗后，按钮文字是否更新
- [ ] 切换到其他页面，地区是否保持
- [ ] 重启小程序，地区是否保持
- [ ] 在其他页面（如首页、商家）添加 RegionBar，是否正常工作

---

## 📊 性能指标

- **组件实例**：全局唯一，减少内存占用
- **数据大小**：省市数据约 10KB，按需加载
- **渲染性能**：列表项使用虚拟化（未来可优化）
- **存储占用**：仅保存省市名称，约 100 字节

---

## 🎯 后续应用场景

1. **粮食价格行情**：展示不同地区的大米价格（如：新疆大米贵，安徽大米便宜）
2. **地方政策资讯**：推送当地的农业政策和补贴信息
3. **区域市场动态**：显示本地的粮食交易行情
4. **本地商家展示**：根据地区筛选附近的粮食商家
5. **物流配送**：根据地区计算运费和配送时效
