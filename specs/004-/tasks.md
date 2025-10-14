# Tasks: 地区化购物车功能完善

**Feature Branch**: `004-`
**Input**: Design documents from `/specs/004-/`
**Prerequisites**: plan.md, spec.md, data-model.md, research.md, quickstart.md

**Tests**: 本项目不包含自动化测试任务(仅手动测试)

**Organization**: 任务按用户故事分组,支持每个故事的独立实现和测试

## Format: `[ID] [P?] [Story] Description`
- **[P]**: 可并行执行(不同文件,无依赖)
- **[Story]**: 用户故事标识(US1, US2, US3等)
- 包含精确的文件路径

## Path Conventions
- **Single project**: `src/`在项目根目录
- **Taro项目结构**: `src/pages/`, `src/contexts/`, `src/types/`, `src/custom-tab-bar/`

---

## Phase 1: Setup (共享基础设施)

**Purpose**: 项目初始化和类型定义完善

- [ ] T001 [P] [Setup] 完善购物车类型定义: 在`src/types/cart.ts`中添加完整的类型定义和辅助函数(参考data-model.md附录的完整类型定义文件)
  - 添加`loadCartFromStorage()`和`saveCartToStorage()`函数,实现localStorage错误降级处理
  - 添加`calculateCartStats()`函数,精确计算购物车统计信息(精确到分)
  - 添加`getTotalItemCount()`函数,计算所有地区商品总数(用于TabBar徽标)
  - 添加`isValidRegionKey()`、`canIncrease()`、`canDecrease()`、`isOffShelf()`等辅助函数
  - 添加`formatAmount()`和`formatUnitPrice()`格式化函数
  - 确保所有函数有明确的返回类型和JSDoc注释

- [ ] T002 [P] [Setup] 验证TypeScript类型安全: 运行`npx tsc --noEmit`确保类型定义无错误

---

## Phase 2: Foundational (阻塞性前置任务)

**Purpose**: 核心基础设施,必须在任何用户故事实现之前完成

**⚠️ CRITICAL**: Phase 2完成前,不能开始任何用户故事的实现

- [ ] T003 [Foundational] 增强CartContext的localStorage操作: 在`src/contexts/CartContext.tsx`中
  - 替换现有的localStorage读取逻辑,使用`loadCartFromStorage()`安全读取
  - 在所有修改购物车的操作后调用`saveCartToStorage()`安全保存
  - 处理localStorage配额超限的情况(清理7天前的购物车项)
  - 确保数据解析失败时初始化为空购物车(FR-023)

- [ ] T004 [P] [Foundational] 添加防抖工具函数(可选): 在`src/utils/debounce.ts`中创建防抖函数,或直接使用lodash的debounce(参考research.md Topic 1)

**Checkpoint**: 基础设施就绪 - 用户故事实现现在可以并行开始

---

## Phase 3: User Story 1 - 查看当前地区购物车 (Priority: P1) 🎯 MVP

**Goal**: 用户能够查看当前地区的所有购物车商品,包括商品图片、名称、单价、数量、小计金额和统计信息

**Independent Test**: 在"江苏省-南京市"添加3种不同商品,切换到该地区,访问购物车页面,验证是否正确显示商品列表和统计信息(商品种类3种、数量8件、合计金额准确)

### Implementation for User Story 1

- [ ] T005 [P] [US1] 实现商品卡片显示组件: 在`src/pages/cart/index.tsx`中
  - 从CartContext获取当前地区购物车数据(`currentRegionCart`)
  - 遍历`currentRegionCart`渲染商品卡片
  - 每个卡片显示:商品图片(`item.product.image`)、名称(`item.product.name`)、单价(`formatUnitPrice(item.product)`)、数量(`item.quantity`)、小计(`formatAmount(getSubtotal(item))`)
  - 使用NutUI组件(如`<Image>`、`<View>`等)
  - 确保类型安全(所有变量有明确类型)

