const app = getApp();
const { request } = require('../../untils/request');

Page({
  data: {
    nodeId: null,
    nodeName: '',
    currentTab: 'hotel', // hotel, restaurant, attraction
    pois: {
      hotel: [],
      restaurant: [],
      attraction: []
    },
    comments: [],
    commentText: '',
    loading: false
  },

  onLoad(options) {
    console.log('详情页加载，nodeId:', options.nodeId);
    this.setData({
      nodeId: options.nodeId,
      nodeName: decodeURIComponent(options.nodeName || '路口详情')
    });
    
    // 加载 POI 数据
    this.loadPOIData();
    
    // 加载评论数据
    this.loadComments();
  },

  /**
   * 切换导航栏目
   */
  onTabChange(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ currentTab: tab });
  },

  /**
   * 加载 POI 数据
   */
  async loadPOIData() {
    this.setData({ loading: true });
    
    try {
      const result = await request({
        url: `/poi/exit/${this.data.nodeId}`,
        method: 'GET',
        showLoading: false
      });

      if (result.success) {
        // 智能排序：根据距离、评分、价格等
        const sortedPOIs = this.sortPOIs(result.data);
        
        this.setData({
          pois: {
            hotel: sortedPOIs.hotel || [],
            restaurant: sortedPOIs.restaurant || [],
            attraction: sortedPOIs.attraction || []
          },
          loading: false
        });
      } else {
        throw new Error(result.message || '加载失败');
      }
    } catch (error) {
      console.error('加载 POI 数据失败:', error);
      this.setData({
        pois: { hotel: [], restaurant: [], attraction: [] },
        loading: false
      });
      
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    }
  },

  /**
   * 智能排序 POI
   * AI 推荐算法：根据距离、评分、价格等因素
   */
  sortPOIs(data) {
    const sortFunction = (a, b) => {
      // 综合评分 = 距离分 (40%) + 评分分 (30%) + 价格分 (20%) + 推荐分 (10%)
      
      // 距离分（越近分数越高）
      const distanceScoreA = this.calculateDistanceScore(a.distance);
      const distanceScoreB = this.calculateDistanceScore(b.distance);
      
      // 评分分（越高分数越高）
      const ratingScoreA = (a.rating || 0) * 10;
      const ratingScoreB = (b.rating || 0) * 10;
      
      // 价格分（适中最好）
      const priceScoreA = this.calculatePriceScore(a.price);
      const priceScoreB = this.calculatePriceScore(b.price);
      
      // 推荐分
      const recommendScoreA = a.recommend ? 100 : 0;
      const recommendScoreB = b.recommend ? 100 : 0;
      
      const scoreA = distanceScoreA * 0.4 + ratingScoreA * 0.3 + priceScoreA * 0.2 + recommendScoreA * 0.1;
      const scoreB = distanceScoreB * 0.4 + ratingScoreB * 0.3 + priceScoreB * 0.2 + recommendScoreB * 0.1;
      
      return scoreB - scoreA;
    };

    return {
      hotel: (data.hotel || []).sort(sortFunction),
      restaurant: (data.restaurant || []).sort(sortFunction),
      attraction: (data.attraction || []).sort(sortFunction)
    };
  },

  /**
   * 计算距离分
   */
  calculateDistanceScore(distance) {
    if (!distance) return 50;
    // 距离越近分数越高，0-1km 得 100 分，5km 以上得 0 分
    // 假设 distance 单位为米
    const score = Math.max(0, 100 - (distance / 5000) * 100);
    return Math.min(100, score);
  },

  /**
   * 计算价格分（适中最好）
   */
  calculatePriceScore(price) {
    if (!price) return 50;
    const numPrice = Number(price);
    if (isNaN(numPrice)) return 50;
    // 价格适中（100-300）得分最高
    if (numPrice >= 100 && numPrice <= 300) return 100;
    if (numPrice < 100) return 80;
    if (numPrice <= 500) return 60;
    return 40;
  },

  /**
   * 加载评论
   */
  loadComments() {
    // TODO: 从后端加载评论数据
    // 这里是示例数据
    const mockComments = [
      {
        id: 1,
        username: '张三',
        avatar: '',
        time: '2 小时前',
        content: '这个服务区设施很新，环境不错！',
        images: [],
        likes: 12
      },
      {
        id: 2,
        username: '李四',
        avatar: '',
        time: '昨天',
        content: '停车场很大，但是饭点人比较多。',
        images: [],
        likes: 5
      }
    ];
    
    this.setData({
      comments: mockComments
    });
  },

  /**
   * 输入评论
   */
  onCommentInput(e) {
    this.setData({
      commentText: e.detail.value
    });
  },

  /**
   * 提交评论
   */
  async onSubmitComment() {
    if (!this.data.commentText.trim()) {
      wx.showToast({
        title: '请输入评论内容',
        icon: 'none'
      });
      return;
    }

    // TODO: 调用后端 API 提交评论
    const newComment = {
      id: Date.now(),
      username: '我',
      avatar: '',
      time: '刚刚',
      content: this.data.commentText,
      images: [],
      likes: 0
    };

    const comments = [newComment, ...this.data.comments];
    this.setData({
      comments,
      commentText: ''
    });

    wx.showToast({
      title: '发表成功',
      icon: 'success'
    });
  },

  /**
   * 点赞评论
   */
  onLike(e) {
    const commentId = e.currentTarget.dataset.commentid;
    const comments = this.data.comments.map(c => {
      if (c.id === commentId) {
        return { ...c, likes: c.likes + 1 };
      }
      return c;
    });
    this.setData({ comments });
  },

  /**
   * 回复评论
   */
  onReply(e) {
    const commentId = e.currentTarget.dataset.commentid;
    const comment = this.data.comments.find(c => c.id === commentId);
    
    wx.showModal({
      title: '回复评论',
      editable: true,
      placeholderText: '请输入回复内容',
      success: (res) => {
        if (res.confirm && res.content) {
          wx.showToast({
            title: '回复成功',
            icon: 'success'
          });
        }
      }
    });
  },

  /**
   * 点击 POI 卡片
   */
  onPOITap(e) {
    const poiId = e.currentTarget.dataset.poiid;
    // TODO: 跳转到 POI 详情页或调用导航
    wx.showToast({
      title: '功能开发中...',
      icon: 'none'
    });
  },

  /**
   * 返回上一页
   */
  onBack() {
    wx.navigateBack();
  },

  /**
   * 分享
   */
  onShareAppMessage() {
    return {
      title: `推荐你查看${this.data.nodeName}的周边设施`,
      path: `/pages/detail/detail?nodeId=${this.data.nodeId}&nodeName=${encodeURIComponent(this.data.nodeName)}`
    };
  }
});