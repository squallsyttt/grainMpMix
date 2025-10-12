/**
 * 分类索引工具
 * 提供分类树形结构构建和高效查询功能
 */

import { Category, CategoryLevel, CategoryPathItem } from '../types/category'

/**
 * 分类树节点
 */
export interface CategoryTreeNode extends Category {
  children: CategoryTreeNode[]
}

/**
 * 分类索引类
 */
export class CategoryIndex {
  private categoryMap: Map<string, Category>
  private parentChildrenMap: Map<string, Category[]>
  private levelMap: Map<CategoryLevel, Category[]>

  constructor(categories: Category[]) {
    this.categoryMap = new Map()
    this.parentChildrenMap = new Map()
    this.levelMap = new Map()

    this.buildIndex(categories)
  }

  /**
   * 构建索引
   */
  private buildIndex(categories: Category[]): void {
    // 构建分类 ID -> 分类对象的映射
    categories.forEach((category) => {
      this.categoryMap.set(category.id, category)
    })

    // 构建父级 ID -> 子分类列表的映射
    categories.forEach((category) => {
      const parentId = category.parentId || 'root'
      if (!this.parentChildrenMap.has(parentId)) {
        this.parentChildrenMap.set(parentId, [])
      }
      this.parentChildrenMap.get(parentId)!.push(category)
    })

    // 按层级排序子分类
    this.parentChildrenMap.forEach((children) => {
      children.sort((a, b) => a.sort - b.sort)
    })

    // 构建层级 -> 分类列表的映射
    categories.forEach((category) => {
      if (!this.levelMap.has(category.level)) {
        this.levelMap.set(category.level, [])
      }
      this.levelMap.get(category.level)!.push(category)
    })

    // 按排序权重排序
    this.levelMap.forEach((categories) => {
      categories.sort((a, b) => a.sort - b.sort)
    })
  }

  /**
   * 根据 ID 获取分类
   */
  getCategoryById(id: string): Category | undefined {
    return this.categoryMap.get(id)
  }

  /**
   * 根据父级 ID 获取子分类列表
   */
  getChildren(parentId: string | null): Category[] {
    const key = parentId || 'root'
    return this.parentChildrenMap.get(key) || []
  }

  /**
   * 获取指定层级的所有分类
   */
  getCategoriesByLevel(level: CategoryLevel): Category[] {
    return this.levelMap.get(level) || []
  }

  /**
   * 获取一级分类（根分类）
   */
  getRootCategories(): Category[] {
    return this.getCategoriesByLevel(1)
  }

  /**
   * 获取分类的所有祖先（从根到父级）
   */
  getAncestors(categoryId: string): Category[] {
    const ancestors: Category[] = []
    let current = this.categoryMap.get(categoryId)

    while (current && current.parentId) {
      const parent = this.categoryMap.get(current.parentId)
      if (parent) {
        ancestors.unshift(parent)
        current = parent
      } else {
        break
      }
    }

    return ancestors
  }

  /**
   * 获取分类的完整路径（包含自己）
   */
  getPath(categoryId: string): CategoryPathItem[] {
    const category = this.categoryMap.get(categoryId)
    if (!category) return []

    const ancestors = this.getAncestors(categoryId)
    const path = [...ancestors, category].map((cat) => ({
      id: cat.id,
      name: cat.name,
      level: cat.level,
    }))

    return path
  }

  /**
   * 获取分类的所有后代（递归获取子孙分类）
   */
  getDescendants(categoryId: string): Category[] {
    const descendants: Category[] = []
    const children = this.getChildren(categoryId)

    children.forEach((child) => {
      descendants.push(child)
      const childDescendants = this.getDescendants(child.id)
      descendants.push(...childDescendants)
    })

    return descendants
  }

  /**
   * 获取分类的所有后代 ID 列表
   */
  getDescendantIds(categoryId: string): string[] {
    return this.getDescendants(categoryId).map((cat) => cat.id)
  }

  /**
   * 获取分类的兄弟分类（同父级的其他分类）
   */
  getSiblings(categoryId: string, includeSelf: boolean = false): Category[] {
    const category = this.categoryMap.get(categoryId)
    if (!category) return []

    const siblings = this.getChildren(category.parentId).filter(
      (cat) => includeSelf || cat.id !== categoryId
    )

    return siblings
  }

  /**
   * 构建分类树
   */
  buildTree(rootId: string | null = null): CategoryTreeNode[] {
    const children = this.getChildren(rootId)

    return children.map((category) => ({
      ...category,
      children: this.buildTree(category.id),
    }))
  }

  /**
   * 获取完整分类树
   */
  getTree(): CategoryTreeNode[] {
    return this.buildTree(null)
  }

  /**
   * 判断分类是否为叶子节点（无子分类）
   */
  isLeaf(categoryId: string): boolean {
    const children = this.getChildren(categoryId)
    return children.length === 0
  }

  /**
   * 判断分类 A 是否为分类 B 的祖先
   */
  isAncestorOf(ancestorId: string, descendantId: string): boolean {
    const ancestors = this.getAncestors(descendantId)
    return ancestors.some((cat) => cat.id === ancestorId)
  }

  /**
   * 判断分类 A 是否为分类 B 的后代
   */
  isDescendantOf(descendantId: string, ancestorId: string): boolean {
    return this.isAncestorOf(ancestorId, descendantId)
  }

  /**
   * 搜索分类（支持名称模糊匹配）
   */
  search(keyword: string): Category[] {
    const searchTerm = keyword.toLowerCase().trim()
    const results: Category[] = []

    this.categoryMap.forEach((category) => {
      const nameMatch = category.name.toLowerCase().includes(searchTerm)
      const descMatch =
        category.description?.toLowerCase().includes(searchTerm) || false

      if (nameMatch || descMatch) {
        results.push(category)
      }
    })

    return results.sort((a, b) => a.sort - b.sort)
  }

  /**
   * 获取分类统计信息
   */
  getStats(): {
    total: number
    byLevel: Record<CategoryLevel, number>
    maxDepth: number
  } {
    const total = this.categoryMap.size
    const byLevel: Record<CategoryLevel, number> = {
      1: 0,
      2: 0,
      3: 0,
    }

    this.levelMap.forEach((categories, level) => {
      byLevel[level] = categories.length
    })

    const maxDepth = Math.max(...Array.from(this.levelMap.keys()))

    return {
      total,
      byLevel,
      maxDepth,
    }
  }

  /**
   * 获取分类深度（从根到该分类的层级数）
   */
  getDepth(categoryId: string): number {
    const category = this.categoryMap.get(categoryId)
    if (!category) return 0

    return this.getAncestors(categoryId).length + 1
  }

  /**
   * 刷新索引（当分类数据更新时调用）
   */
  refresh(categories: Category[]): void {
    this.categoryMap.clear()
    this.parentChildrenMap.clear()
    this.levelMap.clear()
    this.buildIndex(categories)
  }
}

/**
 * 创建分类索引实例的工厂函数
 */
export function createCategoryIndex(categories: Category[]): CategoryIndex {
  return new CategoryIndex(categories)
}

/**
 * 导出默认工厂函数
 */
export default createCategoryIndex
