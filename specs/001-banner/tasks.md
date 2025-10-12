# Tasks: 首页多级分类导航与商品展示交互设计

**Input**: 设计文档来自 `/specs/001-banner/`
**Prerequisites**: plan.md, spec.md (用户故事), data-model.md, contracts/, research.md, quickstart.md

**Tests**: 本项目暂不包含测试任务,采用手动测试验证功能

**Organization**: 任务按用户故事分组,每个故事可独立实现和测试

## Format: `[ID] [P?] [Story] Description`
- **[P]**: 可并行执行(不同文件,无依赖)
- **[Story]**: 任务所属用户故事(US1, US2, US3)
- 包含准确的文件路径

## 路径约定
- 单项目结构: `src/`, `specs/` 在仓库根目录
- Taro小程序项目: `src/pages/`, `src/components/`, `src/data/`, `src/types/`, `src/utils/`

---

## Phase 1: Setup (共享基础设施)

**目的**: 项目初始化和基础结构搭建

- [ ] T001 创建TypeScript类型定义目录结构 `src/types/`
- [ ] T002 [P] 创建工具函数目录 `src/utils/`
- [ ] T003 [P] 创建模拟数据目录 `src/data/` (已部分存在,需扩展)

---

## Phase 2: Foundational (阻塞性前置任务)

**目的**: 所有用户故事依赖的核心基础设施,必须在任何用户故事之前完成

**⚠️ 关键**: 此阶段未完成前,不能开始任何用户故事开发

- [ ] T004 [P] 定义Product产品类型接口 `src/types/product.ts` (包含id, name, price, originalPrice, categoryId, images, sales, rating, reviewCount, promotion, status等字段)
- [ ] T005 [P] 定义Category分类类型接口 `src/types/category.ts` (扩展现有类型,添加parentId, level, icon, cover, description, sort, visible, productCount, createTime, updateTime字段)
- [ ] T006 [P] 创建Banner轮播类型接口 `src/types/banner.ts` (id, imageUrl, title, linkType, linkValue)
- [ ] T007 创建商品模拟数据 `src/data/products.ts` (至少30个商品,覆盖6个分类,包含getFeaturedProducts和getProductsByCategory辅助函数)
- [ ] T008 扩展分类模拟数据 `src/data/categories.ts` (补充完整的分类信息,添加二级分类数据,修复重复的"糯米专区")
- [ ] T009 [P] 创建统一Mock服务 `src/utils/mock.ts` (实现mockGetBanners, mockGetCategories, mockGetFeaturedProducts, mockGetCategoryProducts, mockGetCategoryChildren, mockGetProductDetail等函数)
- [ ] T010 [P] 创建分类索引工具 `src/utils/categoryIndex.ts` (实现buildCategoryIndex, getCategoryPath, getAllDescendantIds函数,支持O(1)查找)
- [ ] T010a [P] 创建图片处理工具 `src/utils/imageHelper.ts` (图片URL处理、占位图生成、图片压缩等辅助函数)
- [ ] T010b [P] 创建数据辅助工具 `src/utils/dataHelper.ts` (数据过滤、排序、分组等辅助函数)

**Checkpoint**: 基础设施就绪 - 用户故事实现现在可以并行开始

---

## Phase 3: User Story 1 - 快速浏览热门商品 (Priority: P1) 🎯 MVP

**目标**: 用户打开首页后,立即看到推荐的热门大米商品,无需额外点击即可快速了解商品信息和价格

**独立测试**: 访问首页 → 查看商品卡片(图片、名称、价格、促销标签) → 点击商品卡片 → 进入商品详情页

### 实现任务 User Story 1

