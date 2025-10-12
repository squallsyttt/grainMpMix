# Implementation Plan: 核销券个人中心

**Branch**: `002-` | **Date**: 2025-10-12 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

构建以核销券为核心的个人中心模块,用户购买大米后获得核销券(含二维码),可查看可核销门店列表并到店自提。系统支持券的状态管理(待核销/已核销/已过期)、过期提醒、商家扫码核销等完整流程。同时提供订单记录查询功能,并为未来的跑腿配送模式预留UI入口。

## Technical Context

**Language/Version**: TypeScript 5.9.3 (strictNullChecks enabled, noImplicitAny: false)
**Primary Dependencies**:
  - **前端**:
    - Taro 3.6.24 (跨平台小程序框架)
    - React 18.0.0
    - NutUI React Taro 2.3.10 (UI组件库)
    - @nutui/icons-react-taro 3.0.2 (图标库)
  - **后端**:
    - PHP >= 7.4.0
    - ThinkPHP 5.x (topthink/framework)
    - FastAdmin 1.4.x (后台管理框架)
    - MySQL 5.7+ (InnoDB引擎)
    - Redis 6.x+ (缓存和分布式锁)
    - overtrue/wechat ^4.6 (微信SDK)
    - topthink/think-queue 1.1.6 (队列系统)

**Storage**: FastAdmin + ThinkPHP + MySQL + Redis
  - 数据库: MySQL 5.7+ (grainPro)
  - 表前缀: `grain_`
  - 字符集: utf8mb4
  - 时间戳: INT(10) Unix时间戳
  - 缓存: Redis (Token、核销券状态、门店距离等)
  - 地理位置: MySQL POINT类型 + SPATIAL INDEX
  - 分布式锁: Redis (防止核销重复)

**Testing**:
  - 前端: Jest + @tarojs/test-utils (单元测试)
  - 后端: PHPUnit (API测试)
  - E2E: 小程序开发者工具自动化测试

**Target Platform**: 微信小程序(主要)、支付宝小程序、H5等多端适配
**Project Type**: Mobile (Taro多端小程序应用 + FastAdmin后端)
**Performance Goals**:
  - 核销券列表加载 ≤ 2秒 (20条记录)
  - 二维码生成展示 ≤ 1.5秒
  - 商家扫码核销响应 ≤ 3秒
  - 支持5000并发用户访问个人中心
  - MySQL慢查询 < 100ms
  - Redis缓存命中率 ≥ 80%

**Constraints**:
  - 小程序代码包大小限制 (单包≤2MB,分包后总体≤20MB)
  - 离线场景支持(用户可保存二维码到相册离线使用)
  - 二维码识别率 ≥ 99%
  - 地理位置权限可选(未授权时门店按默认顺序显示)
  - FastAdmin权限控制(基于FastAdmin内置Auth)
  - 数据库事务隔离级别: READ COMMITTED

**Scale/Scope**:
  - 预计5000-10000活跃用户
  - 核心功能包含6个用户故事(3个P1,2个P2,2个P3)
  - 涉及核销券、订单、门店、地区等多个实体
  - 新增页面约5-8个(列表、详情、商家扫码等)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### 一、TypeScript 类型安全 ✅ 符合

- **要求**: 所有函数必须有明确返回类型,React组件使用`React.FC<Props>`或返回`React.ReactElement`
- **评估**: 项目已启用strictNullChecks,虽然noImplicitAny设为false但要求所有新代码必须显式标注类型
- **行动**: Phase 1设计时为所有API函数、组件、工具函数定义明确类型

### 二、UI 组件标准 ✅ 符合

- **要求**: 使用NutUI React Taro + @nutui/icons-react-taro,禁用文本符号作图标
- **评估**: 项目已安装所需UI库,核销券模块将完全遵循该标准
- **行动**: 在data-model.md中明确列出需使用的NutUI组件和图标

### 三、LESS 样式规范 ✅ 符合

- **要求**: 使用LESS语法(禁止SCSS特有功能),BEM命名,8px倍数间距
- **评估**: 项目配置为LESS,现有代码已遵循BEM命名
- **行动**: 设计时定义核销券相关组件的BEM类名规范

### 四、错误处理与韧性 ⚠️ 需加强

- **要求**: 所有异步操作必须try-catch,网络请求10秒超时保护,友好错误提示
- **评估**: 需在Phase 1设计完善的错误处理机制(尤其是二维码生成、商家扫码核销等关键流程)
- **行动**:
  - research.md中研究二维码生成失败的降级方案
  - 设计统一的错误处理工具函数
  - 定义用户友好的错误提示文案

### 五、代码质量与文档 ✅ 符合

- **要求**: JSDoc注释,文件结构(类型→常量→组件→导出),常量命名UPPER_SNAKE_CASE
- **评估**: 现有代码结构清晰,新模块将严格遵循
- **行动**: Phase 1设计时生成完整的JSDoc模板

### 六、性能优化 ⚠️ 需规划

- **要求**: 大列表虚拟滚动,图片懒加载,React.memo,useCallback
- **评估**: 核销券列表、门店列表可能较长,需考虑性能优化
- **行动**:
  - research.md中研究Taro环境下的虚拟滚动方案
  - 评估是否需要虚拟滚动(取决于列表平均长度)
  - 设计时标注需要memo和useCallback的组件

### 七、Git 提交规范 ✅ 符合

- **要求**: Conventional Commits格式
- **评估**: 现有提交历史已遵循该规范
- **行动**: 无需额外行动,开发过程中继续遵循

