# Research Document: 首页商品分类多级展示优化

**Feature**: 006-code-1-msg
**Date**: 2025-10-17
**Status**: Phase 0 Complete

## Research Overview

本文档记录了多级分类展示功能的技术研究和设计决策。由于本功能基于现有Taro + React + NutUI技术栈,大部分技术选型已确定,研究重点在UI组件选择、数据结构设计和性能优化策略。

---

## R1: NutUI组件选择

### 研究问题

如何使用NutUI组件库实现以下UI需求:
1. 首页分类网格展示
2. 分类导航页的树形展开/收起
3. 分类详情页的二级子分类水平滚动

### 决策

| UI需求 | 选择的组件 | 理由 |
|--------|-----------|------|
| 首页分类网格 | `Grid` + `Grid.Item` | NutUI官方网格组件,支持2列布局、间距配置 |
| 分类树展开/收起 | `Collapse` + `Collapse.Item` | 手风琴组件,原生支持展开/收起动画 |
| 二级分类导航 | `Tabs` (horizontal模式) | 水平滚动标签页,适合移动端分类切换 |
| 分类图标 | `Image` (lazy模式) | 懒加载图片组件,优化性能 |
| 展开图标 | `ArrowDown`/`ArrowRight` (from @nutui/icons-react-taro) | 符合宪法规定,禁止使用文本符号 |

### 替代方案及拒绝理由

- **自定义Grid**: 拒绝理由 - NutUI的Grid组件已满足需求,自定义会增加维护成本
- **使用ScrollView实现树形**: 拒绝理由 - Collapse组件提供了开箱即用的动画和状态管理
- **使用ScrollView实现水平导航**: 拒绝理由 - Tabs组件提供了更好的交互反馈和可访问性

### 实现示例

```tsx
// 首页分类网格
<Grid columns={2} gap={16}>
  {categories.map(cat => (
    <Grid.Item key={cat.id}>
      <View onClick={() => handleClick(cat.id)}>
        <Image src={cat.image} lazy />
        <Text>{cat.name}</Text>
      </View>
    </Grid.Item>
  ))}
</Grid>

// 分类树展开/收起
<Collapse value={expandedKeys} onChange={setExpandedKeys}>
  {categories.map(cat => (
    <Collapse.Item
      key={cat.id}
      name={String(cat.id)}
      title={cat.name}
      icon={<ArrowDown />}
    >
      {cat.childlist.map(child => (
        <View key={child.id}>{child.name}</View>
      ))}
    </Collapse.Item>
  ))}
</Collapse>

// 二级分类导航
<Tabs value={activeTab} onChange={setActiveTab} direction="horizontal">
  <Tabs.TabPane title="全部" />
  {subCategories.map(sub => (
    <Tabs.TabPane key={sub.id} title={sub.name} />
  ))}
</Tabs>
```

---

## R2: 树形数据结构处理

### 研究问题

如何高效处理4层嵌套的树形分类数据,支持:
1. 扁平化(用于快速查找)
2. 路径计算(面包屑导航)
3. 子孙节点收集(商品筛选)

### 决策

采用 **双向索引模式**: 同时维护树形结构和扁平Map索引。

**数据结构**:
```typescript
// 后端返回的树形结构 (保持原样)
interface CategoryTreeNode {
  id: number
  pid: number
  name: string
  image: string
  weigh: number
  childlist: CategoryTreeNode[]
}

// 前端扁平化索引 (用于快速查找)
interface CategoryIndex {
  byId: Map<number, CategoryTreeNode>          // O(1)查找
  byParentId: Map<number, CategoryTreeNode[]>  // O(1)获取子节点
  allIds: number[]                              // 排序后的所有ID
}
```

**核心工具函数**:

