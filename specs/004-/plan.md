# Implementation Plan: 地区化购物车功能完善

**Branch**: `004-` | **Date**: 2025-10-13 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

完善现有的地区化购物车功能,实现购物车的完整交互体验。核心需求包括:查看当前地区购物车商品、修改商品数量与删除、地区切换时的购物车隔离、清空购物车、去结算与订单生成、TabBar徽标显示、购物车前端缓存持久化。

**技术特点**: 购物车数据按"省份-城市"键分组存储在localStorage中,不同步到服务器,实现完全的前端缓存方案。所有地区的购物车数据相互独立,切换地区时立即刷新显示对应购物车内容。

## Technical Context

**Language/Version**: TypeScript 5.9.3 (严格模式)
**Primary Dependencies**:
- Taro 3.6.24 + React 18.0.0
- NutUI React Taro 2.3.10
- NutUI Icons React Taro (图标库)

**Storage**: localStorage (前端缓存,不使用后端存储)
**Testing**: 手动测试 + 端到端测试 (Taro开发者工具模拟器)
**Target Platform**: 微信小程序 (可扩展到其他Taro支持的平台)
**Project Type**: Mobile (Taro跨平台小程序)
**Performance Goals**:
- 购物车页面加载时间 < 1秒
- 地区切换响应时间 < 500ms
- 数量修改UI更新延迟 < 100ms

**Constraints**:
- 单个地区购物车最多50种商品
- 单个商品最大数量999件
- localStorage存储容量限制(约10MB)
- 购物车数据不跨设备同步

**Scale/Scope**:
- 支持10个不同地区的独立购物车
- 单个购物车约50种商品
- TabBar徽标实时反映所有地区商品总数

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ 核心原则合规性检查

#### 一、TypeScript 类型安全 ✅
- **合规**: 购物车相关的类型(`CartItem`, `CartStats`, `RegionalCart`)已在`src/types/cart.ts`中定义
- **合规**: CartContext提供完整的类型定义,所有函数有明确返回类型
- **行动**: 确保新增的UI组件和事件处理器都有明确的类型注解

#### 二、UI 组件标准 ✅
- **合规**: 使用NutUI React Taro组件库(`Button`, `Empty`, `Dialog`, `Toast`)
- **合规**: 图标使用`@nutui/icons-react-taro`,不使用文本符号
- **行动**: 购物车页面使用NutUI的`Empty`组件显示空状态,`Dialog`组件实现清空购物车确认

#### 三、LESS 样式 ✅
- **合规**: 现有购物车页面使用LESS(`src/pages/cart/index.less`)
- **合规**: 类名遵循BEM规范(如`cart-page__cart-container`)
- **行动**: 新增的样式规则继续使用BEM命名,间距使用8px倍数

#### 四、错误处理与韧性 ✅
- **合规**: localStorage读写操作需要添加try-catch保护
- **合规**: 数据解析失败时初始化为空购物车,不影响正常使用
- **行动**: 在CartContext的localStorage读取逻辑中添加错误降级处理

#### 五、代码质量与文档 ✅
- **合规**: 现有CartContext有清晰的JSDoc注释
- **合规**: 组件结构遵循: 导入 → 类型 → 常量 → 组件 → 导出
- **行动**: 为新增的事件处理函数添加JSDoc注释,说明参数和返回值

#### 六、性能优化 ✅
- **合规**: 事件处理器使用`useCallback`防止重渲染(如`handleIncrease`, `handleDecrease`)
- **注意**: 快速点击增减按钮需要防抖处理(规格要求FR-022)
- **行动**: 使用`useCallback`+防抖逻辑优化数量调整操作

#### 七、Git 提交规范 ✅
- **合规**: 已有提交遵循Conventional Commits格式
- **行动**: 本功能的提交使用`feat(cart):`或`fix(cart):`作为前缀

### ✅ 技术约束检查

