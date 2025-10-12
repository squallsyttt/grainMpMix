# Research: 核销券个人中心技术调研

**Feature**: 核销券个人中心
**Branch**: `002-`
**Date**: 2025-10-12
**Status**: Completed

## 概述

本文档记录了核销券个人中心功能的技术调研结果,解决了技术上下文中标记为 `NEEDS CLARIFICATION` 的所有问题。

## 调研问题列表

1. ✅ 二维码生成方案
2. ✅ 虚拟滚动方案
3. ✅ 过期提醒通知方案
4. ✅ 存储和后端API方案
5. ✅ 地理位置处理方案
6. ✅ 测试方案

---

## 1. 二维码生成方案

### 决策

**混合方案 - 前端生成普通二维码 + 后端生成微信小程序码**

### 理由

1. **安全性考虑**: 微信官方小程序码API需要传递敏感信息(appid、appsecret、access_token),必须由后端生成
2. **性能优势**: 前端生成普通二维码可即时响应,无需网络请求,减轻服务器压力
3. **多端兼容**: 选择的方案必须跨平台兼容(微信小程序、H5等)
4. **用户体验**: 前端生成可在网络不佳时仍显示二维码,降低用户流失率

### 技术选型

#### 前端库: weapp-qrcode-canvas-2d (推荐)

```bash
npm install weapp-qrcode-canvas-2d --save
```

**选择理由**:
- ✅ 使用Canvas 2D新API,支持同层渲染,性能优异
- ✅ 官方提供Taro示例,兼容性验证
- ✅ 支持嵌入Logo图片 (v1.1.0+)
- ✅ 持续维护 (最新版本1.1.6, 2025-01-16)
- ✅ 完整的参数配置和文档

**备选方案**: weapp-qrcode (基础版,使用旧版Canvas API)

#### 后端库: 微信官方API

- `wxacode.createQRCode` - 生成小程序二维码
- `wxacode.getUnlimited` - 生成小程序码 (推荐,数量不限)

### 实施要点

#### 生成位置划分

**前端生成场景**:
- ✅ 优惠券二维码 (包含券码信息,用于扫码核销)
- ✅ 分享海报中的二维码
- ✅ 用户保存到相册的二维码

**后端生成场景**:
- ✅ 微信小程序码 (用于分享/推广)
- ✅ 带推广参数的小程序二维码
- ✅ 需要统计扫码数据的场景

#### 降级策略 (多层次保障)

1. ✅ 主方案: Canvas生成二维码
2. ✅ 失败自动重试1次
3. ✅ 显示券码文本 + 复制功能
4. ✅ 手动重试按钮
5. ✅ 页面底部始终显示券码作为备份

#### 二维码内容格式 (安全设计)

```json
{
  "type": "coupon",
  "version": "1.0.0",
  "code": "VOUCHER-CODE",
  "timestamp": 1234567890,
  "expireTime": 1234567890,
  "sign": "HMAC-SHA256签名"
}
```

**安全措施**:
1. **签名防篡改**: 后端使用HMAC-SHA256签名
2. **时间戳防重放**: 核销时检查时间戳是否在24小时内
3. **一次性使用**: 后端记录已核销券码
4. **加密传输**: HTTPS传输

#### 识别率优化 (确保99%+识别率)

**容错级别**:
```typescript
correctLevel: 2  // H级别,30%容错率(最高)
```

**尺寸规范**:
- 📱 手机显示: 260-300px
- 🖨️ 打印输出: 物理尺寸≥15mm
- 💾 保存相册: 500-800px
- 📤 分享海报: 600-1000px

**颜色对比**:
- ✅ 推荐: 黑色前景 + 白色背景 (识别率最高)
- ✅ 前景必须比背景深至少40%
- ❌ 避免: 深色背景、低对比度、渐变色

**Logo嵌入规范**:
- 📏 尺寸: 占二维码20-25%
- 🎨 背景: 使用白色或浅色背景
- 🔲 形状: 方形或圆形最佳

#### 离线支持 (保存到相册)

```typescript
// 完整的权限处理流程
export const saveQRCodeToAlbum = async (imagePath: string): Promise<boolean> => {
  // 1. 检查相册权限
  // 2. 如果没有权限,请求授权
  // 3. 拒绝过则引导用户打开设置
  // 4. 保存图片
  // 详见实施文档
}
```

### 参考资源

- 前端库: weapp-qrcode-canvas-2d
- 后端API: 微信小程序官方文档
- 安全方案: HMAC-SHA256签名算法

