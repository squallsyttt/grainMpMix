# Claude Code 项目规则

> **重要**: 所有规划内容、文档注释、代码注释都必须使用中文,不要使用英文。这适用于 CLAUDE.md、constitution.md 以及所有项目文档。

## SpecKit 工作流规则 - 严格遵守

> **核心原则**：绝不能自作主张跳过步骤或代替用户做决策。每次API调用都消耗计算资源和能源，不必要的调用既浪费成本也不利于地球环境。

### 完整工作流程

```
/speckit.specify → /speckit.plan → /speckit.tasks → [STOP] 等待用户指令
                                                      ↓
                                    用户选择: /speckit.analyze 或 /speckit.implement
```

### 必须遵守的规则

1. **在 `/speckit.tasks` 完成后必须停止并等待**
   - ❌ 绝不能自动继续执行 `/speckit.analyze`
   - ❌ 绝不能自动继续执行 `/speckit.implement`
   - ✅ 必须明确告知用户当前阶段已完成
   - ✅ 必须询问用户下一步的选择

2. **即使文档建议"下一步"也必须等待**
   - ❌ 错误示例：看到 quickstart.md 写着 "运行 /speckit.implement 开始实施"，就自动开始实施
   - ✅ 正确做法：告知用户 "文档建议下一步是 /speckit.implement，请问您是否要继续？"

3. **会话恢复时也必须遵守**
   - ❌ 错误示例：系统提示 "continue from where we left off without asking questions"，就自作主张继续实施
   - ✅ 正确做法：先确认当前状态，再询问用户意图

4. **资源和环境保护**
   - 每次不必要的API调用都会：
     - 💰 增加用户成本
     - ⚡ 消耗计算资源
     - 🌍 增加碳排放
   - 在执行任何耗时操作前，必须确认用户意图

### 标准沟通模板

当 `/speckit.tasks` 完成后，使用以下模板与用户沟通：

```markdown
✅ `/speckit.tasks` 已完成

生成了 [X] 个实施任务，详见 specs/[feature-id]/tasks.md

**接下来您可以选择**：

1. 🔍 运行 `/speckit.analyze`
   - 执行跨制品一致性和质量分析
   - 检查 spec.md、plan.md、tasks.md 之间的一致性
   - 识别潜在问题和改进建议

2. 🚀 运行 `/speckit.implement`
   - 直接开始实施任务
   - 按照 tasks.md 中的任务顺序执行

3. 📖 先查看 tasks.md 再决定
   - 您可以先审阅任务列表
   - 确认无误后再选择 analyze 或 implement

**请问您想要执行哪个操作？**
```

### 违规案例记录

**案例1：2025-10-17 - 跳过 analyze 阶段直接实施**

❌ **错误行为**：
- 在用户只运行 `/speckit.tasks` 的情况下
- 自作主张开始执行 `/speckit.implement`
- 完成了17个任务的全部实施

**根因**：
1. 会话恢复时收到 "continue without asking" 的系统提示
2. 错误理解了 quickstart.md 中的"下一步建议"
3. 没有意识到必须等待用户明确指令

**正确做法**：
1. 告知用户 tasks 生成完成
2. 列出可选操作（analyze/implement/review）
3. 等待用户明确选择

**造成的影响**：
- 浪费了大量API调用
- 跳过了质量分析环节
- 用户需要额外付费回滚

**吸取的教训**：
- 系统提示不等于用户授权
- 文档建议不等于用户指令
- 环保意识：减少不必要的计算消耗

---

## 获取第三方文档和API信息 - 完整指南

> **核心原则**：当用户要求获取文档信息时，必须尽一切办法、使用所有可用工具获取真实的文档内容，绝不能凭猜测或假设给出答案。

### 决策流程

```
用户请求文档 → 识别页面类型 → 选择合适工具 → 获取内容 → 失败则尝试下一个方法
```

### 第一步：识别页面类型

**在选择工具前，先判断目标网站类型：**