```typescript
/**
 * 扁平化树形数据,构建索引
 */
function buildCategoryIndex(tree: CategoryTreeNode[]): CategoryIndex {
  const byId = new Map()
  const byParentId = new Map()
  const allIds: number[] = []

  function traverse(nodes: CategoryTreeNode[], parentId: number = 0) {
    nodes.forEach(node => {
      byId.set(node.id, node)
      allIds.push(node.id)

      if (!byParentId.has(parentId)) {
        byParentId.set(parentId, [])
      }
      byParentId.get(parentId).push(node)

      if (node.childlist.length > 0) {
        traverse(node.childlist, node.id)
      }
    })
  }

  traverse(tree)
  return { byId, byParentId, allIds }
}

/**
 * 获取分类路径 (用于面包屑)
 */
function getCategoryPath(
  categoryId: number,
  index: CategoryIndex
): CategoryTreeNode[] {
  const path: CategoryTreeNode[] = []
  let current = index.byId.get(categoryId)

  while (current && current.pid !== 0) {
    path.unshift(current)
    current = index.byId.get(current.pid)
  }

  if (current) path.unshift(current) // 添加根节点
  return path
}

/**
 * 获取所有子孙节点 (用于商品筛选)
 */
function getDescendants(
  categoryId: number,
  index: CategoryIndex
): number[] {
  const result: number[] = [categoryId]

  function collectChildren(id: number) {
    const children = index.byParentId.get(id) || []
    children.forEach(child => {
      result.push(child.id)
      collectChildren(child.id)
    })
  }

  collectChildren(categoryId)
  return result
}
```

### 替代方案及拒绝理由

- **仅使用树形结构**: 拒绝理由 - 查找父节点需要O(n)遍历,性能差
- **完全扁平化(失去层级关系)**: 拒绝理由 - 无法高效渲染树形UI
- **使用第三方库(如lodash-tree)**: 拒绝理由 - 增加bundle大小,自定义工具函数足够

### 性能评估

- 索引构建: O(n),n为分类总数
- ID查找: O(1)
- 路径计算: O(depth),最大depth=4
- 子孙收集: O(descendants),平均每个节点<10个子孙

---

## R3: 状态管理策略

### 研究问题

如何管理分类数据和UI状态,避免prop drilling和重复请求?

### 决策

采用 **React Hooks + 本地状态** 模式,不引入Redux/MobX等全局状态库。

**理由**:
1. MVP阶段,状态复杂度低
2. 只有3个页面需要共享分类数据
3. 避免引入新依赖,符合宪法"最小复杂度"原则

**实现方案**:

1. **自定义Hook管理分类数据**:

```typescript
// hooks/useCategories.ts
function useCategories() {
  const [tree, setTree] = useState<CategoryTreeNode[]>([])
  const [index, setIndex] = useState<CategoryIndex | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCategories = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await get<CategoryTreeNode[]>(
        '/api/wanlshop/category/tree',
        {},
        false // 不需要Token
      )

      if (response.code === 1 && response.data) {
        setTree(response.data)
        setIndex(buildCategoryIndex(response.data))
      } else {
        throw new Error(response.msg || '获取分类失败')
      }
    } catch (err) {
      setError(err.message)
      Taro.showToast({ title: '加载分类失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  return { tree, index, loading, error, refetch: fetchCategories }
}
```

2. **通过URL参数传递分类ID**:

```typescript
// 首页 -> 商品列表页
Taro.navigateTo({
  url: `/pages/product-list/index?categoryId=${cat.id}&name=${cat.name}`
})

// 商品列表页获取参数
const { categoryId, name } = useRouter().params
```

3. **使用React.memo优化重渲染**:

```typescript
const CategoryCard = React.memo<CategoryCardProps>(({ category, onClick }) => {
  return (
    <View onClick={() => onClick(category.id)}>
      <Image src={category.image} lazy />
      <Text>{category.name}</Text>
    </View>
  )
})
```

### 替代方案及拒绝理由

- **使用Context API**: 拒绝理由 - 会导致不必要的全局重渲染,useCategories Hook足够
- **引入Redux**: 拒绝理由 - 过度设计,增加学习曲线和bundle大小
- **Taro.setStorageSync缓存**: 拒绝理由 - 用户明确表示MVP不需要缓存

---

