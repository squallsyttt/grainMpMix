# Quick Start Guide: 地区化购物车功能完善

**Feature Branch**: `004-`
**Date**: 2025-10-13
**Prerequisites**: [spec.md](./spec.md), [plan.md](./plan.md), [data-model.md](./data-model.md), [research.md](./research.md)

**Purpose**: 提供开发、测试和部署地区化购物车功能的快速启动指南。

---

## 目录

1. [开发环境准备](#1-开发环境准备)
2. [项目启动](#2-项目启动)
3. [功能开发指南](#3-功能开发指南)
4. [测试指南](#4-测试指南)
5. [调试技巧](#5-调试技巧)
6. [常见问题](#6-常见问题)
7. [提交与部署](#7-提交与部署)

---

## 1. 开发环境准备

### 1.1 必需工具

| 工具 | 版本要求 | 用途 | 安装命令 |
|------|---------|------|---------|
| Node.js | >= 16.0.0 | JavaScript运行环境 | [官网下载](https://nodejs.org/) |
| npm | >= 8.0.0 | 包管理工具 | 随Node.js安装 |
| 微信开发者工具 | 最新稳定版 | 小程序开发与调试 | [官网下载](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html) |
| VS Code | 最新版 | 代码编辑器(推荐) | [官网下载](https://code.visualstudio.com/) |

### 1.2 VS Code 插件推荐

```bash
# 必装插件
- ESLint (dbaeumer.vscode-eslint)
- TypeScript and JavaScript Language Features (内置)
- Less IntelliSense (mrmlnc.vscode-less)

# 推荐插件
- Prettier (esbenp.prettier-vscode)
- Auto Rename Tag (formulahendry.auto-rename-tag)
- Path Intellisense (christian-kohler.path-intellisense)
```

### 1.3 项目依赖安装

```bash
# 1. 克隆项目(如果尚未克隆)
git clone <repository-url>
cd grainMpMix

# 2. 切换到功能分支
git checkout 004-

# 3. 安装依赖
npm install

# 4. 验证安装
npm list @tarojs/taro @nutui/nutui-react-taro typescript
```

**预期输出**:
```
grain-mp-mix@1.0.0
├── @nutui/nutui-react-taro@2.3.10
├── @tarojs/taro@3.6.24
└── typescript@5.9.3
```

---

## 2. 项目启动

### 2.1 启动开发服务器

```bash
# 启动微信小程序开发模式
npm run dev:weapp

# 预期输出
# ✔ Webpack compiled successfully in 5.23s
# ✔ Build successfully in 5.34s
# 监听文件修改中...
```

### 2.2 在微信开发者工具中打开项目

1. 打开微信开发者工具
2. 点击 "导入项目"
3. 选择项目根目录下的 `dist` 文件夹
4. AppID填写测试号或真实AppID
5. 点击 "导入"

**预期结果**: 小程序在模拟器中正常显示首页和TabBar

### 2.3 快速验证购物车功能

```bash
# 在微信开发者工具中:
1. 点击底部TabBar的"购物车"图标
2. 应该看到购物车页面(可能是空状态)
3. 在控制台执行以下命令查看购物车数据:
   localStorage.getItem('regional_cart_data')
4. 如果返回null,说明购物车尚未初始化(正常)
```

---

## 3. 功能开发指南

### 3.1 目录结构

```
src/
├── contexts/
│   ├── CartContext.tsx          # 购物车上下文(主要开发文件)
│   └── RegionContext.tsx        # 地区选择上下文(已存在)
├── pages/
│   └── cart/
│       ├── index.tsx            # 购物车页面(主要开发文件)
│       └── index.less           # 购物车样式(主要开发文件)
├── custom-tab-bar/
│   └── index.tsx                # 自定义TabBar(需添加徽标逻辑)
├── types/
│   └── cart.ts                  # 购物车类型定义(需完善)
└── utils/
    └── [待添加] debounce.ts    # 防抖工具函数(可选)
```

### 3.2 开发步骤

#### Step 1: 完善类型定义

**文件**: `src/types/cart.ts`

参考 [data-model.md](./data-model.md) 附录,将完整的类型定义和辅助函数添加到此文件。

**关键函数**:
- `loadCartFromStorage()` - 安全读取localStorage
- `saveCartToStorage()` - 安全保存localStorage
- `calculateCartStats()` - 计算购物车统计信息
- `getTotalItemCount()` - 计算所有地区商品总数(用于TabBar徽标)

**验证**:
```bash
# 确保类型定义无错误
npx tsc --noEmit
```

#### Step 2: 增强 CartContext

**文件**: `src/contexts/CartContext.tsx`

**需要添加的功能**:

1. **防抖处理的数量修改逻辑**
   ```typescript
   import { useMemo } from 'react'
   import debounce from 'lodash/debounce' // 或自定义debounce

   // 在CartContext中添加防抖版本的增加/减少函数
   const debouncedIncrease = useMemo(
     () => debounce((productId: string) => {
       // 增加数量的逻辑
       // ...
       saveCartToStorage(updatedCart) // 保存到localStorage
     }, 300),
     [/* dependencies */]
   )
   ```

   **参考**: [research.md](./research.md) → Topic 1: React防抖最佳实践

2. **localStorage错误降级处理**
   ```typescript
   // 替换现有的localStorage读写逻辑
   import { loadCartFromStorage, saveCartToStorage } from '@/types/cart'

   useEffect(() => {
     const savedCart = loadCartFromStorage() // 使用安全读取函数
     setRegionalCart(savedCart)
   }, [])
   ```

   **参考**: [research.md](./research.md) → Topic 2: localStorage错误处理模式

3. **清空购物车的二次确认逻辑**
   ```typescript
   import { Dialog } from '@nutui/nutui-react-taro'

   const handleClearCart = useCallback(() => {
     Dialog.confirm({
       title: '清空购物车',
       content: '确定清空当前地区的购物车吗?此操作不可恢复',
       onConfirm: () => {
         // 清空逻辑
         const newCart = clearRegionCart(regionalCart, currentRegionKey)
         setRegionalCart(newCart)
         saveCartToStorage(newCart)
         Toast.show({ content: '购物车已清空', icon: 'success' })
       }
     })
   }, [regionalCart, currentRegionKey])
   ```

   **参考**: [research.md](./research.md) → Topic 3: Taro Dialog组件使用

**验证**:
```bash
# 热重载应该自动生效
# 在微信开发者工具控制台测试:
CartContext.clearCart() // 应弹出确认对话框
```

#### Step 3: 完善购物车页面

**文件**: `src/pages/cart/index.tsx`

**需要添加的功能**:

1. **清空购物车按钮**
   ```tsx
   import { Button } from '@nutui/nutui-react-taro'

   <Button
     type="default"
     size="small"
     disabled={currentCart.length === 0}
     onClick={handleClearCart}
   >
     清空购物车
   </Button>
   ```

2. **去结算按钮和登录状态检查**
   ```tsx
   import Taro from '@tarojs/taro'
   import { useContext } from 'react'
   import { UserContext } from '@/contexts/UserContext'

   const { userInfo } = useContext(UserContext)

   const handleCheckout = useCallback(() => {
     if (!userInfo) {
       // 未登录,跳转到登录页
       Taro.navigateTo({
         url: '/pages/login/index?redirect=/pages/order-confirm/index'
       })
       return
     }

     // 已登录,跳转到订单确认页
     Taro.navigateTo({
       url: `/pages/order-confirm/index?regionKey=${currentRegionKey}`
     })
   }, [userInfo, currentRegionKey])
   ```

3. **下拉刷新商品信息**
   ```tsx
   import { usePullDownRefresh } from '@tarojs/taro'

   usePullDownRefresh(async () => {
     try {
       // 获取购物车中所有商品ID
       const productIds = currentCart.map(item => item.product.id)

       // 调用API批量查询最新商品信息
       const response = await fetch('/api/products/batch-query', {
         method: 'POST',
         body: JSON.stringify({ productIds, regionKey: currentRegionKey })
       })
       const { products } = await response.json()

       // 更新购物车商品信息
       const updatedCart = currentCart.map(item => {
         const freshProduct = products.find(p => p.id === item.product.id)
         return freshProduct ? { ...item, product: freshProduct } : item
       })

       // 保存更新后的购物车
       const newRegionalCart = setRegionCart(regionalCart, currentRegionKey, updatedCart)
       setRegionalCart(newRegionalCart)
       saveCartToStorage(newRegionalCart)

       Taro.showToast({ title: '刷新成功', icon: 'success' })
     } catch (error) {
       Taro.showToast({ title: '刷新失败', icon: 'error' })
     } finally {
       Taro.stopPullDownRefresh()
     }
   })
   ```

   **参考**: [research.md](./research.md) → Topic 5: Taro下拉刷新实现

4. **商品下架状态显示**
   ```tsx
   import { isOffShelf } from '@/types/cart'

   {currentCart.map(item => (
     <View className="cart-item" key={item.product.id}>
       {isOffShelf(item) && (
         <View className="cart-item__off-shelf-mask">
           <Text>该商品已下架</Text>
         </View>
       )}
       {/* 其他商品信息 */}
     </View>
   ))}
   ```

**文件**: `src/pages/cart/index.less`

添加下架商品遮罩样式:
```less
.cart-item {
  position: relative;

  &__off-shelf-mask {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;

    Text {
      color: #fff;
      font-size: 28px;
    }
  }
}
```

#### Step 4: 添加 TabBar 徽标

**文件**: `src/custom-tab-bar/index.tsx`

**需要添加的功能**:

1. **监听购物车总数**
   ```tsx
   import { useContext, useEffect, useState } from 'react'
   import { CartContext } from '@/contexts/CartContext'
   import { getTotalItemCount } from '@/types/cart'

   const { regionalCart } = useContext(CartContext)
   const [badgeCount, setBadgeCount] = useState(0)

   useEffect(() => {
     const count = getTotalItemCount(regionalCart)
     setBadgeCount(count)
   }, [regionalCart])
   ```

2. **显示徽标**
   ```tsx
   import { Badge } from '@nutui/nutui-react-taro'

   <Badge value={badgeCount > 0 ? badgeCount : null}>
     <CartIcon size={22} />
   </Badge>
   ```

   **参考**: [research.md](./research.md) → Topic 4: 自定义TabBar徽标实现

**验证**:
```bash
# 在购物车添加商品后,TabBar图标应显示徽标数字
# 切换地区后,徽标数字应实时更新(显示所有地区总数)
```

---

## 4. 测试指南

### 4.1 手动测试清单

#### 测试场景 1: 查看购物车

- [ ] 在"江苏省-南京市"添加3种商品
- [ ] 切换到"江苏省-南京市"
- [ ] 进入购物车页面
- [ ] ✅ 应显示3个商品卡片,包含图片、名称、单价、数量、小计
- [ ] ✅ 底部统计显示:商品种类3种、总数量X件、总金额¥XX.XX
- [ ] 切换到"浙江省-杭州市"(假设为空)
- [ ] ✅ 应显示空状态,提示"当前地区:浙江省-杭州市,购物车是空的"

#### 测试场景 2: 修改商品数量

- [ ] 在购物车中点击某商品的"+"按钮
- [ ] ✅ 数量应+1,小计和总计实时更新
- [ ] 点击"-"按钮
- [ ] ✅ 数量应-1,小计和总计实时更新
- [ ] 当数量为1时点击"-"按钮
- [ ] ✅ 数量应保持1不变(最小数量限制)
- [ ] 快速连续点击"+"按钮10次
- [ ] ✅ 应有防抖处理,数量正确增加,不会出现异常

#### 测试场景 3: 删除商品

- [ ] 点击商品的删除按钮(垃圾桶图标)
- [ ] ✅ 商品应从列表移除
- [ ] ✅ 统计信息应更新(商品种类-1)
- [ ] 删除所有商品
- [ ] ✅ 应显示空状态

#### 测试场景 4: 地区切换隔离

- [ ] 在"江苏省-南京市"添加大米2斤
- [ ] 切换到"浙江省-杭州市"
- [ ] ✅ 购物车应为空
- [ ] 在"浙江省-杭州市"添加面粉1kg
- [ ] 切换回"江苏省-南京市"
- [ ] ✅ 购物车应显示大米2斤(不显示面粉)
- [ ] 查看TabBar购物车图标
- [ ] ✅ 徽标应显示"2"(两个地区商品种类总和)

#### 测试场景 5: 清空购物车

- [ ] 购物车有5种商品
- [ ] 点击"清空购物车"按钮
- [ ] ✅ 应弹出确认对话框:"确定清空当前地区的购物车吗?此操作不可恢复"
- [ ] 点击"取消"
- [ ] ✅ 对话框关闭,购物车商品保持不变
- [ ] 再次点击"清空购物车",点击"确定"
- [ ] ✅ 购物车清空,显示空状态,显示Toast"购物车已清空"
- [ ] 购物车为空时
- [ ] ✅ "清空购物车"按钮应显示禁用状态

#### 测试场景 6: 去结算

- [ ] 购物车有商品,用户已登录
- [ ] 点击"去结算"按钮
- [ ] ✅ 应跳转到订单确认页面,携带商品列表和地区信息
- [ ] 购物车有商品,用户未登录
- [ ] 点击"去结算"按钮
- [ ] ✅ 应跳转到登录页面,登录成功后返回订单确认页面
- [ ] 购物车为空
- [ ] ✅ "去结算"按钮应显示禁用状态

#### 测试场景 7: 数据持久化

- [ ] 在"江苏省-南京市"添加3种商品
- [ ] 关闭微信开发者工具
- [ ] 重新打开微信开发者工具
- [ ] 切换到"江苏省-南京市",进入购物车
- [ ] ✅ 购物车应显示之前添加的3种商品(从localStorage读取)
- [ ] 在控制台执行:
   ```javascript
   JSON.parse(localStorage.getItem('regional_cart_data'))
   ```
- [ ] ✅ 应返回完整的RegionalCart对象

#### 测试场景 8: 边界情况

- [ ] 在购物车添加50种商品(达到上限)
- [ ] 尝试添加第51种商品
- [ ] ✅ 应显示Toast提示:"购物车已满,请先结算部分商品"
- [ ] 增加商品数量超过库存(假设商品有库存限制)
- [ ] ✅ 应显示Toast提示:"库存不足,当前最多可购买X件"
- [ ] 购物车中有下架商品
- [ ] ✅ 商品卡片应显示灰色遮罩"该商品已下架"
- [ ] ✅ 无法增加数量,只能删除

#### 测试场景 9: 下拉刷新

- [ ] 在购物车页面下拉
- [ ] ✅ 应显示加载动画
- [ ] ✅ 刷新完成后显示Toast"刷新成功"
- [ ] ✅ 购物车商品信息应更新(价格、库存、状态)

### 4.2 自动化测试(可选)

如果项目需要端到端测试,可以使用以下工具:

```bash
# 安装Taro测试库
npm install --save-dev @tarojs/test-utils-react

# 编写测试用例(示例)
# src/pages/cart/__tests__/index.test.tsx
import { render, fireEvent } from '@tarojs/test-utils-react'
import Cart from '../index'

describe('购物车页面', () => {
  it('应该显示空状态', () => {
    const { getByText } = render(<Cart />)
    expect(getByText('购物车是空的')).toBeTruthy()
  })

  it('应该显示商品列表', () => {
    // Mock购物车数据
    // ...
  })
})
```

---

## 5. 调试技巧

### 5.1 查看购物车数据

**在微信开发者工具控制台**:
```javascript
// 查看完整购物车数据
JSON.parse(localStorage.getItem('regional_cart_data'))

// 查看特定地区购物车
const cart = JSON.parse(localStorage.getItem('regional_cart_data'))
cart['江苏省-南京市']

// 查看购物车统计
const items = cart['江苏省-南京市'] || []
items.reduce((sum, item) => sum + item.quantity, 0) // 总数量
items.reduce((sum, item) => sum + item.product.price * item.quantity, 0) // 总金额
```

### 5.2 清空购物车数据

```javascript
// 清空所有地区购物车
localStorage.removeItem('regional_cart_data')

// 清空特定地区购物车
const cart = JSON.parse(localStorage.getItem('regional_cart_data'))
delete cart['江苏省-南京市']
localStorage.setItem('regional_cart_data', JSON.stringify(cart))
```

### 5.3 模拟不同场景

```javascript
// 模拟下架商品
const cart = JSON.parse(localStorage.getItem('regional_cart_data'))
cart['江苏省-南京市'][0].product.status = 'off_sale'
localStorage.setItem('regional_cart_data', JSON.stringify(cart))
// 刷新页面查看效果

// 模拟库存不足
cart['江苏省-南京市'][0].product.stock = 2
cart['江苏省-南京市'][0].quantity = 5 // 数量超过库存
localStorage.setItem('regional_cart_data', JSON.stringify(cart))
```

### 5.4 启用 TypeScript 严格模式检查

```bash
# 手动运行类型检查
npx tsc --noEmit

# 启用watch模式(实时检查)
npx tsc --noEmit --watch
```

### 5.5 查看网络请求

在微信开发者工具中:
1. 打开"网络"面板
2. 筛选 `/api/products/batch-query` 查看下拉刷新请求
3. 查看请求体和响应体是否正确

---

## 6. 常见问题

### Q1: localStorage 数据丢失

**问题**: 关闭小程序后购物车数据消失

**原因**: localStorage写入失败或配额已满

**解决方案**:
1. 检查 `saveCartToStorage` 函数是否返回 `true`
2. 在控制台执行:
   ```javascript
   try {
     localStorage.setItem('test', 'value')
     console.log('localStorage可用')
   } catch (e) {
     console.error('localStorage不可用:', e)
   }
   ```
3. 如果配额已满,运行清理脚本:
   ```javascript
   const cart = JSON.parse(localStorage.getItem('regional_cart_data'))
   // 清理7天前的购物车项
   const cleaned = {}
   const now = Date.now()
   for (const [key, items] of Object.entries(cart)) {
     cleaned[key] = items.filter(item => now - item.addedAt < 7 * 24 * 60 * 60 * 1000)
   }
   localStorage.setItem('regional_cart_data', JSON.stringify(cleaned))
   ```

### Q2: 防抖不生效

**问题**: 快速点击"+"按钮时数量变化异常

**原因**: 防抖配置错误或依赖项缺失

**解决方案**:
1. 确保使用 `useMemo` 包裹 `debounce` 函数
2. 检查依赖项数组是否正确:
   ```typescript
   const debouncedIncrease = useMemo(
     () => debounce((productId: string) => { /* ... */ }, 300),
     [regionalCart, currentRegionKey] // 依赖项
   )
   ```
3. 确保防抖延迟为300ms(参考research.md建议)

### Q3: TabBar 徽标不更新

**问题**: 添加商品后TabBar徽标数字不变

**原因**: TabBar未监听 `CartContext` 变化

**解决方案**:
1. 确保TabBar组件使用了 `useContext(CartContext)`
2. 确保 `useEffect` 依赖项包含 `regionalCart`:
   ```typescript
   useEffect(() => {
     const count = getTotalItemCount(regionalCart)
     setBadgeCount(count)
   }, [regionalCart]) // 依赖项
   ```

### Q4: 地区切换后购物车未刷新

**问题**: 切换地区后购物车仍显示旧地区商品

**原因**: 购物车页面未监听地区变化

**解决方案**:
1. 确保购物车页面监听 `RegionContext` 变化:
   ```typescript
   const { province, city } = useContext(RegionContext)
   const currentRegionKey = getRegionKey(province, city)

   useEffect(() => {
     // 地区变化时重新获取购物车数据
     const cart = getRegionCart(regionalCart, currentRegionKey)
     setCurrentCart(cart)
   }, [currentRegionKey, regionalCart])
   ```

### Q5: 订单确认页面接收不到购物车数据

**问题**: 点击"去结算"跳转后订单确认页面为空

**原因**: 未正确传递地区键或购物车数据

**解决方案**:
1. 确保通过URL参数传递地区键:
   ```typescript
   Taro.navigateTo({
     url: `/pages/order-confirm/index?regionKey=${encodeURIComponent(currentRegionKey)}`
   })
   ```
2. 在订单确认页面读取参数:
   ```typescript
   const router = Taro.useRouter()
   const regionKey = decodeURIComponent(router.params.regionKey || '')
   ```
3. 从localStorage读取购物车数据:
   ```typescript
   const regionalCart = loadCartFromStorage()
   const cartItems = getRegionCart(regionalCart, regionKey)
   ```

---

## 7. 提交与部署

### 7.1 代码提交规范

遵循 **Conventional Commits** 规范:

```bash
# 提交格式
git add .
git commit -m "feat(cart): 实现购物车数量防抖处理和localStorage错误降级"

# 提交类型
feat(cart): 新功能
fix(cart): Bug修复
style(cart): 样式优化
refactor(cart): 重构
perf(cart): 性能优化
test(cart): 测试
chore(cart): 构建/配置修改
```

### 7.2 提交前检查清单

- [ ] 运行类型检查: `npx tsc --noEmit`
- [ ] 运行代码格式化: `npm run lint` (如果配置了)
- [ ] 完成手动测试清单(至少测试场景1-7)
- [ ] 清理控制台日志(移除调试用的 `console.log`)
- [ ] 更新注释和JSDoc
- [ ] 检查是否有硬编码的测试数据

### 7.3 构建生产版本

```bash
# 构建微信小程序生产版本
npm run build:weapp

# 预期输出
# ✔ Webpack compiled successfully in 12.45s
# ✔ Build successfully in 13.12s
```

**构建产物位置**: `dist/` 目录

### 7.4 上传到微信小程序后台

1. 打开微信开发者工具
2. 点击顶部菜单 "上传"
3. 填写版本号和备注:
   ```
   版本号: 1.1.0
   备注: 完善地区化购物车功能 - 添加防抖处理、下拉刷新、TabBar徽标等
   ```
4. 点击 "上传"

### 7.5 提交代码到远程仓库

```bash
# 1. 推送功能分支
git push origin 004-

# 2. 创建 Pull Request
# 前往GitHub/GitLab创建PR,目标分支为 main

# 3. PR描述模板
# Title: feat(cart): 完善地区化购物车功能
# Body:
## 功能描述
完善地区化购物车功能,实现购物车的完整交互体验。

## 主要变更
- ✅ 实现购物车数量修改的防抖处理(300ms)
- ✅ 添加localStorage错误降级处理
- ✅ 实现清空购物车的二次确认对话框
- ✅ 添加去结算按钮和登录状态检查
- ✅ 实现下拉刷新商品信息功能
- ✅ 添加商品下架状态显示
- ✅ 实现TabBar购物车徽标(显示所有地区商品总数)

## 测试情况
- [x] 手动测试场景1-9全部通过
- [x] TypeScript类型检查通过
- [x] 地区切换购物车隔离正确
- [x] 数据持久化功能正常

## 相关文档
- 规格说明: specs/004-/spec.md
- 实现计划: specs/004-/plan.md
- 数据模型: specs/004-/data-model.md
- 技术研究: specs/004-/research.md
```

---

## 8. 开发速查表

### 常用命令

| 命令 | 用途 |
|------|------|
| `npm run dev:weapp` | 启动开发服务器 |
| `npm run build:weapp` | 构建生产版本 |
| `npx tsc --noEmit` | 类型检查 |
| `git status` | 查看文件状态 |
| `git diff` | 查看代码变更 |

### 常用路径

| 路径 | 说明 |
|------|------|
| `src/contexts/CartContext.tsx` | 购物车上下文 |
| `src/pages/cart/index.tsx` | 购物车页面 |
| `src/types/cart.ts` | 购物车类型定义 |
| `src/custom-tab-bar/index.tsx` | 自定义TabBar |
| `specs/004-/` | 功能规格和文档 |

### 关键函数

| 函数 | 文件 | 用途 |
|------|------|------|
| `loadCartFromStorage()` | `types/cart.ts` | 安全读取localStorage |
| `saveCartToStorage()` | `types/cart.ts` | 安全保存localStorage |
| `calculateCartStats()` | `types/cart.ts` | 计算购物车统计 |
| `getTotalItemCount()` | `types/cart.ts` | 计算所有地区商品总数 |
| `getRegionCart()` | `types/cart.ts` | 获取指定地区购物车 |
| `clearRegionCart()` | `types/cart.ts` | 清空指定地区购物车 |

---

## 9. 下一步

完成功能开发后,可以继续:

1. **运行 `/speckit.tasks`**: 生成详细的任务分解清单
2. **实现订单确认页面**: 处理购物车结算流程
3. **实现支付功能**: 集成微信支付API
4. **添加核销券生成**: 支付成功后生成核销券
5. **性能优化**: 购物车页面的滚动性能、商品图片懒加载等

---

**文档版本**: v1.0
**最后更新**: 2025-10-13
**问题反馈**: 如有疑问,请参考 [spec.md](./spec.md) 或联系项目负责人