- [ ] T011 [P] [US1] 创建ProductCard商品卡片组件 `src/components/ProductCard/index.tsx` (包含商品图片、名称、价格、原价、促销标签、销量展示,支持onClick回调)
- [ ] T012 [P] [US1] 创建ProductCard样式文件 `src/components/ProductCard/index.less` (BEM命名规范,8px间距网格,响应式布局)
- [ ] T013 [P] [US1] 创建ProductList商品列表组件 `src/components/ProductList/index.tsx` (网格布局,接收products数组,渲染ProductCard,支持空状态)
- [ ] T014 [P] [US1] 创建ProductList样式文件 `src/components/ProductList/index.less` (2列网格布局,间距16px)
- [ ] T015 [US1] 在首页集成ProductList组件 `src/pages/index/index.tsx` (在ProductCategories下方添加,使用mockGetFeaturedProducts获取数据,初始展示12个商品)
- [ ] T016 [US1] 添加首页商品加载状态处理 `src/pages/index/index.tsx` (使用NutUI的Loading组件,添加骨架屏)
- [ ] T017 [P] [US1] 创建商品详情页面 `src/pages/product/index.tsx` (基础版本,展示商品完整信息,包含图片轮播、名称、价格、描述、规格参数)
- [ ] T018 [P] [US1] 创建商品详情页样式 `src/pages/product/index.less` (完整布局样式)
- [ ] T019 [P] [US1] 创建商品详情页配置 `src/pages/product/index.config.ts` (navigationBarTitleText: '商品详情')
- [ ] T020 [US1] 注册商品详情页路由 `src/app.config.ts` (添加 'pages/product/index' 到pages数组)
- [ ] T021 [US1] 实现ProductCard点击跳转 `src/components/ProductCard/index.tsx` (使用Taro.navigateTo跳转到商品详情页,传递productId参数)
- [ ] T022 [US1] 实现商品详情页数据加载 `src/pages/product/index.tsx` (使用mockGetProductDetail根据URL参数获取商品数据)

**Checkpoint**: 此时,用户故事1应完全可用且可独立测试(首页展示商品 → 点击查看详情)

---

## Phase 4: User Story 2 - 按分类浏览商品 (Priority: P1)

**目标**: 用户点击首页分类后,能够看到该分类下的所有商品,支持多级分类导航和面包屑

**分类层级说明**: MVP阶段(US2)实现到二级分类,三级分类支持将在Phase 5(US3)或P2阶段补充,分类索引工具(T010)已支持任意层级

**独立测试**: 点击首页分类 → 查看分类页商品列表 → 点击二级分类筛选 → 点击面包屑返回 → 验证完整分类导航

### 实现任务 User Story 2

- [ ] T023 [P] [US2] 创建Breadcrumb面包屑组件 `src/components/Breadcrumb/index.tsx` (接收路径数组,渲染可点击的分类路径,支持点击跳转)
- [ ] T024 [P] [US2] 创建Breadcrumb样式文件 `src/components/Breadcrumb/index.less` (横向布局,箭头分隔符,当前项高亮)
- [ ] T025 [P] [US2] 创建分类详情页面 `src/pages/category/index.tsx` (展示面包屑、子分类筛选栏、商品列表,支持分页加载)
- [ ] T026 [P] [US2] 创建分类详情页样式 `src/pages/category/index.less` (包含面包屑、筛选栏、商品列表布局)
- [ ] T027 [P] [US2] 创建分类详情页配置 `src/pages/category/index.config.ts` (navigationBarTitleText: '分类商品', enablePullDownRefresh: true)
- [ ] T028 [US2] 注册分类详情页路由 `src/app.config.ts` (添加 'pages/category/index' 到pages数组)
- [ ] T029 [US2] 实现ProductCategories点击跳转 `src/components/ProductCategories/index.tsx` (替换空TODO,使用Taro.navigateTo跳转到分类页,传递categoryId参数)
- [ ] T030 [US2] 实现分类页数据加载 `src/pages/category/index.tsx` (使用categoryIndex工具获取面包屑路径,使用mockGetCategoryChildren获取子分类,使用mockGetCategoryProducts获取商品列表)
- [ ] T031 [US2] 实现分类页子分类筛选 `src/pages/category/index.tsx` (点击子分类时更新商品列表,更新URL参数和面包屑)
- [ ] T032 [US2] 实现面包屑点击返回 `src/pages/category/index.tsx` (点击面包屑任意层级时,跳转到对应分类页面或首页)
- [ ] T033 [US2] 实现分类页分页加载 `src/pages/category/index.tsx` (使用ScrollView的onScrollToLower,加载更多商品,支持下拉刷新)
- [ ] T034 [P] [US2] 添加EmptyState空状态组件 `src/components/EmptyState/index.tsx` (当分类下无商品时展示,包含图标和引导文案)
- [ ] T035 [P] [US2] 创建EmptyState样式 `src/components/EmptyState/index.less`
- [ ] T036 [US2] 在分类页集成EmptyState `src/pages/category/index.tsx` (商品列表为空时显示)

