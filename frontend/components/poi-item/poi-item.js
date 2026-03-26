Component({
  /**
   * 组件属性
   */
  properties: {
    poi: {
      type: Object,
      value: {}
    },
    showNavigate: {
      type: Boolean,
      value: true
    }
  },

  /**
   * 组件数据
   */
  data: {
    ratingStars: ''
  },

  /**
   * 生命周期函数
   */
  lifetimes: {
    attached() {
      this.initRating();
    }
  },

  /**
   * 组件方法
   */
  methods: {
    /**
     * 初始化评分显示
     */
    initRating() {
      const poi = this.data.poi;
      if (poi && poi.rating) {
        const stars = Math.round(poi.rating / 2);
        this.setData({
          ratingStars: '⭐'.repeat(stars) + ` ${poi.rating.toFixed(1)}`
        });
      }
    },

    /**
     * 点击 POI 卡片
     */
    onPOITap() {
      this.triggerEvent('poitap', {
        poiId: this.data.poi.id,
        poi: this.data.poi
      });
    },

    /**
     * 点击导航按钮
     */
    onNavigateTap(e) {
      e.stopPropagation();
      this.triggerEvent('navigate', {
        poiId: this.data.poi.id,
        poi: this.data.poi
      });
    }
  }
});