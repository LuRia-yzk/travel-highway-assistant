const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const logger = require('./utils/logger');
const config = require('./config/index');

// 导入路由
const highwayRoutes = require('./routes/highwayRoutes');
const poiRoutes = require('./routes/poiRoutes');

class App {
  constructor() {
    this.app = express();
    this.setupMiddlewares();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  /**
   * 设置中间件
   */
  setupMiddlewares() {
    // 安全头盔中间件
    this.app.use(helmet());
    
    // CORS 跨域支持
    this.app.use(cors({
      origin: '*', // 生产环境应该限制具体域名
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }));
    
    // JSON 解析
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    
    // 请求日志
    this.app.use(morgan('combined', {
      stream: {
        write: (message) => {
          logger.info(message.trim());
        }
      }
    }));
    
    // 静态文件服务（可选）
    this.app.use(express.static(path.join(__dirname, 'public')));
  }

  /**
   * 设置路由
   */
  setupRoutes() {
    // API 文档根路径
    this.app.get('/api', (req, res) => {
      res.json({
        success: true,
        message: '欢迎使用高速公路旅行助手 API',
        version: '1.0.0',
        endpoints: {
          highway: '/api/highway',
          poi: '/api/poi'
        }
      });
    });

    // 健康检查
    this.app.get('/health', (req, res) => {
      res.json({
        success: true,
        timestamp: new Date().toISOString(),
        status: 'healthy'
      });
    });

    // 挂载路由
    this.app.use('/api/highway', highwayRoutes);
    this.app.use('/api/poi', poiRoutes);

    // 404 处理
    this.app.use((req, res) => {
      res.status(404).json({
        success: false,
        message: '接口不存在'
      });
    });
  }

  /**
   * 错误处理
   */
  setupErrorHandling() {
    // 全局错误处理
    this.app.use((err, req, res, next) => {
      logger.error('服务器错误', {
        error: err.message,
        stack: err.stack,
        url: req.originalUrl,
        method: req.method
      });

      res.status(err.status || 500).json({
        success: false,
        message: err.message || '服务器内部错误',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
      });
    });
  }

  /**
   * 获取 Express 应用实例
   */
  getInstance() {
    return this.app;
  }
}

module.exports = new App().getInstance();