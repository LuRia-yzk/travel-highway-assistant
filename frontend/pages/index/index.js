const app = getApp();
const { request } = require('../../untils/request');

Page({
  data: {
    userLocation: null,
    address: '',
    recommendedNodes: [],
    loading: false,
    error: null,
    mapCenter: {
      latitude: 39.9042,
      longitude: 116.4074,
      scale: 12
    },
    markers: []
  },

  onLoad() {
    console.log('首页加载');
    
    // 先尝试获取真实位置
    this.checkAndRequestLocation();
  },

  onShow() {
    // 页面显示时刷新数据
    if (this.data.userLocation) {
      this.getRecommendedNodes();
    }
  },

  /**
   * 刷新位置和推荐路口
   */
  async onRefresh() {
    console.log('手动刷新位置和路口');
    
    // 清除之前的数据
    this.setData({
      recommendedNodes: [],
      markers: [],
      address: '',
      error: '',
      loading: true
    });
    
    // 重新获取位置和推荐
    await this.checkAndRequestLocation();
  },

  /**
   * 检查并请求位置权限
   */
  async checkAndRequestLocation() {
    wx.showLoading({ title: '获取位置中...' });

    try {
      // 先尝试获取真实位置
      const location = await this.getLocation();
      
      console.log('获取到真实位置:', location);
      
      this.setData({
        userLocation: location,
        mapCenter: {
          latitude: location.latitude,
          longitude: location.longitude,
          scale: 14
        }
      });
      
      // 直接获取推荐路口（recommend 接口会返回地址信息）
      await this.getRecommendedNodes();
      
    } catch (error) {
      console.error('获取位置失败:', error);
      
      // 如果获取失败，使用默认位置（北京）
      const defaultLocation = {
        latitude: 39.9042,
        longitude: 116.4074
      };
      
      this.setData({
        userLocation: defaultLocation,
        mapCenter: {
          latitude: defaultLocation.latitude,
          longitude: defaultLocation.longitude,
          scale: 14
        },
        loading: false
      });
      
      // 显示提示
      wx.showModal({
        title: '提示',
        content: '无法获取真实位置，已使用北京作为默认位置。请在模拟器设置中开启位置模拟，或移动到高速公路附近获取真实推荐。',
        showCancel: false,
        confirmText: '我知道了'
      });
      
      // 使用默认位置获取推荐
      await this.getRecommendedNodes();
    } finally {
      wx.hideLoading();
    }
  },

  /**
   * 获取用户位置
   */
  getLocation() {
    return new Promise((resolve, reject) => {
      wx.getLocation({
        type: 'gcj02',
        success: (res) => {
          resolve({
            latitude: res.latitude,
            longitude: res.longitude
          });
        },
        fail: (err) => {
          reject(err);
        }
      });
    });
  },

  /**
   * 获取推荐路口
   */
  async getRecommendedNodes() {
    const { userLocation } = this.data;
    
    if (!userLocation) return;

    this.setData({ loading: true });

    try {
      const result = await request({
        url: '/highway/recommend',
        method: 'GET',
        data: {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude
        }
      });

      if (result.success) {
        const nodes = result.data.nodes || [];
        const address = result.data.address || '';
        
        // 创建地图标记
        const markers = nodes.map((node, index) => ({
          id: Number(node.id) || index,
          latitude: node.latitude,
          longitude: node.longitude,
          iconPath: '/images/location-icon.png', // 需要在 images 目录放置图标
          width: 30,
          height: 30,
          callout: {
            content: `${index + 1}. ${node.name}\n${node.distanceText}`,
            display: 'ALWAYS',
            padding: 10,
            borderRadius: 5,
            bgColor: '#ffffff',
            color: '#333333',
            fontSize: 12
          }
        }));

        this.setData({
          recommendedNodes: nodes,
          markers: markers,
          address: address,
          loading: false,
          error: null
        });

        if (nodes.length === 0) {
          wx.showToast({
            title: '附近暂无路口信息',
            icon: 'none'
          });
        }
      } else {
        throw new Error(result.message || '获取推荐失败');
      }
    } catch (error) {
      console.error('获取推荐路口失败:', error);
      this.setData({
        loading: false,
        error: error.message || '获取推荐失败'
      });
      
      wx.showToast({
        title: '获取推荐失败',
        icon: 'none'
      });
    }
  },

  /**
   * 点击路口卡片
   */
  onNodeTap(e) {
    const nodeId = e.currentTarget.dataset.nodeid;
    const node = this.data.recommendedNodes.find(n => n.id === nodeId);
    
    if (node) {
      wx.navigateTo({
        url: `/pages/detail/detail?nodeId=${nodeId}&nodeName=${encodeURIComponent(node.name)}`
      });
    }
  },

  /**
   * 下拉刷新
   */
  async onPullDownRefresh() {
    console.log('下拉刷新');
    await this.onRefresh();
    wx.stopPullDownRefresh();
  }
});