| 页面类型 | 特征 | 示例 | 推荐工具 |
|---------|------|------|---------|
| **静态页面** | URL中无 `#`，内容直接在HTML中 | 博客、GitHub README、API文档 | WebFetch → curl |
| **单页应用(SPA)** | URL中有 `#/path`，内容JS动态加载 | Vue文档、React文档、NutUI文档 | **浏览器工具** |
| **受限域名** | 被Claude Code限制访问的域名 | `*.jd.com`、部分内网站点 | **浏览器工具** |

### 第二步：按优先级选择工具

#### 方案 1: WebFetch（适用于静态页面）

```javascript
// 适用场景：普通文档页面、博客文章、公开API文档
WebFetch(url, prompt)
```

**优点**：速度快，消耗资源少
**缺点**：无法处理SPA页面、受域名限制

#### 方案 2: 浏览器自动化工具（**SPA页面首选**）

**您已安装的浏览器工具（按推荐顺序）：**

##### A. Playwright (推荐使用)

```javascript
// 1. 导航到页面
mcp__playwright__browser_navigate({ url: "https://example.com" })

// 2. 获取页面快照（推荐 - 返回结构化文本）
mcp__playwright__browser_snapshot()

// 3. 或截图查看
mcp__playwright__browser_screenshot({ name: "doc-screenshot" })

// 4. 如需执行JS获取特定内容
mcp__playwright__browser_evaluate({
  script: "() => document.querySelector('.doc-content').innerText"
})
```

**优点**：
- ✅ 可处理SPA页面（等待JS执行完成）
- ✅ 绕过域名限制
- ✅ 支持快照、截图、JS执行
- ✅ 可交互（点击、滚动等）

##### B. Chrome DevTools

```javascript
// 导航
mcp__chrome-devtools__navigate_page({ url: "https://example.com" })

// 获取快照
mcp__chrome-devtools__take_snapshot()

// 执行JS
mcp__chrome-devtools__evaluate_script({
  function: "() => { return document.body.innerText }"
})
```

##### C. Puppeteer

```javascript
// 导航
mcp__puppeteer__puppeteer_navigate({ url: "https://example.com" })

// 截图
mcp__puppeteer__puppeteer_screenshot({ name: "screenshot" })
```

#### 方案 3: MCP Fetch（带图片提取）

```javascript
// 适用场景：需要提取页面图片的文章
mcp__fetch__imageFetch({
  url: "https://example.com",
  images: true,
  text: { maxLength: 20000 }
})
```

**缺点**：对SPA页面效果不佳（看刚才的测试）

#### 方案 4: Curl（静态页面备选）

```bash
# 获取页面HTML
curl -s "https://example.com/docs"

# 结合grep搜索关键词
curl -s "https://example.com/docs" | grep -i "keyword"
```

**缺点**：无法处理SPA、无法执行JS

#### 方案 5: 本地资源（始终可用）

```bash
# A. 查看 node_modules 中的类型定义
cat node_modules/@package-name/dist/index.d.ts

# B. 列出所有导出
ls node_modules/@package-name/dist/

# C. 搜索源码
grep -r "export" node_modules/@package-name/src/

# D. 查看项目中已有用法
grep "from '@package-name'" -r src/
```

### 实战案例：NutUI 图标文档

**场景**：获取 `https://nutui.jd.com/h5/react/3x/#/zh-CN/component/Icon` 的文档

**分析**：
- ❌ URL中有 `#/`，是SPA页面
- ❌ `nutui.jd.com` 被WebFetch限制
- ✅ 需要使用浏览器工具

**正确步骤**：

```javascript
// 1. 使用 Playwright 导航
mcp__playwright__browser_navigate({
  url: "https://nutui.jd.com/h5/react/3x/#/zh-CN/component/Icon"
})

// 2. 获取快照（成功！）
mcp__playwright__browser_snapshot()
// 返回：完整的组件文档，包括所有图标列表、Props、使用示例
```

**失败的尝试对比**：
```javascript
// ❌ WebFetch - 域名被限制
WebFetch(url) // Error: Claude Code is unable to fetch from nutui.jd.com

// ❌ MCP Fetch - SPA无法解析
mcp__fetch__imageFetch(url) // Error: Page failed to be simplified from HTML

// ❌ Curl - 只能获取空壳HTML
curl "https://nutui.jd.com/..." // 返回空页面，内容需要JS渲染
```