- [ ] T006 [P] [US1] 实现购物车统计信息显示: 在`src/pages/cart/index.tsx`中
  - 使用`useMemo`计算购物车统计信息:`const stats = useMemo(() => calculateCartStats(currentRegionCart), [currentRegionCart])`
  - 在页面底部显示统计信息:商品种类数(`stats.itemCount`)、商品总数量(`stats.totalItems`)、总金额(`formatAmount(stats.totalAmount)`)
  - 确保更新延迟<100ms(SC-005)

- [ ] T007 [P] [US1] 实现空状态显示: 在`src/pages/cart/index.tsx`中
  - 当`currentRegionCart.length === 0`时显示空状态
  - 使用NutUI的`<Empty>`组件显示空状态插画
  - 显示提示文字:"购物车是空的,去添加一些商品吧~"
  - 显示当前地区信息:`currentRegionKey`(来自RegionContext)
  - 添加空状态样式(FR-009)

- [ ] T008 [P] [US1] 添加购物车页面样式: 在`src/pages/cart/index.less`中
  - 使用BEM命名规范(如`.cart-page__item-list`、`.cart-page__stats`)
  - 商品卡片布局:图片左对齐,商品信息右侧显示
  - 统计信息固定在底部
  - 间距使用8px倍数
  - 确保滚动帧率>50fps(SC-012)

- [ ] T009 [US1] 集成RegionBar组件显示当前地区: 在`src/pages/cart/index.tsx`中
  - 在页面顶部导入并使用现有的`RegionBar`组件
  - 确保RegionBar显示当前地区(province + city)
  - 确保符合FR-001要求

**Checkpoint**: User Story 1完成 - 用户可以查看当前地区购物车商品和统计信息

---

## Phase 4: User Story 2 - 修改商品数量与删除 (Priority: P1)

**Goal**: 用户能够灵活调整商品数量(+/-按钮)或删除商品,实时更新小计和总计金额

**Independent Test**: 在购物车添加商品,验证点击"+"增加数量、"-"减少数量(最小为1)、删除按钮移除商品,金额实时更新正确

### Implementation for User Story 2

- [ ] T010 [P] [US2] 实现防抖处理的数量增加功能: 在`src/contexts/CartContext.tsx`中
  - 添加`handleIncrease`函数,接收`productId: string`参数
  - 使用`useMemo` + `debounce`防抖处理(300ms延迟,参考research.md Topic 1)
  - 检查`canIncrease(item)`:如果数量<库存且<999则允许增加
  - 如果超过库存,调用`Taro.showToast`显示"库存不足,当前最多可购买X件"(FR-018)
  - 更新购物车数据并调用`saveCartToStorage`
  - 确保有明确的返回类型和错误处理

- [ ] T011 [P] [US2] 实现防抖处理的数量减少功能: 在`src/contexts/CartContext.tsx`中
  - 添加`handleDecrease`函数,接收`productId: string`参数
  - 使用`useMemo` + `debounce`防抖处理(300ms延迟)
  - 检查`canDecrease(item)`:如果数量>1则允许减少
  - 如果数量=1,不执行操作(最小数量为1,FR-005)
  - 更新购物车数据并调用`saveCartToStorage`

- [ ] T012 [P] [US2] 实现删除商品功能: 在`src/contexts/CartContext.tsx`中
  - 添加`handleRemove`函数,接收`productId: string`参数
  - 从当前地区购物车中移除该商品
  - 更新`RegionalCart`并调用`saveCartToStorage`
  - 如果删除后购物车为空,确保显示空状态(FR-009)

- [ ] T013 [US2] 在商品卡片中添加数量控制器: 在`src/pages/cart/index.tsx`中
  - 添加"+"按钮,点击时调用`CartContext.handleIncrease(item.product.id)`
  - 添加"-"按钮,点击时调用`CartContext.handleDecrease(item.product.id)`
  - 显示当前数量:`item.quantity`
  - 使用NutUI的`Button`组件或自定义样式
  - 确保按钮禁用状态正确(数量=1时"-"禁用,数量>=库存或=999时"+"禁用)

