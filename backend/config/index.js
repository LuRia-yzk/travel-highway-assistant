module.exports = {
  // 服务器配置
  port: process.env.PORT || 3000,
  
  // 高德地图 API 配置
  amap: {
    // Web 服务 Key（用于服务端 API 调用）
    key: 'd6653d2caaaea2260d7d6b339a14c640',
    // Web 端 Key（用于前端 JS API）
    webKey: '1ea92d862c6a02177889b87ddbaa2e15',
    // 安全密钥
    securityCode: '6e844b4f91c859569af561240ae3dcf9'
  },
  
  // 数据库文件路径
  database: {
    roadNodes: './database/roadNodes.json',
    pois: './database/pois.json'
  },
  
  // API 基础 URL
  amapBaseUrl: 'https://restapi.amap.com/v3',
  
  // 推荐路口配置
  recommend: {
    // 默认搜索半径（米）
    defaultRadius: 5000,
    // 最少推荐路口数
    minCount: 2,
    // 最多推荐路口数
    maxCount: 4
  },
  
  // POI 搜索配置
  poi: {
    // 搜索半径（米）
    radius: 3000,
    // 每页数量
    pageSize: 10
  }
};