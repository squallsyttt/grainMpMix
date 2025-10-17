# Implementation Plan: 首页商品分类多级展示优化

**Branch**: `006-code-1-msg` | **Date**: 2025-10-17 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/006-code-1-msg/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

优化首页商品分类展示,支持多级分类(最多4层)的树形结构展示。核心需求包括:首页一级分类网格展示、分类详情页二级子分类导航、分类导航页的树形展开/收起交互,以及"查看更多"功能。技术方案基于现有 Taro + React + NutUI 架构,通过重构分类组件、新增分类导航页和商品列表页来实现多层级分类的完整浏览体验。

## Technical Context

**Language/Version**: TypeScript 5.9.3 (严格模式)
**Primary Dependencies**:
- Taro 3.6.24 (跨平台小程序框架)
- React 18.0.0 (UI框架)
- @nutui/nutui-react-taro 2.3.10 (UI组件库)
- @nutui/icons-react-taro 3.0.2 (图标库)

**Storage**:
- Taro.request (HTTP请求,与后端API通信)
- Taro.getStorageSync/setStorageSync (本地存储,用于Token等)
- 后端API: FastAdmin框架,返回JSON格式数据

**Testing**: 未配置专门测试框架 (MVP阶段手动测试)
**Target Platform**: 微信小程序 (主要)、H5、其他小程序平台 (支付宝、百度等)
**Project Type**: 移动端小程序 (Taro多端架构)
**Performance Goals**:
- 首页分类加载时间 < 500ms
- 分类树展开/收起响应 < 100ms
- 支持100个一级分类 + 每个50个子分类

**Constraints**:
- 用户操作流程完成时间 < 3秒 (首页点击到商品列表)
- 渲染流畅度 60fps (树形展开动画)
- 兼容微信小程序运行环境限制

**Scale/Scope**:
- 新增页面: 2个 (分类导航页、商品列表页)
- 改造组件: 1个 (ProductCategories)
- 新增工具函数: 树形数据处理、分类路径计算
- API端点: 1个 (GET /api/wanlshop/category/tree)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ 核心原则合规性检查

| 原则 | 检查项 | 状态 | 说明 |
|------|--------|------|------|
| **TypeScript类型安全** | 所有函数有明确返回类型 | ✅ PASS | 将为所有新增函数和组件定义明确的类型和返回值 |
| | React组件使用FC<Props>或ReactElement | ✅ PASS | 遵循现有代码规范,使用React.FC |
| | 禁止隐式any | ✅ PASS | 启用TypeScript严格模式 |
| **UI组件标准** | 使用NutUI组件库 | ✅ PASS | 使用NutUI的Grid、Collapse等组件 |
| | 使用@nutui/icons-react-taro图标 | ✅ PASS | 使用ArrowRight、ArrowDown等图标,避免文本符号 |
| | 禁止文本符号作为图标 | ✅ PASS | 确保所有箭头、关闭按钮使用图标组件 |
| **LESS样式** | 使用LESS而非SCSS | ✅ PASS | 所有样式文件使用.less,遵循BEM命名 |
| | 遵循BEM命名规范 | ✅ PASS | 如category-nav__item--expanded |
| | 使用8px间距倍数 | ✅ PASS | padding/margin使用8、16、24、32px |
| **错误处理** | 异步操作包含try-catch | ✅ PASS | 所有API请求封装错误处理 |
| | 网络请求包含超时保护 | ✅ PASS | 使用现有request.ts的10秒超时 |
| | 用户可见错误使用Taro.showToast | ✅ PASS | 加载失败、空数据等显示友好提示 |
| **代码质量** | 复杂函数包含JSDoc | ✅ PASS | 为树形数据处理等复杂逻辑添加文档 |
| | 遵循组件文件结构顺序 | ✅ PASS | 类型→常量→组件→导出 |
| | 魔术数字提取为常量 | ✅ PASS | 如MAX_DEPTH=4、HOME_DISPLAY_COUNT=6 |
| **性能优化** | 大列表使用虚拟滚动 | ⚠️ N/A | 分类数量预期<100,暂不需要虚拟滚动 |
| | 图片使用懒加载 | ✅ PASS | 分类图标使用NutUI的Image组件懒加载 |
| | 稳定组件使用React.memo | ✅ PASS | 分类卡片等重复渲染组件使用memo |
| | 事件处理使用useCallback | ✅ PASS | 点击、展开等事件使用useCallback |
| **Git提交规范** | 遵循Conventional Commits | ✅ PASS | feat(category): 添加多级分类展示功能 |

### 📋 技术约束检查

| 约束项 | 要求 | 状态 | 说明 |
|--------|------|------|------|
| 框架 | Taro 3.6.24 + React 18 | ✅ PASS | 基于现有技术栈 |
| UI库 | NutUI React Taro 2.3.10 | ✅ PASS | 使用Grid、Collapse、Image等组件 |
| 语言 | TypeScript 5.9.3严格模式 | ✅ PASS | 继续使用严格类型检查 |
| 样式 | LESS (不使用SCSS) | ✅ PASS | 所有样式使用LESS语法 |
| 禁止模式 | SCSS特有语法 | ✅ PASS | 不使用@for等SCSS循环 |
| | 文本符号作为图标 | ✅ PASS | 使用图标组件 |
| | 隐式any类型 | ✅ PASS | 所有类型明确定义 |
| | 无错误处理的异步操作 | ✅ PASS | 所有请求包含错误处理 |

### ✅ 整体评估

**结论**: 通过宪法检查,无违规项。

**理由**:
1. 所有核心原则均符合要求
2. 技术栈完全基于现有架构,无新增依赖
3. 代码规范、性能优化策略与宪法一致
4. 唯一的N/A项(虚拟滚动)是因为数据规模不需要,非违规

## Project Structure

### Documentation (this feature)

```
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```
src/
├── components/
│   ├── ProductCategories/      # [改造] 首页分类展示组件
│   │   ├── index.tsx           # 支持"查看更多"、子分类数量显示
│   │   └── index.less
│   ├── CategoryTree/           # [新增] 可展开/收起的分类树组件
│   │   ├── index.tsx
│   │   ├── index.less
│   │   └── types.ts
│   └── CategoryNavBar/         # [新增] 二级分类水平滚动导航
│       ├── index.tsx
│       └── index.less
│
├── pages/
│   ├── index/                  # [改造] 首页 - 更新ProductCategories使用
│   │   ├── index.tsx
│   │   └── index.less
│   ├── category-nav/           # [新增] 分类导航页 - 树形展示所有分类
│   │   ├── index.tsx
│   │   ├── index.less
│   │   └── index.config.ts
│   └── product-list/           # [新增] 商品列表页 - 按分类显示商品
│       ├── index.tsx
│       ├── index.less
│       └── index.config.ts
│
├── types/
│   └── category.ts             # [改造] 增强分类类型定义
│
├── utils/
│   └── categoryTree.ts         # [新增] 树形数据处理工具函数
│
└── services/
    └── category.ts             # [新增] 分类API服务封装
```

**Structure Decision**:

采用Taro单项目移动端架构。所有源码位于`src/`目录,按功能分层:
- `components/`: 可复用组件(分类树、分类导航栏)
- `pages/`: 页面级组件(分类导航页、商品列表页)
- `types/`: TypeScript类型定义
- `utils/`: 工具函数(树形数据处理)
- `services/`: API服务层(分类数据获取)

此结构与现有项目完全一致,无需调整构建配置。
