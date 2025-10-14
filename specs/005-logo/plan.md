# Implementation Plan: 商家列表与商家详情

**Branch**: `005-logo` | **Date**: 2025-10-14 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-logo/spec.md`

## Summary

实现商家列表和商家详情功能,包括:
1. 根据用户所在区域展示该区域的商家列表,每个商家以卡片形式呈现
2. 统一处理商家logo图片,确保即使图片质量参差不齐也能保持视觉一致性
3. 商家详情页展示商家基本信息和该商家在平台上架的产品品类
4. 支持按区域显示产品统一定价

技术方法:基于现有的Taro + React + NutUI架构,扩展商家(Merchant)类型定义和API服务,复用RegionContext实现区域过滤,采用懒加载和分页策略优化性能。

## Technical Context

**Language/Version**: TypeScript 5.9.3 (严格模式)
**Framework**: Taro 3.6.24 + React 18
**UI Library**: @nutui/nutui-react-taro 2.3.10 + @nutui/icons-react-taro 3.0.2
**Primary Dependencies**:
- @tarojs/taro (小程序API)
- RegionContext (区域管理)
- 现有request服务(网络请求封装)

**Storage**:
- Taro.getStorage/setStorage (本地存储)
- RegionContext (全局状态管理区域信息)

**Testing**: N/A (小程序项目,以手动测试为主)

**Target Platform**: 微信小程序 (兼容支付宝小程序、H5)

**Project Type**: 移动端小程序 (单项目,非monorepo)

**Performance Goals**:
- 商家列表页加载时间 < 3秒 (50+商家)
- 商家详情页加载时间 < 2秒
- 图片懒加载,首屏渲染时间 < 1秒

**Constraints**:
- 移动端优先,小屏幕适配
- 图片处理需前端完成(固定宽高比容器、裁剪、默认占位图)
- 网络请求超时保护(默认10秒)
- 必须支持分页或无限滚动

**Scale/Scope**:
- 预计商家数量: 50-200个/区域
- 产品分类: 2-5个(大米、碎米等)
- 页面: 2个(商家列表、商家详情)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### 核心原则验证

✅ **一、TypeScript 类型安全**
- 所有API服务函数将定义明确的返回类型
- 商家组件将使用 `React.FC<Props>` 或明确返回类型
- 商家、产品关联、区域定价等实体将定义清晰接口

✅ **二、UI 组件标准**
- 使用 @nutui/nutui-react-taro 组件(Card、Empty、Loading等)
- 图标使用 @nutui/icons-react-taro (SVG按需导入)
- 无文本符号作为图标

✅ **三、使用 LESS 编写样式**
- 商家列表和详情页样式使用LESS
- CSS类名遵循BEM规范 (merchant-list, merchant-card__logo--fallback)
- 间距使用8px倍数

✅ **四、错误处理与韧性**
- 所有API请求包含try-catch
- 网络请求超时保护(10秒)
- 使用 Taro.showToast 展示用户友好错误信息

✅ **五、代码质量与文档**
- API服务函数包含JSDoc注释
- 组件文件结构: 类型定义 → 常量 → 组件 → 导出
- 魔术数字提取为常量(如DEFAULT_PAGE_SIZE、LOGO_FALLBACK_SIZE)

✅ **六、性能优化**
- 商家列表使用分页或无限滚动
- 商家logo使用懒加载(Taro Image组件的lazy-load属性)
- 商家卡片组件使用React.memo
- 事件处理器使用useCallback

✅ **七、Git 提交规范**
- 遵循Conventional Commits格式
- 类型: feat(merchant)、style(merchant)等

### 无违规项

本功能完全符合项目宪法,无需额外证明或复杂度豁免。

## Project Structure

### Documentation (this feature)

```
specs/005-logo/
├── plan.md              # 本文件
├── spec.md              # 功能规范
├── research.md          # 研究文档(Phase 0生成)
├── data-model.md        # 数据模型(Phase 1生成)
├── quickstart.md        # 快速开始指南(Phase 1生成)
├── contracts/           # API合约(Phase 1生成)
│   └── merchant.yaml    # 商家API合约
└── checklists/
    └── requirements.md  # 规范质量检查清单