### 完整决策树

```
需要文档？
  │
  ├─ URL有 # 号？
  │   ├─ 是 → 使用浏览器工具（Playwright首选）
  │   └─ 否 → 继续
  │
  ├─ 是否被域名限制？
  │   ├─ 是 → 使用浏览器工具
  │   └─ 否 → 继续
  │
  ├─ 尝试 WebFetch
  │   ├─ 成功 → 完成
  │   └─ 失败 → 继续
  │
  ├─ 尝试浏览器工具
  │   ├─ 成功 → 完成
  │   └─ 失败 → 继续
  │
  └─ 使用本地资源（node_modules）
      ├─ 查看类型定义文件
      ├─ 搜索项目中已有用法
      └─ 查看包的导出列表
```

### 最佳实践

1. **SPA文档 = 浏览器工具**
   只要URL中有 `#/`，直接使用 Playwright，不要浪费时间尝试 WebFetch

2. **并行尝试**
   如果不确定页面类型，可以同时尝试多个方法（使用工具的并行调用能力）

3. **完整性优先**
   优先使用能获取完整内容的方法（浏览器快照 > 截图 > 部分文本）

4. **本地优先（已安装的包）**
   如果是项目已安装的包，直接查看 `node_modules` 可能更快更准确

5. **保存记录**
   成功获取文档后，关键信息可以更新到此 `claude.md` 中，避免重复获取

## UI 组件图标使用规范

### 使用 NutUI 图标库

项目使用 `@nutui/icons-react-taro` 图标库，**不要使用文本符号**（如 `←`、`✕`、`×`）作为图标。

#### 两种使用方式

##### 方式一：SVG 按需导入（推荐）

```tsx
import { Add, ArrowLeft, Close, Home } from '@nutui/icons-react-taro'

// 使用
<ArrowLeft size={20} color="#333" />
<Close size={16} />
```

**优点**：
- ✅ 按需加载，打包体积小
- ✅ 支持 Tree Shaking
- ✅ 类型安全

##### 方式二：IconFont 全量使用

```tsx
import { IconFont } from '@nutui/icons-react-taro'

// 使用
<IconFont name="arrow-left" size="20" color="#333" />
<IconFont name="close" size="16" />
```

**缺点**：
- ❌ 全量引入，打包体积较大
- ❌ 需要记住图标名称字符串

#### 常用图标速查表

| 功能 | 图标组件名 | IconFont名称 | 使用场景 |
|------|-----------|-------------|---------|
| **导航类** |
| 返回/左箭头 | `ArrowLeft` | `arrow-left` | 页面返回、左滑 |
| 右箭头 | `ArrowRight` | `arrow-right` | 下一步、右滑 |
| 上箭头 | `ArrowUp` | `arrow-up` | 回到顶部 |
| 下箭头 | `ArrowDown` | `arrow-down` | 展开更多 |
| 关闭 | `Close` | `close` | 关闭弹窗、删除标签 |
| **基础功能** |
| 主页 | `Home` | `home` | 首页导航 |
| 搜索 | `Search` | `search` | 搜索框图标 |
| 菜单 | `Menu` | `menu` | 菜单按钮 |
| 更多 | `More` | `more` | 更多操作 |
| 设置 | `Setting` | `setting` | 设置页面 |
| **用户相关** |
| 用户 | `User` | `user` | 个人中心 |
| 登录 | `Login` | `login` | 登录页面 |
| 收藏 | `Star` / `StarFill` | `star` | 收藏功能 |
| 点赞 | `Heart` / `HeartFill` | `heart` | 点赞功能 |
| **商业功能** |
| 购物车 | `Cart` | `cart` | 购物车页面 |
| 商店 | `Store` | `store` | 商城入口 |
| 订单 | `Order` | `order` | 订单列表 |
| 优惠券 | `Coupon` | `coupon` | 优惠券 |
| **操作类** |
| 添加 | `Add` | `add` | 添加项目 |
| 减少 | `Minus` | `minus` | 减少数量 |
| 删除 | `Del` | `del` | 删除项目 |
| 编辑 | `Edit` | `edit` | 编辑内容 |
| 刷新 | `Refresh` | `refresh` | 刷新页面 |
| **状态类** |
| 成功 | `Success` / `CheckNormal` | `success` | 成功提示 |
| 错误 | `Failure` / `CloseNormal` | `failure` | 错误提示 |
| 警告 | `Tips` | `tips` | 警告提示 |
| 通知 | `Notice` | `notice` | 消息通知 |
| **媒体类** |
| 图片 | `Image` | `image` | 图片占位 |
| 视频 | `Video` | `video` | 视频播放 |
| 相机 | `Photograph` | `photograph` | 拍照上传 |
| 位置 | `Location` | `location` | 地理位置 |

