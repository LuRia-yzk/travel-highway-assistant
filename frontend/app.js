App({
  onLaunch() {
    console.log('高速旅行助手启动');
    
    // 初始化全局数据
    this.globalData = {
      baseUrl: 'http://localhost:3000/api',
      userInfo: null,
      userLocation: null
    };

    // 检查是否需要获取用户位置
    this.checkLocationPermission();
  },

  /**
   * 检查位置权限
   */
  checkLocationPermission() {
    wx.getSetting({
      success: (res) => {
        if (res.authSetting['scope.userLocation']) {
          console.log('已授权位置权限');
          this.getUserLocation();
        } else {
          console.log('未授权位置权限');
        }
      }
    });
  },

  /**
   * 获取用户位置
   */
  getUserLocation() {
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        this.globalData.userLocation = {
          latitude: res.latitude,
          longitude: res.longitude
        };
        console.log('获取到用户位置:', this.globalData.userLocation);
      },
      fail: (err) => {
        console.error('获取位置失败:', err);
      }
    });
  },

  /**
   * 请求位置授权
   */
  requestLocationAuth() {
    return new Promise((resolve, reject) => {
      wx.authorize({
        scope: 'scope.userLocation',
        success: () => {
          this.getUserLocation();
          resolve(true);
        },
        fail: () => {
          reject(false);
        }
      });
    });
  },

  globalData: {
    baseUrl: 'http://localhost:3000/api',
    userInfo: null,
    userLocation: null
  }
});