---

## 2. 虚拟滚动方案

### 决策

**暂不使用虚拟滚动,采用分页加载 + 性能优化方案**

### 理由

#### 数据量分析

- **核销券列表**: 50+ 张券
- **门店列表**: 20+ 个门店

这个数据量级(50-100条记录)处于**不需要虚拟滚动的临界点以下**。

**性能测试数据**:
- 几百条数据的列表可以正常处理
- **数千条**时才会出现明显卡顿
- **上万条**时可能导致崩溃

#### 开发与维护成本

**使用虚拟滚动的成本**:
- ❌ 学习成本高
- ❌ 调试成本高(bug难定位)
- ❌ 适配成本高(不等高列表项、下拉刷新、上拉加载)
- ❌ 已知问题: 官方VirtualList在Taro 3中有高度计算问题

**简单方案的成本**:
- ✅ 分页加载: 1-2小时开发 + 30分钟测试
- ✅ 性能优化: 按需优化,成本可控

### 推荐方案: 分页加载 + 性能优化

#### 方案1: 分页加载 (推荐)

```typescript
// 首次加载 20 条
const [list, setList] = useState([])
const [page, setPage] = useState(1)
const pageSize = 20

// 滚动到底部加载更多
const onScrollToLower = () => {
  loadMore()
}
```

**优点**:
- ✅ 实现简单,代码量少
- ✅ 用户体验好(小程序常见交互)
- ✅ 性能可控(每页固定条数)
- ✅ 易于维护和调试

#### 方案2: 懒加载图片 + 节流优化

```typescript
// 使用 Taro 的 Image 组件自带懒加载
<Image
  src={imageUrl}
  lazyLoad
  mode="aspectFill"
/>

// 滚动事件节流
const onScroll = throttle((e) => {
  // 处理滚动逻辑
}, 200)
```

#### 方案3: React.memo + useCallback优化

```typescript
// 只更新变化的数据
const CouponCard = React.memo(({ data }) => {
  return <View>...</View>
})

// 使用 useCallback 缓存事件处理器
const handleClick = useCallback(() => {
  console.log('clicked')
}, [])
```

### 适用场景判断

| 列表类型 | 数据量 | 是否使用虚拟滚动 | 推荐方案 |
|---------|--------|----------------|---------|
| **核销券列表** | 50-100张 | ❌ 不需要 | 分页加载(每页20条) |
| **门店列表** | 20-50个 | ❌ 不需要 | 一次性加载或分页10条 |
| **商品列表** | <100个 | ❌ 不需要 | 分页加载(每页20条) |
| **消息列表** | >500条 | ✅ 建议使用 | VirtualList + 懒加载 |

### 何时升级到虚拟滚动

**明确的升级信号**:
1. ✅ 数据量稳定超过 **500 条**
2. ✅ 用户活跃度数据显示列表滚动深度 > 80%
3. ✅ 性能监控显示首屏时间 > 2秒
4. ✅ 低端机型崩溃率 > 1%
5. ✅ 列表项DOM节点 > 50个/项

### 性能指标

**基础方案(分页 + 优化)预期指标**:

| 指标 | 目标值 | 备注 |
|------|--------|------|
| 首屏渲染时间 | < 1s | 加载20条数据 |
| 列表滚动FPS | ≥ 50 | 中高端机型 |
| 内存占用 | < 100MB | 包含图片缓存 |
| 加载更多响应 | < 500ms | 网络正常情况 |

---

## 3. 过期提醒通知方案

### 决策

**一次性订阅消息 + 后端定时任务 + 站内消息降级**

### 理由

1. **一次性订阅消息最适合核销券场景**
   - 核销券有明确的过期时间,属于"一次性通知"场景
   - 无需申请特殊资质(长期订阅仅限政务、医疗等公共服务)
   - 用户订阅一次,服务端可在任意时间发送一条消息
   - 订阅次数可累计

2. **后端定时任务更可靠**
   - 前端定时检查依赖用户打开小程序,无法保证触达
   - 后端定时任务可在过期前24小时/3小时等时间点精准推送
   - 避免前端计时器的资源消耗和不准确性

3. **站内消息作为降级保障**
   - 当用户拒绝订阅或订阅次数用完时,仍能在小程序内看到提醒
   - 提供一致的用户体验

### 技术实现

#### 通知类型: 一次性订阅消息

