/**
 * 分类树工具函数
 * 提供树形数据处理和高效查询功能
 */

import { CategoryTreeNode, CategoryApiIndex } from '../types/category'

/**
 * 最大层级深度
 */
export const MAX_DEPTH = 4

/**
 * 构建分类索引
 * @param tree 分类树数组
 * @returns 分类索引对象
 */
export function buildCategoryIndex(tree: CategoryTreeNode[]): CategoryApiIndex {
  const byId = new Map<number, CategoryTreeNode>()
  const byParentId = new Map<number, CategoryTreeNode[]>()
  const allIds: number[] = []

  /**
   * 递归遍历树形数据
   */
  function traverse(nodes: CategoryTreeNode[], parentId: number = 0): void {
    nodes.forEach((node) => {
      // 添加到ID映射
      byId.set(node.id, node)
      allIds.push(node.id)

      // 添加到父ID映射
      if (!byParentId.has(parentId)) {
        byParentId.set(parentId, [])
      }
      byParentId.get(parentId)!.push(node)

      // 递归处理子节点
      if (node.childlist && node.childlist.length > 0) {
        traverse(node.childlist, node.id)
      }
    })
  }

  traverse(tree)

  // 按weigh排序每个父级的子分类
  byParentId.forEach((children) => {
    children.sort((a, b) => b.weigh - a.weigh) // 倒序,值越大越靠前
  })

  return { byId, byParentId, allIds }
}

/**
 * 获取分类路径 (用于面包屑)
 * @param categoryId 分类ID
 * @param index 分类索引
 * @returns 分类路径数组 (从根到当前分类)
 */
export function getCategoryPath(
  categoryId: number,
  index: CategoryApiIndex
): CategoryTreeNode[] {
  const path: CategoryTreeNode[] = []
  let current = index.byId.get(categoryId)

  if (!current) return path

  // 向上追溯到根节点
  while (current && current.pid !== 0) {
    path.unshift(current)
    current = index.byId.get(current.pid)

    // 防止无限循环
    if (path.length > MAX_DEPTH) {
      console.error('[getCategoryPath] 检测到循环引用或层级过深')
      break
    }
  }

  // 添加根节点
  if (current) {
    path.unshift(current)
  }

  return path
}

/**
 * 获取所有子孙节点ID (用于商品筛选)
 * @param categoryId 分类ID
 * @param index 分类索引
 * @returns 所有子孙节点ID数组 (包含自身)
 */
export function getDescendants(
  categoryId: number,
  index: CategoryApiIndex
): number[] {
  const result: number[] = [categoryId]

  function collectChildren(id: number): void {
    const children = index.byParentId.get(id) || []
    children.forEach((child) => {
      result.push(child.id)
      collectChildren(child.id)
    })
  }

  collectChildren(categoryId)
  return result
}

/**
 * 计算节点深度 (从0开始,0表示一级分类)
 * @param categoryId 分类ID
 * @param index 分类索引
 * @returns 深度值 (0-3)
 */
export function getNodeDepth(
  categoryId: number,
  index: CategoryApiIndex
): number {
  const path = getCategoryPath(categoryId, index)
  return Math.max(0, path.length - 1)
}

/**
 * 判断是否为叶子节点 (无子分类)
 * @param categoryId 分类ID
 * @param index 分类索引
 * @returns 是否为叶子节点
 */
export function isLeafNode(
  categoryId: number,
  index: CategoryApiIndex
): boolean {
  const children = index.byParentId.get(categoryId) || []
  return children.length === 0
}

/**
 * 获取根分类列表 (一级分类)
 * @param index 分类索引
 * @returns 根分类数组
 */
export function getRootCategories(index: CategoryApiIndex): CategoryTreeNode[] {
  return index.byParentId.get(0) || []
}

/**
 * 获取指定分类的子分类
 * @param categoryId 分类ID
 * @param index 分类索引
 * @returns 子分类数组
 */
export function getChildren(
  categoryId: number,
  index: CategoryApiIndex
): CategoryTreeNode[] {
  return index.byParentId.get(categoryId) || []
}

/**
 * 获取分类的子分类数量
 * @param categoryId 分类ID
 * @param index 分类索引
 * @returns 子分类数量
 */
export function getChildrenCount(
  categoryId: number,
  index: CategoryApiIndex
): number {
  const children = getChildren(categoryId, index)
  return children.length
}
