# Spec Kit 开发规划指南

## 项目概述

**项目名称**: 粮仓Mix (Grain Mp Mix)
**项目类型**: Taro + React + NutUI 小程序
**开发方式**: Spec-Driven Development (规范驱动开发)
**AI 工具**: Claude Code + Spec Kit

---

## 什么是 Spec Kit？

Spec Kit 是 GitHub 推出的规范驱动开发工具包，让规范成为工程流程的中心，而不是写完就放在一边的文档。它与 AI 编码助手（Claude Code、GitHub Copilot、Gemini CLI）深度集成，通过四阶段工作流驱动开发。

### 核心优势

✅ **AI 友好**: 专为 AI 编码助手设计，规范可被 AI 直接理解和执行
✅ **规范驱动**: 规范不仅是文档，更是实施、检查清单和任务拆解的依据
✅ **企业级**: 可将安全策略、合规规则、设计系统约束、集成需求统一管理
✅ **结构化流程**: 通过 `/specify` → `/plan` → `/tasks` → `/implement` 四阶段确保开发质量

---

## 安装 Spec Kit

### 方式一：使用 uvx 初始化（推荐）

```bash
# 初始化 Spec Kit
uvx --from git+https://github.com/github/spec-kit.git specify init grain-mp-mix

# 这将在项目中创建 .claude/ 目录和相关配置
```

### 方式二：手动设置

如果没有安装 `uvx`，可以手动创建 Spec Kit 结构：

```bash
# 创建 Spec Kit 目录
mkdir -p .claude/commands
mkdir -p .claude/specs

# 下载 Spec Kit 命令文件
curl -o .claude/commands/specify.md https://raw.githubusercontent.com/github/spec-kit/main/commands/specify.md
curl -o .claude/commands/plan.md https://raw.githubusercontent.com/github/spec-kit/main/commands/plan.md
curl -o .claude/commands/tasks.md https://raw.githubusercontent.com/github/spec-kit/main/commands/tasks.md
curl -o .claude/commands/implement.md https://raw.githubusercontent.com/github/spec-kit/main/commands/implement.md
```

---

## Spec Kit 四阶段工作流

### 阶段 1: `/specify` - 编写功能规范

**目的**: 详细描述要构建的功能，包括需求、约束、设计系统规则等

**使用场景**:
- 开发新功能前
- 重构现有模块
- 添加新页面或组件

**示例规范模板**:

```markdown
# 功能规范: 商品详情页

## 功能描述
用户可以查看商品的详细信息，包括价格、库存、规格、图片、描述等，并可以加入购物车或立即购买。

## 用户故事
- 作为用户，我想查看商品的详细信息，以便决定是否购买
- 作为用户，我想查看商品的评价，以便了解其他人的购买体验
- 作为用户，我想选择商品规格（如颜色、尺寸），以便购买符合需求的商品

## 技术约束
- 必须使用 Taro + React + TypeScript
- UI 组件必须使用 @nutui/nutui-react-taro
- 图标必须使用 @nutui/icons-react-taro（不使用文本符号）
- 样式使用 LESS（不使用 SCSS 特有语法）
- 遵循 BEM 命名规范

## 设计规范
- 页面布局参考首页风格
- 主色调: #FF6B35
- 按钮圆角: 8px
- 间距使用 8px 倍数（8, 16, 24, 32）

## API 接口
- GET /api/product/{id} - 获取商品详情
- POST /api/cart/add - 添加到购物车

## 性能要求
- 首屏加载时间 < 2s
- 图片使用懒加载
- 大列表使用虚拟滚动

## 验收标准
- [ ] 页面加载显示骨架屏
- [ ] 成功展示商品信息
- [ ] 可以选择规格
- [ ] 可以加入购物车
- [ ] 显示库存状态
- [ ] 错误处理完善
```

**命令**:
```bash
# 在 Claude Code 中使用
/specify 商品详情页功能
```

### 阶段 2: `/plan` - 制定实施计划

**目的**: 基于规范创建详细的实施计划，包括架构设计、文件结构、技术选型等

