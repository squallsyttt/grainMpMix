# API合约: 分类树接口

**Endpoint**: `GET /api/wanlshop/category/tree`
**Description**: 获取完整的商品分类树形结构
**Authentication**: 不需要Token

## Request

### HTTP Method
```
GET
```

### Headers
```
Content-Type: application/json
```

### Query Parameters

无

### Request Body

无

## Response

### Success Response (HTTP 200)

#### Response Headers
```
Content-Type: application/json
```

#### Response Body

```typescript
{
  "code": 1,                    // 成功状态码
  "msg": "获取成功",             // 响应消息
  "time": "1760672063",         // 响应时间戳(秒)
  "data": CategoryTreeNode[]    // 分类树数组
}
```

#### CategoryTreeNode 结构

```typescript
interface CategoryTreeNode {
  id: number                    // 分类ID
  pid: number                   // 父分类ID (0表示根分类)
  name: string                  // 分类名称
  image: string                 // 分类图标路径 (相对路径)
  weigh: number                 // 排序权重 (值越大越靠前)
  childlist: CategoryTreeNode[] // 子分类列表
  type_text: string             // 类型文本 (可选)
  flag_text: string             // 标记文本 (可选)
  spacer: string                // 间隔符 (可选)
}
```

#### 示例响应

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1760672063",
  "data": [
    {
      "id": 104,
      "pid": 0,
      "name": "精米",
      "image": "/uploads/20251002/2cc15ecf36b9d7d9dac000c3513970f4.jpg",
      "weigh": 104,
      "type_text": "",
      "flag_text": "",
      "spacer": "",
      "childlist": []
    },
    {
      "id": 105,
      "pid": 0,
      "name": "碎米",
      "image": "/uploads/20251003/2cc15ecf36b9d7d9dac000c3513970f4.jpg",
      "weigh": 105,
      "type_text": "",
      "flag_text": "",
      "spacer": "",
      "childlist": []
    },
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
    },
    {
      "id": 107,
      "pid": 0,
      "name": "新米",
      "image": "/uploads/20251003/2cc15ecf36b9d7d9dac000c3513970f4.jpg",
      "weigh": 107,
      "type_text": "",
      "flag_text": "",
      "spacer": "",
      "childlist": []
    }
  ]
}
```

### Error Response

#### HTTP 200 (业务错误)

```json
{
  "code": 0,
  "msg": "获取失败",
  "time": "1760672063"
}
```

#### HTTP 500 (服务器错误)

```json
{
  "code": 0,
  "msg": "服务器内部错误",
  "time": "1760672063"
}
```

## 业务规则

1. **排序规则**: 同级分类按 `weigh` 字段倒序排列 (值越大越靠前)
2. **层级限制**: 支持最多4层嵌套 (前端只展示4层,超出部分忽略)
3. **图片路径**: 返回相对路径,前端需拼接API base URL
4. **空子分类**: `childlist` 为空数组 `[]`,不为 `null`
5. **根分类**: `pid` 为 `0` 的分类为一级分类(根分类)

## 前端使用示例

```typescript
import { get } from '@/services/request'
import { CategoryTreeNode } from '@/types/category'

/**
 * 获取分类树
 */
async function fetchCategoryTree(): Promise<CategoryTreeNode[]> {
  try {
    const response = await get<CategoryTreeNode[]>(
      '/api/wanlshop/category/tree',
      {},
      false // 不需要Token
    )

    if (response.code === 1 && response.data) {
      return response.data
    } else {
      throw new Error(response.msg || '获取分类失败')
    }
  } catch (error) {
    console.error('[fetchCategoryTree] 错误:', error)
    throw error
  }
}

// 使用示例
const categories = await fetchCategoryTree()
console.log('分类数量:', categories.length)
```

## 测试用例

### Test Case 1: 成功获取分类树

**Request**:
```bash
curl -X GET \
  -H "Content-Type: application/json" \
  'http://grain.local.com/api/wanlshop/category/tree'
```

**Expected Response**:
```json
{
  "code": 1,
  "msg": "获取成功",
  "data": [...]  // 包含完整分类树
}
```

### Test Case 2: 验证树形结构

**Assertion**:
1. 所有节点的 `id` 唯一
2. 除根节点外,所有节点的 `pid` 对应存在的父节点ID
3. `childlist` 为数组类型
4. `weigh` 为数字类型

### Test Case 3: 验证层级深度

**Assertion**:
1. 从任意叶子节点向上追溯,最多4层
2. 所有根节点的 `pid` === 0

## 变更历史

| 版本 | 日期 | 变更内容 |
|------|------|----------|
| 1.0 | 2025-10-17 | 初始版本 |

## 相关文档

- [数据模型](../data-model.md)
- [功能规范](../spec.md)