**Checkpoint**: 此时,用户故事1和2应都可独立工作(分类导航 → 商品列表 → 多级筛选 → 面包屑返回)

---

## Phase 5: User Story 3 - 首页快速筛选和切换分类商品 (Priority: P2)

**目标**: 用户在首页点击分类标签,动态切换商品列表,无需页面跳转,提升浏览流畅度

**独立测试**: 在首页点击分类标签 → 观察商品列表动态刷新 → 再次点击取消选中 → 切换不同分类 → 点击"查看更多"跳转分类页

### 实现任务 User Story 3

- [ ] T037 [US3] 优化ProductCategories组件支持选中状态 `src/components/ProductCategories/index.tsx` (添加selectedCategoryId prop,渲染选中样式,支持点击切换)
- [ ] T038 [US3] 更新ProductCategories样式支持选中效果 `src/components/ProductCategories/index.less` (添加--selected修饰符样式,高亮边框或背景色)
- [ ] T039 [US3] 在首页实现分类切换逻辑 `src/pages/index/index.tsx` (添加selectedCategory状态,点击分类时更新商品列表,再次点击取消选中恢复精选商品)
- [ ] T040 [US3] 实现首页动态加载分类商品 `src/pages/index/index.tsx` (根据selectedCategory调用mockGetCategoryProducts或mockGetFeaturedProducts)
- [ ] T041 [US3] 添加"查看更多"跳转功能 `src/pages/index/index.tsx` (在商品列表底部添加按钮,点击跳转到分类详情页,如果有选中分类则跳转到该分类)
- [ ] T042 [US3] 优化首页分类切换时的加载状态 `src/pages/index/index.tsx` (切换分类时显示Loading,避免闪烁)

**Checkpoint**: 此时,所有用户故事应独立可用(首页动态筛选 + 分类页深度浏览 + 商品详情)

---

## Phase 6: Polish & 跨功能优化

**目的**: 影响多个用户故事的改进和优化

- [ ] T043 [P] 添加商品图片懒加载 `src/components/ProductCard/index.tsx` (使用Taro Image的lazyLoad属性)
- [ ] T044 [P] 添加图片加载失败处理 `src/components/ProductCard/index.tsx` (设置error占位图)
- [ ] T045 [P] 优化首页加载性能 `src/pages/index/index.tsx` (使用React.memo优化ProductList和ProductCard,添加useCallback优化事件处理)
- [ ] T046 [P] 添加网络错误处理 `src/utils/mock.ts` (所有mock函数添加错误处理,使用Taro.showToast提示用户)
- [ ] T047 [P] 为ProductCategories添加图标支持 `src/components/ProductCategories/index.tsx` (使用@nutui/icons-react-taro渲染分类图标,替换文本符号)
- [ ] T048 更新分类数据添加图标字段 `src/data/categories.ts` (为每个分类添加合适的NutUI图标名称)
- [ ] T049 [P] 代码清理和重构 (移除console.log,优化导入语句,统一命名规范)
- [ ] T050 [P] 更新API汇总文档 `specs/001-banner/API汇总.md` (确保与实际实现的mock函数一致)
- [ ] T051 运行quickstart.md验证 (按照quickstart.md步骤验证所有功能是否正常)
- [ ] T052 [P] 添加弱网环境处理 (3G网络下的骨架屏优化,超时重试机制)
- [ ] T053 [P] 添加快速点击防抖处理 `src/pages/index/index.tsx` (分类切换时防止重复请求)
- [ ] T054 [P] 实现浏览器返回状态保持 `src/pages/index/index.tsx` (使用Taro.eventCenter或本地存储保存首页选中状态)