- [ ] T014 [US2] 在商品卡片中添加删除按钮: 在`src/pages/cart/index.tsx`中
  - 添加删除按钮(垃圾桶图标),使用`@nutui/icons-react-taro`的`Del`图标
  - 点击时调用`CartContext.handleRemove(item.product.id)`
  - 确保符合FR-006要求

- [ ] T015 [P] [US2] 添加数量控制器样式: 在`src/pages/cart/index.less`中
  - 使用BEM命名(如`.cart-item__quantity-controller`)
  - "+"和"-"按钮样式:圆形按钮,点击效果
  - 数量显示居中
  - 删除按钮样式:右上角或右侧显示

**Checkpoint**: User Story 2完成 - 用户可以调整商品数量和删除商品,金额实时更新

---

## Phase 5: User Story 3 - 地区切换时的购物车隔离 (Priority: P1)

**Goal**: 用户切换地区时,购物车立即刷新显示对应地区的内容,实现地区级别的购物车隔离

**Independent Test**: 在"江苏省-南京市"添加大米,切换到"浙江省-杭州市"添加面粉,再分别切换回两个地区,验证购物车内容正确隔离

### Implementation for User Story 3

- [ ] T016 [US3] 实现地区切换监听: 在`src/pages/cart/index.tsx`中
  - 从`RegionContext`获取`province`和`city`
  - 使用`useMemo`计算`currentRegionKey = getRegionKey(province, city)`
  - 使用`useEffect`监听`currentRegionKey`变化
  - 地区变化时,从`RegionalCart`中提取新地区的购物车数据
  - 确保刷新响应时间<500ms(SC-004)

- [ ] T017 [US3] 确保地区切换时页面实时更新: 在`src/pages/cart/index.tsx`中
  - 确保`currentCart`状态与`currentRegionKey`同步
  - 验证切换地区时购物车商品列表立即刷新
  - 验证统计信息同步更新
  - 确保符合FR-012要求

**Checkpoint**: User Story 3完成 - 地区切换时购物车正确隔离并实时刷新

---

## Phase 6: User Story 5 - 去结算与订单生成 (Priority: P1)

**Goal**: 用户点击"去结算"按钮,检查登录状态,跳转到订单确认页面(携带商品列表和地区信息)

**Independent Test**: 在购物车添加商品,点击"去结算"按钮,验证登录状态检查和正确跳转到订单确认页面(携带地区键参数)

### Implementation for User Story 5

- [ ] T018 [P] [US5] 实现"去结算"按钮UI: 在`src/pages/cart/index.tsx`中
  - 在页面底部添加"去结算"按钮(使用NutUI的`<Button>`组件)
  - 按钮显示:"去结算"或"去结算(共X件)"
  - 当购物车为空时,按钮显示禁用状态(`disabled={currentCart.length === 0}`)(FR-008)
  - 确保符合FR-010要求

- [ ] T019 [US5] 实现结算逻辑和登录状态检查: 在`src/pages/cart/index.tsx`中
  - 添加`handleCheckout`函数
  - 从`UserContext`获取`userInfo`判断登录状态
  - 如果未登录(`!userInfo`),调用`Taro.navigateTo`跳转到登录页面,并传递`redirect`参数:`/pages/login/index?redirect=/pages/order-confirm/index`(FR-011)
  - 如果已登录,调用`Taro.navigateTo`跳转到订单确认页面,携带地区键参数:`/pages/order-confirm/index?regionKey=${encodeURIComponent(currentRegionKey)}`
  - 确保符合FR-011要求