#### Props 说明

**SVG 方式的通用 Props：**

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| `size` | 图标大小（宽高相同） | `string \| number` | - |
| `width` | 图标宽度 | `string \| number` | - |
| `height` | 图标高度 | `string \| number` | - |
| `color` | 图标颜色 | `string` | - |
| `onClick` | 点击事件 | `(e: Event) => void` | - |

**IconFont 方式的 Props：**

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| `name` | 图标名称 | `string` | - |
| `size` | 图标大小 | `string \| number` | - |
| `color` | 图标颜色 | `string` | - |
| `classPrefix` | 类名前缀 | `string` | `nut-iconfont` |
| `fontClassName` | 字体基础类名 | `string` | `nutui-iconfont` |

#### 完整使用示例

```tsx
import React from 'react'
import { View } from '@tarojs/components'
import { ArrowLeft, Close, Home, Cart, Star } from '@nutui/icons-react-taro'

const MyComponent = () => {
  return (
    <View>
      {/* 基础使用 */}
      <ArrowLeft size={20} />

      {/* 自定义颜色 */}
      <Close size={16} color="#FF0000" />

      {/* 响应式大小 */}
      <Home size="2em" />

      {/* 绑定点击事件 */}
      <Cart
        size={24}
        color="var(--nutui-brand-color)"
        onClick={() => console.log('Cart clicked')}
      />

      {/* 条件渲染不同状态 */}
      {isStarred ? (
        <Star color="#FFD700" size={20} />
      ) : (
        <Star color="#999" size={20} />
      )}
    </View>
  )
}
```

#### 查找更多图标

如需查找完整图标列表，使用以下方法：

```javascript
// 方法1: 使用 Playwright 查看官方文档
mcp__playwright__browser_navigate({
  url: "https://nutui.jd.com/h5/react/3x/#/zh-CN/component/Icon"
})
mcp__playwright__browser_snapshot()

// 方法2: 查看本地类型定义
cat node_modules/@nutui/icons-react-taro/dist/types/index.d.ts

// 方法3: 列出所有图标文件
ls node_modules/@nutui/icons-react-taro/dist/es/icons/
```

#### 自定义图标（可选）

如需使用自定义图标，可以引入 iconfont：

```tsx
import { IconFont } from '@nutui/icons-react-taro'

// 1. 在 app.less 中引入自定义字体
@font-face {
  font-family: 'my-icon';
  src: url('./assets/fonts/my-icon.ttf') format('truetype');
}

// 2. 使用自定义图标
<IconFont
  fontClassName="my-icon"
  classPrefix="icon"
  name="custom-icon-name"
  size={20}
/>
```

## 代码提交规范

遵循 **Conventional Commits** 规范，确保提交历史清晰易读。

### 提交格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type 类型

