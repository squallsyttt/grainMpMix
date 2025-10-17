# API 配置说明

## API Base URL 配置

本项目通过 `src/config/api.ts` 统一管理 API Base URL，根据 `process.env.NODE_ENV` 自动切换开发环境和生产环境。

### 配置位置

**唯一配置文件**: `src/config/api.ts`

### 当前配置

```typescript
export function getApiBaseUrl(): string {
  // 开发环境
  if (process.env.NODE_ENV === 'development') {
    return 'http://grain.local.com'
  }

  // 生产环境
  // TODO: 上线前修改为真实的生产环境域名
  return 'https://api.example.com'
}
```

### 上线前必做步骤 ⚠️

1. 打开 `src/config/api.ts`
2. 修改生产环境的返回值为真实域名
3. 删除 TODO 注释
4. 执行构建并测试

**修改示例**：
```typescript
export function getApiBaseUrl(): string {
  if (process.env.NODE_ENV === 'development') {
    return 'http://grain.local.com'
  }

  // 生产环境
  return 'https://api.grain.com'  // ✅ 修改为真实域名
}
```

### 如何在代码中使用

#### 方式1：通过常量（推荐）

```typescript
import { API_BASE_URL } from '@/config/api'

// 拼接完整URL
const fullUrl = `${API_BASE_URL}/uploads/image.jpg`
// 开发环境: http://grain.local.com/uploads/image.jpg
// 生产环境: https://api.grain.com/uploads/image.jpg
```

#### 方式2：通过封装的工具函数（最佳实践）

```typescript
// 图片URL拼接
import { getFullImageUrl } from '@/utils/imageUrl'
const imageUrl = getFullImageUrl('/uploads/image.jpg')

// API请求
import { get, post } from '@/services/request'
// 请求会自动拼接 API_BASE_URL
await get('/api/user/info')
```

### 验证配置

#### 开发环境验证

```bash
# 启动开发服务器
npm run dev:weapp

# 打开微信开发者工具，查看网络请求:
# ✅ 应该看到: http://grain.local.com/api/wanlshop/category/tree
```

#### 生产环境验证

```bash
# 1. 修改 src/config/api.ts 为生产域名
# 2. 构建生产包
npm run build:weapp

# 3. 上传到微信小程序后台测试
# ✅ 应该看到: https://api.grain.com/api/wanlshop/category/tree
```

### 环境切换原理

Taro 在构建时会根据命令自动设置 `process.env.NODE_ENV`：

| 命令 | NODE_ENV | API Base URL |
|------|----------|--------------|
| `npm run dev:weapp` | `development` | `http://grain.local.com` |
| `npm run build:weapp` | `production` | 配置的生产域名 |

**无需手动切换**，构建工具自动处理。

### 注意事项

1. **不要在代码中硬编码URL**
   ```typescript
   // ❌ 错误
   const url = 'http://localhost:8080/api/user'

   // ✅ 正确
   import { get } from '@/services/request'
   const response = await get('/api/user')
   ```

2. **修改配置后需要重启开发服务器**
   修改 `src/config/api.ts` 后，执行：
   ```bash
   # Ctrl+C 停止服务
   npm run dev:weapp  # 重新启动
   ```

3. **生产环境构建前检查清单**
   - [ ] 打开 `src/config/api.ts`
   - [ ] 确认生产环境域名正确
   - [ ] 删除所有 TODO 注释
   - [ ] 执行 `npm run build:weapp`
   - [ ] 上传测试验证 API 请求地址

### 常见问题

**Q: 为什么不在 `.env` 文件中配置？**
A: Taro 对环境变量的支持有限，使用代码配置更简单可靠，且支持 TypeScript 类型检查。

**Q: 如何添加测试环境？**
A: 在 `getApiBaseUrl()` 函数中添加判断：
```typescript
export function getApiBaseUrl(): string {
  const env = process.env.NODE_ENV
  const taroEnv = process.env.TARO_ENV

  if (env === 'development') {
    return 'http://grain.local.com'
  }

  // 可以通过其他环境变量区分测试和生产
  if (process.env.BUILD_ENV === 'test') {
    return 'https://test-api.grain.com'
  }

  return 'https://api.grain.com'
}
```

**Q: 开发时如何临时切换到其他API地址？**
A: 直接修改 `src/config/api.ts` 中的开发环境返回值，重启服务即可。

**Q: 为什么使用函数而不是直接导出常量？**
A: 函数可以在运行时根据环境变量动态计算，更灵活。导出的 `API_BASE_URL` 常量会在模块加载时自动调用函数。

### 相关文件

- 配置文件: `src/config/api.ts`
- 请求封装: `src/services/request.ts`
- 图片URL工具: `src/utils/imageUrl.ts`

---

**最后更新**: 2025-10-17
**维护者**: 开发团队
