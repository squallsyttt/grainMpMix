# Tasks: 首页商品分类多级展示优化

**Input**: 设计文档来自 `/specs/006-code-1-msg/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: MVP阶段手动测试,不包含自动化测试任务

**Organization**: 任务按用户故事分组,实现每个故事的独立性和可测试性

## Format: `[ID] [P?] [Story] Description`
- **[P]**: 可并行执行(不同文件,无依赖)
- **[Story]**: 任务所属用户故事(如US1、US2、US3、US4)
- 包含精确文件路径

## 路径约定
- Taro单项目移动端架构
- 源码根目录: `src/`
- 项目根目录: `/Users/griffith/IdeaProjects/money/grainMpMix/`

---

## Phase 1: Setup (共享基础设施)

**目的**: 项目初始化和基础结构搭建

- [ ] T001 [P] 在 `src/app.config.ts` 中注册新页面路由(category-nav, product-list)
- [ ] T002 [P] 创建项目目录结构(按plan.md定义的components、pages、utils、services目录)
- [ ] T003 在 `src/services/request.ts` 中验证现有HTTP请求封装是否支持分类API(无需Token)

---

## Phase 2: Foundational (阻塞性前置任务)

**目的**: 所有用户故事依赖的核心基础设施,必须先完成

**⚠️ 关键**: 在此阶段完成前,无法开始任何用户故事工作

- [ ] T004 创建 `src/types/category.ts` - 定义CategoryTreeNode、CategoryIndex、CategoryUINode、CategoryPathItem、CategoryFilter等核心类型
- [ ] T005 [P] 创建 `src/utils/categoryTree.ts` - 实现buildCategoryIndex、getCategoryPath、getDescendants工具函数
- [ ] T006 [P] 创建 `src/services/category.ts` - 封装fetchCategoryTree API请求,使用现有request.ts
- [ ] T007 [P] 创建 `src/hooks/useCategories.ts` - 实现分类数据获取和状态管理的自定义Hook
- [ ] T008 [P] 创建 `src/utils/imageUrl.ts` - 实现图片相对路径拼接为完整URL的工具函数
- [ ] T009 创建 `src/constants/category.ts` - 定义MAX_DEPTH=4、HOME_DISPLAY_COUNT=6等常量

**Checkpoint**: 基础设施就绪 - 用户故事实现现在可以并行开始

---

## Phase 3: User Story 1 - 首页浏览一级分类 (Priority: P1) 🎯 MVP

**目标**: 用户打开首页时,能够快速浏览所有一级商品分类,每个分类显示名称、图标和商品数量。分类以网格形式展示,易于点击查看详情。

**独立测试**: 用户访问首页,可以看到完整的一级分类网格,点击任意分类能够跳转到对应的分类详情页,展示该分类下的所有商品。

### 实现User Story 1

- [ ] T010 [US1] 改造 `src/components/ProductCategories/index.tsx` - 使用useCategories Hook获取分类数据
- [ ] T011 [US1] 在 `src/components/ProductCategories/index.tsx` 中实现一级分类网格展示(使用NutUI Grid组件)
- [ ] T012 [US1] 在 `src/components/ProductCategories/index.tsx` 中显示子分类数量标识(如果childlist.length > 0)
- [ ] T013 [US1] 在 `src/components/ProductCategories/index.tsx` 中添加分类点击事件(跳转到商品列表页,传递categoryId和name参数)
- [ ] T014 [US1] 改造 `src/components/ProductCategories/index.less` - 使用BEM命名、8px间距倍数、Grid布局样式
- [ ] T015 [US1] 在 `src/components/ProductCategories/index.tsx` 中添加空状态处理(数据为空时显示提示)
- [ ] T016 [US1] 在 `src/components/ProductCategories/index.tsx` 中添加加载失败处理(显示错误提示和重试按钮)
- [ ] T017 [US1] 使用React.memo优化 `src/components/ProductCategories/index.tsx` 中的分类卡片组件

**Checkpoint**: 此时User Story 1应该完全功能正常,可独立测试

**手动测试验收标准**:
1. 打开首页,查看"产品分类"区块是否显示所有一级分类(精米、碎米、香米、新米等)
2. 验证有子分类的分类是否显示子分类数量标识(如"4个子分类")
3. 点击任意分类,验证是否跳转到商品列表页并传递正确参数

---

## Phase 4: User Story 2 - 查看二级子分类列表 (Priority: P2)

**目标**: 用户点击有子分类的一级分类后,能够看到该分类的所有二级子分类列表,每个子分类同样显示名称、图标和商品数量。用户可以选择查看整个一级分类的商品,或进一步选择某个二级子分类的商品。

**独立测试**: 用户从首页点击"香米"分类,进入分类详情页,可以看到"东北五常精品"等子分类列表,点击子分类能够筛选显示该子分类的商品。

### 实现User Story 2

- [ ] T018 [P] [US2] 创建 `src/components/CategoryNavBar/index.tsx` - 二级分类水平滚动导航组件
- [ ] T019 [P] [US2] 创建 `src/components/CategoryNavBar/index.less` - 导航栏样式(BEM命名、水平滚动、选中状态)
- [ ] T020 [US2] 创建 `src/pages/product-list/index.tsx` - 商品列表页主组件
- [ ] T021 [US2] 创建 `src/pages/product-list/index.config.ts` - 页面配置(navigationBarTitleText: '商品列表')
- [ ] T022 [US2] 在 `src/pages/product-list/index.tsx` 中实现URL参数获取(categoryId、name)
- [ ] T023 [US2] 在 `src/pages/product-list/index.tsx` 中使用CategoryNavBar组件展示二级子分类导航
- [ ] T024 [US2] 在 `src/pages/product-list/index.tsx` 中实现子分类切换逻辑(点击"全部"显示一级分类所有商品)
- [ ] T025 [US2] 在 `src/pages/product-list/index.tsx` 中使用getDescendants获取分类及子孙分类ID用于商品筛选
- [ ] T026 [US2] 创建 `src/pages/product-list/index.less` - 商品列表页样式
- [ ] T027 [US2] 在 `src/pages/product-list/index.tsx` 中添加空商品列表状态处理

**Checkpoint**: 此时User Story 1和2应该都独立工作正常

**手动测试验收标准**:
1. 从首页点击"香米"分类,验证是否进入商品列表页
2. 验证页面顶部是否显示子分类导航栏,包含"全部"和所有二级子分类(如"东北五常精品")
3. 点击某个二级子分类,验证商品列表是否只显示该子分类商品
4. 点击"全部",验证商品列表是否显示一级分类下的所有商品

---

## Phase 5: User Story 3 - 展开多级分类树 (Priority: P3)

**目标**: 对于包含三级、四级子分类的复杂分类结构,用户可以通过展开/收起操作逐层查看分类树。每次展开显示下一级子分类,保持界面整洁不拥挤。

**独立测试**: 当后端添加三级分类数据(如"香米 > 东北五常精品 > 5kg装")后,用户在分类页面可以通过点击箭头图标逐层展开查看,最终定位到三级分类的商品。

### 实现User Story 3

- [ ] T028 [P] [US3] 创建 `src/components/CategoryTree/types.ts` - CategoryTree组件的Props和State类型定义
- [ ] T029 [P] [US3] 创建 `src/components/CategoryTree/index.tsx` - 可展开/收起的分类树组件
- [ ] T030 [P] [US3] 创建 `src/components/CategoryTree/index.less` - 分类树样式(BEM命名、层级缩进、展开动画)
- [ ] T031 [US3] 在 `src/components/CategoryTree/index.tsx` 中使用NutUI Collapse组件实现展开/收起
- [ ] T032 [US3] 在 `src/components/CategoryTree/index.tsx` 中使用ArrowDown/ArrowRight图标(from @nutui/icons-react-taro)
- [ ] T033 [US3] 在 `src/components/CategoryTree/index.tsx` 中限制最大展示深度为4层(使用MAX_DEPTH常量)
- [ ] T034 [US3] 在 `src/components/CategoryTree/index.tsx` 中实现分类节点点击跳转到商品列表页
- [ ] T035 [US3] 使用React.memo和useCallback优化 `src/components/CategoryTree/index.tsx` 性能
- [ ] T036 [US3] 在分类导航页中集成CategoryTree组件(修改 `src/pages/category-nav/index.tsx`)

**Checkpoint**: 所有用户故事应该现在独立功能正常

**手动测试验收标准**:
1. 进入分类导航页,验证是否显示完整的分类树(所有一级分类)
2. 点击某个有子分类的一级分类的展开图标,验证是否显示其子分类
3. 点击展开的二级分类,验证是否显示其三级子分类(如果有)
4. 验证第4层分类不再显示展开图标(限制深度)
5. 点击任意层级的分类,验证是否跳转到商品列表页

---

## Phase 6: User Story 4 - 首页分类"查看更多"功能 (Priority: P2)

**目标**: 当一级分类数量超过首页默认展示数量(如6个)时,用户可以点击"查看更多"按钮查看完整的分类列表。点击后跳转到专门的分类导航页面,展示所有一级分类及其子分类的树形结构。

**独立测试**: 当系统有超过6个一级分类时,首页只显示前6个,并显示"查看更多"按钮。点击后进入分类导航页,用户可以浏览所有分类并选择进入。

### 实现User Story 4

- [ ] T037 [US4] 创建 `src/pages/category-nav/index.tsx` - 分类导航页主组件
- [ ] T038 [US4] 创建 `src/pages/category-nav/index.config.ts` - 页面配置(navigationBarTitleText: '全部分类')
- [ ] T039 [US4] 在 `src/pages/category-nav/index.tsx` 中使用CategoryTree组件展示完整分类树
- [ ] T040 [US4] 在 `src/pages/category-nav/index.tsx` 中使用useCategories Hook获取分类数据
- [ ] T041 [US4] 创建 `src/pages/category-nav/index.less` - 分类导航页样式
- [ ] T042 [US4] 在 `src/components/ProductCategories/index.tsx` 中添加"查看更多"按钮(当分类数量>6时显示)
- [ ] T043 [US4] 在 `src/components/ProductCategories/index.tsx` 中实现"查看更多"按钮点击跳转到分类导航页
- [ ] T044 [US4] 在 `src/components/ProductCategories/index.tsx` 中限制首页只显示前6个一级分类(使用HOME_DISPLAY_COUNT常量)

**Checkpoint**: 所有用户故事完整实现,可独立测试

**手动测试验收标准**:
1. 在首页查看分类数量,如果>6个,验证是否显示"查看更多"按钮
2. 点击"查看更多"按钮,验证是否跳转到分类导航页
3. 在分类导航页验证是否显示所有一级分类的网格列表
4. 点击某个一级分类,验证是否展开显示其子分类
5. 点击任意层级分类,验证是否跳转到商品列表页

---

## Phase 7: Polish & Cross-Cutting Concerns

**目的**: 影响多个用户故事的改进和优化

- [ ] T045 [P] 在所有分类相关组件中添加JSDoc注释(复杂函数和组件)
- [ ] T046 [P] 代码质量检查 - 确保所有组件遵循文件结构顺序(类型→常量→组件→导出)
- [ ] T047 [P] 性能优化验证 - 确保所有图片使用懒加载、所有事件使用useCallback
- [ ] T048 边界情况处理 - 验证所有Edge Cases都已实现(空数据、加载失败、图片失败、深度限制等)
- [ ] T049 样式规范检查 - 验证所有LESS文件遵循BEM命名、8px间距倍数
- [ ] T050 运行quickstart.md中的5分钟体验流程,验证功能完整性

---

## Dependencies & Execution Order

### Phase 依赖关系

- **Setup (Phase 1)**: 无依赖 - 可立即开始
- **Foundational (Phase 2)**: 依赖Setup完成 - **阻塞所有用户故事**
- **User Stories (Phase 3-6)**: 所有依赖Foundational阶段完成
  - 用户故事可以并行进行(如果有足够人力)
  - 或按优先级顺序进行(P1 → P2 → P3)
- **Polish (Phase 7)**: 依赖所有期望的用户故事完成

### User Story 依赖关系

- **User Story 1 (P1)**: 可在Foundational完成后开始 - 不依赖其他故事
- **User Story 2 (P2)**: 可在Foundational完成后开始 - 独立可测,但会使用US1的首页入口
- **User Story 3 (P3)**: 可在Foundational完成后开始 - 独立组件,可独立测试
- **User Story 4 (P2)**: 依赖US3完成(需要CategoryTree组件) - 但也可独立测试

### 每个User Story内部

- 基础实现 → UI组件 → 页面集成 → 样式优化 → 边界处理
- 标记[P]的任务可并行执行
- 故事完成后再进入下一个优先级

### 并行机会

- Phase 1中所有标记[P]的任务可并行
- Phase 2中所有标记[P]的任务可并行
- Phase 2完成后,如果团队有多人,可以:
  - Developer A: US1 (T010-T017)
  - Developer B: US2 (T018-T027)
  - Developer C: US3 (T028-T036)
- Phase 7中所有标记[P]的任务可并行

---

## Parallel Example: Foundational Phase

```bash
# 同时启动Foundational阶段的所有并行任务:
Task: "创建 src/types/category.ts - 定义核心类型"
Task: "创建 src/utils/categoryTree.ts - 实现工具函数"
Task: "创建 src/services/category.ts - 封装API请求"
Task: "创建 src/hooks/useCategories.ts - 实现自定义Hook"
Task: "创建 src/utils/imageUrl.ts - 图片URL工具"
```

---

## Parallel Example: User Story 1

```bash
# US1的改造工作(依赖Foundational完成后):
Task: "改造 ProductCategories/index.tsx - 使用useCategories Hook"
Task: "实现一级分类网格展示"
Task: "添加子分类数量标识"
Task: "添加分类点击事件"
```

---

## Implementation Strategy

### MVP First (仅User Story 1)

1. 完成Phase 1: Setup
2. 完成Phase 2: Foundational (**关键** - 阻塞所有故事)
3. 完成Phase 3: User Story 1
4. **停止并验证**: 独立测试User Story 1
5. 如果就绪则部署/演示

### 增量交付

1. 完成Setup + Foundational → 基础就绪
2. 添加User Story 1 → 独立测试 → 部署/演示 (**MVP!**)
3. 添加User Story 4 → 独立测试 → 部署/演示(查看更多功能)
4. 添加User Story 2 → 独立测试 → 部署/演示(二级分类导航)
5. 添加User Story 3 → 独立测试 → 部署/演示(多级树形展开)
6. 每个故事增加价值而不破坏之前的故事

**推荐MVP范围**: User Story 1 + Foundational (17个任务)

### 并行团队策略

如果有多个开发人员:

1. 团队一起完成Setup + Foundational
2. Foundational完成后:
   - Developer A: User Story 1 (首页分类展示)
   - Developer B: User Story 4 (分类导航页骨架)
   - Developer C: User Story 3 (CategoryTree组件)
3. 然后:
   - Developer A: User Story 2 (商品列表页)
4. 故事独立完成和集成

---

## Notes

- **[P]任务** = 不同文件,无依赖,可并行
- **[Story]标签** = 将任务映射到特定用户故事,便于追溯
- 每个用户故事应该可独立完成和测试
- 在每个checkpoint停止以独立验证故事
- 提交: 每个任务或逻辑组完成后提交
- 避免: 模糊任务、同文件冲突、破坏独立性的跨故事依赖
- Git提交规范: 使用Conventional Commits格式,如`feat(category): 实现一级分类网格展示`

---

## Summary

- **总任务数**: 50个任务
- **MVP范围**: Phase 1-3 (17个任务 - Setup + Foundational + US1)
- **并行机会**:
  - Phase 2: 5个并行任务
  - 多个User Story可并行开发(如果有足够人力)
  - Phase 7: 3个并行任务
- **独立测试标准**: 每个User Story有明确的验收标准
- **建议优先级**: P1(US1) → P2(US4+US2) → P3(US3)

**关键路径**: Setup → Foundational → User Story 1 → 其他故事可并行或按优先级

**估算工作量** (单人开发,每个任务约30-60分钟):
- MVP (US1): 约8-17小时
- 完整功能 (所有US): 约25-50小时
