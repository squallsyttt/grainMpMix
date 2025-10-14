# 快速开始: 商家列表与商家详情

**功能**: 商家列表与商家详情
**分支**: 005-logo
**日期**: 2025-10-14

本指南帮助开发者快速上手商家列表功能的开发、测试和调试。

---

## 环境要求

### 必需环境

| 工具 | 版本 | 说明 |
|------|------|------|
| Node.js | >= 16.0.0 | JavaScript运行时 |
| npm | >= 8.0.0 | 包管理器 |
| 微信开发者工具 | 最新稳定版 | 小程序调试工具 |
| Git | >= 2.0.0 | 版本控制 |

### 技术栈

```json
{
  "framework": "Taro 3.6.24",
  "language": "TypeScript 5.9.3",
  "ui": "@nutui/nutui-react-taro@2.3.10",
  "icons": "@nutui/icons-react-taro@3.0.2"
}
```

---

## 快速启动

### 1. 克隆项目并切换分支

```bash
# 克隆项目
git clone <repository-url>
cd grainMpMix

# 切换到功能分支
git checkout 005-logo

# 查看分支状态
git status
```

### 2. 安装依赖

```bash
# 安装项目依赖
npm install

# 验证安装
npm list @nutui/nutui-react-taro
# 应显示: @nutui/nutui-react-taro@2.3.10
```

### 3. 启动开发服务器

```bash
# 启动微信小程序开发模式
npm run dev:weapp

# 或启动H5开发模式(用于快速调试)
npm run dev:h5
```

### 4. 打开微信开发者工具

1. 打开微信开发者工具
2. 选择"导入项目"
3. 项目路径选择: `grainMpMix/dist/`
4. AppID: `wxe63c298b4eec57f0`(或使用测试号)
5. 点击"导入"

---

## 项目结构导览

```
grainMpMix/
├── src/
│   ├── pages/
│   │   ├── merchant/              # 商家列表页(本功能)
│   │   │   ├── index.tsx
│   │   │   └── index.less
│   │   └── merchant-detail/       # 商家详情页(本功能,待创建)
│   │       ├── index.tsx
│   │       └── index.less
│   ├── components/
│   │   ├── MerchantCard/          # 商家卡片组件(待创建)
│   │   ├── MerchantLogo/          # 商家Logo组件(待创建)
│   │   └── EmptyState/            # 空状态组件(待创建)
│   ├── services/
│   │   ├── merchant.ts            # 商家API服务(待创建)
│   │   └── request.ts             # 网络请求封装(已有)
│   ├── types/
│   │   ├── merchant.ts            # 商家类型定义(待创建)
│   │   └── regional-pricing.ts   # 区域定价类型(待创建)
│   ├── contexts/
│   │   └── RegionContext.tsx      # 区域上下文(已有)
│   └── utils/
│       ├── image.ts               # 图片处理工具(待创建)
│       └── constants.ts           # 常量定义(待创建)
└── specs/005-logo/                # 本功能的规范文档
    ├── spec.md                    # 功能规范
    ├── plan.md                    # 实现计划
    ├── research.md                # 研究文档
    ├── data-model.md              # 数据模型
    ├── quickstart.md              # 本文档
    └── contracts/
        └── merchant.yaml          # API合约
```

---

## 开发流程

### Phase 1: 类型定义

**创建 `src/types/merchant.ts`:**

```typescript
/**
 * 商家类型定义
 *
 * 基于API合约: specs/005-logo/contracts/merchant.yaml
 */

export interface Merchant {
  id: number
  name: string
  logo?: string
  region_id: number
  region_name: string
  province: string
  city: string
  address?: string
  phone?: string
  business_hours?: string
  description?: string
  is_active: 0 | 1
  rating?: number
  years_in_business?: number
  certification_status?: 'verified' | 'pending' | 'none'
  created_at: string
  updated_at: string
}

export interface MerchantListItem extends Merchant {
  distance?: number
  product_tags?: string[]
}

// 更多类型定义见 data-model.md
```

### Phase 2: API服务

**创建 `src/services/merchant.ts`:**

