/**
 * 格式化时间
 */
function formatTime(date, format = 'YYYY-MM-DD HH:mm:ss') {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();

  return format
    .replace('YYYY', year)
    .replace('MM', String(month).padStart(2, '0'))
    .replace('DD', String(day).padStart(2, '0'))
    .replace('HH', String(hour).padStart(2, '0'))
    .replace('mm', String(minute).padStart(2, '0'))
    .replace('ss', String(second).padStart(2, '0'));
}

/**
 * 格式化距离显示
 */
function formatDistance(meters) {
  if (meters < 1000) {
    return `${Math.round(meters)}米`;
  } else {
    return `${(meters / 1000).toFixed(1)}公里`;
  }
}

/**
 * 计算两点间距离（简化版 Haversine 公式）
 */
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000; // 地球半径（米）
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * 角度转弧度
 */
function toRad(degrees) {
  return degrees * Math.PI / 180;
}

/**
 * 防抖函数
 */
function debounce(func, wait = 300) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

/**
 * 节流函数
 */
function throttle(func, wait = 300) {
  let lastCall = 0;
  return function(...args) {
    const now = Date.now();
    if (now - lastCall >= wait) {
      lastCall = now;
      func.apply(this, args);
    }
  };
}

/**
 * 深拷贝
 */
function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item));
  }
  
  const cloned = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  
  return cloned;
}

/**
 * 获取 URL 参数
 */
function getQueryParam(url, name) {
  const params = new URLSearchParams(url);
  return params.get(name);
}

/**
 * 显示成功提示
 */
function showSuccess(title, duration = 1500) {
  wx.showToast({
    title,
    icon: 'success',
    duration
  });
}

/**
 * 显示错误提示
 */
function showError(title, duration = 2000) {
  wx.showToast({
    title,
    icon: 'none',
    duration
  });
}

/**
 * 页面跳转
 */
function navigateTo(url) {
  wx.navigateTo({
    url,
    fail: (err) => {
      console.error('跳转失败:', err);
      showError('页面跳转失败');
    }
  });
}

/**
 * 返回上一页
 */
function navigateBack(delta = 1) {
  wx.navigateBack({
    delta,
    fail: (err) => {
      console.error('返回失败:', err);
    }
  });
}

/**
 * 重定向页面
 */
function redirectTo(url) {
  wx.redirectTo({
    url,
    fail: (err) => {
      console.error('重定向失败:', err);
    }
  });
}

module.exports = {
  formatTime,
  formatDistance,
  calculateDistance,
  toRad,
  debounce,
  throttle,
  deepClone,
  getQueryParam,
  showSuccess,
  showError,
  navigateTo,
  navigateBack,
  redirectTo
};