**微信小程序**:
```typescript
Taro.requestSubscribeMessage({
  tmplIds: ['模板ID']
})
```

**支持平台**:
- @supported weapp, tt, alipay
- 调用限制: 需要在用户点击行为后调用(微信2.8.2+)
- 发送限制: 开通支付能力3000万条/日,未开通1000万条/日

#### 权限流程: 多场景引导订阅

**最佳订阅时机**:
1. **领取核销券时**(推荐) - 用户刚完成支付,订阅意愿最强
2. **核销券列表页** - 批量订阅入口
3. **核销券详情页** - 单个订阅

**处理"总是保持以上选择"**:
```typescript
// 用户勾选"总是保持"后,下次调用不会弹窗
// 需引导用户到设置页修改
const setting = await Taro.getSetting()
if (setting.subscriptionsSetting?.itemSettings?.['模板ID'] === 'reject') {
  // 显示引导提示,打开设置
  Taro.openSetting()
}
```

#### 触发机制: 后端定时任务

**架构设计**:
```typescript
// 每小时检查一次即将过期的核销券
cron.schedule('0 * * * *', async () => {
  // 1. 查询24小时内过期且未发送通知的订阅
  // 2. 批量发送通知
  // 3. 更新通知状态
})
```

**微信小程序服务端发送接口**:
```
POST https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token={token}
{
  "touser": "openId",
  "template_id": "模板ID",
  "page": "pages/coupon/detail?id=xxx",
  "data": {
    "thing1": {"value": "您的核销券即将过期"},
    "time2": {"value": "2025-10-15 18:00:00"},
    "thing3": {"value": "请及时使用"}
  }
}
```

#### 多端适配

| 特性 | 微信小程序 | 支付宝小程序 | 字节跳动小程序 |
|------|----------|------------|-------------|
| **API参数** | `tmplIds` | `entityIds` | `tmplIds` |
| **成功返回** | `{ [tmplId]: 'accept' }` | `{ behavior: 'subscribe' }` | `{ [tmplId]: 'accept' }` |
| **一次订阅数量** | 1-3个 | 1-3个 | 支持 |
| **模板配置位置** | mp.weixin.qq.com | 支付宝开放平台 | 开发者平台 |

#### 降级策略: 多层次通知保障

**完整降级链路**:
1. 第1层: 尝试发送订阅消息(后端)
2. 第2层: 创建站内消息
3. 第3层: 前端打开时弹窗提醒
4. 第4层: TabBar红点提示
5. 第5层: 核销券列表角标

### 实施步骤

1. **前端开发**
   - [ ] 封装统一订阅消息工具类
   - [ ] 在领取核销券页面添加订阅引导
   - [ ] 实现站内消息中心组件
   - [ ] 添加TabBar红点提示

2. **后端开发**
   - [ ] 设计订阅记录数据库表
   - [ ] 实现订阅状态保存接口
   - [ ] 配置定时任务(cron job)
   - [ ] 实现微信/支付宝消息发送接口

3. **小程序管理后台配置**
   - [ ] 创建订阅消息模板
   - [ ] 配置跳转页面路径

---

## 4. 存储和后端API方案

### 决策

**FastAdmin + ThinkPHP 5.x + MySQL 5.7+ + Redis + RESTful API + Token认证**

### 理由

#### 1. 后端框架选择 FastAdmin + ThinkPHP

- **项目统一性**: 与现有后端项目 `/Users/griffith/IdeaProjects/money/grainAdminMix` 保持技术栈一致
- **快速开发**: FastAdmin提供完善的权限管理、CRUD生成、菜单管理等后台功能
- **核销业务适配**: ThinkPHP的事务处理、队列系统可满足核销流程需求
- **成熟生态**: 内置会员系统、API模块、微信支付集成(overtrue/wechat)
- **运维成本低**: 团队已掌握PHP技术栈,无需额外学习成本

#### 2. 数据库选择 MySQL 5.7+

- **事务强一致性**: InnoDB引擎支持ACID事务,核销操作(扣减库存、更新券状态、记录日志)可原子性执行
- **地理位置查询**: MySQL 5.7+的空间索引(Spatial Index)支持地理位置计算
  - `ST_Distance_Sphere()` 函数计算球面距离
  - `POINT` 数据类型存储经纬度坐标
  - `SPATIAL INDEX` 加速地理位置查询
- **项目要求**:
  - 数据库名: `grainPro`
  - 表前缀: `grain_`
  - 字符集: `utf8mb4`