**输出内容**:
- 文件结构设计
- 组件拆分方案
- 数据流设计
- API 调用策略
- 错误处理方案
- 测试策略

**示例计划**:

```markdown
# 实施计划: 商品详情页

## 文件结构
src/pages/product/
├── detail/
│   ├── index.tsx              # 主页面组件
│   ├── index.config.ts        # 页面配置
│   ├── index.less             # 页面样式
│   └── types.ts               # 类型定义

src/components/
├── ProductImageGallery/       # 商品图片轮播
├── ProductInfo/               # 商品基本信息
├── SpecSelector/              # 规格选择器
├── ProductActions/            # 操作按钮（加购物车、购买）
└── ProductReviews/            # 商品评价列表

## 组件设计

### ProductDetail (主页面)
- 负责数据获取和状态管理
- 协调子组件
- 处理路由参数

### ProductImageGallery
- Props: images[], currentIndex
- 功能: 图片轮播、预览、缩放

### SpecSelector
- Props: specs[], onSelect
- 功能: 规格选择、库存校验

## 状态管理
使用 React Hooks (useState, useEffect)

```typescript
interface ProductState {
  product: ProductInfo | null
  loading: boolean
  selectedSpecs: Record<string, string>
  quantity: number
  error: string | null
}
```

## API 调用
- 使用 Taro.request 封装
- 添加超时控制（10s）
- 错误处理和重试机制

## 样式方案
- 使用 LESS 模块化
- BEM 命名: product-detail__title
- 响应式布局

## 性能优化
- 图片懒加载: NutUI Image 组件
- 防抖处理: 规格选择、数量修改
- 缓存: 使用 Taro.setStorageSync 缓存商品信息
```

**命令**:
```bash
/plan 商品详情页
```

### 阶段 3: `/tasks` - 拆解任务清单

**目的**: 将计划拆解为具体的、可执行的任务列表

**任务粒度**: 每个任务应该是 1-2 小时可完成的独立工作

**示例任务清单**:

```markdown
# 任务清单: 商品详情页

## 准备工作
- [ ] 创建页面和组件目录结构
- [ ] 定义 TypeScript 类型
- [ ] 添加路由配置

## 组件开发
- [ ] 实现 ProductImageGallery 组件
- [ ] 实现 ProductInfo 组件
- [ ] 实现 SpecSelector 组件
- [ ] 实现 ProductActions 组件
- [ ] 实现 ProductReviews 组件

## 主页面开发
- [ ] 实现数据获取逻辑
- [ ] 实现加载状态处理
- [ ] 实现错误处理
- [ ] 组装子组件

## 交互功能
- [ ] 实现规格选择逻辑
- [ ] 实现数量增减
- [ ] 实现加入购物车
- [ ] 实现立即购买

## 样式开发
- [ ] 编写页面样式
- [ ] 编写组件样式
- [ ] 适配不同屏幕尺寸
- [ ] 添加过渡动画

## 测试与优化
- [ ] 功能测试
- [ ] 性能优化
- [ ] 代码审查
- [ ] 提交代码

## 文档
- [ ] 编写组件文档
- [ ] 更新项目文档
```

**命令**:
```bash
/tasks 商品详情页
```

### 阶段 4: `/implement` - 执行实施

**目的**: 按照任务清单逐个实施，AI 助手会根据规范和计划生成代码

**工作流程**:
1. 选择一个任务
2. 使用 `/implement` 命令
3. AI 生成代码
4. 代码审查
5. 测试验证
6. 标记任务完成
7. 继续下一个任务

**命令**:
```bash
# 实施特定任务
/implement 实现 ProductImageGallery 组件

# 或者让 AI 按顺序实施所有任务
/implement --all
```

---

## 项目现状分析

### 已完成的页面
- ✅ 首页 (index)
- ✅ 商家页 (merchant)
- ✅ 购物车 (cart)
- ✅ 资讯页 (news)
- ✅ 资讯详情 (news/detail)
- ✅ 我的页面 (mine)