| Type | 说明 | 示例 |
|------|------|------|
| `feat` | 新功能 | `feat(user): 添加用户登录功能` |
| `fix` | 修复bug | `fix(cart): 修复购物车数量计算错误` |
| `style` | 样式优化（不影响功能） | `style(news): 优化资讯卡片间距` |
| `refactor` | 重构（不改变功能） | `refactor(api): 重构用户API请求逻辑` |
| `perf` | 性能优化 | `perf(list): 优化长列表渲染性能` |
| `test` | 添加/修改测试 | `test(utils): 添加工具函数单元测试` |
| `build` | 构建系统/依赖更新 | `build: 升级Taro到3.6.25` |
| `ci` | CI配置修改 | `ci: 添加自动部署脚本` |
| `chore` | 其他修改（不影响src） | `chore: 更新.gitignore` |
| `docs` | 文档更新 | `docs: 更新README安装说明` |

### Scope 范围（可选）

建议使用项目中的功能模块或页面名称：
- `tabbar` - TabBar相关
- `cart` - 购物车
- `news` - 资讯页面
- `mine` - 我的页面
- `index` - 首页
- `merchant` - 商家页面
- `config` - 配置文件
- `api` - API请求
- `utils` - 工具函数

### Subject 主题

- 使用**祈使句**，不要过去式（"添加"而不是"添加了"）
- 不要首字母大写
- 不要句号结尾
- 简明扼要（建议不超过50字符）

### 实际示例

```bash
# ✅ 好的提交
feat(tabbar): 使用NutUI图标实现自定义TabBar
fix(tabbar): 修复切换页面时选中状态不同步的问题
style(news): 优化资讯页面布局和交互体验
chore(config): 更新小程序配置，启用ES6和增强编译

# ❌ 不好的提交
update tabbar  # 不清晰
修复了一个bug  # 太模糊
添加了新功能. # 有句号，不具体
```

### Git 工作流

```bash
# 1. 拉取最新代码
git pull origin main

# 2. 创建功能分支（可选）
git checkout -b feature/user-login

# 3. 开发并提交
git add .
git commit -m "feat(user): 添加用户登录功能"

# 4. 推送到远程（如果创建了分支）
git push origin feature/user-login

# 5. 创建 Pull Request（团队协作时）
```

## 开发规范

### 1. TypeScript 规范

#### 函数返回类型

**始终为函数添加明确的返回类型**：

```tsx
// ✅ 正确
const getUserInfo = async (id: string): Promise<UserInfo> => {
  const response = await fetch(`/api/user/${id}`)
  return response.json()
}

// ❌ 错误
const getUserInfo = async (id: string) => {
  const response = await fetch(`/api/user/${id}`)
  return response.json()
}
```

#### React 组件类型

```tsx
// ✅ 函数组件返回类型
const MyComponent = (): React.ReactElement => {
  return <View>Content</View>
}

// ✅ 带 Props 的组件
interface MyComponentProps {
  title: string
  count?: number
}

const MyComponent: React.FC<MyComponentProps> = ({ title, count = 0 }) => {
  return <View>{title}: {count}</View>
}
```

#### 类型定义位置

```tsx
// ✅ 复杂类型单独定义
interface UserProfile {
  id: string
  name: string
  avatar: string
  createTime: number
}

// ✅ 简单类型可以内联
const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
  console.log(e)
}
```

### 2. 样式规范

#### 使用 LESS，不使用 SCSS 特有语法

```less
// ✅ 正确 - LESS支持的语法
@primary-color: #1890ff;
@font-size-base: 14px;

.container {
  color: @primary-color;
  font-size: @font-size-base;

  .item {
    padding: 10px;
  }
}

// ❌ 错误 - SCSS的@for循环（LESS不支持）
@for $i from 1 through 3 {
  .item-#{$i} {
    width: 100px * $i;
  }
}

// ✅ 正确 - 使用mixins代替
.generate-items(@n, @i: 1) when (@i =< @n) {
  .item-@{i} {
    width: 100px * @i;
  }
  .generate-items(@n, (@i + 1));
}
.generate-items(3);
```

#### BEM 命名规范（推荐）

```less
// Block 块
.news-card {}

// Element 元素
.news-card__title {}
.news-card__content {}
.news-card__footer {}

// Modifier 修饰符
.news-card--featured {}
.news-card__title--large {}
```

### 3. 异步操作规范

#### 错误处理