#### 3. API风格选择 RESTful

- **小程序适配**: 小程序网络请求简单直接,RESTful更易理解和调试
- **资源导向清晰**: 核销券系统的资源边界明确(Voucher、Order、Store)
- **FastAdmin规范**: 继承 `app\common\controller\Api` 基类,统一响应格式
  - 成功: `$this->success('消息', $data)`
  - 失败: `$this->error('错误消息')`
- **缓存友好**: RESTful的GET请求可直接利用HTTP缓存

#### 4. 缓存策略 Redis

- **用户信息缓存**: 30分钟 (FastAdmin内置Auth缓存机制)
- **门店列表缓存**: 按地区+大米分类维度缓存1小时
- **核销券状态热数据**: 待核销券缓存5分钟
- **过期券定时任务**: 使用ThinkPHP的think-queue队列系统
- **防重复核销锁**: 分布式锁(`SETNX voucher:{id}:lock 1 EX 5`)

#### 5. 认证方案 FastAdmin Auth + 微信openId

- **FastAdmin Auth系统**: 内置用户认证,支持Token模式
  - 使用 `$this->auth` 访问当前用户
  - Token自动刷新和过期管理
  - `$noNeedLogin` 和 `$noNeedRight` 权限控制
- **微信登录流程**:
  1. 前端调用 wx.login() 获取 code
  2. 前端发送 code 到 `/api/user/wechatLogin`
  3. 后端使用overtrue/wechat获取openId + session_key
  4. 后端生成用户Token并绑定openId
  5. 返回 token 和用户信息给前端

### 技术栈版本

- PHP >= 7.4.0
- ThinkPHP 5.x (topthink/framework)
- FastAdmin 1.4.x
- MySQL 5.7+ (InnoDB引擎)
- Redis 6.x+
- overtrue/wechat ^4.6 (微信SDK)
- topthink/think-queue 1.1.6 (队列系统)

### 核心表设计

```sql
-- 用户表(FastAdmin内置user表扩展)
ALTER TABLE `grain_user` ADD COLUMN `openid` VARCHAR(64) UNIQUE COMMENT '微信openid';
ALTER TABLE `grain_user` ADD COLUMN `region_code` VARCHAR(20) COMMENT '地区编码';

-- 核销券表
CREATE TABLE `grain_voucher` (
  `id` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(32) UNIQUE NOT NULL COMMENT '核销券码',
  `order_id` INT(10) UNSIGNED NOT NULL COMMENT '订单ID',
  `user_id` INT(10) UNSIGNED NOT NULL COMMENT '用户ID',
  `category_id` INT(10) UNSIGNED NOT NULL COMMENT '大米分类ID',
  `region_code` VARCHAR(20) NOT NULL COMMENT '适用地区编码',
  `status` ENUM('pending','used','expired','cancelled') DEFAULT 'pending' COMMENT '状态:待核销,已核销,已过期,已取消',
  `expire_at` INT(10) UNSIGNED NOT NULL COMMENT '过期时间戳',
  `used_at` INT(10) UNSIGNED DEFAULT NULL COMMENT '核销时间戳',
  `used_store_id` INT(10) UNSIGNED DEFAULT NULL COMMENT '核销门店ID',
  `createtime` INT(10) UNSIGNED DEFAULT NULL COMMENT '创建时间',
  `updatetime` INT(10) UNSIGNED DEFAULT NULL COMMENT '更新时间',
  INDEX `idx_user_status` (`user_id`, `status`),
  INDEX `idx_expire` (`expire_at`),
  INDEX `idx_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='核销券表';