- [ ] T020 [P] [US5] 添加"去结算"按钮样式: 在`src/pages/cart/index.less`中
  - 使用BEM命名(如`.cart-page__checkout-button`)
  - 固定在底部,与统计信息同行或单独一行
  - 按钮样式:主题色背景,白色文字
  - 禁用状态样式:灰色背景

**Checkpoint**: User Story 5完成 - 用户可以点击"去结算"跳转到订单确认页面(购物车功能的核心闭环完成)

---

## Phase 7: User Story 4 - 清空购物车功能 (Priority: P2)

**Goal**: 用户可以快速清空当前地区的所有购物车商品,提供二次确认对话框防止误操作

**Independent Test**: 在购物车添加5种商品,点击"清空购物车"按钮,验证弹出确认对话框,确认后清空购物车

### Implementation for User Story 4

- [ ] T021 [US4] 实现清空购物车逻辑: 在`src/contexts/CartContext.tsx`中
  - 添加`handleClearCart`函数,接收`regionKey: RegionKey`参数
  - 使用NutUI的`Dialog.confirm`显示二次确认对话框(参考research.md Topic 3)
  - 对话框标题:"清空购物车"
  - 对话框内容:"确定清空当前地区的购物车吗?此操作不可恢复"
  - 用户点击"确定"后,调用`clearRegionCart(regionalCart, regionKey)`清空当前地区购物车
  - 更新`RegionalCart`并调用`saveCartToStorage`
  - 显示Toast提示:"购物车已清空"(FR-007)

- [ ] T022 [US4] 在购物车页面添加"清空购物车"按钮: 在`src/pages/cart/index.tsx`中
  - 在页面顶部或底部添加"清空购物车"按钮(使用NutUI的`<Button>`组件)
  - 按钮类型:`type="default"`,尺寸:`size="small"`
  - 当购物车为空时,按钮显示禁用状态(`disabled={currentCart.length === 0}`)(FR-008)
  - 点击时调用`CartContext.handleClearCart(currentRegionKey)`

- [ ] T023 [P] [US4] 添加"清空购物车"按钮样式: 在`src/pages/cart/index.less`中
  - 使用BEM命名(如`.cart-page__clear-button`)
  - 按钮样式:次要按钮样式,灰色边框
  - 禁用状态样式:灰色文字

**Checkpoint**: User Story 4完成 - 用户可以快速清空购物车,有二次确认保护

---

## Phase 8: User Story 7 - 购物车前端缓存持久化 (Priority: P2)

**Goal**: 购物车数据通过localStorage持久化保存,小程序重启后数据保留(已在Phase 2 Foundational中实现大部分)

**Independent Test**: 在购物车添加商品,关闭小程序,断网后重新打开,验证购物车商品仍然保留(无需网络请求)

### Implementation for User Story 7

- [ ] T024 [US7] 验证localStorage持久化功能: 在`src/contexts/CartContext.tsx`中
  - 确认`useEffect`初始化时调用`loadCartFromStorage`加载数据
  - 确认所有修改购物车的操作后都调用`saveCartToStorage`保存数据
  - 测试关闭小程序后重新打开,购物车数据是否保留
  - 测试离线状态下打开小程序,购物车数据是否可访问(FR-015)

- [ ] T025 [P] [US7] 实现支付成功后清空购物车逻辑(预留接口): 在`src/contexts/CartContext.tsx`中
  - 添加`clearCartAfterPayment`函数,接收`regionKey: RegionKey`参数
  - 清空指定地区购物车并保存到localStorage
  - 该函数将在订单确认页面支付成功后调用(FR-021)
  - 添加JSDoc注释说明该函数的用途

**Checkpoint**: User Story 7完成 - 购物车数据完全依赖localStorage持久化,支持离线访问

---

## Phase 9: User Story 6 - 多地区购物车概览 (Priority: P3)

**Goal**: TabBar购物车图标显示徽标(所有地区商品总数),购物车页面顶部显示当前地区信息

