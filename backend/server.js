const app = require('./app');
const config = require('./config/index');
const logger = require('./utils/logger');
const roadNodeModel = require('./models/roadNodeModel');

class Server {
  constructor() {
    this.server = null;
    this.port = config.port;
  }

  /**
   * 启动服务器
   */
  async start() {
    try {
      // 预加载数据
      logger.info('正在初始化路口数据...');
      await roadNodeModel.loadData();
      const nodes = await roadNodeModel.getAllNodes();
      logger.info(`路口数据加载成功，共${nodes.length}个路口`);

      // 启动 HTTP 服务器
      this.server = app.listen(this.port, () => {
        logger.info('===========================================');
        logger.info(`🚀 服务器启动成功！`);
        logger.info(`📍 端口：${this.port}`);
        logger.info(`🌐 本地访问：http://localhost:${this.port}`);
        logger.info(`📡 API 文档：http://localhost:${this.port}/api`);
        logger.info(`💚 健康检查：http://localhost:${this.port}/health`);
        logger.info('===========================================');
        logger.info(`当前环境：${process.env.NODE_ENV || 'development'}`);
        logger.info(`日志级别：${logger.logLevel}`);
        logger.info('===========================================');
      });

      // 优雅关闭
      this.setupGracefulShutdown();

      return this.server;
    } catch (error) {
      logger.error('服务器启动失败', { error: error.message });
      process.exit(1);
    }
  }

  /**
   * 设置优雅关闭
   */
  setupGracefulShutdown() {
    const shutdown = async (signal) => {
      logger.info(`收到信号 ${signal}, 开始优雅关闭...`);
      
      if (this.server) {
        this.server.close(async () => {
          logger.info('HTTP 服务器已关闭');
          
          // 这里可以添加数据库连接关闭等操作
          
          logger.info('所有资源已释放，进程退出');
          process.exit(0);
        });

        // 强制退出超时（10 秒）
        setTimeout(() => {
          logger.error('未能优雅关闭，强制退出');
          process.exit(1);
        }, 10000);
      } else {
        process.exit(0);
      }
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // 未捕获的异常处理
    process.on('uncaughtException', (err) => {
      logger.error('未捕获的异常', { error: err.message, stack: err.stack });
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('未处理的 Promise 拒绝', { reason: reason?.message || reason });
    });
  }

  /**
   * 停止服务器
   */
  stop() {
    return new Promise((resolve, reject) => {
      if (this.server) {
        this.server.close((err) => {
          if (err) {
            logger.error('关闭服务器失败', { error: err.message });
            reject(err);
          } else {
            logger.info('服务器已停止');
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }

  /**
   * 获取服务器实例
   */
  getServer() {
    return this.server;
  }
}

// 如果直接运行此文件
if (require.main === module) {
  const server = new Server();
  server.start();
}

module.exports = Server;