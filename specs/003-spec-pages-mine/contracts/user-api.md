# API Contract: 用户信息API

**Feature**: 核销券个人中心主页
**Created**: 2025-10-13

## 获取用户信息

### 请求

```
GET /api/user/info
```

**Headers**:
```
token: {user_token}
```

**Query Parameters**: 无

### 响应

**成功响应 (code=1)**:
```json
{
  "code": 1,
  "msg": "成功",
  "time": 1704038400,
  "data": {
    "id": 1,
    "avatar": "https://example.com/avatar.jpg",
    "nickname": "张三",
    "phone": "13800138000",
    "member_level": "vip1",
    "member_level_name": "VIP1会员",
    "member_icon": "https://example.com/vip1.png",
    "register_time": 1672502400
  }
}
```

**错误响应 (code=0)**:
```json
{
  "code": 0,
  "msg": "Token无效",
  "time": 1704038400
}
```

## 获取核销券统计

### 请求

```
GET /api/user/voucher_stats
```

**Headers**:
```
token: {user_token}
```

### 响应

```json
{
  "code": 1,
  "msg": "成功",
  "time": 1704038400,
  "data": {
    "pending": 5,
    "used": 12,
    "expired": 3,
    "expiring_soon": 2
  }
}
```

## 获取订单统计

### 请求

```
GET /api/user/order_stats
```

**Headers**:
```
token: {user_token}
```

### 响应

```json
{
  "code": 1,
  "msg": "成功",
  "time": 1704038400,
  "data": {
    "total": 20,
    "pending": 2,
    "verified": 15
  }
}
```

## 获取最近核销券

### 请求

```
GET /api/user/recent_vouchers?limit=3
```

**Headers**:
```
token: {user_token}
```

**Query Parameters**:
- `limit`: 返回数量,默认3

### 响应

```json
{
  "code": 1,
  "msg": "成功",
  "time": 1704038400,
  "data": [
    {
      "id": 1,
      "title": "东北大米兑换券",
      "product_image": "https://example.com/product.jpg",
      "product_name": "东北大米 5kg",
      "purchase_time": 1704038400,
      "expire_at": 1706630400,
      "days_remaining": 5
    }
  ]
}
```

## 获取最近订单

### 请求

```
GET /api/user/recent_orders?limit=3
```

**Headers**:
```
token: {user_token}
```

**Query Parameters**:
- `limit`: 返回数量,默认3

### 响应

```json
{
  "code": 1,
  "msg": "成功",
  "time": 1704038400,
  "data": [
    {
      "id": 1,
      "order_no": "20240101000000001",
      "product_image": "https://example.com/product.jpg",
      "product_name": "东北大米 5kg",
      "status": "verified",
      "status_text": "已核销",
      "create_time": 1704038400
    }
  ]
}
```
