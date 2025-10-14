# Tasks: 商家列表与商家详情

**Input**: Design documents from `/specs/005-logo/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/merchant.yaml

**Tests**: 本项目采用手动测试策略(小程序项目),不包含自动化测试任务。

**Organization**: 任务按用户故事组织,确保每个故事可以独立实现和测试。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 可并行执行(不同文件,无依赖)
- **[Story]**: 所属用户故事(US1, US2, US3, US4)
- 包含准确的文件路径

## Path Conventions

项目采用单体结构:
- **源码**: `src/` (组件、页面、服务、类型、工具)
- **配置**: 根目录 (`app.config.ts`)
- **规范**: `specs/005-logo/`

---

## Phase 1: Setup (共享基础设施)

**目的**: 项目初始化和基础结构准备

- [X] T001 [P] 创建常量定义文件 `src/utils/constants.ts`,定义分页、Logo尺寸、颜色等常量
- [X] T002 [P] 创建图片处理工具 `src/utils/image.ts`,包含生成占位图颜色的工具函数
- [X] T003 [P] 创建商家类型定义 `src/types/merchant.ts`,定义Merchant、MerchantListItem等接口
- [X] T004 [P] 创建区域定价类型定义 `src/types/regional-pricing.ts`,定义RegionalPricing、MerchantProduct等接口

**Checkpoint**: 基础类型和工具准备完毕,可以开始API服务和组件开发

---

## Phase 2: Foundational (阻塞性前置条件)

**目的**: 必须完成的核心基础设施,阻塞所有用户故事

**⚠️ CRITICAL**: 所有用户故事必须等待此阶段完成

- [X] T005 创建商家API服务 `src/services/merchant.ts`,实现 getMerchantList、getMerchantDetail、getMerchantProducts 三个函数,包含错误处理和JSDoc注释
- [X] T006 更新应用配置 `src/app.config.ts`,添加商家详情页路由 `pages/merchant-detail/index`

**Checkpoint**: 核心API服务和路由配置完成,用户故事实现可以并行开始

---

## Phase 3: User Story 1 - 浏览商家列表 (Priority: P1) 🎯 MVP

**Goal**: 用户可以浏览所有入驻平台的商家,即使logo质量不佳也能保持视觉一致性

**Independent Test**: 访问商家列表页面,验证是否展示所有商家,商家卡片是否包含必要信息,图片质量差异大时界面是否保持视觉一致性

### Implementation for User Story 1

- [X] T007 [P] [US1] 创建MerchantLogo组件 `src/components/MerchantLogo/index.tsx`,实现logo展示和默认占位图逻辑(CSS+首字母方案)
- [X] T008 [P] [US1] 创建MerchantLogo样式 `src/components/MerchantLogo/index.less`,使用BEM命名,固定宽高比容器,object-fit: cover
- [X] T009 [P] [US1] 创建EmptyState组件 `src/components/EmptyState/index.tsx`,封装NutUI Empty组件,支持自定义文案和操作按钮
- [X] T010 [P] [US1] 创建EmptyState样式 `src/components/EmptyState/index.less`,使用BEM命名,8px间距倍数
- [X] T011 [US1] 创建MerchantCard组件 `src/components/MerchantCard/index.tsx`,使用MerchantLogo、Tag等NutUI组件,支持评分、认证标识、品类标签展示(依赖T007)
- [X] T012 [US1] 创建MerchantCard样式 `src/components/MerchantCard/index.less`,BEM命名,8px间距,卡片阴影和圆角(依赖T008)
- [X] T013 [US1] 使用React.memo优化MerchantCard组件,添加自定义比较函数
- [X] T014 [US1] 完善商家列表页 `src/pages/merchant/index.tsx`,使用NutUI InfiniteLoading实现无限滚动,Skeleton实现骨架屏,EmptyState处理空状态,集成RegionContext获取用户区域(依赖T005, T009, T011)
- [X] T015 [US1] 完善商家列表页样式 `src/pages/merchant/index.less`,BEM命名,优化商家卡片间距和列表布局(依赖T012)
- [X] T016 [US1] 添加useCallback优化商家列表页的事件处理器(handleLoadMore, handleRefresh),使用函数式更新减少依赖

**Checkpoint**: 商家列表页完全功能,可以独立测试:访问/pages/merchant/index,验证商家展示、滚动加载、Logo处理、空状态等

---

## Phase 4: User Story 2 - 查看商家详情 (Priority: P1)

**Goal**: 用户可以点击商家卡片进入详情页,查看商家完整信息

**Independent Test**: 从商家列表点击任意商家,验证是否正确跳转到商家详情页,是否展示商家基本信息

### Implementation for User Story 2

- [X] T017 [P] [US2] 创建商家详情页 `src/pages/merchant-detail/index.tsx`,展示商家基本信息(名称、logo、地址、电话、营业时间、简介等),智能处理缺失字段
- [X] T018 [P] [US2] 创建商家详情页样式 `src/pages/merchant-detail/index.less`,BEM命名,信息卡片布局,8px间距
- [X] T019 [US2] 在MerchantCard组件添加onClick事件,使用Taro.navigateTo跳转到商家详情页,传递merchant_id参数(依赖T011)
- [X] T020 [US2] 在商家详情页实现页面加载逻辑,从URL获取merchant_id,调用getMerchantDetail获取商家信息,添加加载状态和错误处理(依赖T017, T005)

**Checkpoint**: 商家详情页基本信息展示完成,可以独立测试:从列表点击商家,验证详情页展示商家信息,缺失字段智能处理

---

## Phase 5: User Story 3 - 查看商家供应的平台产品 (Priority: P1)

**Goal**: 用户在商家详情页可以看到该商家已上架的平台产品品类,包含区域价格

**Independent Test**: 访问已上架产品的商家详情页,验证是否正确展示该商家支持的平台产品列表,价格是否为当前区域价格

### Implementation for User Story 3

- [X] T021 [P] [US3] 创建MerchantProductList组件 `src/components/MerchantProductList/index.tsx`,展示商家供应的产品品类列表,处理"暂未上架产品"空状态
- [X] T022 [P] [US3] 创建MerchantProductList样式 `src/components/MerchantProductList/index.less`,BEM命名,产品卡片布局,8px间距
- [X] T023 [US3] 在商家详情页集成MerchantProductList组件,调用getMerchantProducts获取商家产品,传递RegionContext的province和city(依赖T020, T021, T005)
- [X] T024 [US3] 添加产品加载状态和错误处理,使用NutUI Skeleton展示加载占位

**Checkpoint**: 商家详情页产品展示完成,可以独立测试:访问商家详情,验证产品列表展示,区域价格正确,空状态友好提示

---

## Phase 6: User Story 4 - 商家信息的多维度展示 (Priority: P2)

**Goal**: 商家列表页展示更丰富的商家信息(评分、认证、年限、品类标签)

**Independent Test**: 在商家列表页查看商家卡片,验证是否展示评分、认证标识、经营年限、主营品类标签等信息

### Implementation for User Story 4

- [X] T025 [US4] 增强MerchantCard组件,添加评分展示(使用NutUI Rate组件)、认证标识(使用Badge或Tag)、经营年限、主营品类标签(使用Tag组件)(依赖T011)
- [X] T026 [US4] 优化MerchantCard样式,调整多维度信息的布局和间距,确保视觉层次清晰(依赖T012)

**Checkpoint**: 商家列表页展示丰富信息,可以独立测试:访问商家列表,验证评分、认证、年限、品类标签是否正确展示

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: 跨用户故事的改进和优化

- [X] T027 [P] 性能优化:验证所有图片是否启用lazyLoad,MerchantCard和MerchantLogo是否使用React.memo - ✅通过
- [X] T028 [P] 错误处理审查:确保所有API调用包含try-catch,使用Taro.showToast展示用户友好错误信息 - ✅通过
- [X] T029 [P] 代码质量检查:运行 `npx tsc --noEmit` 验证TypeScript类型,确保所有函数有明确返回类型 - ✅商家功能已修复
- [X] T030 [P] 样式审查:确认所有LESS文件使用BEM命名,间距使用8px倍数,无SCSS特有语法 - ✅通过
- [X] T031 [P] 可访问性检查:确认所有交互元素有合理的点击区域(至少44px),图标使用@nutui/icons-react-taro而非文本符号 - ✅通过
- [ ] T032 运行quickstart.md中的调试流程,验证功能完整性 - ⚠️需要微信开发者工具环境
- [X] T033 代码清理和注释完善,确保JSDoc注释完整 - ✅通过(所有文件已有完整JSDoc)
- [ ] T034 性能测试:使用微信开发者工具的Performance面板,验证商家列表加载时间<3秒,详情页加载时间<2秒 - ⚠️需要微信开发者工具环境

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 无依赖 - 可立即开始
- **Foundational (Phase 2)**: 依赖Setup完成 - **阻塞所有用户故事**
- **User Stories (Phase 3-6)**: 所有依赖Foundational完成
  - 用户故事可以并行进行(如有多人团队)
  - 或按优先级顺序进行(P1 → P1 → P1 → P2)
- **Polish (Phase 7)**: 依赖所有需要的用户故事完成

### User Story Dependencies

- **User Story 1 (P1)**: Foundational完成后可开始 - 无其他故事依赖
- **User Story 2 (P1)**: Foundational完成后可开始 - 部分依赖US1(MerchantCard的onClick),但可独立测试
- **User Story 3 (P1)**: Foundational完成后可开始 - 依赖US2(商家详情页框架),但可独立测试
- **User Story 4 (P2)**: Foundational完成后可开始 - 依赖US1(MerchantCard组件),但可独立测试

### Within Each User Story

- 组件样式在组件之后(如T008在T007之后)
- React.memo优化在组件创建之后
- 页面集成在组件创建之后
- 事件处理器优化在页面集成之后

### Parallel Opportunities

- **Phase 1**: T001-T004 可并行(不同文件)
- **Phase 2**: T005-T006 可并行(不同文件)
- **Phase 3 (US1)**: T007-T010 可并行(不同组件)
- **Phase 4 (US2)**: T017-T018 可并行(不同文件)
- **Phase 5 (US3)**: T021-T022 可并行(不同文件)
- **Phase 7**: T027-T031 可并行(不同关注点)
- **跨故事并行**: 如有多人团队,US1/US2/US3/US4可以并行开发(在Foundational完成后)

---

## Parallel Example: User Story 1

```bash
# 同时创建US1的所有独立组件:
Task T007: "创建MerchantLogo组件 src/components/MerchantLogo/index.tsx"
Task T008: "创建MerchantLogo样式 src/components/MerchantLogo/index.less"
Task T009: "创建EmptyState组件 src/components/EmptyState/index.tsx"
Task T010: "创建EmptyState样式 src/components/EmptyState/index.less"