#### 强制技术栈 ✅
- **框架**: Taro 3.6.24 + React 18 ✅
- **UI库**: NutUI React Taro 2.3.10 ✅
- **语言**: TypeScript 5.9.3 严格模式 ✅
- **样式**: LESS (不使用SCSS) ✅
- **构建工具**: Webpack 5 ✅

#### 禁止模式 ✅
- ❌ SCSS特有语法 - 不使用
- ❌ 文本符号作为图标 - 使用NutUI Icons
- ❌ 隐式any类型 - 所有类型明确定义
- ❌ 没有错误处理的异步操作 - localStorage读写添加try-catch
- ❌ 内联样式 - 使用LESS模块

### 结论: ✅ 通过宪法检查

**无违规项**。本功能完全符合项目宪法的所有核心原则和技术约束。现有的CartContext和购物车页面已经建立了良好的代码基础,本次完善将在此基础上增强功能,不引入新的技术债务。

## Project Structure

### Documentation (this feature)

```
specs/004-/
├── spec.md              # 功能规格说明(已完成)
├── checklists/
│   └── requirements.md  # 规格质量检查清单(已完成)
├── plan.md              # 本文件(实现计划)
├── research.md          # Phase 0 输出(研究与技术决策)
├── data-model.md        # Phase 1 输出(数据模型)
├── quickstart.md        # Phase 1 输出(快速开始指南)
├── contracts/           # Phase 1 输出(API契约,如适用)
└── tasks.md             # Phase 2 输出(任务分解,由/speckit.tasks生成)
```

### Source Code (repository root)

**当前项目结构** (Taro + React 单项目结构):

```
src/
├── components/          # 可复用UI组件
│   ├── RegionBar/      # 地区选择栏(已存在)
│   ├── RegionSelector/ # 地区选择器(已存在)
│   └── [新增组件待定]
├── contexts/            # React Context状态管理
│   ├── RegionContext.tsx    # 地区选择上下文(已存在)
│   ├── CartContext.tsx      # 购物车上下文(已存在,需完善)
│   └── UserContext.tsx      # 用户上下文(已存在)
├── pages/               # 页面组件
│   ├── cart/
│   │   ├── index.tsx        # 购物车页面(已存在,需完善)
│   │   └── index.less       # 购物车样式(已存在,需完善)
│   └── [其他页面]
├── types/               # TypeScript类型定义
│   ├── cart.ts              # 购物车类型(已存在)
│   ├── product.ts           # 商品类型(已存在)
│   └── [其他类型]
├── services/            # API服务层(如需要)
├── utils/               # 工具函数
└── custom-tab-bar/      # 自定义TabBar(已存在,需添加徽标逻辑)

config/
├── index.ts             # Taro配置(已存在)
├── dev.ts               # 开发环境配置
└── prod.ts              # 生产环境配置
```

**Structure Decision**:
本项目采用Taro单项目结构,购物车功能主要涉及以下模块的完善:
1. **CartContext** (`src/contexts/CartContext.tsx`) - 已有基础实现,需添加:
   - 防抖处理的数量修改逻辑
   - localStorage错误降级处理
   - 清空购物车的二次确认逻辑

2. **购物车页面** (`src/pages/cart/index.tsx`) - 已有UI框架,需添加:
   - 清空购物车按钮和确认对话框
   - 去结算按钮和登录状态检查
   - 下拉刷新商品信息
   - 商品下架状态显示

3. **自定义TabBar** (`src/custom-tab-bar/index.tsx`) - 需添加:
   - 购物车徽标显示逻辑(显示所有地区商品总数)
   - 实时监听CartContext的totalCartCount

4. **类型定义** (`src/types/cart.ts`) - 类型已完善,无需修改

## Complexity Tracking

*本节为空,因为Constitution Check无违规项需要辩护*

**理由**: 购物车功能完全基于现有的技术栈和架构模式,没有引入新的复杂性或违反宪法的设计决策。所有实现都在Taro + React的标准范式内完成。
