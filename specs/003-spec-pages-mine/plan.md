# Implementation Plan: 核销券个人中心主页设计

**Branch**: `003-spec-pages-mine` | **Date**: 2025-10-13 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-spec-pages-mine/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

实现核销券个人中心主页(pages/mine/index),作为用户管理核销券、订单、个人信息的统一入口。该页面区别于传统电商的"我的"页面,核心聚焦于核销券状态管理和快速核销操作路径。

**核心功能**:
- 核销券状态统计与快速入口(待核销/已核销/已过期)
- 最近3张待核销券快速展示
- 订单列表入口与最近订单预览
- 用户信息展示与个人资料管理入口
- 常用功能入口(地址管理、客服、设置等)
- 跑腿配送功能占位入口

**技术方案**: 使用 Taro + React + TypeScript + NutUI 构建响应式页面,遵循项目宪法规定的 TypeScript 类型安全、LESS 样式、BEM 命名、错误处理等规范。通过 Context API 管理用户登录状态,使用 Mock 数据进行 MVP 开发,后续接入后端 FastAdmin API。

## Technical Context

**Language/Version**: TypeScript 5.9.3 (严格模式)
**Primary Dependencies**:
- Taro 3.6.24 (跨平台小程序框架)
- React 18.0.0
- @nutui/nutui-react-taro 2.3.10 (UI组件库)
- @nutui/icons-react-taro 3.0.2 (图标库)
- LESS (CSS预处理器)

**Storage**:
- Taro.getStorageSync/setStorageSync (本地存储,用于Token、用户信息缓存)
- 后端 FastAdmin 框架 (MySQL数据库,本前端页面不直接操作数据库)

**Testing**:
- 开发阶段使用 Mock 数据进行功能测试
- 后续集成后端 API 后进行联调测试
- 类型安全通过 TypeScript 编译器强制检查

**Target Platform**:
- 微信小程序 (主要目标)
- 支付宝小程序、H5 (次要目标,Taro跨平台能力)

**Project Type**: Mobile (小程序)
**Performance Goals**:
- 页面加载时间 < 2秒 (正常网络)
- 首屏渲染时间 < 1秒
- 支持流畅滚动 (60fps)
- 骨架屏加载过渡

**Constraints**:
- 必须遵循项目宪法的 TypeScript 类型安全规范
- 必须使用 NutUI 组件库,禁止使用文本符号作为图标
- 样式必须使用 LESS (禁止 SCSS 特有语法)
- CSS类名必须遵循 BEM 命名规范
- 所有异步操作必须包含错误处理和超时保护
- 必须适配不同屏幕尺寸 (375px-414px 主流机型宽度)

**Scale/Scope**:
- 单个页面组件 (pages/mine/index)
- 预计引入 2-3 个新的可复用组件
- 集成 6 个用户故事的功能点
- 支持 10000+ 并发用户访问

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ 核心原则合规性检查

