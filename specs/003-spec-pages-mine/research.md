# Research: 核销券个人中心主页技术调研

**Feature**: 核销券个人中心主页设计
**Branch**: `003-spec-pages-mine`
**Created**: 2025-10-13

## 调研目标

为个人中心页面(pages/mine/index)的实现确定最佳技术方案,解决以下关键问题:
1. 用户登录状态管理最佳实践
2. 核销券和订单数据统计的高效实现方式
3. 页面性能优化策略(骨架屏、懒加载)
4. 下拉刷新和数据同步机制
5. 未登录用户的友好引导设计

## 技术决策

### 1. 用户状态管理

**决策**: 使用 React Context API + localStorage 组合方案

**理由**:
- React Context 适合跨组件共享用户登录状态(头像、昵称、会员等级)
- localStorage 实现用户信息持久化,刷新页面后保持登录状态
- 项目已有 RegionContext 实现先例,团队熟悉这种模式
- 相比 Redux 等状态管理库,Context API 更轻量,适合小程序环境

**考虑的替代方案**:
- ❌ Redux: 过于重量级,增加包体积,小程序环境不推荐
- ❌ MobX: 引入新的依赖和学习成本,与项目现有模式不一致
- ❌ 仅使用 localStorage: 无法实现组件间实时状态同步

**实施方案**:
```typescript
// src/contexts/UserContext.tsx
interface UserInfo {
  id: number
  avatar: string
  nickname: string
  memberLevel: string
}

const UserContext = React.createContext<{
  userInfo: UserInfo | null
  isLoggedIn: boolean
  login: (userInfo: UserInfo) => void
  logout: () => void
}>()
```

---

### 2. 数据统计API设计

**决策**: 后端提供独立的统计API,前端不做本地聚合计算

**理由**:
- 核销券和订单数据量可能很大(100+条),前端全量加载再统计效率低
- 后端数据库查询统计更高效(SQL聚合函数)
- 减少前端网络流量和内存占用
- 统计数据实时性要求不高(5-10秒延迟可接受)

**考虑的替代方案**:
- ❌ 前端全量加载后统计: 网络流量大,首屏加载慢
- ❌ 分页加载后累加统计: 需要多次请求,逻辑复杂,容易出错

**API设计**:
```
GET /api/user/voucher_stats
Response: {
  pending: 5,      // 待核销数量
  used: 12,        // 已核销数量
  expired: 3,      // 已过期数量
  expiring_soon: 2 // 即将过期数量(7天内)
}

GET /api/user/order_stats
Response: {
  total: 20,       // 总订单数
  pending: 2,      // 待支付数量
  verified: 15     // 已核销数量
}
```

---

### 3. 骨架屏加载策略

**决策**: 使用NutUI的Skeleton组件实现骨架屏

**理由**:
- NutUI已提供完整的Skeleton组件,支持自定义形状和动画
- 项目已在核销券列表页使用过,团队熟悉
- 骨架屏能显著提升用户感知性能(避免白屏)
- 符合项目宪法的UI组件标准

**考虑的替代方案**:
- ❌ 自定义CSS骨架屏: 重复造轮子,维护成本高
- ❌ 显示Loading动画: 用户体验不如骨架屏

**实施方案**:
```tsx
import { Skeleton } from '@nutui/nutui-react-taro'

// 用户信息骨架屏
<Skeleton width="60px" height="60px" animated round />
<Skeleton width="100px" height="20px" animated />

// 核销券统计骨架屏
<Skeleton width="100%" height="100px" animated />
```

---

### 4. 下拉刷新机制

**决策**: 使用Taro的`usePullDownRefresh`钩子实现下拉刷新

**理由**:
- Taro提供的官方钩子,与小程序原生下拉刷新体验一致
- 自动处理下拉动画和状态管理
- 项目已在核销券列表页使用过,有成功先例
- 支持跨平台(微信、支付宝小程序)

**考虑的替代方案**:
- ❌ 手动实现下拉刷新: 开发成本高,用户体验可能不一致
- ❌ 只提供手动刷新按钮: 用户体验不如下拉刷新自然

**实施方案**:
```typescript
usePullDownRefresh(() => {
  loadUserInfo()
  loadVoucherStats()
  loadOrderStats()
  Taro.stopPullDownRefresh()
})
```

---

### 5. 未登录用户引导

**决策**: 显示简化的占位界面,提供"立即登录"按钮

**理由**:
- 未登录时无法加载用户数据,显示空白或错误不友好
- 占位界面引导用户登录,提升转化率
- 可以预览个人中心的功能布局,吸引用户注册

**考虑的替代方案**:
- ❌ 直接跳转登录页: 过于强制,用户体验差
- ❌ 显示错误提示: 负面情绪,不利于转化

**UI设计**:
- 显示默认头像占位
- 显示"点击登录"文案
- 显示功能模块占位(核销券、订单等,但数据显示为"--")
- 提供明显的"立即登录"按钮

