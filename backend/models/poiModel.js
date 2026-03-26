const fs = require('fs');
const path = require('path');
const config = require('../config/index');

class POIModel {
  constructor() {
    this.dataPath = path.join(__dirname, '../../', config.database.pois);
    this.data = null;
  }

  // 读取 POI 数据
  async loadData() {
    try {
      if (!this.data) {
        const fileContent = fs.readFileSync(this.dataPath, 'utf-8');
        const jsonData = JSON.parse(fileContent);
        this.data = jsonData.pois || [];
      }
      return this.data;
    } catch (error) {
      console.error('读取 POI 数据失败:', error);
      throw new Error('POI 数据加载失败');
    }
  }

  // 获取所有 POI
  async getAllPOIs() {
    await this.loadData();
    return this.data;
  }

  // 根据路口 ID 获取 POI
  async getPOIsByRoadNodeId(roadNodeId) {
    await this.loadData();
    return this.data.filter(poi => poi.roadNodeId === roadNodeId);
  }

  // 根据类型筛选 POI
  async getPOIsByType(roadNodeId, type) {
    await this.loadData();
    const pois = await this.getPOIsByRoadNodeId(roadNodeId);
    return type ? pois.filter(poi => poi.type === type) : pois;
  }

  // 获取指定路口的所有 POI（按类型分组）
  async getGroupedPOIs(roadNodeId) {
    const pois = await this.getPOIsByRoadNodeId(roadNodeId);
    
    const grouped = {
      hotel: [],
      restaurant: [],
      attraction: [],
      all: pois
    };
    
    pois.forEach(poi => {
      if (poi.type === 'hotel') grouped.hotel.push(poi);
      else if (poi.type === 'restaurant') grouped.restaurant.push(poi);
      else if (poi.type === 'attraction') grouped.attraction.push(poi);
    });
    
    return grouped;
  }

  // 根据坐标范围查询 POI
  async getPOIsByArea(latMin, latMax, lngMin, lngMax) {
    await this.loadData();
    return this.data.filter(poi => {
      return poi.latitude >= latMin && 
             poi.latitude <= latMax && 
             poi.longitude >= lngMin && 
             poi.longitude <= lngMax;
    });
  }

  // 计算距离并排序
  async getNearbyPOIs(userLat, userLng, radius = 5000) {
    await this.loadData();
    
    const poisWithDistance = this.data.map(poi => {
      const distance = this.calculateDistance(userLat, userLng, poi.latitude, poi.longitude);
      return { ...poi, distance };
    }).filter(poi => poi.distance <= radius)
      .sort((a, b) => a.distance - b.distance);
    
    return poisWithDistance;
  }

  // 计算两点间距离
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371000;
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  toRad(degrees) {
    return degrees * Math.PI / 180;
  }

  // 刷新数据
  refreshData() {
    this.data = null;
    return this.loadData();
  }
}

module.exports = new POIModel();