**Independent Test**: 在3个不同地区分别添加商品,验证TabBar购物车徽标显示总数量,购物车页面显示当前地区信息

### Implementation for User Story 6

- [ ] T026 [US6] 实现TabBar徽标计算逻辑: 在`src/custom-tab-bar/index.tsx`中
  - 从`CartContext`导入`regionalCart`
  - 使用`useEffect`监听`regionalCart`变化
  - 调用`getTotalItemCount(regionalCart)`计算所有地区商品总数
  - 使用`useState`保存`badgeCount`
  - 确保符合FR-013要求

- [ ] T027 [US6] 在TabBar中显示购物车徽标: 在`src/custom-tab-bar/index.tsx`中
  - 使用NutUI的`<Badge>`组件包裹购物车图标
  - 传递`value={badgeCount > 0 ? badgeCount : null}`,当`badgeCount=0`时不显示徽标(FR-014)
  - 确保徽标实时更新(当购物车数据变化时)
  - 参考research.md Topic 4的实现方式

- [ ] T028 [P] [US6] 确保RegionBar在购物车页面显示当前地区: 在`src/pages/cart/index.tsx`中
  - 验证`RegionBar`组件已在页面顶部显示(T009已实现)
  - 确认显示格式为"省份-城市"(如"江苏省-南京市")
  - 确认支持地区切换功能(点击RegionBar可切换地区)

**Checkpoint**: User Story 6完成 - TabBar徽标实时反映所有地区商品总数,用户可查看购物车全局状态

---

## Phase 10: 增强功能 (Edge Cases & 错误处理)

**Purpose**: 处理边界情况和增强用户体验

- [ ] T029 [P] [Enhancement] 实现下拉刷新功能: 在`src/pages/cart/index.tsx`中
  - 使用Taro的`usePullDownRefresh` Hook(参考research.md Topic 5)
  - 获取购物车中所有商品ID
  - 调用后端API:`POST /api/products/batch-query`,传递`{ productIds, regionKey }`
  - 更新购物车商品信息(价格、库存、状态)
  - 保存更新后的购物车到localStorage
  - 显示Toast:"刷新成功"
  - 调用`Taro.stopPullDownRefresh`停止刷新动画
  - 确保符合FR-025要求

- [ ] T030 [P] [Enhancement] 实现商品下架状态显示: 在`src/pages/cart/index.tsx`中
  - 使用`isOffShelf(item)`判断商品是否下架
  - 如果下架,在商品卡片上显示灰色遮罩和文字"该商品已下架"
  - 禁用"+"按钮(只能删除不能增加数量)(FR-019)
  - 参考quickstart.md中的下架商品遮罩样式

- [ ] T031 [P] [Enhancement] 添加商品下架遮罩样式: 在`src/pages/cart/index.less`中
  - 添加`.cart-item__off-shelf-mask`类
  - 样式:半透明黑色遮罩,白色文字居中显示
  - 确保遮罩覆盖整个商品卡片

- [ ] T032 [P] [Enhancement] 实现购物车容量限制提示: 在`src/contexts/CartContext.tsx`中
  - 在添加商品到购物车时,检查`currentCart.length >= 50`
  - 如果超过限制,调用`Taro.showToast`显示"购物车已满,请先结算部分商品"(FR-020)
  - 拒绝添加新商品

- [ ] T033 [P] [Enhancement] 实现库存不足提示: 在`src/contexts/CartContext.tsx`的`handleIncrease`函数中
  - 如果`item.quantity >= item.product.stock`,显示Toast:"库存不足,当前最多可购买X件"(FR-018)
  - 不增加数量

- [ ] T034 [P] [Enhancement] 确保金额计算精确到分: 在所有金额计算的地方
  - 验证`calculateCartStats`使用`Math.round(amount * 100) / 100`精确计算
  - 验证`getSubtotal`使用相同的精度处理
  - 确保符合FR-024和SC-006要求

