const fs = require('fs');
const path = require('path');

class Logger {
  constructor() {
    this.logDir = path.join(__dirname, '../logs');
    this.logLevel = process.env.LOG_LEVEL || 'info';
    
    // 确保日志目录存在
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  /**
   * 获取日志级别数值
   */
  getLogLevel(level) {
    const levels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3
    };
    return levels[level] || 2;
  }

  /**
   * 判断是否应该记录日志
   */
  shouldLog(level) {
    return this.getLogLevel(level) <= this.getLogLevel(this.logLevel);
  }

  /**
   * 格式化时间
   */
  formatTime() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  /**
   * 获取日志文件名（按日期）
   */
  getLogFileName() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    
    return `app-${year}-${month}-${day}.log`;
  }

  /**
   * 写入日志
   */
  writeLog(level, message, meta = {}) {
    if (!this.shouldLog(level)) {
      return;
    }

    const timestamp = this.formatTime();
    const logEntry = {
      timestamp,
      level: level.toUpperCase(),
      message,
      ...meta
    };

    const logLine = `[${timestamp}] [${level.toUpperCase()}] ${message} ${Object.keys(meta).length > 0 ? JSON.stringify(meta) : ''}\n`;
    
    const logFile = path.join(this.logDir, this.getLogFileName());
    
    // 异步写入，不阻塞主流程
    fs.appendFile(logFile, logLine, (err) => {
      if (err) {
        console.error('写入日志失败:', err);
      }
    });

    // 同时输出到控制台
    const colorMap = {
      error: '\x1b[31m', // 红色
      warn: '\x1b[33m',  // 黄色
      info: '\x1b[36m',  // 青色
      debug: '\x1b[35m'  // 紫色
    };
    
    const reset = '\x1b[0m';
    const color = colorMap[level] || '';
    
    console.log(`${color}[${timestamp}] [${level.toUpperCase()}] ${message}${reset}`, meta);
  }

  /**
   * 错误日志
   */
  error(message, meta = {}) {
    this.writeLog('error', message, meta);
  }

  /**
   * 警告日志
   */
  warn(message, meta = {}) {
    this.writeLog('warn', message, meta);
  }

  /**
   * 信息日志
   */
  info(message, meta = {}) {
    this.writeLog('info', message, meta);
  }

  /**
   * 调试日志
   */
  debug(message, meta = {}) {
    this.writeLog('debug', message, meta);
  }

  /**
   * HTTP 请求日志
   */
  http(req, res, startTime) {
    const duration = Date.now() - startTime;
    this.info('HTTP Request', {
      method: req.method,
      url: req.originalUrl || req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip || req.connection.remoteAddress
    });
  }
}

module.exports = new Logger();