## R4: 性能优化策略

### 研究问题

如何确保满足性能目标:
- 首页分类加载 < 500ms
- 树形展开响应 < 100ms
- 支持100+分类数据

### 决策

| 优化目标 | 策略 | 实现 |
|----------|------|------|
| 减少首屏加载时间 | 懒加载图片 | 使用NutUI Image组件的lazy属性 |
| 减少重渲染 | React.memo + useCallback | 缓存子组件和事件处理器 |
| 优化树形展开 | CSS动画而非JS动画 | 使用NutUI Collapse的原生transition |
| 减少bundle大小 | Tree-shaking | 使用SVG图标按需导入 |
| 防止重复请求 | 请求去重 | useEffect依赖数组+loading状态 |

**关键实现**:

1. **图片懒加载**:
```tsx
<Image src={fullImageUrl(category.image)} lazy />
```

2. **事件处理优化**:
```tsx
const handleCategoryClick = useCallback((id: number) => {
  Taro.navigateTo({ url: `/pages/product-list/index?categoryId=${id}` })
}, [])
```

3. **树形节点优化**:
```tsx
const CategoryNode = React.memo<NodeProps>(({ node, onToggle }) => {
  return (
    <View>
      <View onClick={() => onToggle(node.id)}>
        {node.childlist.length > 0 && <ArrowDown />}
        {node.name}
      </View>
    </View>
  )
})
```

### 替代方案及拒绝理由

- **虚拟滚动**: 拒绝理由 - 数据量<100,普通渲染足够,引入虚拟滚动增加复杂度
- **Web Worker处理数据**: 拒绝理由 - 小程序环境限制,数据量不足以justify
- **预加载所有图片**: 拒绝理由 - 浪费带宽,用户可能不浏览所有分类

---

## R5: 路由设计

### 研究问题

如何设计3个新增/改造页面的路由和参数传递?

### 决策

| 页面 | 路由 | 参数 | 说明 |
|------|------|------|------|
| 首页 | `/pages/index/index` | 无 | 现有页面,展示前6个分类 |
| 分类导航页 | `/pages/category-nav/index` | 无 | 展示完整分类树 |
| 商品列表页 | `/pages/product-list/index` | `?categoryId=106&name=香米` | 显示指定分类商品 |

**路由配置** (app.config.ts):
```typescript
export default {
  pages: [
    'pages/index/index',
    'pages/category-nav/index',    // 新增
    'pages/product-list/index',    // 新增
    // ...
  ],
  window: {
    navigationBarTitleText: '粮仓Mix'
  }
}
```

**导航页面配置**:
```typescript
// pages/category-nav/index.config.ts
export default {
  navigationBarTitleText: '全部分类'
}

// pages/product-list/index.config.ts
export default {
  navigationBarTitleText: '商品列表'
}
```

### 替代方案及拒绝理由

- **使用Tab页切换**: 拒绝理由 - 不符合用户点击导航的心智模型
- **使用hash路由**: 拒绝理由 - Taro不支持,必须使用页面路由
- **在URL中传递完整分类对象**: 拒绝理由 - URL长度限制,只传ID即可

---

## Research Summary

### 核心技术决策

1. **UI组件**: 使用NutUI的Grid、Collapse、Tabs、Image组件
2. **数据结构**: 双向索引模式 (树形 + Map索引)
3. **状态管理**: React Hooks + URL参数传递
4. **性能优化**: 懒加载 + React.memo + useCallback
5. **路由设计**: 3个页面,通过categoryId参数关联

### 无需进一步研究的项目

- ✅ 技术栈已确定 (Taro + React + NutUI)
- ✅ 后端API已存在 (GET /api/wanlshop/category/tree)
- ✅ 类型系统已配置 (TypeScript严格模式)
- ✅ 构建工具已配置 (Webpack 5)

### 下一步: Phase 1 设计

研究完成,可以进入Phase 1:
1. 生成数据模型 (data-model.md)
2. 生成API合约 (contracts/)
3. 生成快速入门文档 (quickstart.md)

