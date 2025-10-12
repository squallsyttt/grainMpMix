# Tasks: 核销券个人中心

**Branch**: `002-` | **Date**: 2025-10-12 | **Spec**: [spec.md](./spec.md)
**Input**: Design documents from `/specs/002-/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/

**注**: 本任务列表专注于**前端实现**。后端 API 由后端团队负责开发，前端任务中已包含完整的 API 列表和接口说明供参考。

---

## 📋 后端 API 汇总（供前端开发参考）

### 核销券 API (`/api/voucher/*`)
- **GET /api/voucher/lists** - 获取核销券列表（支持状态筛选、分页）
  - 参数: `token`, `filter`, `page`, `limit`, `sort`, `order`
  - 返回: 核销券列表（包含券码、类型、标题、状态、过期时间、门店信息等）

- **GET /api/voucher/detail** - 获取核销券详情
  - 参数: `token`, `id`
  - 返回: 完整券信息（包含二维码数据、门店详情、订单信息等）

### 订单 API (`/api/order/*`)
- **GET /api/order/lists** - 获取订单列表（支持状态筛选、分页）
  - 参数: `token`, `filter`, `page`, `limit`, `sort`, `order`
  - 返回: 订单列表（包含订单号、金额、状态、门店名称、创建时间等）

- **GET /api/order/detail** - 获取订单详情
  - 参数: `token`, `id`
  - 返回: 完整订单信息（包含商品详情、核销券信息、核销记录等）

### 门店 API (`/api/store/*`)
- **GET /api/store/lists** - 获取门店列表（支持地理位置排序）
  - 参数: `token`, `filter`, `longitude`, `latitude`, `page`, `limit`
  - 返回: 门店列表（包含名称、地址、距离、营业时间、电话等）

- **GET /api/store/detail** - 获取门店详情
  - 参数: `token`, `id`
  - 返回: 门店详细信息

**认证**: 所有 API 需要在 Header 或 Query 中传递 `token` 参数

**响应格式**: FastAdmin 标准格式
```typescript
{
  code: 1,           // 1=成功, 0/-1/-2/-3/-4=各类错误
  msg: "操作成功",
  time: 1736697600,  // Unix时间戳(秒)
  data: { ... }      // 响应数据
}
```

**详细说明**: 参见 `specs/002-/contracts/*.yaml`

---

## Format: `[ID] [P?] [Story] Description`
- **[P]**: 可并行执行（不同文件，无依赖）
- **[Story]**: 所属用户故事（US1, US2, US3...）
- 路径基于 Taro 项目结构: `src/pages/`, `src/components/`, `src/types/`, `src/services/`

---

## Phase 1: Setup (共享基础设施)

**目的**: 项目初始化和基础结构

### T001: 创建 TypeScript 类型定义（前端）
**文件**: `src/types/voucher.ts`, `src/types/order.ts`, `src/types/store.ts`, `src/types/writeoff.ts`

创建核销券相关的 TypeScript 接口定义:
- **voucher.ts**: `Voucher`, `VoucherListItem`, `VoucherStatus`, `VoucherType`
- **order.ts**: `Order`, `OrderListItem`, `OrderStatus`
- **store.ts**: `Store`, `StoreListItem`
- **writeoff.ts**: `WriteOffRecord`

基于 `specs/002-/contracts/*.yaml` 中的 schema 定义，映射为前端类型。

**验收标准**:
- ✅ 所有类型定义与 API 合约中的 schema 一致
- ✅ 使用 TypeScript 严格类型（启用 strictNullChecks）
- ✅ 枚举类型使用 TypeScript `enum` 或字符串字面量联合类型
- ✅ 时间字段统一使用 `number`（Unix 时间戳秒）

**依赖**: 无
**估时**: 1.5h

---

### T002: [P] 创建 API 服务层（前端）
**文件**: `src/services/voucher.ts`, `src/services/order.ts`, `src/services/store.ts`

实现前端 API 请求封装:
- **voucher.ts**: `getVoucherList()`, `getVoucherDetail(id)`
- **order.ts**: `getOrderList()`, `getOrderDetail(id)`
- **store.ts**: `getStoreList()`, `getStoreDetail(id)`

所有函数都需要:
- 明确的返回类型（`Promise<ApiResponse<T>>`）
- try-catch 错误处理
- 10 秒超时保护
- Token 自动注入（从 Taro.getStorageSync 读取）

**验收标准**:
- ✅ 所有函数有 JSDoc 注释和明确返回类型
- ✅ 统一错误处理（网络超时、Token 失效等）
- ✅ 使用 Taro.request 发起请求
- ✅ 响应数据自动解析为类型化对象

**依赖**: T001
**估时**: 2.5h

---

### T003: [P] 创建工具函数（前端）
**文件**: `src/utils/qrcode.ts`, `src/utils/location.ts`, `src/utils/date.ts`, `src/utils/error.ts`

实现辅助工具:
- **qrcode.ts**: `generateQRCode(data, canvas)` - 基于 Taro Canvas API 生成二维码
- **location.ts**: `getCurrentLocation()`, `calculateDistance(lat1, lng1, lat2, lng2)` - 地理位置相关
- **date.ts**: `formatTimestamp(ts)`, `getExpireDays(expireAt)`, `isExpiringSoon(expireAt)` - 时间处理
- **error.ts**: `handleApiError(error)`, `showFriendlyError(error)` - 错误处理

**验收标准**:
- ✅ 所有函数有 JSDoc 注释和明确返回类型
- ✅ qrcode.ts 使用 `weapp-qrcode-canvas-2d` 或 Taro 原生 Canvas
- ✅ location.ts 使用 `Taro.getLocation` 并处理权限拒绝情况
- ✅ error.ts 提供用户友好的错误提示文案

**依赖**: T001
**估时**: 2h

---

## Phase 2: Foundational (阻塞性前置任务)

**目的**: 所有用户故事依赖的核心基础设施

**⚠️ 关键**: 此阶段完成前，任何用户故事都无法开始实现

### T004: 配置个人中心页面路由
**文件**: `src/app.config.ts`, `src/pages/mine/index.tsx`

在现有 `mine` 页面基础上扩展:
- 在 `app.config.ts` 中添加子页面路由:
  - `pages/voucher/list/index`
  - `pages/voucher/detail/index`
  - `pages/order/list/index`
  - `pages/order/detail/index`

**验收标准**:
- ✅ 所有路由在 `app.config.ts` 中正确配置
- ✅ 页面可通过 `Taro.navigateTo` 正常跳转

**依赖**: 无
**估时**: 0.5h

---

### T005: 实现 Token 管理和认证拦截
**文件**: `src/utils/auth.ts`, `src/services/request.ts`

创建统一的请求拦截器:
- Token 自动注入到请求头或 Query 参数
- Token 失效自动跳转登录页
- 网络错误统一处理和提示

**验收标准**:
- ✅ 所有 API 请求自动携带 Token
- ✅ 收到 `-2` 错误码（未授权）时自动跳转登录
- ✅ 网络超时显示友好提示

**依赖**: T002
**估时**: 1.5h

---

### T006: 实现地理位置获取和权限处理
**文件**: `src/utils/location.ts`

完善地理位置工具:
- 使用 `Taro.getLocation` 获取当前位置
- 处理权限未授权情况（降级为不显示距离）
- 缓存位置信息（5 分钟有效期）

**验收标准**:
- ✅ 首次调用请求用户授权位置权限
- ✅ 授权拒绝不阻塞页面加载
- ✅ 位置信息缓存到 Storage，5 分钟内复用

**依赖**: T003
**估时**: 1h

---

**Checkpoint**: ✅ 基础设施就绪 - 用户故事实现可以开始

---

## Phase 3: User Story 1 - 查看核销券列表 (Priority: P1) 🎯 MVP

**目标**: 用户可以在个人中心查看核销券列表，按状态筛选，了解券的基本信息和当前状态。

**独立测试**: 创建测试 Token 和测试券数据，访问个人中心，检查是否正确显示核销券列表、状态筛选、分页加载功能。

---

### T007: [P] [US1] 创建核销券卡片组件（前端）
**文件**: `src/components/VoucherCard/index.tsx`, `src/components/VoucherCard/index.less`

创建可复用的核销券卡片组件:
- 显示商品图片、名称、规格、购买数量
- 显示购买时间（格式化为 "YYYY-MM-DD HH:mm"）
- 显示当前状态（待核销/已核销/已过期，不同颜色标识）
- 即将过期的券显示"即将过期"标签（剩余 7 天内）
- 点击卡片可跳转到详情页

使用 NutUI 的 `<Card>` 组件作为基础。

**验收标准**:
- ✅ 组件接收 `VoucherListItem` 类型的 Props
- ✅ 使用 BEM 命名规范（`.voucher-card`, `.voucher-card__title` 等）
- ✅ 状态徽章使用 NutUI 的 `<Tag>` 组件
- ✅ 即将过期标签使用醒目颜色（如橙色）
- ✅ 组件有 JSDoc 注释

**依赖**: T001, T003 (date.ts)
**估时**: 2h

---

### T008: [US1] 实现核销券列表页面（前端）
**文件**: `src/pages/voucher/list/index.tsx`, `src/pages/voucher/list/index.less`, `src/pages/voucher/list/index.config.ts`

实现核销券列表页面:
- 顶部状态筛选 Tab（全部/待核销/已核销/已过期），使用 NutUI `<Tabs>`
- 核销券列表展示（使用 `<VoucherCard>` 组件）
- 下拉刷新（使用 NutUI `<PullToRefresh>`）
- 滚动加载更多（分页，每页 20 条）
- 空状态提示（无券时显示提示和跳转按钮）
- 加载状态（骨架屏）

**验收标准**:
- ✅ 页面标题为"我的核销券"
- ✅ Tab 切换时调用 API 并传递 `filter` 参数
- ✅ 首屏加载时间 < 2 秒
- ✅ 下拉刷新重新加载第一页数据
- ✅ 滚动到底部自动加载下一页
- ✅ 空状态显示"暂无核销券，去商城逛逛吧"并提供跳转

**依赖**: T002, T007
**估时**: 4h

---

### T009: [US1] 优化核销券列表性能（前端）
**文件**: `src/pages/voucher/list/index.tsx`

优化列表渲染性能:
- 使用 `React.memo` 包装 `<VoucherCard>` 组件
- 避免列表项 key 使用 index，使用券 ID
- 防抖 Tab 切换和搜索操作

**验收标准**:
- ✅ `<VoucherCard>` 使用 `React.memo` 包装
- ✅ 列表项使用 `voucher.id` 作为 key
- ✅ Tab 切换添加 300ms 防抖

**依赖**: T008
**估时**: 1h

---

**Checkpoint**: ✅ 用户故事 1 完成 - 用户可以查看和筛选核销券列表

---

## Phase 4: User Story 2 - 查看核销券详情及二维码 (Priority: P1)

**目标**: 用户可以查看核销券详情、核销二维码、可核销门店列表，并保存二维码到相册。

**独立测试**: 点击任意待核销券，检查详情页是否显示完整信息（商品信息、订单信息、二维码、门店列表），验证二维码可扫描识别。

---

### T010: [P] [US2] 创建二维码组件（前端）
**文件**: `src/components/VoucherQRCode/index.tsx`, `src/components/VoucherQRCode/index.less`

创建核销券二维码展示组件:
- 使用 Canvas 生成二维码（基于 T003 的 `qrcode.ts`）
- 显示核销码文本（券 ID）
- 已核销/已过期状态显示灰色二维码或水印
- 提供"保存到相册"按钮

使用 `weapp-qrcode-canvas-2d` 或 Taro 原生 Canvas API。

**验收标准**:
- ✅ 二维码生成时间 < 1.5 秒
- ✅ 二维码清晰可扫描（测试识别率 > 99%）
- ✅ 已核销/已过期券显示灰色水印
- ✅ 保存到相册成功后显示 Toast 提示
- ✅ 二维码生成失败显示降级文本（券码）

**依赖**: T001, T003 (qrcode.ts)
**估时**: 3h

---

### T011: [P] [US2] 创建门店列表组件（前端）
**文件**: `src/components/StoreList/index.tsx`, `src/components/StoreList/index.less`

创建可核销门店列表组件:
- 显示门店名称、地址、距离、营业时间、电话
- 点击地址打开地图导航（`Taro.openLocation`）
- 点击电话拨打（`Taro.makePhoneCall`）
- 按距离排序（如果有地理位置权限）

使用 NutUI 的 `<Cell>` 或 `<Card>` 组件。

**验收标准**:
- ✅ 组件接收 `StoreListItem[]` 类型的 Props
- ✅ 有地理位置时显示距离（如 "1.2km"）
- ✅ 无地理位置时距离显示为 "--"
- ✅ 点击地址成功打开地图应用
- ✅ 点击电话成功拨打

**依赖**: T001, T002 (store.ts), T006
**估时**: 2.5h

---

### T012: [US2] 实现核销券详情页面（前端）
**文件**: `src/pages/voucher/detail/index.tsx`, `src/pages/voucher/detail/index.less`, `src/pages/voucher/detail/index.config.ts`

实现核销券详情页面:
- 顶部显示商品信息（图片、名称、规格、分类）
- 订单信息（订单号、购买时间、支付金额）
- 核销二维码（使用 `<VoucherQRCode>` 组件）
- 有效期提示（剩余天数或具体过期日期）
- 可核销门店列表（使用 `<StoreList>` 组件）
- 已核销券显示核销时间和核销门店
- 地区限制提示（"仅限XX地区使用"）

**验收标准**:
- ✅ 页面通过 Query 参数接收券 ID (`id`)
- ✅ 页面加载时调用 `/api/voucher/detail` 获取详情
- ✅ 商品图片使用懒加载
- ✅ 待核销券显示剩余有效天数
- ✅ 已核销券显示核销记录
- ✅ 门店列表按距离排序（有权限时）

**依赖**: T002, T010, T011
**估时**: 4h

---

### T013: [US2] 实现二维码保存功能（前端）
**文件**: `src/components/VoucherQRCode/index.tsx`

实现二维码保存到相册:
- 使用 `Taro.canvasToTempFilePath` 将 Canvas 转为图片
- 使用 `Taro.saveImageToPhotosAlbum` 保存到相册
- 处理相册权限（首次使用需授权）
- 保存成功/失败提示

**验收标准**:
- ✅ 点击"保存到相册"按钮触发保存
- ✅ 首次使用时请求相册权限
- ✅ 保存成功显示 "已保存到相册"
- ✅ 保存失败显示友好错误提示

**依赖**: T010
**估时**: 1.5h

---

**Checkpoint**: ✅ 用户故事 2 完成 - 用户可以查看券详情、二维码、门店列表并保存二维码

---

## Phase 5: User Story 3 - 门店核销操作 (Priority: P2)

**目标**: 商家扫描用户二维码后，系统验证券有效性并完成核销，更新券状态。

**独立测试**: 商家扫描测试二维码，验证系统是否正确识别券信息、检查状态、完成核销并实时更新用户端显示。

**注**: 本用户故事涉及商家端扫码功能。如果商家端是独立应用，此部分可能在商家端项目中实现。以下任务假设在同一个小程序中提供商家扫码入口。

---

### T014: [US3] 创建商家扫码页面（前端）
**文件**: `src/pages/merchant-scan/index.tsx`, `src/pages/merchant-scan/index.less`, `src/pages/merchant-scan/index.config.ts`

实现商家扫码核销页面:
- 使用 `Taro.scanCode` 调用扫码功能
- 扫码后解析券码，调用 `/api/voucher/detail` 验证券信息
- 显示券详情（商品名称、规格、数量、用户信息）
- 显示"确认核销"按钮
- 核销成功后显示成功提示，并更新券状态

**验收标准**:
- ✅ 页面标题为"扫码核销"
- ✅ 点击"扫一扫"按钮打开扫码
- ✅ 扫码后正确解析券 ID
- ✅ 显示券详情供商家确认
- ✅ 点击"确认核销"调用核销 API
- ✅ 已核销/已过期券显示相应提示，禁止核销

**依赖**: T002
**估时**: 3h

**注**: 如果商家端是独立系统，此任务可调整为"前端监听券状态变化并实时更新"。

---

### T015: [US3] 实现核销状态实时同步（前端）
**文件**: `src/pages/voucher/detail/index.tsx`, `src/pages/voucher/list/index.tsx`

实现核销后的状态同步:
- 券详情页在商家核销后自动刷新状态
- 券列表页返回时刷新数据，显示最新状态
- 可选：使用轮询或 WebSocket 实时监听状态变化

**验收标准**:
- ✅ 券核销后，详情页状态自动更新为"已核销"
- ✅ 返回列表页时刷新数据
- ✅ 无需用户手动刷新即可看到最新状态

**依赖**: T012, T014
**估时**: 2h

---

**Checkpoint**: ✅ 用户故事 3 完成 - 商家可以扫码核销，用户端实时同步状态

---

## Phase 6: User Story 4 - 订单记录查询 (Priority: P2)

**目标**: 用户可以查看完整的购买订单记录，包括订单详情，并从订单跳转到关联的核销券。

**独立测试**: 创建多个测试订单，检查订单列表是否正确显示所有订单信息，验证订单详情页展示完整信息。

---

### T016: [P] [US4] 创建订单卡片组件（前端）
**文件**: `src/components/OrderCard/index.tsx`, `src/components/OrderCard/index.less`

创建可复用的订单卡片组件:
- 显示商品缩略图、名称、购买数量
- 显示订单号、支付金额、订单状态、购买时间
- 配送方式标识（核销自提/跑腿配送）
- 点击卡片跳转到订单详情

使用 NutUI 的 `<Card>` 组件。

**验收标准**:
- ✅ 组件接收 `OrderListItem` 类型的 Props
- ✅ 使用 BEM 命名规范
- ✅ 状态徽章使用不同颜色区分
- ✅ 配送方式标识清晰可见

**依赖**: T001
**估时**: 2h

---

### T017: [US4] 实现订单列表页面（前端）
**文件**: `src/pages/order/list/index.tsx`, `src/pages/order/list/index.less`, `src/pages/order/list/index.config.ts`

实现订单列表页面:
- 显示所有订单（使用 `<OrderCard>` 组件）
- 下拉刷新
- 滚动加载更多（分页，每页 20 条）
- 空状态提示
- 加载状态（骨架屏）

**验收标准**:
- ✅ 页面标题为"我的订单"
- ✅ 订单按购买时间倒序排列
- ✅ 下拉刷新重新加载第一页数据
- ✅ 滚动到底部自动加载下一页
- ✅ 空状态显示"暂无订单"

**依赖**: T002, T016
**估时**: 3h

---

### T018: [US4] 实现订单详情页面（前端）
**文件**: `src/pages/order/detail/index.tsx`, `src/pages/order/detail/index.less`, `src/pages/order/detail/index.config.ts`

实现订单详情页面:
- 显示订单号、商品详情、数量、单价、总价
- 显示支付方式、支付时间
- 已完成订单显示"查看核销券"按钮，点击跳转到券详情
- 跑腿配送订单显示收货地址（占位）

**验收标准**:
- ✅ 页面通过 Query 参数接收订单 ID (`id`)
- ✅ 页面加载时调用 `/api/order/detail` 获取详情
- ✅ 已完成订单显示核销券信息和跳转按钮
- ✅ 订单信息完整准确

**依赖**: T002
**估时**: 3h

---

### T019: [US4] 在个人中心添加订单入口（前端）
**文件**: `src/pages/mine/index.tsx`, `src/pages/mine/index.less`

在个人中心页面添加"我的订单"入口:
- 使用 NutUI 的 `<Cell>` 或 `<Grid>` 组件
- 显示图标（使用 `@nutui/icons-react-taro` 的 `<Order>` 图标）
- 点击跳转到订单列表页面

**验收标准**:
- ✅ 个人中心显示"我的订单"入口
- ✅ 使用 NutUI 图标，不使用文本符号
- ✅ 点击跳转到 `/pages/order/list/index`

**依赖**: T017
**估时**: 0.5h

---

**Checkpoint**: ✅ 用户故事 4 完成 - 用户可以查看订单记录并跳转到核销券

---

## Phase 7: User Story 5 - 核销券有效期管理 (Priority: P3)

**目标**: 系统自动管理核销券有效期，提醒用户即将过期的券，过期后自动更新状态。

**独立测试**: 创建不同有效期的测试券，验证系统是否正确发送过期提醒、更新过期状态、在列表中正确标识即将过期的券。

**注**: 过期提醒和定时任务由后端负责，前端负责显示提醒信息和过期状态。

---

### T020: [US5] 实现过期提醒显示（前端）
**文件**: `src/pages/voucher/list/index.tsx`, `src/components/VoucherCard/index.tsx`

在核销券列表和卡片中显示过期提醒:
- 即将过期的券（剩余 7 天内）显示"即将过期"标签
- 标签使用醒目颜色（橙色或红色）
- 已过期券显示"已过期"标签

**验收标准**:
- ✅ 调用 `isExpiringSoon(expireAt)` 判断是否即将过期
- ✅ 即将过期券显示橙色/红色标签
- ✅ 已过期券显示灰色标签

**依赖**: T003 (date.ts), T007
**估时**: 1h

---

### T021: [US5] 实现有效期倒计时显示（前端）
**文件**: `src/pages/voucher/detail/index.tsx`

在核销券详情页显示有效期信息:
- 待核销券显示剩余天数（"剩余 X 天"）
- 剩余 3 天内用醒目颜色提示
- 已过期券显示过期时间

**验收标准**:
- ✅ 调用 `getExpireDays(expireAt)` 计算剩余天数
- ✅ 剩余 3 天内显示红色警告
- ✅ 已过期显示"已于 YYYY-MM-DD 过期"

**依赖**: T003 (date.ts), T012
**估时**: 1h

---

### T022: [US5] 接收过期提醒通知（前端）
**文件**: `src/app.tsx`（应用入口）

实现接收后端推送的过期提醒通知:
- 监听微信订阅消息
- 显示提醒通知（小程序原生通知或页面内提示）
- 点击通知跳转到核销券列表

**验收标准**:
- ✅ 应用启动时检查是否有新的过期提醒
- ✅ 收到提醒时显示通知（微信订阅消息或页面 Toast）
- ✅ 点击通知跳转到相应券详情

**依赖**: T008
**估时**: 2h

**注**: 此任务需要后端配合实现订阅消息推送。

---

**Checkpoint**: ✅ 用户故事 5 完成 - 用户可以看到过期提醒并及时使用券

---

## Phase 8: User Story 6 - 跑腿配送模式入口预留 (Priority: P3)

**目标**: 为未来的跑腿配送功能预留 UI 入口和基础交互界面，当前阶段只展示占位界面。

**独立测试**: 访问订单详情页面，验证跑腿配送订单是否显示基础占位界面和"敬请期待"提示。

---

### T023: [US6] 在订单列表显示配送方式标识（前端）
**文件**: `src/components/OrderCard/index.tsx`

在订单卡片中显示配送方式:
- 核销自提显示"核销自提"标识
- 跑腿配送显示"跑腿配送"标识
- 使用不同图标或颜色区分

**验收标准**:
- ✅ 订单卡片根据 `deliveryMode` 字段显示相应标识
- ✅ 配送方式标识清晰可见

**依赖**: T016
**估时**: 0.5h

---

### T024: [US6] 在订单详情显示配送占位界面（前端）
**文件**: `src/pages/order/detail/index.tsx`

跑腿配送订单详情页显示占位信息:
- 显示收货地址（基本信息）
- 显示"配送功能开发中，敬请期待"提示
- 使用 NutUI 的 `<Empty>` 组件展示占位状态

**验收标准**:
- ✅ 跑腿配送订单显示收货地址
- ✅ 显示占位提示文案
- ✅ 占位界面美观友好

**依赖**: T018
**估时**: 1h

---

### T025: [US6] 预留配送方式筛选（前端，可选）
**文件**: `src/pages/order/list/index.tsx`

在订单列表添加配送方式筛选（占位）:
- 添加筛选 Tab（全部/核销自提/跑腿配送）
- "跑腿配送" Tab 显示为灰色或标注"即将上线"
- 点击提示"功能开发中"

**验收标准**:
- ✅ 筛选 Tab 包含"跑腿配送"选项
- ✅ 跑腿配送 Tab 显示灰色或"即将上线"标识
- ✅ 点击提示功能未开放

**依赖**: T017
**估时**: 0.5h

---

**Checkpoint**: ✅ 用户故事 6 完成 - 跑腿配送入口已预留，未来可平滑扩展

---

## Phase 9: Polish & Cross-Cutting Concerns

**目的**: 优化和完善，影响多个用户故事的横切关注点

---

### T026: [P] 性能优化 - 列表虚拟滚动（前端，可选）
**文件**: `src/pages/voucher/list/index.tsx`, `src/pages/order/list/index.tsx`

如果列表长度超过 50 条，使用 Taro VirtualList 优化:
- 评估实际列表长度
- 如需要，引入 `@tarojs/components` 的 `<VirtualList>`
- 优化列表渲染性能

**验收标准**:
- ✅ 列表长度 >= 50 时使用虚拟滚动
- ✅ 滚动流畅，无明显卡顿

**依赖**: T008, T017
**估时**: 2h

---

### T027: [P] 错误处理完善（前端）
**文件**: `src/utils/error.ts`, 所有页面文件

完善全局错误处理:
- 网络超时显示"网络请求超时，请稍后重试"
- Token 失效自动跳转登录
- API 错误显示友好提示（根据 `code` 字段）
- 提供"重试"按钮

**验收标准**:
- ✅ 所有 API 调用都有 try-catch 包裹
- ✅ 错误提示用户友好
- ✅ 关键操作提供重试按钮

**依赖**: T002, T003
**估时**: 2h

---

### T028: [P] 无障碍优化（前端，可选）
**文件**: 所有组件和页面

优化无障碍访问:
- 所有按钮添加 `aria-label`
- 图片添加 `alt` 属性
- 交互元素可通过键盘访问

**验收标准**:
- ✅ 关键按钮有 `aria-label`
- ✅ 图片有描述性 `alt` 文本

**依赖**: 所有页面和组件
**估时**: 2h

---

### T029: [P] 代码文档和注释完善（前端）
**文件**: 所有 TypeScript 文件

完善代码文档:
- 所有导出函数有 JSDoc 注释
- 复杂逻辑添加行内注释
- README.md 添加模块说明

**验收标准**:
- ✅ 所有导出函数有 JSDoc
- ✅ 复杂逻辑有注释说明

**依赖**: 所有任务
**估时**: 2h

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 无依赖 - 可立即开始
- **Foundational (Phase 2)**: 依赖 Setup 完成 - **阻塞所有用户故事**
- **User Stories (Phase 3+)**: 所有依赖 Foundational 完成
  - 用户故事之间基本独立，可并行开发（如有多人）
  - 或按优先级顺序开发（P1 → P2 → P3）
- **Polish (Phase 9)**: 依赖所有用户故事完成

### User Story Dependencies

- **User Story 1 (P1)**: Foundational 完成后可开始 - 无其他故事依赖
- **User Story 2 (P1)**: Foundational 完成后可开始 - 无其他故事依赖
- **User Story 3 (P2)**: Foundational 完成后可开始 - 可选依赖 US2（扫码后跳转到券详情）
- **User Story 4 (P2)**: Foundational 完成后可开始 - 可选依赖 US1（订单跳转到券列表）
- **User Story 5 (P3)**: 依赖 US1（列表显示过期提醒）和 US2（详情显示倒计时）
- **User Story 6 (P3)**: 依赖 US4（订单列表和详情）

### Within Each User Story

- 组件优先于页面（如 T007 VoucherCard 优先于 T008 列表页）
- 工具函数优先于组件（如 T003 工具函数优先于 T010 二维码组件）
- 核心实现优先于优化（如 T012 详情页优先于 T013 保存功能）

### Parallel Opportunities

- **Phase 1 Setup**: T002、T003 可并行（不同文件）
- **Phase 3 US1**: T007 VoucherCard 和其他 US1 组件可并行
- **Phase 4 US2**: T010 二维码组件和 T011 门店列表组件可并行
- **Phase 6 US4**: T016 OrderCard 可与其他任务并行
- **Phase 9 Polish**: 所有 [P] 标记的优化任务可并行

---

## Implementation Strategy

### MVP First (User Story 1 + 2 Only) 🎯

1. 完成 Phase 1: Setup（~6h）
2. 完成 Phase 2: Foundational（~3h）
3. 完成 Phase 3: User Story 1（~7h）
4. 完成 Phase 4: User Story 2（~11h）
5. **STOP and VALIDATE**: 测试核销券列表和详情功能
6. 部署/演示（用户可查看券、查看详情、查看二维码、查看门店）

**MVP 总估时**: ~27 小时

### Incremental Delivery

1. **Iteration 1**: Setup + Foundational → 基础就绪（~9h）
2. **Iteration 2**: + User Story 1 → 可查看券列表（~16h）
3. **Iteration 3**: + User Story 2 → 可查看详情和二维码（~27h，**MVP 完成**）
4. **Iteration 4**: + User Story 3 → 可商家扫码核销（~32h）
5. **Iteration 5**: + User Story 4 → 可查看订单记录（~38.5h）
6. **Iteration 6**: + User Story 5 → 过期提醒（~42.5h）
7. **Iteration 7**: + User Story 6 → 配送占位（~44.5h）
8. **Iteration 8**: + Polish → 性能优化和完善（~52.5h）

每个迭代都交付一个可独立测试和演示的增量功能。

### Parallel Team Strategy

如果有多个前端开发者:

1. 所有人一起完成 Setup + Foundational（~9h）
2. 一旦 Foundational 完成:
   - **开发者 A**: User Story 1（核销券列表）
   - **开发者 B**: User Story 2（券详情和二维码）
   - **开发者 C**: User Story 4（订单记录）
3. 各故事完成后独立测试并集成

---

## Summary

**总任务数**: 29 个任务
**总估时**: ~52.5 小时

### 任务分布

- **Phase 1 (Setup)**: 3 个任务，~6h
- **Phase 2 (Foundational)**: 3 个任务，~3h
- **Phase 3 (US1 - 核销券列表)**: 3 个任务，~7h 🎯 P1
- **Phase 4 (US2 - 券详情和二维码)**: 4 个任务，~11h 🎯 P1
- **Phase 5 (US3 - 商家扫码核销)**: 2 个任务，~5h (P2)
- **Phase 6 (US4 - 订单记录查询)**: 4 个任务，~6.5h (P2)
- **Phase 7 (US5 - 过期提醒)**: 3 个任务，~4h (P3)
- **Phase 8 (US6 - 配送占位)**: 3 个任务，~2h (P3)
- **Phase 9 (Polish)**: 4 个任务，~8h

### 并行机会

- Setup 阶段: T002、T003 可并行
- US1: T007 可与其他组件并行
- US2: T010、T011 可并行
- US4: T016 可并行
- Polish: T026-T029 可并行

### MVP 范围

**推荐 MVP**: User Story 1 + User Story 2
- 用户可以查看核销券列表
- 用户可以查看券详情和二维码
- 用户可以查看可核销门店列表
- **估时**: ~27 小时

---

## Notes

- **[P]** = 可并行执行（不同文件，无依赖）
- **[Story]** = 所属用户故事（US1-US6），便于追溯
- **后端 API**: 由后端团队负责实现，前端参考 `specs/002-/contracts/*.yaml`
- **所有函数必须有明确返回类型**（遵循项目 constitution.md）
- **使用 NutUI 组件库**，不使用文本符号作为图标
- **BEM 命名规范**: `.block`, `.block__element`, `.block--modifier`
- **错误处理**: 所有异步操作必须 try-catch，10 秒超时保护
- **每个任务完成后提交 Git**，遵循 Conventional Commits 规范
- **每个 Checkpoint 完成后独立测试**，确保功能可用

---

**生成时间**: 2025-10-12
**版本**: 2.0.0（前端专注版本）
**生成工具**: /speckit.tasks
**备注**: 本版本移除了所有后端实现任务，保留 API 列表汇总供前端开发参考。后端 API 由后端团队独立开发。