**Checkpoint**: 所有边界情况和错误处理已实现,用户体验完善

---

## Phase 11: Polish & Cross-Cutting Concerns

**Purpose**: 跨用户故事的改进和最终优化

- [ ] T035 [P] [Polish] 代码清理和重构
  - 移除所有调试用的`console.log`
  - 确保所有函数有JSDoc注释
  - 确保所有组件结构遵循:导入 → 类型 → 常量 → 组件 → 导出
  - 运行`npx tsc --noEmit`确保类型安全

- [ ] T036 [P] [Polish] 性能优化
  - 使用`useCallback`优化所有事件处理函数
  - 使用`useMemo`优化所有计算逻辑
  - 确保购物车页面加载时间<1秒(SC-001)
  - 确保地区切换响应时间<500ms(SC-004)

- [ ] T037 [Polish] 运行quickstart.md手动测试清单
  - 完成测试场景1-9的所有测试点(共38个测试点)
  - 记录所有测试结果
  - 修复发现的所有问题

- [ ] T038 [Polish] 提交代码并创建Pull Request
  - 运行`git add .`
  - 提交格式:`feat(cart): 完善地区化购物车功能`
  - 提交Body:包含实现的所有功能列表
  - 推送到远程:`git push origin 004-`
  - 创建Pull Request到main分支

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 无依赖 - 可立即开始
- **Foundational (Phase 2)**: 依赖Phase 1完成 - **阻塞所有用户故事**
- **User Stories (Phase 3-9)**: 全部依赖Phase 2完成
  - User Story 1 (P1): 依赖Phase 2完成 - 无其他用户故事依赖
  - User Story 2 (P1): 依赖Phase 2完成 - 无其他用户故事依赖
  - User Story 3 (P1): 依赖Phase 2完成 - 无其他用户故事依赖
  - User Story 5 (P1): 依赖Phase 2完成 - 无其他用户故事依赖
  - User Story 4 (P2): 依赖Phase 2完成 - 无其他用户故事依赖
  - User Story 7 (P2): 依赖Phase 2完成(大部分已在Phase 2实现)
  - User Story 6 (P3): 依赖Phase 2完成 - 无其他用户故事依赖
- **Enhancement (Phase 10)**: 依赖相关用户故事完成
- **Polish (Phase 11)**: 依赖所有期望的用户故事完成

### User Story Dependencies

- **User Story 1 (P1)**: 可在Phase 2后立即开始 - 独立实现和测试
- **User Story 2 (P1)**: 可在Phase 2后立即开始 - 独立实现和测试(与US1可并行)
- **User Story 3 (P1)**: 可在Phase 2后立即开始 - 独立实现和测试(与US1/US2可并行)
- **User Story 5 (P1)**: 可在Phase 2后立即开始 - 独立实现和测试(与US1/US2/US3可并行)
- **User Story 4 (P2)**: 可在Phase 2后立即开始 - 独立实现和测试
- **User Story 7 (P2)**: 可在Phase 2后立即开始 - 主要验证Phase 2的实现
- **User Story 6 (P3)**: 可在Phase 2后立即开始 - 独立实现和测试

### Within Each User Story

- Setup任务(T001-T002)可并行执行
- Foundational任务(T003-T004)需顺序执行(T003先,T004可并行)
- User Story内部:标记[P]的任务可并行,未标记的需顺序执行
- 同一文件的任务需顺序执行,不同文件的任务可并行

### Parallel Opportunities

- Phase 1: T001和T002可并行
- Phase 2: T004可与T003并行(T003完成localStorage操作,T004添加防抖工具)
- Phase 3: T005、T006、T007、T008可并行(不同文件)
- Phase 4: T010、T011、T012可并行(同文件但独立函数)
- Phase 6: T018和T020可并行(不同文件)
- Phase 9: T026、T027在同文件需顺序,T028独立可并行
- Phase 10: T029-T034都可并行(不同功能,不同位置)
- Phase 11: T035和T036可并行

