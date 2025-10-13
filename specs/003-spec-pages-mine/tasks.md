# Tasks: 核销券个人中心主页设计

**Input**: Design documents from `/specs/003-spec-pages-mine/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: 本功能不包含测试任务(未在规格说明中明确要求)

**Organization**: 任务按用户故事(User Story)组织,每个故事可独立实现和测试

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 可并行执行(不同文件,无依赖关系)
- **[Story]**: 任务所属的用户故事(US1, US2, US3...)
- 包含确切的文件路径

## Path Conventions

项目采用 Mobile (小程序) 结构,基于 Taro 框架:
- 页面组件: `src/pages/`
- 可复用组件: `src/components/`
- 类型定义: `src/types/`
- 服务层: `src/services/`
- Mock数据: `src/data/mock/`
- 上下文: `src/contexts/`

---

## Phase 1: Setup (共享基础设施)

**Purpose**: 项目初始化和基础结构

- [X] T001 [P] 创建类型定义文件 `src/types/stats.ts` (VoucherStats, OrderStats)
- [X] T002 [P] 创建类型定义文件 `src/types/recent.ts` (RecentVoucher, RecentOrder)
- [X] T003 [P] 创建类型定义文件 `src/types/function.ts` (FunctionItem)
- [X] T004 [P] 扩展用户类型定义 `src/types/user.ts` (UserInfo, MemberLevel)
- [X] T005 [P] 创建用户Mock数据 `src/data/mock/user.ts` (mockUserInfo, mockVoucherStats, mockOrderStats等)

---

## Phase 2: Foundational (阻塞性前置条件)

**Purpose**: 所有用户故事依赖的核心基础设施

**⚠️ CRITICAL**: 必须完成此阶段才能开始任何用户故事的实现

- [X] T006 创建用户上下文 `src/contexts/UserContext.tsx` (UserContext, UserProvider, useUser hook)
- [X] T007 创建用户服务 `src/services/user.ts` (getUserInfo, getVoucherStats, getOrderStats等API封装)
- [X] T008 在 `src/app.tsx` 中集成 UserProvider,包裹整个应用

**Checkpoint**: 基础设施就绪 - 用户故事实现可以并行开始

---

## Phase 3: User Story 1 - 核销券快速入口与状态概览 (Priority: P1) 🎯 MVP

**Goal**: 用户进入个人中心后,立即看到核销券状态统计(待核销/已核销/已过期),并能快速进入各状态的券列表

**Independent Test**: 创建不同状态的测试券(3张待核销、2张已核销、1张已过期),访问个人中心,验证统计数据正确显示,点击卡片跳转到对应状态的券列表

### Implementation for User Story 1

- [X] T009 [P] [US1] 创建核销券统计卡片组件 `src/components/VoucherStatsCard/index.tsx`
- [X] T010 [P] [US1] 创建核销券统计卡片样式 `src/components/VoucherStatsCard/index.less`
- [X] T011 [US1] 在个人中心页面 `src/pages/mine/index.tsx` 中集成 VoucherStatsCard 组件
- [X] T012 [US1] 实现核销券统计数据加载逻辑(调用 getVoucherStats API)
- [X] T013 [US1] 实现状态卡片点击跳转逻辑(跳转到核销券列表页并筛选对应状态)
- [X] T014 [US1] 添加即将过期红点提醒功能(当 expiringSoon > 0 时显示)
- [X] T015 [US1] 添加空状态处理(无核销券时显示"暂无核销券")
- [X] T016 [US1] 添加加载失败错误处理和重试功能

**Checkpoint**: 此时用户故事1应完全功能化且可独立测试

---

## Phase 4: User Story 2 - 最近核销券展示与快速操作 (Priority: P1)

**Goal**: 用户在个人中心直接看到最近3张待核销券,点击可快速进入详情查看二维码

**Independent Test**: 创建5张待核销券,验证个人中心只显示最近的3张,点击券卡片直接进入详情页并显示二维码

### Implementation for User Story 2

- [ ] T017 [US2] 在个人中心页面 `src/pages/mine/index.tsx` 中添加最近核销券列表区域
- [ ] T018 [US2] 实现最近核销券数据加载逻辑(调用 getRecentVouchers API,限制3条,计算 daysRemaining = Math.ceil((expireAt - now) / 86400))
- [ ] T019 [US2] 复用 VoucherCard 组件展示最近核销券(显示商品图片、名称、剩余天数,如组件不支持则需扩展)
- [ ] T020 [US2] 实现券卡片点击跳转到详情页逻辑(传递券ID参数)
- [ ] T021 [US2] 添加"查看全部"按钮(当待核销券>3张时显示)
- [ ] T022 [US2] 添加空状态处理(无待核销券时显示"暂无待核销券"和"查看已核销券"按钮)
- [ ] T023 [US2] 添加加载骨架屏(使用 NutUI Skeleton 组件)

**Checkpoint**: 此时用户故事1和2应都可独立工作

---

## Phase 5: User Story 3 - 订单入口与核销记录 (Priority: P2)

**Goal**: 用户查看完整订单记录的快速入口,并能看到最近订单状态

**Independent Test**: 创建不同状态的测试订单,验证个人中心正确显示订单入口和订单数量统计,点击入口跳转到订单列表页

### Implementation for User Story 3

- [ ] T024 [P] [US3] 创建订单统计组件样式区域(在个人中心页面中)
- [ ] T025 [US3] 实现订单统计数据加载逻辑(调用 getOrderStats API)
- [ ] T026 [US3] 显示订单总数和待支付徽标(当 pending > 0 时显示数量徽标)
- [ ] T027 [US3] 实现订单入口点击跳转逻辑(跳转到订单列表页)
- [ ] T028 [US3] 添加最近3个订单预览区域
- [ ] T029 [US3] 实现最近订单数据加载逻辑(调用 getRecentOrders API,限制3条)
- [ ] T030 [US3] 复用 OrderCard 组件展示最近订单(显示订单号、商品图片、订单状态)
- [ ] T031 [US3] 实现订单卡片点击跳转到订单详情页逻辑

**Checkpoint**: 此时用户故事1、2、3应都可独立功能化

---

## Phase 6: User Story 4 - 用户信息展示与基础操作 (Priority: P2)

**Goal**: 用户在个人中心顶部看到自己的基本信息(头像、昵称、会员等级),并能点击进入个人资料编辑页面

**Independent Test**: 登录测试账号,验证个人中心顶部正确显示用户头像、昵称和会员信息,点击头像能进入资料编辑页

### Implementation for User Story 4

- [ ] T032 [P] [US4] 创建用户信息卡片组件 `src/components/UserInfoCard/index.tsx`
- [ ] T033 [P] [US4] 创建用户信息卡片样式 `src/components/UserInfoCard/index.less`
- [ ] T034 [US4] 在个人中心页面顶部集成 UserInfoCard 组件
- [ ] T035 [US4] 从 UserContext 获取用户信息并传递给 UserInfoCard
- [ ] T036 [US4] 实现用户信息点击跳转到资料编辑页逻辑
- [ ] T037 [US4] 添加未登录状态处理(显示默认头像和"点击登录"文案)
- [ ] T038 [US4] 添加头像加载失败处理(显示默认占位图)
- [ ] T039 [US4] 显示会员等级图标和名称(根据 memberLevel 显示对应UI)

**Checkpoint**: 此时用户故事1-4应都可独立工作

---

## Phase 7: User Story 5 - 常用功能入口与设置 (Priority: P3)

**Goal**: 用户在个人中心访问常用功能(地址管理、客服联系、意见反馈、设置)

**Independent Test**: 访问个人中心,验证功能列表区域正确显示,点击每个入口跳转到对应页面或打开对应操作

### Implementation for User Story 5

- [ ] T040 [P] [US5] 创建功能列表项组件 `src/components/FunctionListItem/index.tsx`
- [ ] T041 [P] [US5] 创建功能列表项样式 `src/components/FunctionListItem/index.less`
- [ ] T042 [US5] 在个人中心页面底部添加功能列表区域
- [ ] T043 [US5] 定义功能列表配置数据(包含收货地址、联系客服、意见反馈、设置等)
- [ ] T044 [US5] 渲染功能列表项(使用 FunctionListItem 组件)
- [ ] T045 [US5] 实现功能项点击跳转逻辑(根据 url 或 action 处理)
- [ ] T046 [US5] 实现"联系客服"功能(打开客服对话或拨打电话)
- [ ] T047 [US5] 实现"设置"页面跳转(包含关于我们、隐私政策、退出登录等)
- [ ] T048 [US5] 实现"退出登录"功能(清除 UserContext 和 localStorage,返回个人中心显示未登录状态)

**Checkpoint**: 此时用户故事1-5应都可独立工作

---

## Phase 8: User Story 6 - 跑腿配送入口预留 (Priority: P3)

**Goal**: 为未来的跑腿配送功能预留UI入口,当前显示"即将上线"状态

**Independent Test**: 访问个人中心,验证跑腿配送占位入口显示,点击显示"即将上线"提示

### Implementation for User Story 6

- [ ] T049 [US6] 在功能列表配置中添加"跑腿配送"项(设置 comingSoon: true)
- [ ] T050 [US6] 实现"即将上线"标识样式(灰色或特殊样式)
- [ ] T051 [US6] 实现点击"跑腿配送"时显示"即将上线"提示弹窗

**Checkpoint**: 所有用户故事应都可独立功能化

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: 影响多个用户故事的改进

- [ ] T052 [P] 实现个人中心页面下拉刷新功能(使用 Taro usePullDownRefresh 钩子)
- [ ] T053 [P] 添加页面骨架屏加载状态(使用 NutUI Skeleton 组件)
- [ ] T054 [P] 实现图片懒加载(用户头像、商品图片使用 Taro Image 组件的 lazyLoad 属性)
- [ ] T055 [P] 添加性能优化(核销券卡片、订单卡片、功能列表项使用 React.memo)
- [ ] T056 [P] 添加事件处理器优化(点击事件使用 useCallback)
- [ ] T057 完善错误处理和友好提示(所有数据加载失败显示友好错误信息,覆盖FR-024的5个模块)
- [ ] T058 完善加载状态管理(避免数据请求冲突和状态错乱)
- [ ] T059 [P] 添加页面样式优化 `src/pages/mine/index.less` (BEM命名规范,8px间距倍数)
- [ ] T060 [P] 代码质量检查(TypeScript类型检查,ESLint检查,样式格式化)
- [ ] T061 验证 quickstart.md 中的功能清单(确保所有功能正常工作)
- [ ] T062 [P] 添加数据一致性验证(验证 VoucherStats 统计数字与实际券列表数量一致,满足FR-028要求)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 无依赖 - 可立即开始
- **Foundational (Phase 2)**: 依赖 Setup 完成 - 阻塞所有用户故事
- **User Stories (Phase 3-8)**: 所有用户故事依赖 Foundational 阶段完成
  - 用户故事可以并行进行(如果有多个开发者)
  - 或按优先级顺序执行(P1 → P2 → P3)
- **Polish (Phase 9)**: 依赖所有期望的用户故事完成

### User Story Dependencies

- **User Story 1 (P1)**: 可在 Foundational 完成后开始 - 不依赖其他故事
- **User Story 2 (P1)**: 可在 Foundational 完成后开始 - 复用 VoucherCard 组件(已存在)
- **User Story 3 (P2)**: 可在 Foundational 完成后开始 - 复用 OrderCard 组件(已存在)
- **User Story 4 (P2)**: 可在 Foundational 完成后开始 - 依赖 UserContext (Phase 2已完成)
- **User Story 5 (P3)**: 可在 Foundational 完成后开始 - 不依赖其他故事
- **User Story 6 (P3)**: 可在 Foundational 完成后开始 - 不依赖其他故事

### Within Each User Story

- 组件创建(tsx + less)可并行
- 数据加载逻辑依赖组件创建
- 交互逻辑依赖数据加载
- 错误处理和优化在核心实现之后

### Parallel Opportunities

- Phase 1 的所有任务 (T001-T005) 可并行执行
- Phase 2 的 T006-T007 可并行执行(T008依赖前两者)
- 一旦 Foundational 阶段完成,所有用户故事(Phase 3-8)可以并行开始(如果团队容量允许)
- 每个用户故事内部标记 [P] 的任务可并行执行
- Phase 9 的标记 [P] 的任务可并行执行

---

## Parallel Example: User Story 1

```bash
# 并行启动 User Story 1 的组件创建:
Task: "创建核销券统计卡片组件 src/components/VoucherStatsCard/index.tsx"
Task: "创建核销券统计卡片样式 src/components/VoucherStatsCard/index.less"
```

---

## Implementation Strategy

### MVP First (仅 User Story 1 + 2)

1. 完成 Phase 1: Setup
2. 完成 Phase 2: Foundational (关键 - 阻塞所有故事)
3. 完成 Phase 3: User Story 1 (核销券状态概览)
4. 完成 Phase 4: User Story 2 (最近核销券展示)
5. **STOP and VALIDATE**: 独立测试 User Story 1 和 2
6. 部署/演示(如果就绪)

### Incremental Delivery

1. 完成 Setup + Foundational → 基础设施就绪
2. 添加 User Story 1 + 2 → 独立测试 → 部署/演示(MVP!)
3. 添加 User Story 3 → 独立测试 → 部署/演示
4. 添加 User Story 4 → 独立测试 → 部署/演示
5. 添加 User Story 5 + 6 → 独立测试 → 部署/演示
6. 每个故事增加价值而不破坏之前的故事

### Parallel Team Strategy

多个开发者协作:

1. 团队一起完成 Setup + Foundational
2. Foundational 完成后:
   - 开发者 A: User Story 1 + 2 (核销券相关)
   - 开发者 B: User Story 3 (订单相关)
   - 开发者 C: User Story 4 (用户信息相关)
   - 开发者 D: User Story 5 + 6 (功能列表相关)
3. 故事独立完成和集成

---

## Notes

- [P] 任务 = 不同文件,无依赖关系
- [Story] 标签将任务映射到特定用户故事,便于追溯
- 每个用户故事应可独立完成和测试
- 在每个检查点停止以独立验证故事
- 每完成一个任务或逻辑组提交代码
- 避免:模糊任务、同文件冲突、破坏独立性的跨故事依赖

---

## Task Summary

**Total Tasks**: 62

**Tasks per User Story**:
- Setup: 5 tasks
- Foundational: 3 tasks
- User Story 1 (P1): 8 tasks
- User Story 2 (P1): 7 tasks
- User Story 3 (P2): 8 tasks
- User Story 4 (P2): 8 tasks
- User Story 5 (P3): 9 tasks
- User Story 6 (P3): 3 tasks
- Polish: 11 tasks

**Parallel Opportunities**: 22个任务可并行执行(标记为[P])

**Suggested MVP**: User Story 1 + 2 (核销券状态概览 + 最近核销券展示) = 核心价值

**Independent Test Criteria**: 每个用户故事都有明确的独立测试标准,可以独立验证功能
