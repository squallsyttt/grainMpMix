# Implementation Plan: 首页多级分类导航与商品展示交互设计

**Branch**: `001-banner` | **Date**: 2025-10-11 | **Spec**: [spec.md](./spec.md)
**Input**: 用户描述: "这个项目的首页 目前展示轮播banner 和 大米分类。我在犹豫这个首页要不要也放大米商品,还是点击大米分类之后进入二级页面去展示对应的大米商品,这个最外层的分类是最基础的一级分类,后面也可能会有二级分类甚至三级分类。这个交互应该怎么设计最合理"

## Summary

基于现有代码评审,本功能将在已实现的首页基础上(RegionBar、HomeBanner、HorizontalAd、ProductCategories)增加以下核心功能:

**MVP核心(P1)**:
1. 创建商品数据结构和模拟数据
2. 实现首页商品列表展示组件(8-12个精选商品)
3. 完善ProductCategories的点击跳转功能
4. 创建分类详情页,支持多级分类导航和面包屑
5. 创建商品详情页基础版本

**体验增强(P2)**:
6. 实现首页动态切换分类商品(无需跳转页面)
7. 添加分类图标和选中状态
8. 实现多级分类导航和面包屑

**数据接入(P3)**:
9. 接入后端API替换模拟数据
10. 添加用户行为数据统计

**技术方案**: 采用增量开发策略,基于现有Taro + React + NutUI技术栈,使用模拟数据快速验证交互设计,后期再对接真实API。

## Technical Context

**Language/Version**: TypeScript 5.9.3 (严格模式)
**Primary Dependencies**:
- Taro 3.6.24 (小程序跨端框架)
- React 18 (UI库)
- @nutui/nutui-react-taro 2.3.10 (UI组件库)
- @nutui/icons-react-taro (图标库)

**Storage**:
- 现阶段: 本地模拟数据 (`src/data/*.ts`)
- P3阶段: 后端API对接,考虑使用Taro.request + 简单状态管理

**Testing**:
- 单元测试: Jest + React Testing Library (按需添加)
- E2E测试: 小程序开发者工具手动测试
- 类型检查: TypeScript编译器

**Target Platform**: 微信小程序 (主要) + H5 (次要)

**Project Type**: Mobile (Taro小程序项目)

**Performance Goals**:
- 首页加载时间 < 2秒
- 商品列表滚动 60fps
- 图片懒加载,骨架屏优化

**Constraints**:
- 必须遵循微信小程序包大小限制(主包<2MB)
- 必须支持iOS和Android双平台
- 网络请求需处理弱网环境(3G网络)

**Scale/Scope**:
- MVP阶段: 20-30个商品,6个一级分类
- 后续扩展: 支持100+商品,3级分类树形结构

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### 核心原则合规性

#### ✅ 一、TypeScript 类型安全
- 所有函数必须有明确的返回类型
- React组件使用 `React.FC<Props>` 或返回 `React.ReactElement`
- 禁止隐式 `any` 类型

**本功能合规方案**:
- 所有新组件(ProductList、分类页、商品详情页)强制类型定义
- 数据接口(Product、Category扩展)使用TypeScript interface
- API请求响应类型定义

#### ✅ 二、UI 组件标准
- 必须使用 `@nutui/nutui-react-taro` 和 `@nutui/icons-react-taro`
- 禁止文本符号作为图标

**本功能合规方案**:
- ProductCategories图标使用 NutUI icons (如 `<Category />`, `<StarFill />`)
- 商品卡片使用 NutUI 的 `<Card />` 或自定义组件配合 NutUI 基础组件
- 加载状态使用 `<Loading />`,空状态使用 `<Empty />`

#### ✅ 三、LESS 样式规范
- 使用LESS语法,禁止SCSS特有功能
- 遵循BEM命名 (product-card__title--large)
- 间距使用8px倍数

**本功能合规方案**:
- 所有新组件样式文件使用 `.less` 扩展名
- 类名示例: `.product-list`, `.product-card`, `.category-page__breadcrumb`

#### ✅ 四、错误处理与韧性
- 异步操作必须 try-catch
- 网络请求超时保护(10秒)
- 友好错误提示

**本功能合规方案**:
- 商品数据加载失败显示重试按钮
- 图片加载失败显示占位图
- 网络错误使用 `Taro.showToast` 提示用户

#### ✅ 五、代码质量与文档
- 复杂函数JSDoc注释
- 组件文件结构:类型→常量→组件→导出
- 魔术数字提取为常量

**本功能合规方案**:
- 商品列表分页大小: `const PAGE_SIZE = 12`
- 图片占位符: `const PLACEHOLDER_IMAGE = 'xxx'`
- 所有工具函数添加JSDoc