### 已完成的组件
- ✅ ArticleCardSkeleton - 文章卡片骨架屏
- ✅ HomeBanner - 首页轮播图
- ✅ HorizontalAd - 横向广告
- ✅ ProductCategories - 商品分类
- ✅ RegionBar - 地区栏
- ✅ RegionSelector - 地区选择器

### 技术栈
- **框架**: Taro 3.6.24
- **UI**: React 18 + @nutui/nutui-react-taro 2.3.10
- **图标**: @nutui/icons-react-taro 3.0.2
- **语言**: TypeScript 5.9.3
- **样式**: LESS
- **构建**: Webpack 5

---

## 使用 Spec Kit 的完整示例

### 场景: 开发商品详情页

#### 步骤 1: 编写规范
```bash
# 在 Claude Code 中
/specify

# 或者手动创建规范文件
touch .claude/specs/product-detail.md
```

然后编写详细规范（参考上面的规范模板）

#### 步骤 2: 制定计划
```bash
/plan

# AI 会读取规范，生成实施计划
# 计划会保存到 .claude/plans/product-detail.md
```

#### 步骤 3: 生成任务
```bash
/tasks

# AI 会将计划拆解为任务清单
# 任务会保存到 .claude/tasks/product-detail.md
```

#### 步骤 4: 开始实施
```bash
# 方式 1: 逐个实施
/implement 创建页面目录结构
/implement 定义 TypeScript 类型
/implement 实现 ProductImageGallery 组件
# ...

# 方式 2: 自动实施所有任务
/implement --all
```

---

## 推荐的开发工作流

### 新功能开发

```
1. 需求讨论
   ↓
2. /specify 编写规范
   ↓
3. /plan 制定计划
   ↓
4. /tasks 拆解任务
   ↓
5. /implement 逐步实施
   ↓
6. 测试验证
   ↓
7. 代码审查
   ↓
8. 提交代码（遵循 Conventional Commits）
```

### Bug 修复

```
1. 复现问题
   ↓
2. 定位代码
   ↓
3. /specify 编写修复规范（可选）
   ↓
4. 直接修复或使用 /implement
   ↓
5. 测试验证
   ↓
6. 提交代码
```

### 重构

```
1. 识别重构目标
   ↓
2. /specify 编写重构规范
   ↓
3. /plan 制定重构计划
   ↓
4. /tasks 拆解任务
   ↓
5. /implement 执行重构
   ↓
6. 功能回归测试
   ↓
7. 性能对比
   ↓
8. 提交代码
```

---

## 待开发功能建议

基于现有页面结构，以下是使用 Spec Kit 可以开发的功能：

### 高优先级

1. **商品详情页**
   - 商品图片展示
   - 规格选择
   - 加入购物车
   - 立即购买

2. **订单系统**
   - 订单列表
   - 订单详情
   - 订单状态跟踪
   - 订单评价

3. **用户系统**
   - 登录/注册
   - 个人信息编辑
   - 收货地址管理
   - 实名认证

4. **支付系统**
   - 订单支付
   - 支付方式选择
   - 支付结果页

### 中优先级

5. **搜索功能**
   - 商品搜索
   - 搜索历史
   - 热门搜索
   - 搜索结果页

6. **收藏功能**
   - 商品收藏
   - 商家收藏
   - 收藏列表

7. **优惠券系统**
   - 优惠券列表
   - 领取优惠券
   - 使用优惠券

8. **客服系统**
   - 在线客服
   - 问题反馈
   - 常见问题

### 低优先级

9. **营销活动**
   - 限时抢购
   - 拼团活动
   - 积分商城

10. **数据分析**
    - 用户行为统计
    - 商品浏览记录
    - 购买转化分析

---

## Spec Kit 最佳实践

### 1. 规范编写原则

✅ **清晰明确**: 避免模糊表述，使用具体的需求描述
✅ **完整全面**: 包含功能、技术、设计、性能等所有方面
✅ **可验证**: 提供明确的验收标准
✅ **AI 友好**: 使用结构化的 Markdown 格式