-- 门店表(使用MySQL Spatial数据类型)
CREATE TABLE `grain_store` (
  `id` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(200) NOT NULL COMMENT '门店名称',
  `address` TEXT NOT NULL COMMENT '详细地址',
  `latitude` DECIMAL(10,6) NOT NULL COMMENT '纬度',
  `longitude` DECIMAL(10,6) NOT NULL COMMENT '经度',
  `location` POINT NOT NULL COMMENT '地理位置坐标',
  `region_code` VARCHAR(20) NOT NULL COMMENT '地区编码',
  `phone` VARCHAR(20) DEFAULT NULL COMMENT '联系电话',
  `business_hours` TEXT DEFAULT NULL COMMENT '营业时间(JSON格式)',
  `status` ENUM('normal','disabled') DEFAULT 'normal' COMMENT '状态',
  `createtime` INT(10) UNSIGNED DEFAULT NULL COMMENT '创建时间',
  `updatetime` INT(10) UNSIGNED DEFAULT NULL COMMENT '更新时间',
  SPATIAL INDEX `idx_location` (`location`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='门店表';

-- 订单表
CREATE TABLE `grain_order` (
  `id` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `order_no` VARCHAR(32) UNIQUE NOT NULL COMMENT '订单号',
  `user_id` INT(10) UNSIGNED NOT NULL COMMENT '用户ID',
  `category_id` INT(10) UNSIGNED NOT NULL COMMENT '大米分类ID',
  `region_code` VARCHAR(20) NOT NULL COMMENT '地区编码',
  `quantity` INT(10) UNSIGNED NOT NULL COMMENT '购买数量',
  `total_amount` DECIMAL(10,2) NOT NULL COMMENT '订单总金额',
  `payment_time` INT(10) UNSIGNED DEFAULT NULL COMMENT '支付时间',
  `delivery_mode` ENUM('self_pickup','delivery') DEFAULT 'self_pickup' COMMENT '配送方式:自提,跑腿',
  `status` ENUM('pending','paid','completed','cancelled') DEFAULT 'paid' COMMENT '订单状态',
  `createtime` INT(10) UNSIGNED DEFAULT NULL COMMENT '创建时间',
  `updatetime` INT(10) UNSIGNED DEFAULT NULL COMMENT '更新时间',
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_order_no` (`order_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单表';

-- 核销记录表
CREATE TABLE `grain_writeoff_record` (
  `id` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `voucher_id` INT(10) UNSIGNED NOT NULL COMMENT '核销券ID',
  `store_id` INT(10) UNSIGNED NOT NULL COMMENT '门店ID',
  `operator_id` INT(10) UNSIGNED DEFAULT NULL COMMENT '操作员ID',
  `result` ENUM('success','failed') NOT NULL COMMENT '核销结果',
  `fail_reason` VARCHAR(255) DEFAULT NULL COMMENT '失败原因',
  `createtime` INT(10) UNSIGNED DEFAULT NULL COMMENT '创建时间',
  INDEX `idx_voucher` (`voucher_id`),
  INDEX `idx_store` (`store_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='核销记录表';

-- 大米分类表(可能已存在,需确认)
CREATE TABLE IF NOT EXISTS `grain_rice_category` (
  `id` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL COMMENT '分类名称',
  `description` TEXT DEFAULT NULL COMMENT '分类描述',
  `image` VARCHAR(255) DEFAULT NULL COMMENT '分类图片',
  `weigh` INT(10) DEFAULT 0 COMMENT '权重排序',
  `status` ENUM('normal','hidden') DEFAULT 'normal' COMMENT '状态',
  `createtime` INT(10) UNSIGNED DEFAULT NULL COMMENT '创建时间',
  `updatetime` INT(10) UNSIGNED DEFAULT NULL COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='大米分类表';
```

**注意事项**:
1. ⚠️ **表前缀**: 所有表必须使用 `grain_` 前缀
2. ⚠️ **时间戳**: 使用INT(10)存储10位时间戳,而非TIMESTAMP类型
3. ⚠️ **字符集**: 统一使用utf8mb4字符集
4. ⚠️ **自增ID**: 使用INT(10) UNSIGNED而非UUID
5. ⚠️ **地理位置**: 使用POINT类型 + SPATIAL INDEX,而非PostGIS

### 核心API接口

#### 认证相关
```
POST /api/user/wechatLogin  - 微信登录(使用code换取openId)
POST /api/user/refreshToken - 刷新token
```

#### 核销券相关
```
GET  /api/voucher/lists      - 获取用户核销券列表
GET  /api/voucher/detail     - 获取核销券详情
POST /api/voucher/qrcode     - 生成核销二维码
```

#### 核销操作
```
POST /api/writeoff/scan      - 商家扫码验证
POST /api/writeoff/confirm   - 确认核销
```

#### 订单相关
```
GET /api/order/lists         - 获取订单列表
GET /api/order/detail        - 获取订单详情
```

#### 门店相关
```
GET /api/store/lists         - 获取门店列表(支持地理位置筛选)
GET /api/store/detail        - 获取门店详情
```

### 并发核销防护

```php
<?php
namespace app\api\controller;

use app\common\controller\Api;
use think\Db;
use think\Exception;

class Writeoff extends Api
{
    protected $noNeedLogin = [];
    protected $noNeedRight = '*';

    /**
     * 确认核销
     * @ApiMethod (POST)
     * @ApiParams (name="voucher_id", type="int", required=true, description="核销券ID")
     * @ApiParams (name="store_id", type="int", required=true, description="门店ID")
     */
    public function confirm()
    {
        $voucherId = $this->request->post('voucher_id');
        $storeId = $this->request->post('store_id');

        if (!$voucherId || !$storeId) {
            $this->error('参数错误');
        }

        // 1. 获取Redis分布式锁(5秒过期)
        $redis = new \Redis();
        $redis->connect(config('redis.host'), config('redis.port'));
        $lockKey = "voucher:{$voucherId}:lock";
        $locked = $redis->set($lockKey, 1, ['NX', 'EX' => 5]);

        if (!$locked) {
            $this->error('该券正在核销中,请稍后重试');
        }

        try {
            // 2. 数据库事务
            Db::startTrans();

            // 查询并锁定记录(FOR UPDATE行锁)
            $voucher = Db::name('voucher')
                ->where('id', $voucherId)
                ->lock(true)
                ->find();

            if (!$voucher) {
                throw new Exception('核销券不存在');
            }

            if ($voucher['status'] !== 'pending') {
                throw new Exception('该券已核销或已失效');
            }

            if ($voucher['expire_at'] < time()) {
                throw new Exception('该券已过期');
            }

            // 更新核销券状态
            Db::name('voucher')
                ->where('id', $voucherId)
                ->update([
                    'status' => 'used',
                    'used_at' => time(),
                    'used_store_id' => $storeId,
                    'updatetime' => time()
                ]);

            // 记录核销日志
            Db::name('writeoff_record')
                ->insert([
                    'voucher_id' => $voucherId,
                    'store_id' => $storeId,
                    'operator_id' => $this->auth->id ?? 0,
                    'result' => 'success',
                    'createtime' => time()
                ]);

            // 提交事务
            Db::commit();

            // 清除缓存
            cache('voucher_' . $voucherId, null);

            $this->success('核销成功');

        } catch (Exception $e) {
            // 回滚事务
            Db::rollback();
            $this->error($e->getMessage());
        } finally {
            // 3. 释放锁
            $redis->del($lockKey);
            $redis->close();
        }
    }
}
```

**关键点说明**:
1. **Redis分布式锁**: 使用`SET key 1 NX EX 5`命令,5秒自动过期
2. **数据库行锁**: ThinkPHP的`lock(true)`方法生成`SELECT ... FOR UPDATE`
3. **事务保证**: `Db::startTrans()` + `Db::commit()` + `Db::rollback()`
4. **异常处理**: try-catch-finally确保锁一定被释放
5. **缓存失效**: 核销成功后清除相关缓存

---

## 5. 地理位置处理方案

### 决策

**前端混合计算 + 权限优雅降级 + 按需后端排序**

### 理由

1. **位置权限的特殊性**: 微信小程序获取精确位置需要特定类目并通过审核
2. **用户体验优先**: 不在首次进入就弹窗要求位置权限,功能可降级
3. **性能与成本平衡**: 50个门店以内前端计算,超过则后端计算

### 技术实现

#### 位置权限申请

**API**: `Taro.getLocation`

**app.json 配置(必需)**:
```json
{
  "permission": {
    "scope.userLocation": {
      "desc": "用于计算您与门店的距离并推荐附近商家"
    }
  },
  "requiredPrivateInfos": ["getLocation"]
}
```

**小程序后台配置**:
1. 开发 → 开发管理 → 接口设置
2. 找到"wx.getLocation"接口,点击"申请开通"
3. 填写使用场景并上传录屏

#### 权限降级策略

```typescript
// 完整的位置权限处理流程
export const getUserLocation = async (): Promise<LocationResult | null> => {
  // 1. 检查授权状态
  const setting = await Taro.getSetting()
  const hasAuth = setting.authSetting['scope.userLocation']

  if (hasAuth === false) {
    // 用户拒绝过,引导打开设置
    await Taro.showModal({
      title: '需要位置权限',
      content: '开启位置权限后,可为您推荐附近门店',
      confirmText: '去设置'
    })
    if (confirm) await Taro.openSetting()
  }

  // 2. 获取位置
  const location = await Taro.getLocation({
    type: 'gcj02',
    isHighAccuracy: true
  })

  return location
}
```

**未授权时的降级**:
- 默认按综合评分(rating)排序
- 显示"开启定位"按钮引导
- 提供其他排序方式(销量、评分)

#### 距离计算

**Haversine 公式** (前端计算):
```typescript
export const calculateDistance = (
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number => {
  const R = 6371e3 // 地球半径(米)
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lng2 - lng1) * Math.PI) / 180

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c) // 返回整数米
}
```

**PostGIS查询** (后端计算,门店>50个时):
```sql
-- MySQL 5.7+ Spatial查询
SELECT
  s.id, s.name, s.address,
  ST_Distance_Sphere(
    s.location,
    POINT(121.123, 31.456)
  ) AS distance_meters
FROM grain_store s
WHERE ST_Distance_Sphere(
  s.location,
  POINT(121.123, 31.456)
) <= 3000  -- 3000米半径
ORDER BY distance_meters ASC
LIMIT 20;
```

**ThinkPHP实现**:
```php
<?php
namespace app\api\controller;

use app\common\controller\Api;
use think\Db;

class Store extends Api
{
    protected $noNeedLogin = ['lists'];
    protected $noNeedRight = '*';

    /**
     * 获取门店列表(支持地理位置排序)
     * @ApiMethod (GET)
     * @ApiParams (name="latitude", type="float", required=false, description="纬度")
     * @ApiParams (name="longitude", type="float", required=false, description="经度")
     * @ApiParams (name="radius", type="int", required=false, description="搜索半径(米)")
     */
    public function lists()
    {
        $latitude = $this->request->get('latitude');
        $longitude = $this->request->get('longitude');
        $radius = $this->request->get('radius', 3000);

        $query = Db::name('store')
            ->where('status', 'normal');

        // 如果提供了位置信息,按距离排序
        if ($latitude && $longitude) {
            $point = "POINT($longitude, $latitude)";

            // 计算距离并筛选
            $query->whereRaw(
                "ST_Distance_Sphere(location, $point) <= ?",
                [$radius]
            );

            // 按距离排序
            $query->field([
                '*',
                "ST_Distance_Sphere(location, $point) AS distance"
            ])->order('distance', 'asc');
        }

        $list = $query->paginate(20);

        $this->success('查询成功', $list);
    }
}
```

**注意**: MySQL的POINT数据类型坐标顺序是 **(经度, 纬度)**,与常见的纬度在前不同。

#### 地图导航

```typescript
// 打开地图导航
export const openNavigation = (store: Store): void => {
  Taro.openLocation({
    latitude: store.latitude,
    longitude: store.longitude,
    name: store.name,
    address: store.address,
    scale: 18
  })
}
```

**用户操作流程**:
1. 用户点击门店地址
2. 调用 `Taro.openLocation` 打开微信内置地图
3. 微信地图显示"导航"按钮
4. 用户选择第三方地图APP(高德、百度、腾讯等)

**注意**: 必须使用 **gcj02坐标系**(火星坐标)

#### 性能优化

**方案1: 虚拟列表** (门店>30个推荐)
```typescript
<VirtualList
  height={600}
  itemCount={stores.length}
  itemSize={120}
>
  {renderStore}
</VirtualList>
```

**方案2: 距离缓存** (30分钟)
```typescript
// 缓存计算结果,位置变化>100米则失效
const getCachedDistances = (lat, lng): Store[] | null
```

**方案3: 防抖节流** (500ms)
```typescript
const debouncedGetLocation = useCallback(callback, 500)
```

### 性能基准

| 操作 | 耗时 | 说明 |
|------|------|------|
| Taro.getLocation | 500-2000ms | 首次授权慢,后续快 |
| Haversine计算(50个) | 1-2ms | 前端无感知 |
| Haversine计算(500个) | 10-20ms | 前端可接受 |
| Haversine计算(5000个) | 100-200ms | 建议后端处理 |

**建议阈值**:
- **< 50个门店**: 纯前端计算
- **50-200个门店**: 前端计算 + 虚拟列表
- **> 200个门店**: 后端计算 + 分页加载

---

## 6. 测试方案

### 决策

**Jest + @tarojs/test-utils-react + miniprogram-automator + GitHub Actions**

### 理由

1. **Jest + @tarojs/test-utils-react**: Taro官方推荐,提供专门针对Taro优化的测试工具
2. **miniprogram-automator**: 微信官方E2E测试工具,真实环境测试
3. **GitHub Actions**: 与Git无缝集成,配置简单,免费额度充足

### 技术选型

#### 单元测试: Jest

**安装**:
```bash
npm install --save-dev jest @tarojs/test-utils-react @types/jest
```

**配置** (`jest.config.js`):
```javascript
const defineJestConfig = require('@tarojs/test-utils-react/dist/jest.js').default

module.exports = defineJestConfig({
  testEnvironment: 'jsdom',
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.config.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    },
    './src/pages/verifyVoucher/**/*.{ts,tsx}': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    }
  }
})
```

#### E2E测试: miniprogram-automator

**安装**:
```bash
npm install --save-dev miniprogram-automator
```

**示例**:
```javascript
const automator = require('miniprogram-automator')

describe('核销券E2E测试', () => {
  let miniProgram

  beforeAll(async () => {
    miniProgram = await automator.launch({
      projectPath: '/path/to/dist'
    })
  })

  it('完整核销流程', async () => {
    const page = await miniProgram.reLaunch('/pages/verifyVoucher/index')
    // 模拟扫码、确认核销...
  })
})
```

### 覆盖率目标

| 指标 | 全局目标 | 核心业务目标 | 说明 |
|------|---------|-------------|------|
| **Statements** | ≥70% | ≥90% | 代码中每条语句都被执行 |
| **Branches** | ≥70% | ≥90% | if/else分支都被测试 |
| **Functions** | ≥70% | ≥90% | 每个函数都被调用 |
| **Lines** | ≥70% | ≥90% | 每行代码都被执行 |

**核心业务模块**:
- 核销券模块: 90%+ 覆盖率
- 一般业务模块: 70%+ 覆盖率
- 工具函数: 80%+ 覆盖率
- UI组件: 75%+ 覆盖率

### Mock方案

#### Mock Taro API

```typescript
jest.mock('@tarojs/taro', () => ({
  ...jest.requireActual('@tarojs/taro'),
  scanCode: jest.fn(() => Promise.resolve({ result: 'TEST-CODE' })),
  showToast: jest.fn(),
  request: jest.fn(() => Promise.resolve({ statusCode: 200, data: {} }))
}))
```

#### Mock 后端API

```typescript
(Taro.request as jest.Mock).mockResolvedValue({
  data: {
    success: true,
    data: { voucherId: '123' }
  }
})
```

### CI集成: GitHub Actions

**配置** (`.github/workflows/test.yml`):
```yaml
name: 测试和覆盖率

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: 设置 Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18.x

      - name: 安装依赖
        run: npm ci

      - name: 运行测试
        run: npm run test:coverage

      - name: 上传覆盖率
        uses: codecov/codecov-action@v3
```

### 测试优先级

**P0 (必须测试)**:
- ✅ 核销券完整流程
- ✅ 用户身份验证
- ✅ 资金相关操作

**P1 (高优先级)**:
- ✅ 主流程页面
- ✅ 核心工具函数
- ✅ 常用组件

**P2 (中优先级)**:
- ⚠️ 次要功能页面
- ⚠️ 辅助工具函数

---

## 总结

所有技术调研已完成,主要决策如下:

1. **二维码生成**: 前端weapp-qrcode-canvas-2d + 后端微信API,多层降级保障
2. **虚拟滚动**: 暂不使用,采用分页加载 + 性能优化
3. **过期提醒**: 一次性订阅消息 + 后端定时任务 + 站内消息降级
4. **后端方案**: FastAdmin + ThinkPHP 5.x + MySQL 5.7+ + Redis + RESTful + Token认证
5. **地理位置**: 前端Haversine计算(<50个门店) + MySQL Spatial索引 + 权限优雅降级
6. **测试方案**: Jest + miniprogram-automator + 70%覆盖率(核心90%)

所有方案均已充分考虑:
- ✅ 技术可行性
- ✅ 性能指标
- ✅ 用户体验
- ✅ 开发成本
- ✅ 维护成本
- ✅ 扩展性
- ✅ 与现有后端项目技术栈一致性

**重要提醒**:
- 📁 后端项目路径: `/Users/griffith/IdeaProjects/money/grainAdminMix`
- 🗄️ 数据库名: `grainPro`
- 🏷️ 表前缀: `grain_`
- ⏰ 时间戳格式: INT(10) 10位时间戳
- 🔐 认证方式: FastAdmin内置Auth + Token
- 📦 微信SDK: overtrue/wechat ^4.6

下一步可进入 **Phase 1: 数据模型和合约设计**。
