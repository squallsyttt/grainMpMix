# Data Model: 首页商品分类多级展示优化

**Feature**: 006-code-1-msg
**Date**: 2025-10-17
**Status**: Phase 1 Design

## Overview

本文档定义了多级分类展示功能所需的数据实体、类型定义和验证规则。所有类型遵循TypeScript严格模式,确保类型安全。

---

## Entity 1: CategoryTreeNode (分类树节点)

**描述**: 后端API返回的分类树形数据结构,支持递归嵌套。

### 字段定义

| 字段名 | 类型 | 必填 | 描述 | 验证规则 |
|--------|------|------|------|----------|
| `id` | `number` | ✅ | 分类唯一ID | > 0 |
| `pid` | `number` | ✅ | 父分类ID (0表示根分类) | >= 0 |
| `name` | `string` | ✅ | 分类名称 | 长度 1-50字符 |
| `image` | `string` | ✅ | 分类图标路径 | 相对路径,如"/uploads/xxx.jpg" |
| `weigh` | `number` | ✅ | 排序权重 (值越大越靠前) | >= 0 |
| `childlist` | `CategoryTreeNode[]` | ✅ | 子分类列表 | 数组,可为空 |
| `type_text` | `string` | ❌ | 类型文本 (暂未使用) | - |
| `flag_text` | `string` | ❌ | 标记文本 (暂未使用) | - |
| `spacer` | `string` | ❌ | 间隔符 (后端用于树形展示) | - |

### TypeScript 定义

```typescript
/**
 * 分类树节点 (后端返回格式)
 */
export interface CategoryTreeNode {
  /** 分类ID */
  id: number
  /** 父分类ID (0表示根分类) */
  pid: number
  /** 分类名称 */
  name: string
  /** 分类图标相对路径 */
  image: string
  /** 排序权重 (值越大越靠前) */
  weigh: number
  /** 子分类列表 */
  childlist: CategoryTreeNode[]
  /** 类型文本 (可选,暂未使用) */
  type_text?: string
  /** 标记文本 (可选,暂未使用) */
  flag_text?: string
  /** 间隔符 (可选,后端树形展示用) */
  spacer?: string
}
```

### 关系

- **父子关系**: 通过 `pid` 字段关联父节点
- **递归结构**: `childlist` 包含相同类型的子节点
- **层级深度**: 最大支持4层 (一级 > 二级 > 三级 > 四级)

### 示例数据

```json
{
  "id": 106,
  "pid": 0,
  "name": "香米",
  "image": "/uploads/20251003/2cc15ecf36b9d7d9dac000c3513970f4.jpg",
  "weigh": 106,
  "type_text": "",
  "flag_text": "",
  "spacer": "",
  "childlist": [
    {
      "id": 108,
      "pid": 106,
      "name": "东北五常精品",
      "image": "/uploads/20251003/2cc15ecf36b9d7d9dac000c3513970f4.jpg",
      "weigh": 108,
      "type_text": "",
      "flag_text": "",
      "spacer": "&nbsp;└",
      "childlist": []
    }
  ]
}
```

---

## Entity 2: CategoryIndex (分类索引)

**描述**: 前端扁平化的分类索引结构,用于高效查找和路径计算。

### 字段定义

| 字段名 | 类型 | 描述 |
|--------|------|------|
| `byId` | `Map<number, CategoryTreeNode>` | 按ID快速查找分类 (O(1)) |
| `byParentId` | `Map<number, CategoryTreeNode[]>` | 按父ID获取子分类列表 (O(1)) |
| `allIds` | `number[]` | 所有分类ID的排序列表 |

### TypeScript 定义

```typescript
/**
 * 分类索引 (前端构建)
 */
export interface CategoryIndex {
  /** ID -> 分类节点 映射 */
  byId: Map<number, CategoryTreeNode>
  /** 父ID -> 子分类列表 映射 */
  byParentId: Map<number, CategoryTreeNode[]>
  /** 所有分类ID (按weigh排序) */
  allIds: number[]
}
```

### 构建规则

1. 遍历树形数据,将所有节点加入 `byId` Map
2. 按 `pid` 分组,构建 `byParentId` Map
3. 收集所有ID,按 `weigh` 倒序排序

---

## Entity 3: CategoryUINode (UI层分类节点)

**描述**: UI组件使用的分类节点,包含展开状态等UI相关属性。

### 字段定义

| 字段名 | 类型 | 描述 |
|--------|------|------|
| `data` | `CategoryTreeNode` | 原始分类数据 |
| `depth` | `number` | 当前节点层级 (0-3,对应1-4层) |
| `isExpanded` | `boolean` | 是否展开 (仅用于树形UI) |
| `hasChildren` | `boolean` | 是否有子节点 |
| `fullImageUrl` | `string` | 完整的图片URL (拼接后) |

### TypeScript 定义