**多开发者并行策略**:
1. 完成Phase 1和Phase 2(团队协作)
2. Phase 2完成后:
   - Developer A: User Story 1 (T005-T009)
   - Developer B: User Story 2 (T010-T015)
   - Developer C: User Story 3 (T016-T017)
   - Developer D: User Story 5 (T018-T020)
3. P1故事完成后:
   - Developer A: User Story 4 (T021-T023)
   - Developer B: User Story 7 (T024-T025)
   - Developer C: User Story 6 (T026-T028)
4. 所有故事完成后合并进入Phase 10和Phase 11

---

## Parallel Example: User Story 1

```bash
# 在Phase 3中并行执行多个任务:
Task T005: "实现商品卡片显示组件 in src/pages/cart/index.tsx"
Task T006: "实现购物车统计信息显示 in src/pages/cart/index.tsx"
Task T007: "实现空状态显示 in src/pages/cart/index.tsx"
Task T008: "添加购物车页面样式 in src/pages/cart/index.less"

# T005-T007在同一文件(index.tsx),需要协调或顺序执行
# T008在不同文件(index.less),可与T005-T007并行

# 实际并行方案:
# - Developer A: T005 → T006 → T007 → T009 (index.tsx)
# - Developer B: T008 (index.less) 可立即开始,无需等待
```

---

## Parallel Example: Phase 10 Enhancement

```bash
# Phase 10中所有任务可并行执行(不同功能,不同位置):
Task T029: "实现下拉刷新功能 in src/pages/cart/index.tsx"
Task T030: "实现商品下架状态显示 in src/pages/cart/index.tsx"
Task T031: "添加商品下架遮罩样式 in src/pages/cart/index.less"
Task T032: "实现购物车容量限制提示 in src/contexts/CartContext.tsx"
Task T033: "实现库存不足提示 in src/contexts/CartContext.tsx"
Task T034: "确保金额计算精确到分 (验证任务)"

# 实际并行方案:
# - Developer A: T029 + T030 (index.tsx的不同功能区域)
# - Developer B: T031 (index.less)
# - Developer C: T032 + T033 (CartContext.tsx的不同函数)
# - Developer D: T034 (验证任务,可立即开始)
```

---

## Implementation Strategy

### MVP First (User Story 1-3, 5 Only) 🎯

**最小可行产品(MVP)范围**: 只实现P1优先级的用户故事

1. Complete Phase 1: Setup (T001-T002)
2. Complete Phase 2: Foundational (T003-T004) - **CRITICAL BLOCKER**
3. Complete Phase 3: User Story 1 (T005-T009) - 查看购物车
4. Complete Phase 4: User Story 2 (T010-T015) - 修改数量与删除
5. Complete Phase 5: User Story 3 (T016-T017) - 地区切换隔离
6. Complete Phase 6: User Story 5 (T018-T020) - 去结算
7. **STOP and VALIDATE**: 测试US1-US3和US5独立功能
8. Deploy/Demo MVP版本

**MVP交付物**:
- ✅ 用户可以查看当前地区购物车商品
- ✅ 用户可以增加/减少数量、删除商品
- ✅ 地区切换时购物车正确隔离
- ✅ 用户可以点击"去结算"跳转到订单确认页面
- ✅ localStorage持久化,小程序重启后数据保留

### Incremental Delivery

**渐进式交付策略**: 每个用户故事独立交付

1. Setup + Foundational (Phase 1-2) → 基础设施就绪
2. Add User Story 1 (Phase 3) → 测试独立功能 → Deploy/Demo
3. Add User Story 2 (Phase 4) → 测试独立功能 → Deploy/Demo
4. Add User Story 3 (Phase 5) → 测试独立功能 → Deploy/Demo
5. Add User Story 5 (Phase 6) → 测试独立功能 → Deploy/Demo (MVP完成!)
6. Add User Story 4 (Phase 7) → 测试独立功能 → Deploy/Demo
7. Add User Story 7 (Phase 8) → 测试独立功能 → Deploy/Demo
8. Add User Story 6 (Phase 9) → 测试独立功能 → Deploy/Demo
9. Add Enhancements (Phase 10) → 完整测试 → Deploy/Demo
10. Polish (Phase 11) → 最终发布

