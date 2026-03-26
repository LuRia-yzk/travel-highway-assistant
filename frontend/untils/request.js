const app = getApp();

/**
 * 封装网络请求
 */
function request(options) {
  return new Promise((resolve, reject) => {
    // 构建完整 URL
    const url = (options.url.startsWith('http') ? '' : app.globalData.baseUrl) + options.url;

    // 显示加载提示
    if (options.showLoading !== false) {
      wx.showLoading({
        title: options.loadingText || '加载中...',
        mask: true
      });
    }

    wx.request({
      url,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Content-Type': 'application/json',
        ...options.header
      },
      timeout: options.timeout || 10000,
      success: (res) => {
        // 隐藏加载提示
        if (options.showLoading !== false) {
          wx.hideLoading();
        }

        // 处理响应
        if (res.statusCode === 200) {
          resolve(res.data);
        } else if (res.statusCode === 404) {
          wx.showToast({
            title: '请求的资源不存在',
            icon: 'none'
          });
          reject(new Error('资源不存在'));
        } else if (res.statusCode === 500) {
          wx.showToast({
            title: '服务器错误',
            icon: 'none'
          });
          reject(new Error('服务器错误'));
        } else {
          wx.showToast({
            title: `请求失败 (${res.statusCode})`,
            icon: 'none'
          });
          reject(new Error(`请求失败：${res.statusCode}`));
        }
      },
      fail: (err) => {
        // 隐藏加载提示
        if (options.showLoading !== false) {
          wx.hideLoading();
        }

        console.error('请求失败:', err);
        
        // 网络错误处理
        if (err.errMsg.includes('timeout')) {
          wx.showToast({
            title: '请求超时',
            icon: 'none'
          });
        } else if (err.errMsg.includes('fail')) {
          wx.showToast({
            title: '网络连接失败',
            icon: 'none'
          });
        } else {
          wx.showToast({
            title: err.errMsg || '请求失败',
            icon: 'none'
          });
        }
        
        reject(err);
      }
    });
  });
}

/**
 * GET 请求快捷方式
 */
function get(url, data = {}) {
  return request({
    url,
    method: 'GET',
    data
  });
}

/**
 * POST 请求快捷方式
 */
function post(url, data = {}) {
  return request({
    url,
    method: 'POST',
    data
  });
}

module.exports = {
  request,
  get,
  post
};