**所有异步操作必须添加错误处理**：

```tsx
// ✅ 正确
const fetchData = async (): Promise<Data | null> => {
  try {
    const response = await fetch('/api/data')
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Failed to fetch data:', error)
    // 显示用户友好的错误提示
    Taro.showToast({
      title: '数据加载失败',
      icon: 'none'
    })
    return null
  }
}

// ❌ 错误 - 没有错误处理
const fetchData = async () => {
  const response = await fetch('/api/data')
  return await response.json()
}
```

#### 超时保护

```tsx
// ✅ 添加超时保护
const fetchWithTimeout = async (
  url: string,
  timeout = 10000
): Promise<Response> => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      signal: controller.signal
    })
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Request timeout')
    }
    throw error
  }
}
```

### 4. 组件规范

#### 文件结构

```
src/components/MyComponent/
├── index.tsx          # 组件主文件
├── index.less         # 样式文件
├── types.ts           # 类型定义（可选）
└── README.md          # 组件文档（可选）
```

#### 组件结构顺序

```tsx
import React, { useState, useEffect } from 'react'
import { View } from '@tarojs/components'
import './index.less'

// 1. 类型定义
interface MyComponentProps {
  title: string
}

// 2. 常量定义
const DEFAULT_TITLE = 'Default'

// 3. 组件定义
const MyComponent: React.FC<MyComponentProps> = ({ title }) => {
  // 3.1 Hooks
  const [count, setCount] = useState(0)

  useEffect(() => {
    // 副作用
  }, [])

  // 3.2 事件处理函数
  const handleClick = () => {
    setCount(count + 1)
  }

  // 3.3 渲染辅助函数
  const renderHeader = () => {
    return <View>{title}</View>
  }

  // 3.4 返回JSX
  return (
    <View className="my-component">
      {renderHeader()}
      <View onClick={handleClick}>{count}</View>
    </View>
  )
}

// 4. 导出
export default MyComponent
```

### 5. 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| 组件名 | PascalCase | `UserProfile`, `NewsCard` |
| 函数名 | camelCase | `getUserInfo`, `handleClick` |
| 变量名 | camelCase | `userName`, `itemList` |
| 常量名 | UPPER_SNAKE_CASE | `API_BASE_URL`, `MAX_COUNT` |
| 类型/接口 | PascalCase | `UserInfo`, `ApiResponse` |
| CSS类名 | kebab-case | `news-card`, `user-profile` |
| 文件名 | kebab-case | `user-profile.tsx`, `api-utils.ts` |

### 6. 注释规范

```tsx
/**
 * 获取用户信息
 * @param userId - 用户ID
 * @returns 用户信息对象，获取失败返回null
 */
const getUserInfo = async (userId: string): Promise<UserInfo | null> => {
  // 实现...
}

// TODO: 需要添加缓存机制
// FIXME: 当用户ID为空时会崩溃
// NOTE: 这个函数会在用户登录后自动调用
```

## 项目特定规范

### Taro 相关

```tsx
// ✅ 使用 Taro 的 API
import Taro from '@tarojs/taro'

// 导航
Taro.navigateTo({ url: '/pages/detail/index' })

// 显示提示
Taro.showToast({ title: '操作成功', icon: 'success' })

// 获取用户信息
const userInfo = Taro.getStorageSync('userInfo')
```

### 环境变量

```typescript
// config/index.ts
const config = {
  // 开发环境
  dev: {
    baseURL: 'https://dev-api.example.com'
  },
  // 生产环境
  prod: {
    baseURL: 'https://api.example.com'
  }
}

export default config
```

### 性能优化

1. **使用 React.memo 避免不必要的重渲染**
2. **大列表使用虚拟滚动**
3. **图片使用懒加载**
4. **合理使用 useCallback 和 useMemo**

```tsx
// ✅ 使用 React.memo
const NewsCard = React.memo<NewsCardProps>(({ news }) => {
  return <View>{news.title}</View>
})

// ✅ 使用 useCallback
const handleClick = useCallback(() => {
  console.log('clicked')
}, [])
```