```

### Source Code (repository root)

```
src/
├── components/              # 可复用UI组件
│   ├── RegionBar/          # 现有:区域选择栏
│   ├── RegionSelector/     # 现有:区域选择器
│   ├── MerchantCard/       # 新增:商家卡片组件
│   │   ├── index.tsx
│   │   └── index.less
│   ├── MerchantLogo/       # 新增:商家Logo组件(处理图片质量问题)
│   │   ├── index.tsx
│   │   └── index.less
│   └── EmptyState/         # 新增:空状态组件
│       ├── index.tsx
│       └── index.less
├── pages/
│   ├── merchant/           # 现有:商家列表页(需完善)
│   │   ├── index.tsx
│   │   └── index.less
│   └── merchant-detail/    # 新增:商家详情页
│       ├── index.tsx
│       └── index.less
├── services/               # API服务
│   ├── request.ts          # 现有:网络请求封装
│   ├── store.ts            # 现有:门店API(实体店铺位置服务)
│   └── merchant.ts         # 新增:商家API服务(独立于store.ts)
├── types/                  # TypeScript类型定义
│   ├── api.ts              # 现有:通用API类型
│   ├── store.ts            # 现有:门店类型(独立,无需修改)
│   ├── merchant.ts         # 新增:商家类型定义
│   ├── product.ts          # 现有:产品类型
│   └── regional-pricing.ts # 新增:区域定价类型
├── contexts/
│   └── RegionContext.tsx   # 现有:区域上下文
├── utils/                  # 工具函数
│   ├── image.ts            # 新增:图片处理工具(logo占位图生成)
│   └── constants.ts        # 新增:常量定义
└── app.config.ts           # 应用配置(需添加商家详情页路由)
```

**Structure Decision**:
采用单项目结构,按功能模块组织。现有项目已有merchant页面占位,需完善其功能并新增merchant-detail页面。复用现有的RegionContext和request服务。新建merchant.ts服务和类型(独立于现有的store.ts,两者是不同的业务实体:store是实体店铺位置,merchant是供应商/商家)。组件采用模块化设计,MerchantCard和MerchantLogo独立封装以提高复用性和可测试性。

## Complexity Tracking

*无违规项,无需填写此表*

---

## Phase 0: Outline & Research

### 待研究问题

基于Technical Context,以下问题需要在research.md中明确:

1. **商家logo图片处理策略**
   - 如何生成品牌色块+首字母的默认占位图?
   - CSS固定宽高比容器实现方案(aspect-ratio vs padding-top hack)
   - 图片裁剪策略(object-fit: cover vs contain)

2. **区域过滤实现方案**
   - RegionContext是否需要扩展以支持商家列表过滤?
   - API如何传递区域参数(province_id? city_id?)
   - 区域为空时的fallback策略

3. **分页与懒加载最佳实践**
   - Taro环境下的无限滚动实现方案
   - 图片懒加载的最佳配置(threshold、placeholder)
   - 分页参数命名约定(page+limit vs pageNum+pageSize)

4. **商家-产品关联展示逻辑**
   - 如何在详情页展示"该商家支持的平台产品"?
   - 产品列表组件是否可复用现有的ProductCard?
   - 区域定价数据结构和查询方式

5. **性能优化策略**
   - React.memo的使用场景和比较函数
   - useCallback的依赖项管理
   - 骨架屏(Skeleton)的实现方案

### 研究任务清单

- [ ] 调研小程序环境下Canvas生成默认logo的可行性
- [ ] 确认后端API是否支持按区域过滤商家
- [ ] 调研NutUI InfiniteLoading组件的使用方式
- [ ] 确认产品分类和区域定价的数据结构
- [ ] 调研NutUI Skeleton组件的最佳实践

**输出**: research.md文档

---

## Phase 1: Design & Contracts

*Prerequisites: research.md complete*

### 任务列表

1. **数据模型设计 (data-model.md)**
   - 定义Merchant实体(扩展自Store)
   - 定义MerchantProductMapping实体
   - 定义RegionalPricing实体
   - 定义实体间关系和验证规则

2. **API合约生成 (contracts/merchant.yaml)**
   - GET /api/merchant/list (查询参数:region_id, page, limit)
   - GET /api/merchant/detail (查询参数:id)
   - GET /api/merchant/:id/products (查询参数:region_id)
   - 使用OpenAPI 3.0规范

3. **快速开始指南 (quickstart.md)**
   - 环境配置说明
   - 本地开发流程
   - 测试数据准备
   - 调试技巧

4. **代理上下文更新**
   - 运行 `.specify/scripts/bash/update-agent-context.sh claude`
   - 添加新增的技术栈信息(Merchant相关类型和服务)

**输出**: data-model.md, contracts/merchant.yaml, quickstart.md, agent上下文文件

---

## 实现阶段 (Phase 2)

*由 /speckit.tasks 和 /speckit.implement 命令处理,此计划到Phase 1为止*