### Gate 评估总结

**状态**: ✅ 通过

**已在 Phase 0/1 确认的方案**:
1. **存储方案**: ✅ FastAdmin + ThinkPHP + MySQL + Redis
   - MySQL InnoDB引擎,表前缀grain_
   - Redis用于缓存和分布式锁
   - MySQL POINT类型处理地理位置

2. **测试方案**: ✅ 前端Jest + 后端PHPUnit
   - 前端: Jest + @tarojs/test-utils
   - 后端: PHPUnit (FastAdmin标准)
   - E2E: 小程序开发者工具自动化测试

3. **二维码方案**: ✅ Taro API + 后端核销验证
   - 生成: canvas-based (Taro.canvasToTempFilePath)
   - 数据: 核销券ID + 加密签名
   - 降级: 核销码文本显示

4. **虚拟滚动**: ✅ 根据数据量决定
   - 列表长度 < 50: 不使用虚拟滚动
   - 列表长度 >= 50: 使用Taro VirtualList
   - 门店列表按距离分页加载

5. **地理位置**: ✅ Taro.getLocation + MySQL ST_Distance_Sphere
   - 权限可选,未授权时按默认排序
   - 距离计算使用MySQL空间索引
   - 缓存附近门店列表(5分钟)

6. **过期提醒**: ✅ 订阅消息 + 定时任务
   - 微信订阅消息(过期前1天提醒)
   - 后端定时任务扫描即将过期券
   - 小程序内红点标记过期券

**无宪法违规**: 所有要求均可满足,无需复杂度豁免。

## Project Structure

### Documentation (this feature)

```
specs/002-/
├── spec.md              # 功能规格(已存在)
├── plan.md              # 本实施计划(/speckit.plan 命令输出)
├── research.md          # Phase 0 输出 - 技术研究文档
├── data-model.md        # Phase 1 输出 - 数据模型设计
├── quickstart.md        # Phase 1 输出 - 快速开始指南
├── contracts/           # Phase 1 输出 - API合约
│   ├── voucher.yaml     # 核销券相关API
│   ├── order.yaml       # 订单相关API
│   └── store.yaml       # 门店相关API
└── tasks.md             # Phase 2 输出(/speckit.tasks 命令 - 未由 /speckit.plan 创建)
```

### Source Code (repository root)

```
src/
├── components/              # 可复用UI组件
│   ├── VoucherCard/        # 核销券卡片组件(新增)
│   ├── VoucherQRCode/      # 核销券二维码组件(新增)
│   ├── StoreList/          # 门店列表组件(新增)
│   ├── OrderCard/          # 订单卡片组件(新增)
│   └── [existing components...]
│
├── pages/                   # 页面组件
│   ├── mine/               # 个人中心(现有,需扩展)
│   │   ├── index.tsx       # 个人中心首页(修改)
│   │   └── index.less
│   ├── voucher/            # 核销券模块(新增)
│   │   ├── list/           # 核销券列表页
│   │   │   ├── index.tsx
│   │   │   ├── index.less
│   │   │   └── index.config.ts
│   │   └── detail/         # 核销券详情页
│   │       ├── index.tsx
│   │       ├── index.less
│   │       └── index.config.ts
│   ├── order/              # 订单模块(新增)
│   │   ├── list/           # 订单列表页
│   │   │   ├── index.tsx
│   │   │   ├── index.less
│   │   │   └── index.config.ts
│   │   └── detail/         # 订单详情页
│   │       ├── index.tsx
│   │       ├── index.less
│   │       └── index.config.ts
│   └── merchant-scan/      # 商家扫码页(新增)
│       ├── index.tsx
│       ├── index.less
│       └── index.config.ts
│
├── types/                   # 类型定义
│   ├── voucher.ts          # 核销券类型(新增)
│   ├── order.ts            # 订单类型(新增)
│   ├── store.ts            # 门店类型(新增)
│   ├── writeoff.ts         # 核销记录类型(新增)
│   └── [existing types...]
│
├── services/                # API服务
│   ├── voucher.ts          # 核销券API(新增)
│   ├── order.ts            # 订单API(新增)
│   ├── store.ts            # 门店API(新增)
│   ├── writeoff.ts         # 核销API(新增)
│   └── [existing services...]
│
├── utils/                   # 工具函数
│   ├── qrcode.ts           # 二维码生成工具(新增)
│   ├── location.ts         # 地理位置工具(新增)
│   ├── date.ts             # 日期处理工具(新增)
│   ├── error.ts            # 错误处理工具(新增)
│   └── [existing utils...]
│
├── contexts/                # React Context
│   ├── VoucherContext.tsx  # 核销券状态管理(新增,可选)
│   └── [existing contexts...]
│
└── [existing structure...]

tests/                       # 测试文件(待Phase 0确定框架)
├── unit/                   # 单元测试
│   ├── utils/
│   ├── services/
│   └── components/
└── e2e/                    # 端到端测试
    └── voucher/
```

**Structure Decision**: 采用 **Option 1: Single project (Mobile)** 结构,因为这是Taro多端小程序应用,前后端分离,前端代码在`src/`目录下按功能模块组织。核销券和订单作为独立的页面模块,与现有的index、news、mine、merchant、cart等模块平行。可复用组件抽取到`components/`目录。

## Complexity Tracking

*无需填写* - Constitution Check未发现宪法违规,所有要求均可满足。