```typescript
/**
 * 商家API服务
 */

import { get } from './request'
import {
  Merchant,
  MerchantListItem,
  GetMerchantListParams,
  GetMerchantListResponse
} from '../types/merchant'
import { ApiResponse, PaginationData } from '../types/api'

/**
 * 获取商家列表
 */
export async function getMerchantList(
  params?: GetMerchantListParams
): Promise<ApiResponse<PaginationData<MerchantListItem>>> {
  try {
    const response = await get<GetMerchantListResponse>(
      '/api/merchant/list',
      params
    )
    return response
  } catch (error) {
    console.error('[MerchantService] 获取商家列表失败:', error)
    throw error
  }
}

// 更多API服务见 contracts/merchant.yaml
```

### Phase 3: 组件开发

**创建 `src/components/MerchantLogo/index.tsx`:**

完整实现见 `research.md` 第1.1节。

**创建 `src/components/MerchantCard/index.tsx`:**

完整实现见 `research.md` 第4.2节。

### Phase 4: 页面开发

**更新 `src/pages/merchant/index.tsx`:**

完整实现见 `research.md` 第3.1节。

---

## 测试数据准备

### Mock数据结构

**创建 `src/data/mock-merchants.ts`:**

```typescript
import { MerchantListItem } from '../types/merchant'

export const mockMerchants: MerchantListItem[] = [
  {
    id: 1001,
    name: "五常大米批发店",
    logo: "https://picsum.photos/200?random=1",
    region_id: 230100,
    region_name: "哈尔滨市",
    province: "黑龙江省",
    city: "哈尔滨市",
    address: "南岗区中央大街123号",
    phone: "13800138000",
    business_hours: "09:00-18:00",
    description: "专营五常大米,品质保证",
    is_active: 1,
    rating: 4.5,
    years_in_business: 5,
    certification_status: "verified",
    product_tags: ["大米", "碎米"],
    created_at: "2024-01-01T10:00:00Z",
    updated_at: "2024-10-14T12:00:00Z"
  },
  {
    id: 1002,
    name: "东北粮油直销",
    // logo缺失 -> 测试默认占位图
    region_id: 230100,
    region_name: "哈尔滨市",
    province: "黑龙江省",
    city: "哈尔滨市",
    address: "道里区友谊路456号",
    is_active: 1,
    rating: 4.2,
    product_tags: ["大米"],
    created_at: "2024-02-01T10:00:00Z",
    updated_at: "2024-10-14T12:00:00Z"
  },
  // 更多测试数据...
]
```

### 使用Mock数据

在开发阶段,可以在API服务中使用Mock数据:

```typescript
// src/services/merchant.ts

const USE_MOCK = process.env.NODE_ENV === 'development'

export async function getMerchantList(
  params?: GetMerchantListParams
): Promise<ApiResponse<PaginationData<MerchantListItem>>> {
  if (USE_MOCK) {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 500))

    // 返回Mock数据
    return {
      code: 0,
      msg: 'success',
      data: {
        total: mockMerchants.length,
        per_page: params?.limit || 20,
        current_page: params?.page || 1,
        last_page: Math.ceil(mockMerchants.length / (params?.limit || 20)),
        data: mockMerchants
      }
    }
  }

  // 生产环境使用真实API
  const response = await get<GetMerchantListResponse>(
    '/api/merchant/list',
    params
  )
  return response
}
```

---

## 调试技巧

### 1. 区域选择调试

```typescript
// 在merchant/index.tsx中打印区域信息
const MerchantPage = () => {
  const { province, city } = useRegion()

  useEffect(() => {
    console.log('[Merchant] 当前区域:', { province, city })
  }, [province, city])
}
```

### 2. 网络请求调试

在微信开发者工具中:
1. 打开"调试器" > "Network"选项卡
2. 查看请求URL、参数、响应
3. 检查请求耗时

### 3. 组件渲染调试

```typescript
// 使用React DevTools查看组件树
// 在微信开发者工具中打开"调试器" > "Console"
console.log('[MerchantCard] 渲染数据:', merchant)
```

