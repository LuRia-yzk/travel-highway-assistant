# 高速公路旅行助手 (Travel Highway Assistant)

一个基于微信小程序和 Node.js 后端的高速公路出行辅助系统，为驾驶员提供前方路口推荐、周边 POI（酒店/餐厅/景点）查询等服务。

## 📋 项目结构

```
travel-highway-assistant/
├── frontend/                  # 微信小程序前端
│   ├── pages/                 # 页面
│   │   ├── index/             # 首页（地图展示、路口推荐）
│   │   └── detail/            # 详情页（POI 列表）
│   ├── components/            # 组件
│   │   └── poi-item/          # POI 卡片组件
│   ├── untils/                # 工具类
│   │   ├── request.js         # 网络请求封装
│   │   └── util.js            # 通用工具函数
│   ├── app.js                 # 小程序入口
│   ├── app.json               # 全局配置
│   └── app.wxss               # 全局样式
├── backend/                   # Node.js 后端
│   ├── config/                # 配置文件
│   ├── controllers/           # 控制器
│   ├── models/                # 数据模型
│   ├── routes/                # 路由定义
│   ├── services/              # 服务层（高德 API）
│   ├── utils/                 # 工具类
│   ├── app.js                 # Express 应用
│   ├── server.js              # 服务器启动
│   └── package.json           # 依赖配置
├── database/                  # 数据文件
│   ├── roadNodes.json         # 高速路口数据
│   ├── pois.json              # POI 数据
│   └── init.js                # 初始化脚本
└── README.md                  # 项目文档
```

## 🚀 快速开始

### 环境要求

- Node.js >= 14.0.0
- 微信开发者工具（最新版）
- npm 或 yarn

### 后端部署

#### 1. 安装依赖

```bash
cd backend
npm install
```

#### 2. 启动服务器

```bash
# 开发环境（支持热更新）
npm run dev

# 生产环境
npm start
```

启动成功后会显示：
```
===========================================
🚀 服务器启动成功！
📍 端口：3000
🌐 本地访问：http://localhost:3000
📡 API 文档：http://localhost:3000/api
💚 健康检查：http://localhost:3000/health
===========================================
```

### 前端部署

#### 1. 打开微信开发者工具

- 导入 `frontend` 目录
- 在 `project.config.json` 中修改为你的小程序 AppID
- 编译运行

#### 2. 配置服务器地址

在 `app.js` 中修改 `baseUrl`：

```javascript
globalData: {
  baseUrl: 'http://localhost:3000/api'  // 改为你的服务器地址
}
```

## ✅ 功能验证手册

### 一、后端 API 测试

#### 1. 健康检查

**请求：**
```bash
curl http://localhost:3000/health
```

**预期响应：**
```json
{
  "success": true,
  "timestamp": "2026-03-26T00:00:00.000Z",
  "status": "healthy"
}
```

#### 2. 获取所有路口

**请求：**
```bash
curl http://localhost:3000/api/highway/all
```

