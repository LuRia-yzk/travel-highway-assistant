const fs = require('fs');
const path = require('path');
const config = require('../config/index');

class RoadNodeModel {
  constructor() {
    this.dataPath = path.join(__dirname, '../../', config.database.roadNodes);
    this.data = null;
  }

  // 读取路口数据
  async loadData() {
    try {
      if (!this.data) {
        const fileContent = fs.readFileSync(this.dataPath, 'utf-8');
        const jsonData = JSON.parse(fileContent);
        this.data = jsonData.roadNodes || [];
      }
      return this.data;
    } catch (error) {
      console.error('读取路口数据失败:', error);
      throw new Error('路口数据加载失败');
    }
  }

  // 获取所有路口
  async getAllNodes() {
    await this.loadData();
    return this.data;
  }

  // 根据 ID 获取路口
  async getNodeById(id) {
    await this.loadData();
    return this.data.find(node => node.id === id);
  }

  // 根据坐标范围查询路口
  async getNodesByArea(latMin, latMax, lngMin, lngMax) {
    await this.loadData();
    return this.data.filter(node => {
      return node.latitude >= latMin && 
             node.latitude <= latMax && 
             node.longitude >= lngMin && 
             node.longitude <= lngMax;
    });
  }

  // 计算距离并排序（根据用户位置）
  async getNearbyNodes(userLat, userLng, radius = 50000) {
    await this.loadData();
    
    const nodesWithDistance = this.data.map(node => {
      const distance = this.calculateDistance(userLat, userLng, node.latitude, node.longitude);
      return { ...node, distance };
    }).filter(node => node.distance <= radius)
      .sort((a, b) => a.distance - b.distance);
    
    return nodesWithDistance;
  }

  // 计算两点间距离（Haversine 公式）
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371000; // 地球半径（米）
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

  // 刷新数据（重新从文件读取）
  refreshData() {
    this.data = null;
    return this.loadData();
  }
}

module.exports = new RoadNodeModel();