```typescript
/**
 * UI层分类节点 (包含展开状态)
 */
export interface CategoryUINode {
  /** 原始分类数据 */
  data: CategoryTreeNode
  /** 节点层级 (0-3) */
  depth: number
  /** 是否展开 */
  isExpanded: boolean
  /** 是否有子节点 */
  hasChildren: boolean
  /** 完整图片URL */
  fullImageUrl: string
}
```

---

## Entity 4: CategoryPathItem (分类路径项)

**描述**: 面包屑导航使用的分类路径项。

### 字段定义

| 字段名 | 类型 | 描述 |
|--------|------|------|
| `id` | `number` | 分类ID |
| `name` | `string` | 分类名称 |
| `depth` | `number` | 层级 (0-3) |

### TypeScript 定义

```typescript
/**
 * 分类路径项 (用于面包屑)
 */
export interface CategoryPathItem {
  /** 分类ID */
  id: number
  /** 分类名称 */
  name: string
  /** 层级 (0-3) */
  depth: number
}
```

### 示例

```typescript
// "香米 > 东北五常精品" 的路径
[
  { id: 106, name: "香米", depth: 0 },
  { id: 108, name: "东北五常精品", depth: 1 }
]
```

---

## Entity 5: CategoryFilter (分类筛选参数)

**描述**: 商品列表页的分类筛选参数。

### 字段定义

| 字段名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| `categoryId` | `number` | ✅ | 当前选中的分类ID |
| `includeChildren` | `boolean` | ❌ | 是否包含子分类商品 (默认true) |

### TypeScript 定义

```typescript
/**
 * 分类筛选参数
 */
export interface CategoryFilter {
  /** 分类ID */
  categoryId: number
  /** 是否包含子分类商品 */
  includeChildren?: boolean
}
```

---

## State Management (状态管理)

### useCategoriesState

```typescript
/**
 * 分类数据状态
 */
export interface UseCategoriesState {
  /** 分类树 (后端原始数据) */
  tree: CategoryTreeNode[]
  /** 分类索引 (前端构建) */
  index: CategoryIndex | null
  /** 加载中 */
  loading: boolean
  /** 错误信息 */
  error: string | null
  /** 重新获取 */
  refetch: () => Promise<void>
}
```

### useTreeExpandState

```typescript
/**
 * 树形展开状态
 */
export interface UseTreeExpandState {
  /** 已展开的节点ID集合 */
  expandedKeys: Set<number>
  /** 切换展开/收起 */
  toggle: (id: number) => void
  /** 展开所有 */
  expandAll: () => void
  /** 收起所有 */
  collapseAll: () => void
}
```

---

## Validation Rules (验证规则)

### 后端响应验证

```typescript
/**
 * 验证后端返回的分类数据
 */
function validateCategoryTree(node: any): node is CategoryTreeNode {
  return (
    typeof node === 'object' &&
    typeof node.id === 'number' && node.id > 0 &&
    typeof node.pid === 'number' && node.pid >= 0 &&
    typeof node.name === 'string' && node.name.length > 0 &&
    typeof node.image === 'string' &&
    typeof node.weigh === 'number' &&
    Array.isArray(node.childlist)
  )
}
```

### 层级深度验证

```typescript
/**
 * 最大层级深度
 */
const MAX_DEPTH = 4

/**
 * 计算节点深度
 */
function calculateDepth(node: CategoryTreeNode, index: CategoryIndex): number {
  let depth = 0
  let current = node

  while (current.pid !== 0) {
    depth++
    current = index.byId.get(current.pid)
    if (!current || depth > MAX_DEPTH) {
      throw new Error(`Invalid tree structure: depth > ${MAX_DEPTH}`)
    }
  }

  return depth
}
```

---

## Data Flow (数据流)

```
1. API请求
   └─> GET /api/wanlshop/category/tree
       └─> ApiResponse<CategoryTreeNode[]>

2. 数据验证
   └─> validateCategoryTree()
       └─> CategoryTreeNode[] (验证通过)

3. 索引构建
   └─> buildCategoryIndex()
       └─> CategoryIndex

4. UI渲染
   └─> toUINodes()
       └─> CategoryUINode[] (包含展开状态)

5. 用户交互
   └─> onClick/onToggle
       └─> 更新expandedKeys / 导航到新页面
```

---

## Summary

### 核心实体

1. **CategoryTreeNode**: 后端返回的树形数据
2. **CategoryIndex**: 前端扁平化索引
3. **CategoryUINode**: UI层节点 (包含状态)
4. **CategoryPathItem**: 面包屑路径
5. **CategoryFilter**: 筛选参数

### 类型文件位置

```
src/types/category.ts  # 所有分类相关类型定义
```

### 下一步

数据模型定义完成,可以进入:
- API合约设计 (contracts/)
- 快速入门文档 (quickstart.md)