#### ✅ 六、性能优化
- 大列表虚拟滚动(按需)
- 图片懒加载
- React.memo / useCallback

**本功能合规方案**:
- 首页商品列表: 初始加载12个,滚动加载更多
- 商品图片: 使用 `<Image lazyLoad />` 属性
- ProductList组件使用 `React.memo`

#### ✅ 七、Git 提交规范
- 遵循 Conventional Commits
- 类型: feat/fix/style/refactor等

**本功能合规方案**:
- `feat(product): 添加首页商品列表组件`
- `feat(category): 实现分类详情页面`
- `fix(product): 修复商品卡片价格显示错误`

### 技术栈合规性

✅ **框架**: Taro 3.6.24 + React 18 (已有)
✅ **UI库**: NutUI React Taro 2.3.10 (已有)
✅ **语言**: TypeScript 5.9.3 严格模式 (已有)
✅ **样式**: LESS (已有,`src/pages/index/index.less`)
✅ **构建**: Webpack 5 (Taro内置)

### 禁止模式检查

✅ 无SCSS特有语法
✅ 无文本符号图标
✅ 无隐式any类型
✅ 无未处理的异步操作
✅ 无内联样式

**Gate结果**: ✅ **PASS** - 所有宪法要求均满足,无需豁免,可以进入Phase 0

## Project Structure

### Documentation (this feature)

```
specs/001-banner/
├── spec.md              # 功能规格说明 (已完成)
├── plan.md              # 本文件 - 实现规划
├── research.md          # Phase 0 - 技术调研
├── data-model.md        # Phase 1 - 数据模型设计
├── quickstart.md        # Phase 1 - 快速上手指南
├── contracts/           # Phase 1 - API契约定义
│   ├── product-api.md
│   └── category-api.md
├── checklists/          # 质量检查清单
│   └── requirements.md  (已完成)
└── tasks.md             # Phase 2 - 任务分解 (由 /speckit.tasks 生成)
```

### Source Code (repository root)

**现有结构**:

```
src/
├── components/          # 可复用UI组件
│   ├── RegionBar/      ✅ 已完成
│   ├── RegionSelector/ ✅ 已完成
│   ├── HomeBanner/     ✅ 已完成
│   ├── HorizontalAd/   ✅ 已完成
│   └── ProductCategories/ ✅ 已完成 (需优化)
├── pages/              # 页面组件
│   └── index/          ✅ 首页已完成
├── data/               # 模拟数据
│   ├── banners.ts      ✅ 已完成
│   └── categories.ts   ✅ 已完成 (需扩展)
├── contexts/           # React Context
│   └── RegionContext.tsx ✅ 已完成
└── app.config.ts       # Taro配置
```

**本功能新增结构**:

```
src/
├── components/
│   ├── ProductList/       ❌ 新建 - 商品列表组件
│   │   ├── index.tsx
│   │   ├── index.less
│   │   └── types.ts
│   ├── ProductCard/       ❌ 新建 - 商品卡片组件
│   │   ├── index.tsx
│   │   ├── index.less
│   │   └── types.ts
│   ├── Breadcrumb/        ❌ 新建 - 面包屑导航
│   │   ├── index.tsx
│   │   └── index.less
│   └── EmptyState/        ❌ 新建 - 空状态提示
│       ├── index.tsx
│       └── index.less
├── pages/
│   ├── category/          ❌ 新建 - 分类详情页
│   │   ├── index.tsx
│   │   ├── index.less
│   │   └── index.config.ts
│   └── product/           ❌ 新建 - 商品详情页
│       ├── index.tsx
│       ├── index.less
│       └── index.config.ts
├── data/
│   └── products.ts        ❌ 新建 - 商品模拟数据
├── types/                 ❌ 新建 - 全局类型定义
│   ├── product.ts
│   └── category.ts
└── utils/                 ❌ 新建 - 工具函数
    ├── imageHelper.ts     # 图片处理工具
    └── dataHelper.ts      # 数据过滤/排序工具
```

**Structure Decision**:
采用 **Single project (Taro小程序)** 结构。代码按功能模块组织:
- `components/` 存放可复用UI组件
- `pages/` 存放页面级组件(与路由对应)
- `data/` 存放模拟数据(P3阶段迁移到API)
- `types/` 存放共享TypeScript类型定义
- `utils/` 存放工具函数

此结构符合Taro最佳实践,便于后续模块化扩展。

## Complexity Tracking

*本功能无宪法违规,此部分留空*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| 无 | 无 | 无 |

---

**Phase 0-1将在后续步骤自动生成**: research.md → data-model.md → contracts/ → quickstart.md