---

## 依赖关系与执行顺序

### 阶段依赖

- **Setup (Phase 1)**: 无依赖 - 可立即开始
- **Foundational (Phase 2)**: 依赖Setup完成 - 阻塞所有用户故事
- **User Stories (Phase 3-5)**: 全部依赖Foundational阶段完成
  - 用户故事可以并行进行(如果有多人协作)
  - 或按优先级顺序执行 (P1 → P1 → P2)
- **Polish (Phase 6)**: 依赖所需的用户故事完成

### 用户故事依赖

- **User Story 1 (P1)**: Foundational完成后即可开始 - 无其他故事依赖
- **User Story 2 (P1)**: Foundational完成后即可开始 - 需复用US1的ProductList和ProductCard组件
- **User Story 3 (P2)**: Foundational完成后即可开始 - 需US1的首页结构,可与US2并行

### 每个用户故事内部

- 组件先于页面(先有ProductCard再集成到首页)
- 路由配置先于页面跳转逻辑
- 基础展示先于交互优化
- 故事完成后再进入下一优先级

### 并行执行机会

- Setup阶段所有标记[P]的任务可并行
- Foundational阶段所有标记[P]的任务可并行(在Phase 2内)
- Foundational完成后,所有用户故事可并行开始(如果团队容量允许)
- 每个故事内,标记[P]的任务可并行
- 不同用户故事可由不同团队成员并行开发

---

## 并行示例: User Story 1

```bash
# 同时启动User Story 1的所有组件创建任务:
Task: "创建ProductCard商品卡片组件 src/components/ProductCard/index.tsx"
Task: "创建ProductCard样式文件 src/components/ProductCard/index.less"
Task: "创建ProductList商品列表组件 src/components/ProductList/index.tsx"
Task: "创建ProductList样式文件 src/components/ProductList/index.less"

# 同时启动商品详情页相关任务:
Task: "创建商品详情页面 src/pages/product/index.tsx"
Task: "创建商品详情页样式 src/pages/product/index.less"
Task: "创建商品详情页配置 src/pages/product/index.config.ts"
```

---

## 实施策略

### MVP优先(仅User Story 1)

1. 完成 Phase 1: Setup
2. 完成 Phase 2: Foundational (关键 - 阻塞所有故事)
3. 完成 Phase 3: User Story 1
4. **停止并验证**: 独立测试User Story 1
5. 如果就绪则部署/演示

### 增量交付

1. 完成Setup + Foundational → 基础就绪
2. 添加User Story 1 → 独立测试 → 部署/演示(MVP!)
3. 添加User Story 2 → 独立测试 → 部署/演示
4. 添加User Story 3 → 独立测试 → 部署/演示
5. 每个故事增加价值而不破坏已有故事

### 并行团队策略

多开发者情况:

1. 团队共同完成Setup + Foundational
2. Foundational完成后:
   - 开发者A: User Story 1
   - 开发者B: User Story 2
   - 开发者C: User Story 3(或等待US1完成后复用组件)
3. 故事独立完成并集成

---

## 注意事项

- [P] 任务 = 不同文件,无依赖,可并行
- [Story] 标签将任务映射到特定用户故事,便于追溯
- 每个用户故事应可独立完成和测试
- 每个任务或逻辑分组后提交代码
- 在任何检查点停止以独立验证故事
- 避免: 模糊任务、同文件冲突、破坏独立性的跨故事依赖

---

## 任务统计

- **总任务数**: 56个任务
- **User Story 1**: 12个任务 (T011-T022)
- **User Story 2**: 14个任务 (T023-T036)
- **User Story 3**: 6个任务 (T037-T042)
- **Setup + Foundational**: 12个任务 (T001-T010b)
- **Polish**: 12个任务 (T043-T054)
- **并行机会**: 约35个任务标记[P]可并行执行
- **MVP范围建议**: Phase 1 + Phase 2 + Phase 3 (User Story 1) = 共24个任务