| 原则 | 检查项 | 状态 | 说明 |
|------|--------|------|------|
| **TypeScript 类型安全** | 所有函数必须有明确返回类型 | ✅ 通过 | 组件返回 `React.ReactElement`,服务函数返回 `Promise<T>` |
| | React组件使用 `React.FC<Props>` | ✅ 通过 | 所有组件使用 `React.FC` 或明确返回类型 |
| | 复杂类型单独定义 | ✅ 通过 | 用户信息、核销券、订单类型已在 `src/types/` 定义 |
| | 禁止隐式 `any` | ✅ 通过 | TypeScript 严格模式已启用 |
| **UI组件标准** | 必须使用 NutUI React Taro | ✅ 通过 | 使用 Card、Tag、Empty、Button、Skeleton 等组件 |
| | 图标使用 @nutui/icons-react-taro | ✅ 通过 | 使用 ArrowRight、User 等图标,优先 SVG 导入 |
| | 禁止文本符号作为图标 | ✅ 通过 | 不使用 ←、✕、× 等符号 |
| **LESS样式** | 必须使用 LESS 语法 | ✅ 通过 | 所有样式文件使用 `.less` 扩展名 |
| | 禁止 SCSS 特有语法 | ✅ 通过 | 不使用 `@for`、`@while`、`@each` 循环 |
| | CSS类名遵循 BEM | ✅ 通过 | 类名格式: `.mine-page__header--active` |
| | 间距使用 8px 倍数 | ✅ 通过 | 间距: 8、16、24、32px |
| **错误处理与韧性** | 所有异步操作包含 try-catch | ✅ 通过 | 数据加载、API请求都包含错误处理 |
| | 网络请求包含超时保护 | ✅ 通过 | 使用 request.ts 封装,默认10秒超时 |
| | 用户可见错误使用友好提示 | ✅ 通过 | 使用 `Taro.showToast` 显示错误信息 |
| **代码质量与文档** | 复杂函数包含 JSDoc | ✅ 通过 | 数据加载、事件处理函数添加 JSDoc |
| | 组件文件结构遵循规范 | ✅ 通过 | 类型 → 常量 → 组件 → 导出 |
| | 魔术数字提取为常量 | ✅ 通过 | 如 `PAGE_SIZE = 20`、`EXPIRE_WARNING_DAYS = 7` |
| **性能优化** | 大列表使用虚拟滚动 | N/A | 个人中心页面无超长列表 |
| | 图片使用懒加载 | ✅ 通过 | 用户头像、商品图片使用懒加载 |
| | 组件使用 React.memo | ✅ 通过 | 核销券卡片、订单卡片使用 `React.memo` |
| | 事件处理器使用 useCallback | ✅ 通过 | 点击事件、下拉刷新使用 `useCallback` |
| **Git提交规范** | 遵循 Conventional Commits | ✅ 通过 | 提交格式: `feat(mine): 添加个人中心页面` |

### ✅ 技术约束检查

| 约束 | 要求 | 状态 | 说明 |
|------|------|------|------|
| **强制技术栈** | Taro 3.6.24 + React 18 | ✅ 通过 | 使用项目已配置的版本 |
| | NutUI React Taro 2.3.10 | ✅ 通过 | 使用项目已安装的UI库 |
| | TypeScript 5.9.3 严格模式 | ✅ 通过 | tsconfig.json 已启用严格模式 |
| | LESS (不使用 SCSS) | ✅ 通过 | 样式文件使用 `.less` 扩展名 |
| **禁止模式** | SCSS 特有语法 | ✅ 通过 | 不使用循环、SCSS函数 |
| | 文本符号作为图标 | ✅ 通过 | 使用 NutUI 图标库 |
| | 隐式 any 类型 | ✅ 通过 | TypeScript 严格模式检查 |
| | 无错误处理的异步操作 | ✅ 通过 | 所有异步操作包含 try-catch |
| | 内联样式 | ✅ 通过 | 使用 LESS 模块化样式 |

### 结论

**✅ 所有宪法检查通过,可以继续Phase 0研究阶段。**

本功能完全符合粮仓Mix项目宪法的所有核心原则和技术约束,无需记录任何违规例外。

## Project Structure

### Documentation (this feature)

```
specs/003-spec-pages-mine/
├── spec.md                  # 功能规格说明
├── plan.md                  # 本文件 (/speckit.plan 命令输出)
├── research.md              # Phase 0 输出 (技术调研文档)
├── data-model.md            # Phase 1 输出 (数据模型定义)
├── quickstart.md            # Phase 1 输出 (快速开始指南)
├── contracts/               # Phase 1 输出 (API 合约定义)
│   ├── user-api.md          # 用户信息API
│   ├── voucher-stats-api.md # 核销券统计API
│   └── order-stats-api.md   # 订单统计API
├── checklists/              # 质量检查清单
│   └── requirements.md      # 需求完整性检查清单
└── tasks.md                 # Phase 2 输出 (/speckit.tasks 命令 - 待生成)
```

