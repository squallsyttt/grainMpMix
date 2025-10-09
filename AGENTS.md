# 仓库指南

## 语言与本地化
- 所有输出与文档一律使用简体中文（zh-CN）：README、变更记录、代码注释、提交信息、PR 描述、终端/日志输出与 UI 文案。
- 代码标识符（变量、函数、文件名）统一使用英文；面向协作者或用户阅读的文本使用中文。
- 如第三方协议/接口必须英文，可保留英文，但需在文档补充中文说明。
- 示例：提交信息 `feat(weapp): 新增订单列表页`；日志 `构建完成：目标 weapp，耗时 12.3s`。

## 项目结构与模块组织
- 源码位于 `src/`，入口：`src/app.ts`、`src/app.config.ts`；全局样式：`src/app.less`。
- 页面放在 `src/pages/<name>/`，包含 `index.tsx`、`index.less`、`index.config.ts`（示例：`src/pages/index/`）。
- 构建产物输出到 `dist/`（请勿手动修改）。环境与编译配置位于 `config/`（`index.ts` 合并 `dev.ts`/`prod.ts`）。
- 类型声明位于 `types/`。

## 构建与开发命令
- `npm run dev:weapp`：WeChat 小程序实时构建输出到 `dist/`。
- `npm run dev:h5`：本地 H5 调试。
- `npm run build:weapp|tt|alipay|h5`：针对平台的生产构建。
- `npx eslint "src/**/*.{ts,tsx}"`：运行 ESLint 代码检查。
建议使用 Node 16–18；Taro CLI 已作为开发依赖提供。

## 代码风格与命名约定
- 技术栈：TypeScript + React（Hooks）。缩进 2 空格；使用分号与单引号。
- 组件：PascalCase（如 `src/components/Button/Button.tsx`）。页面：小写目录名 + `index.tsx`。
- 样式：Less；类名使用 kebab-case 或 BEM，页面样式收敛在各自 `index.less`。
- Lint：遵循 `eslint-config-taro`，尽量保持模块内聚、单一职责。

## 提交与合并请求（PR）
- 提交遵循 Conventional Commits：`feat:`、`fix:`、`chore:`、`refactor:`、`docs:`、`test:`；必要时在作用域注明平台（如 `feat(weapp): ...`）。
- PR 必须包含：变更摘要、动机说明、UI 变更截图/录屏（weapp/h5）、涉及的配置更新（如新增页面需修改 `src/app.config.ts`）、相关 Issue 链接。

## 安全与配置提示
- 请勿提交真实应用 AppID/密钥；本地 IDE/工具配置放在 `project.private.config.json`。
- 不要手改 `dist/`；如需调整，请修改源码或 `config/` 并重新构建。

## 代理/自动化注意事项
- 新增页面：创建 `src/pages/<name>/` 的三件套（`index.tsx`、`index.less`、`index.config.ts`），并在 `src/app.config.ts` 的 `pages` 列表中注册。
- 变更尽量聚焦，避免无关重排与大范围格式化。

## 快速出效果原则
- 本项目为外包交付，优先“可运行的页面与交互”，不引入复杂工程化与测试框架。
- 无需编写自动化测试；若甲方提出再补充测试与覆盖率要求。
- 可先提交可视占位与基础流程，复杂状态与边界情况按需求节奏补齐。