**预期响应：**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "北京服务区",
      "highway": "G2 京沪高速",
      "latitude": 39.9042,
      "longitude": 116.4074,
      ...
    },
    ...
  ],
  "message": "获取成功"
}
```

#### 3. 推荐路口测试

**请求（模拟北京位置）：**
```bash
curl "http://localhost:3000/api/highway/recommend?latitude=39.9042&longitude=116.4074"
```

**预期响应：**
```json
{
  "success": true,
  "data": {
    "userLocation": {
      "latitude": 39.9042,
      "longitude": 116.4074
    },
    "address": "北京市东城区...",
    "nodes": [
      {
        "id": "1",
        "name": "北京服务区",
        "distance": 150,
        "distanceText": "150 米",
        "estimatedTime": 1,
        ...
      }
    ]
  },
  "message": "为您找到 2 个推荐路口"
}
```

#### 4. 获取路口 POI

**请求：**
```bash
curl http://localhost:3000/api/poi/exit/1
```

**预期响应：**
```json
{
  "success": true,
  "data": {
    "node": {
      "id": "1",
      "name": "北京服务区",
      "highway": "G2 京沪高速"
    },
    "summary": {
      "total": 3,
      "hotel": 1,
      "restaurant": 1,
      "attraction": 1
    },
    "pois": {
      "all": [...],
      "hotel": [...],
      "restaurant": [...],
      "attraction": [...]
    }
  }
}
```

#### 5. 按类型获取 POI

**请求：**
```bash
curl http://localhost:3000/api/poi/exit/1/type/hotel
```

**预期响应：**
```json
{
  "success": true,
  "data": {
    "node": {
      "id": "1",
      "name": "北京服务区"
    },
    "type": "hotel",
    "pois": [
      {
        "id": "1",
        "name": "北京国际大酒店",
        "type": "hotel",
        ...
      }
    ]
  }
}
```

### 二、小程序功能测试

#### 1. 首页功能验证

**测试步骤：**

1. **位置授权**
   - 打开小程序，允许位置权限
   - 检查是否显示当前位置信息

2. **地图展示**
   - 地图是否正确显示
   - 是否显示用户当前位置标记

3. **路口推荐**
   - 查看"推荐前方路口"列表
   - 验证路口数量（2-4 个）
   - 点击路口卡片，检查是否跳转到详情页

4. **下拉刷新**
   - 下拉页面，验证是否重新加载数据

**预期结果：**
- ✅ 显示当前位置和地址
- ✅ 地图正常显示，有用户位置标记
- ✅ 推荐路口列表正确展示
- ✅ 每个路口显示距离、预估时间等信息
- ✅ 点击路口可跳转到详情页

#### 2. 详情页功能验证

**测试步骤：**

1. **路口信息展示**
   - 检查路口名称、高速编号、里程桩号
   - 查看设施列表（加油站、餐厅等）

2. **POI 统计**
   - 验证 POI 总数和各分类数量

3. **分类切换**
   - 点击"全部/酒店/餐厅/景点"标签
   - 验证列表是否正确筛选

4. **POI 详情**
   - 点击任意 POI 卡片
   - 查看弹窗显示的详细信息

5. **导航功能**
   - 点击"导航"按钮
   - 验证是否打开微信地图导航

**预期结果：**
- ✅ 路口信息完整显示
- ✅ POI 统计数据准确
- ✅ 分类切换流畅，数据正确
- ✅ POI 详情弹窗显示完整信息
- ✅ 导航功能正常工作

### 三、API 接口完整性测试

使用 Postman 或其他 API 测试工具：

| 接口 | 方法 | 参数 | 说明 |
|------|------|------|------|
| `/api/highway/all` | GET | 无 | 获取所有路口 |
| `/api/highway/:id` | GET | id | 获取路口详情 |
| `/api/highway/recommend` | GET | latitude, longitude | 推荐路口 |
| `/api/highway/nearby` | GET | latitude, longitude, radius | 搜索附近路口 |
| `/api/highway/:id/weather` | GET | id | 获取路口天气 |
| `/api/poi/exit/:exitId` | GET | exitId | 获取路口 POI |
| `/api/poi/exit/:exitId/type/:type` | GET | exitId, type | 按类型获取 POI |
| `/api/poi/nearby` | GET | latitude, longitude, type, radius | 搜索附近 POI |
| `/api/poi/:poiId` | GET | poiId | 获取 POI 详情 |

### 四、性能测试

#### 1. 响应时间测试

```bash
# 使用 curl 测试响应时间
curl -w "@curl-format.txt" -o /dev/null -s "http://localhost:3000/api/highway/recommend?latitude=39.9042&longitude=116.4074"
```

**curl-format.txt 内容：**
```
time_namelookup:  %{time_namelookup}\n
       time_connect:  %{time_connect}\n
    time_appconnect:  %{time_appconnect}\n
   time_pretransfer:  %{time_pretransfer}\n
      time_redirect:  %{time_redirect}\n
 time_starttransfer:  %{time_starttransfer}\n
                    ----------\n
         time_total:  %{time_total}\n
```

**预期结果：**
- API 响应时间 < 500ms
- 首次加载 < 1s

#### 2. 并发测试

使用 Apache Bench 进行测试：

```bash
ab -n 100 -c 10 "http://localhost:3000/api/highway/all"
```

**预期结果：**
- 成功率 > 99%
- 平均响应时间 < 1s

## 🔧 常见问题

### 1. 后端启动失败

**问题：** 端口被占用
```
Error: listen EADDRINUSE: address already in use :::3000
```

**解决：**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <进程 ID> /F

# Linux/Mac
lsof -i :3000
kill -9 <进程 ID>
```

### 2. 小程序无法连接后端

**问题：** 请求域名未配置

**解决：**
- 登录微信公众平台
- 开发管理 -> 开发设置 -> 服务器域名
- 添加 `request` 合法域名：`https://your-domain.com`

**本地开发：**
- 微信开发者工具 -> 详情 -> 本地设置
- 勾选"不校验合法域名、web-view（业务域名）、TLS 版本以及 HTTPS 证书"

### 3. 位置获取失败

**问题：** 用户拒绝授权

**解决：**
- 引导用户在小程序右上角菜单 -> 设置 -> 允许位置权限
- 或在代码中处理拒绝授权的降级方案

### 4. 高德 API 调用失败

**问题：** Key 无效或配额超限

**解决：**
- 检查 `config/index.js` 中的 Key 配置
- 登录高德开放平台查看配额使用情况
- 考虑升级套餐或优化调用频率

## 📱 界面预览

### 首页
- 地图展示用户位置和周边路口
- 推荐前方 2-4 个路口
- 显示距离、预估时间、设施信息

### 详情页
- 路口详细信息
- POI 分类展示（酒店/餐厅/景点）
- 一键导航功能

## 🛠️ 技术栈

**前端：**
- 微信小程序原生开发
- JavaScript ES6+

**后端：**
- Node.js
- Express 框架
- Axios（HTTP 客户端）
- Helmet（安全中间件）
- Morgan（日志中间件）

**第三方服务：**
- 高德地图 API（地理编码、POI 搜索、路径规划）

## 📝 开发计划

- [ ] 添加用户收藏功能
- [ ] 实时路况信息显示
- [ ] 离线缓存支持
- [ ] 路线规划功能
- [ ] 天气预警提示
- [ ] 分享到微信好友

## 📄 License

MIT License

## 👥 联系方式

如有问题请提交 Issue 或联系开发团队。

---

**祝使用愉快！** 🎉