### Source Code (repository root)

项目采用 **Mobile (小程序)** 结构,基于 Taro 框架的标准布局:

```
src/
├── pages/                   # 页面组件
│   ├── mine/                # 个人中心页面 (本功能核心)
│   │   ├── index.tsx        # 页面主组件
│   │   ├── index.less       # 页面样式
│   │   └── types.ts         # 页面专用类型定义
│   ├── voucher/             # 核销券相关页面 (已存在)
│   │   ├── list/            # 核销券列表页
│   │   └── detail/          # 核销券详情页
│   └── order/               # 订单相关页面 (已存在)
│       ├── list/            # 订单列表页
│       └── detail/          # 订单详情页
│
├── components/              # 可复用组件
│   ├── VoucherCard/         # 核销券卡片 (已存在)
│   ├── OrderCard/           # 订单卡片 (已存在)
│   ├── UserInfoCard/        # 用户信息卡片 (新增 - 本功能)
│   ├── VoucherStatsCard/    # 核销券状态统计卡片 (新增 - 本功能)
│   └── FunctionListItem/    # 功能列表项组件 (新增 - 本功能)
│
├── types/                   # TypeScript 类型定义
│   ├── user.ts              # 用户相关类型 (扩展)
│   ├── voucher.ts           # 核销券类型 (已存在)
│   ├── order.ts             # 订单类型 (已存在)
│   └── api.ts               # API响应类型 (已存在)
│
├── services/                # API 服务层
│   ├── user.ts              # 用户服务 (新增 - 本功能)
│   ├── voucher.ts           # 核销券服务 (已存在)
│   ├── order.ts             # 订单服务 (已存在)
│   └── request.ts           # HTTP请求封装 (已存在)
│
├── contexts/                # React Context
│   ├── UserContext.tsx      # 用户上下文 (新增 - 本功能)
│   └── RegionContext.tsx    # 地区上下文 (已存在)
│
├── data/                    # Mock 数据和常量
│   ├── mock/                # Mock 数据
│   │   ├── user.ts          # 用户Mock数据 (新增)
│   │   ├── voucher.ts       # 核销券Mock数据 (已存在)
│   │   └── order.ts         # 订单Mock数据 (已存在)
│   └── constants.ts         # 全局常量
│
├── utils/                   # 工具函数
│   ├── date.ts              # 日期工具 (已存在)
│   ├── error.ts             # 错误处理 (已存在)
│   └── hooks.ts             # 自定义Hooks (已存在)
│
├── app.config.ts            # 应用配置 (页面路由已定义)
├── app.tsx                  # 应用入口
└── custom-tab-bar/          # 自定义TabBar (已存在)
    └── index.tsx
```

**Structure Decision**:

选择 Mobile (小程序) 结构的理由:
1. 项目基于 Taro 框架,按照 Taro 的标准目录结构组织代码
2. 核心页面在 `src/pages/` 下,每个页面是独立的目录单元
3. 可复用组件统一放在 `src/components/` 下
4. 类型定义集中在 `src/types/`,便于跨模块共享
5. 服务层 `src/services/` 封装所有 API 调用
6. 上下文管理 `src/contexts/` 用于全局状态共享
7. Mock 数据 `src/data/mock/` 支持前端独立开发

**关键新增文件** (本功能):
- `src/pages/mine/index.tsx` - 个人中心主页面
- `src/components/UserInfoCard/` - 用户信息卡片组件
- `src/components/VoucherStatsCard/` - 核销券统计卡片组件
- `src/components/FunctionListItem/` - 功能列表项组件
- `src/services/user.ts` - 用户服务API封装
- `src/contexts/UserContext.tsx` - 用户上下文管理
- `src/types/user.ts` - 用户类型定义扩展
- `src/data/mock/user.ts` - 用户Mock数据

## Complexity Tracking

*所有宪法检查已通过,无需记录违规例外。本节保留为空。*