### 2. 计划制定原则

✅ **可执行**: 计划应该是可直接转化为代码的
✅ **模块化**: 合理拆分组件和模块
✅ **可扩展**: 考虑未来的扩展性
✅ **遵循规范**: 严格遵循项目的技术规范（见 CLAUDE.md）

### 3. 任务拆解原则

✅ **原子化**: 每个任务应该是独立、完整的
✅ **有序性**: 任务之间的依赖关系清晰
✅ **时间可控**: 每个任务 1-2 小时可完成
✅ **可验证**: 每个任务有明确的完成标准

### 4. 实施执行原则

✅ **逐步推进**: 不要一次实施太多任务
✅ **及时测试**: 每完成一个任务就测试
✅ **代码审查**: AI 生成的代码需要人工审查
✅ **迭代优化**: 根据反馈持续改进

---

## 与项目规范的集成

Spec Kit 应该与项目现有的规范（`CLAUDE.md`）无缝集成：

### TypeScript 规范
- 所有函数必须有返回类型声明
- React 组件使用 `React.FC<Props>` 或明确返回 `React.ReactElement`
- 复杂类型单独定义

### 样式规范
- 使用 LESS（不使用 SCSS 特有语法）
- 遵循 BEM 命名规范
- 使用 NutUI 图标（不使用文本符号）

### 提交规范
- 遵循 Conventional Commits
- Type: feat/fix/style/refactor/perf/test/build/ci/chore/docs
- Scope: 使用页面或模块名称
- Subject: 祈使句，简明扼要

### 错误处理
- 所有异步操作必须添加 try-catch
- 添加超时保护
- 提供用户友好的错误提示

---

## 常见问题

### Q: Spec Kit 会增加开发时间吗？
A: 短期看会增加前期规划时间，但长期来看可以：
- 减少返工和bug
- 提高代码质量
- 加快后续迭代
- 降低维护成本

### Q: 规范需要写得多详细？
A: 取决于功能复杂度：
- 简单功能：核心需求 + 验收标准即可
- 复杂功能：需要详细的技术方案和设计规范
- 原则：让 AI 能理解并生成正确代码

### Q: 可以跳过某些阶段吗？
A: 可以根据情况灵活调整：
- 简单 bug 修复：可以直接实施
- 小功能：specify + implement
- 中型功能：specify + plan + implement
- 大型功能：完整四阶段

### Q: 如何处理规范变更？
A:
1. 更新 `.claude/specs/` 中的规范文件
2. 重新运行 `/plan` 更新计划
3. 重新运行 `/tasks` 更新任务
4. 执行变更的部分

---

## 下一步行动

### 立即开始

1. **安装 Spec Kit**
   ```bash
   uvx --from git+https://github.com/github/spec-kit.git specify init grain-mp-mix
   ```

2. **选择第一个功能**
   推荐从"商品详情页"开始，因为它是电商小程序的核心功能

3. **编写规范**
   ```bash
   # 在 Claude Code 中
   /specify 商品详情页功能
   ```

4. **开始开发**
   按照 `/plan` → `/tasks` → `/implement` 流程推进

### 学习资源

- [Spec Kit GitHub](https://github.com/github/spec-kit)
- [Spec-Driven Development Blog](https://github.blog/ai-and-ml/generative-ai/spec-driven-development-with-ai-get-started-with-a-new-open-source-toolkit/)
- [Taro 文档](https://taro-docs.jd.com/)
- [NutUI React Taro 文档](https://nutui.jd.com/h5/react/3x/)

---

## 总结

Spec Kit 提供了一种结构化的开发方式，特别适合：
- ✅ 与 AI 助手（Claude Code）协作开发
- ✅ 确保代码质量和规范一致性
- ✅ 大型功能的规划和实施
- ✅ 团队协作和知识传递

**核心理念**: 让规范驱动开发，而不是让代码驱动规范

**开始使用**: `/specify` → `/plan` → `/tasks` → `/implement`

祝开发顺利！🚀