# 上述任务完成后,创建依赖它们的MerchantCard:
Task T011: "创建MerchantCard组件"
Task T012: "创建MerchantCard样式"
```

---

## Parallel Example: Foundational Phase

```bash
# Foundational阶段的任务可以并行:
Task T005: "创建商家API服务 src/services/merchant.ts"
Task T006: "更新应用配置 src/app.config.ts"
```

---

## Implementation Strategy

### MVP First (User Stories 1, 2, 3 Only)

1. **Complete Phase 1**: Setup (T001-T004)
2. **Complete Phase 2**: Foundational (T005-T006) ⚠️ **CRITICAL BLOCKER**
3. **Complete Phase 3**: User Story 1 (T007-T016)
4. **STOP and VALIDATE**: 独立测试商家列表功能
5. **Complete Phase 4**: User Story 2 (T017-T020)
6. **STOP and VALIDATE**: 独立测试商家详情基本信息
7. **Complete Phase 5**: User Story 3 (T021-T024)
8. **STOP and VALIDATE**: 独立测试商家产品展示
9. **Deploy/Demo**: 此时拥有完整的P1功能(浏览列表、查看详情、查看产品)

### Incremental Delivery

1. **Foundation Ready**: Setup + Foundational → 基础设施就绪
2. **Add User Story 1**: T007-T016 → 独立测试 → Deploy/Demo (MVP - 浏览商家列表)
3. **Add User Story 2**: T017-T020 → 独立测试 → Deploy/Demo (详情基本信息)
4. **Add User Story 3**: T021-T024 → 独立测试 → Deploy/Demo (产品展示)
5. **Add User Story 4**: T025-T026 → 独立测试 → Deploy/Demo (丰富信息)
6. **Polish**: T027-T034 → 最终优化

每个故事增加价值而不破坏之前的故事。

### Parallel Team Strategy

如有多名开发者:

1. **团队一起完成**: Setup + Foundational (T001-T006)
2. **Foundational完成后**:
   - Developer A: User Story 1 (T007-T016)
   - Developer B: User Story 2 (T017-T020)
   - Developer C: User Story 3 (T021-T024)
3. **故事独立完成后集成测试**
4. **团队一起完成**: User Story 4 (T025-T026) + Polish (T027-T034)

---

## Notes

- **[P]** 标记表示可并行任务(不同文件,无依赖)
- **[Story]** 标签将任务映射到用户故事,便于追踪
- **每个用户故事应该独立可完成和可测试**
- **每个任务或逻辑组后提交代码**
- **在每个Checkpoint停止并验证故事独立性**
- **避免**: 模糊任务、同文件冲突、破坏独立性的跨故事依赖

---

## Task Count Summary

- **Total Tasks**: 34
- **Setup (Phase 1)**: 4 tasks
- **Foundational (Phase 2)**: 2 tasks
- **User Story 1 (Phase 3)**: 10 tasks
- **User Story 2 (Phase 4)**: 4 tasks
- **User Story 3 (Phase 5)**: 4 tasks
- **User Story 4 (Phase 6)**: 2 tasks
- **Polish (Phase 7)**: 8 tasks

**Parallel Opportunities**: 15个任务标记为[P],可并行执行

**Suggested MVP Scope**: Phase 1 + Phase 2 + Phase 3 + Phase 4 + Phase 5 (T001-T024,共24个任务)

**Independent Test Criteria**:
- **US1**: 商家列表页可以独立访问和测试,展示商家卡片、处理滚动、Logo占位图
- **US2**: 商家详情页可以独立访问(传入merchant_id参数),展示商家基本信息
- **US3**: 商家详情页的产品模块可以独立测试(验证产品列表和区域价格)
- **US4**: 商家列表页的多维度信息可以独立验证(评分、认证、标签)