---

### 6. 图片懒加载

**决策**: 使用Taro的Image组件内置懒加载功能

**理由**:
- Taro的Image组件默认支持懒加载(lazyLoad属性)
- 小程序环境下懒加载由平台实现,性能更好
- 减少首屏加载的网络流量

**实施方案**:
```tsx
import { Image } from '@tarojs/components'

<Image
  src={userInfo.avatar}
  lazyLoad
  mode="aspectFill"
/>
```

---

### 7. 组件拆分策略

**决策**: 按功能模块拆分为3个可复用组件

**理由**:
- 单一职责原则,每个组件负责一个功能模块
- 提高代码可维护性和可测试性
- 支持组件级别的React.memo优化
- 便于后续在其他页面复用

**组件划分**:

| 组件 | 职责 | 复用场景 |
|------|------|---------|
| `UserInfoCard` | 用户信息展示(头像、昵称、会员) | 个人中心、设置页 |
| `VoucherStatsCard` | 核销券统计卡片(3个状态) | 个人中心、核销券列表页顶部 |
| `FunctionListItem` | 功能列表项(图标+文字+箭头) | 个人中心、设置页 |

---

### 8. 性能优化策略

**决策**: 组合使用React.memo、useCallback、骨架屏

**理由**:
- React.memo避免子组件不必要的重渲染
- useCallback缓存事件处理函数,减少子组件更新
- 骨架屏提升感知性能
- 图片懒加载减少首屏加载时间

**实施细节**:
```typescript
// 组件级优化
const UserInfoCard = React.memo<UserInfoCardProps>(({ userInfo }) => {
  // ...
})

// 事件处理优化
const handleVoucherStatsClick = useCallback((status: string) => {
  Taro.navigateTo({
    url: `/pages/voucher/list/index?status=${status}`
  })
}, [])
```

---

### 9. Mock数据开发模式

**决策**: MVP阶段使用Mock数据,后续无缝切换到真实API

**理由**:
- 前后端并行开发,不阻塞前端进度
- Mock数据便于测试各种边界情况(空数据、大量数据、错误状态)
- 项目已有Mock数据实现先例(核销券、订单)
- 通过环境变量或配置切换Mock/真实API

**实施方案**:
```typescript
// src/data/mock/user.ts
export const mockUserInfo: UserInfo = {
  id: 1,
  avatar: 'https://example.com/avatar.jpg',
  nickname: '张三',
  memberLevel: 'VIP1'
}

export const mockVoucherStats = {
  pending: 5,
  used: 12,
  expired: 3,
  expiring_soon: 2
}

// src/services/user.ts
export async function getUserInfo(): Promise<UserInfo> {
  if (process.env.USE_MOCK) {
    return Promise.resolve(mockUserInfo)
  }
  const response = await get('/api/user/info')
  return response.data
}
```

---

### 10. 错误处理策略

**决策**: 分层错误处理(网络层 + 业务层 + UI层)

**理由**:
- 网络层统一处理HTTP错误和超时(request.ts已实现)
- 业务层处理API错误码和业务异常
- UI层显示用户友好的错误提示和重试选项

**实施方案**:
```typescript
try {
  const userInfo = await getUserInfo()
  setUserInfo(userInfo)
} catch (error) {
  console.error('[MinePage] 加载用户信息失败:', error)
  Taro.showToast({
    title: '加载失败,请下拉刷新重试',
    icon: 'none',
    duration: 2000
  })
  // 显示错误占位界面
  setLoadError(true)
}
```

---

## 技术风险评估

| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| 后端API延期 | 前端无法联调测试 | 使用Mock数据并行开发,定义明确的API合约 |
| 用户头像图片加载慢 | 首屏加载体验差 | 使用懒加载+默认占位图+CDN加速 |
| 统计数据不准确 | 用户困惑,影响信任 | 后端添加数据一致性校验,前端刷新同步 |
| 下拉刷新频繁触发 | 服务器压力大 | 添加防抖/节流,限制刷新频率(最少间隔5秒) |

---

## 待确认的技术问题

无。所有技术决策已明确,基于现有项目实现和行业最佳实践。

---

## 参考资料

1. **Taro文档**: https://taro-docs.jd.com/docs/
   - usePullDownRefresh钩子
   - Image组件懒加载
2. **NutUI文档**: https://nutui.jd.com/h5/react/
   - Skeleton骨架屏组件
   - Card卡片组件
3. **React性能优化**: https://react.dev/reference/react/memo
   - React.memo使用指南
   - useCallback最佳实践
4. **项目现有实现**:
   - `src/pages/voucher/list/index.tsx` - 下拉刷新实现
   - `src/contexts/RegionContext.tsx` - Context实现模式
   - `src/services/request.ts` - HTTP请求封装