每个用户故事添加价值,不会破坏之前的功能。

### Parallel Team Strategy

**多开发者并行策略**: 最大化团队效率

**Phase 1-2 (Foundation)**: 全员协作
- 1-2名开发者完成Setup (T001-T002)
- 1-2名开发者完成Foundational (T003-T004)

**Phase 3-6 (P1 Stories)**: 并行实现 MVP
- Developer A: User Story 1 (查看购物车) - T005-T009
- Developer B: User Story 2 (修改数量与删除) - T010-T015
- Developer C: User Story 3 (地区切换隔离) - T016-T017
- Developer D: User Story 5 (去结算) - T018-T020

**Phase 7-9 (P2/P3 Stories)**: 并行实现增强功能
- Developer A: User Story 4 (清空购物车) - T021-T023
- Developer B: User Story 7 (持久化验证) - T024-T025
- Developer C: User Story 6 (多地区概览) - T026-T028

**Phase 10 (Enhancement)**: 并行实现边界情况处理
- Developer A: 下拉刷新 + 商品下架 (T029-T031)
- Developer B: 容量限制 + 库存不足 (T032-T033)
- Developer C: 金额精度验证 (T034)

**Phase 11 (Polish)**: 全员协作
- 代码清理、性能优化、测试、提交

---

## Task Summary

- **Total Tasks**: 38
- **Setup Tasks**: 2 (T001-T002)
- **Foundational Tasks**: 2 (T003-T004) ⚠️ CRITICAL BLOCKER
- **User Story 1 (P1) Tasks**: 5 (T005-T009) 🎯 MVP
- **User Story 2 (P1) Tasks**: 6 (T010-T015) 🎯 MVP
- **User Story 3 (P1) Tasks**: 2 (T016-T017) 🎯 MVP
- **User Story 5 (P1) Tasks**: 3 (T018-T020) 🎯 MVP
- **User Story 4 (P2) Tasks**: 3 (T021-T023)
- **User Story 7 (P2) Tasks**: 2 (T024-T025)
- **User Story 6 (P3) Tasks**: 3 (T026-T028)
- **Enhancement Tasks**: 6 (T029-T034)
- **Polish Tasks**: 4 (T035-T038)

**MVP Scope**: Phase 1-6 (总计18个任务,包含Setup + Foundational + US1 + US2 + US3 + US5)

**Parallel Opportunities**: 约20个任务可并行执行(标记[P]的任务)

**Independent Test Criteria**:
- US1: 查看购物车显示正确的商品列表和统计信息
- US2: 增加/减少数量和删除商品功能正常,金额实时更新
- US3: 切换地区后购物车内容正确隔离
- US5: "去结算"按钮正确检查登录状态并跳转
- US4: "清空购物车"按钮弹出确认对话框并正确清空
- US7: 小程序重启后购物车数据保留
- US6: TabBar徽标显示所有地区商品总数

---

## Notes

- [P] tasks = 不同文件或独立功能,可并行执行
- [Story] label = 任务所属的用户故事,便于追溯
- 每个用户故事应独立完成和测试
- 每个任务或逻辑组完成后提交代码
- 在每个Checkpoint停下来验证用户故事独立功能
- 避免:模糊任务、同文件冲突、破坏用户故事独立性的跨故事依赖
- 所有任务都有精确的文件路径和明确的实现要求
- 参考quickstart.md中的详细开发指南
- 参考data-model.md中的完整类型定义
- 参考research.md中的技术决策和最佳实践