### 4. 性能分析

```typescript
// 记录渲染时间
const MerchantPage = () => {
  useEffect(() => {
    const startTime = performance.now()

    loadMerchants().then(() => {
      const endTime = performance.now()
      console.log('[Performance] 商家列表加载耗时:', endTime - startTime, 'ms')
    })
  }, [])
}
```

### 5. Logo占位图测试

测试不同场景下的Logo显示:

```typescript
const testCases = [
  { name: "测试A", logo: "https://valid-url.com/logo.jpg" },    // 正常logo
  { name: "测试B", logo: "" },                                 // 空字符串
  { name: "测试C", logo: undefined },                           // undefined
  { name: "测试D", logo: "https://invalid-url.com/404.jpg" }, // 无效URL
]
```

---

## 常见问题

### Q1: NutUI组件样式不生效

**原因**: NutUI样式未正确引入

**解决方案**:

```typescript
// src/app.tsx
import '@nutui/nutui-react-taro/dist/style.css'
```

### Q2: 图片懒加载不工作

**原因**: 微信小程序基础库版本过低

**解决方案**:
1. 微信开发者工具 > 详情 > 本地设置 > 调试基础库 >= 2.9.0
2. 或在代码中降级处理:

```typescript
<Image
  src={logo}
  lazyLoad={Taro.getSystemInfoSync().SDKVersion >= '2.9.0'}
/>
```

### Q3: RegionContext为空

**原因**: 用户首次进入未选择区域

**解决方案**:

```typescript
const MerchantPage = () => {
  const { province, city, openSelector } = useRegion()

  if (!province && !city) {
    return (
      <Empty
        description="请先选择您所在的地区"
        actions={[
          {
            text: '选择地区',
            type: 'primary',
            onClick: openSelector
          }
        ]}
      />
    )
  }

  // 正常渲染
}
```

### Q4: 无限滚动不触发加载

**原因**: InfiniteLoading组件的`hasMore`未正确设置

**解决方案**:

```typescript
const [hasMore, setHasMore] = useState(true)

const loadMore = async () => {
  const response = await getMerchantList({ page: page + 1 })

  // 关键:判断是否还有更多数据
  if (response.data.data.length === 0) {
    setHasMore(false) // 没有更多数据
  }
}
```

### Q5: TypeScript类型错误

**原因**: 类型定义不完整或不匹配

**解决方案**:
1. 确保所有类型文件正确导入
2. 运行类型检查: `npx tsc --noEmit`
3. 参考 `data-model.md` 确保类型定义完整

---

## 提交规范

遵循 Conventional Commits 格式:

```bash
# 新增功能
git commit -m "feat(merchant): 实现商家列表页"

# 修复bug
git commit -m "fix(merchant): 修复logo图片加载失败问题"

# 样式优化
git commit -m "style(merchant): 优化商家卡片间距"

# 重构
git commit -m "refactor(merchant): 重构商家API服务"

# 性能优化
git commit -m "perf(merchant): 优化商家列表渲染性能"

# 文档
git commit -m "docs(merchant): 更新商家API文档"
```

---

## 下一步

1. ✅ 阅读完本指南
2. ⬜ 查看 `spec.md` 了解功能需求
3. ⬜ 查看 `data-model.md` 了解数据结构
4. ⬜ 查看 `research.md` 了解技术决策
5. ⬜ 开始开发(使用 `/speckit.tasks` 生成任务列表)
6. ⬜ 运行测试
7. ⬜ 提交代码
8. ⬜ 创建Pull Request

---

## 参考资源

- [NutUI React Taro 文档](https://nutui.jd.com/h5/react/2x/#/zh-CN/guide/start-react)
- [Taro 官方文档](https://taro-docs.jd.com/docs/)
- [OpenAPI 规范](./contracts/merchant.yaml)
- [项目宪法](../../.specify/memory/constitution.md)
- [Claude Code 规范](../../CLAUDE.md)

---

## 联系方式

如有问题,请联系:
- 提Issue: https://github.com/your-org/grainMpMix/issues
- 团队协作: 参考项目README中的联系方式
