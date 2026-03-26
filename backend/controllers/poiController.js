const poiModel = require('../models/poiModel');
const roadNodeModel = require('../models/roadNodeModel');
const amapService = require('../services/amapService');
const GeoUtil = require('../utils/geoUtil');
const logger = require('../utils/logger');
const config = require('../config/index');

class POIController {
  /**
   * 获取指定路口的所有 POI
   */
  async getPOIsByExit(req, res) {
    try {
      const { exitId } = req.params;
      
      // 验证路口是否存在
      const node = await roadNodeModel.getNodeById(exitId);
      if (!node) {
        return res.status(404).json({
          success: false,
          message: '路口不存在'
        });
      }
      
      // 获取该路口的所有 POI
      const groupedPOIs = await poiModel.getGroupedPOIs(exitId);
      
      // 格式化 POI 数据
      const formatPOI = (poi) => ({
        ...poi,
        distanceText: GeoUtil.formatDistance(poi.distance),
        ratingText: this.formatRating(poi.rating)
      });
      
      const formattedData = {
        node: {
          id: node.id,
          name: node.name,
          highway: node.highway
        },
        summary: {
          total: groupedPOIs.all.length,
          hotel: groupedPOIs.hotel.length,
          restaurant: groupedPOIs.restaurant.length,
          attraction: groupedPOIs.attraction.length
        },
        pois: {
          all: groupedPOIs.all.map(formatPOI),
          hotel: groupedPOIs.hotel.map(formatPOI),
          restaurant: groupedPOIs.restaurant.map(formatPOI),
          attraction: groupedPOIs.attraction.map(formatPOI)
        }
      };
      
      logger.info('获取路口 POI 成功', { 
        exitId, 
        nodeName: node.name,
        counts: formattedData.summary 
      });
      
      res.json({
        success: true,
        data: formattedData,
        message: '获取成功'
      });
      
    } catch (error) {
      logger.error('获取路口 POI 失败', { error: error.message, exitId: req.params.exitId });
      res.status(500).json({
        success: false,
        message: error.message || '服务器错误'
      });
    }
  }

  /**
   * 根据类型获取 POI
   */
  async getPOIsByType(req, res) {
    try {
      const { exitId, type } = req.params;
      
      // 验证路口
      const node = await roadNodeModel.getNodeById(exitId);
      if (!node) {
        return res.status(404).json({
          success: false,
          message: '路口不存在'
        });
      }
      
      // 验证类型
      const validTypes = ['hotel', 'restaurant', 'attraction'];
      if (type && !validTypes.includes(type)) {
        return res.status(400).json({
          success: false,
          message: '无效的 POI 类型'
        });
      }
      
      const pois = await poiModel.getPOIsByType(exitId, type);
      const formattedPOIs = pois.map(poi => ({
        ...poi,
        distanceText: GeoUtil.formatDistance(poi.distance),
        ratingText: this.formatRating(poi.rating)
      }));
      
      logger.info('按类型获取 POI 成功', { exitId, type, count: formattedPOIs.length });
      
      res.json({
        success: true,
        data: {
          node: {
            id: node.id,
            name: node.name
          },
          type,
          pois: formattedPOIs
        },
        message: `找到${formattedPOIs.length}个${type ? this.getTypeName(type) : ''}POI`
      });
      
    } catch (error) {
      logger.error('按类型获取 POI 失败', { error: error.message });
      res.status(500).json({
        success: false,
        message: error.message || '服务器错误'
      });
    }
  }

  /**
   * 搜索附近的 POI（基于坐标）
   */
  async searchNearby(req, res) {
    try {
      const { latitude, longitude, type, radius } = req.query;
      
      if (!latitude || !longitude) {
        return res.status(400).json({
          success: false,
          message: '缺少位置参数'
        });
      }
      
      const searchRadius = radius ? parseInt(radius) : config.poi.radius;
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      
      let pois;
      if (type) {
        // 使用高德 API 搜索特定类型的 POI
        const typeMap = {
          hotel: '酒店住宿服务',
          restaurant: '餐饮服务',
          attraction: '风景名胜'
        };
        
        const result = await amapService.searchByType(lat, lng, typeMap[type], searchRadius);
        if (result.success) {
          pois = result.data.map(poi => ({
            id: poi.id,
            name: poi.name,
            type: type,
            typeName: this.getTypeName(type),
            latitude: poi.location.split(',')[1],
            longitude: poi.location.split(',')[0],
            address: poi.address,
            rating: poi.biz_ext?.rating || 0,
            distance: parseFloat(poi.distance) || 0
          }));
        } else {
          pois = [];
        }
      } else {
        // 从本地数据库获取
        pois = await poiModel.getNearbyPOIs(lat, lng, searchRadius);
      }
      
      const formattedPOIs = pois.map(poi => ({
        ...poi,
        distanceText: GeoUtil.formatDistance(poi.distance),
        ratingText: this.formatRating(poi.rating)
      })).slice(0, config.poi.pageSize);
      
      logger.info('搜索附近 POI 成功', { 
        location: `${lat},${lng}`, 
        type, 
        count: formattedPOIs.length 
      });
      
      res.json({
        success: true,
        data: formattedPOIs,
        message: `找到${formattedPOIs.length}个${type ? this.getTypeName(type) + ' ' : ''}POI`
      });
      
    } catch (error) {
      logger.error('搜索附近 POI 失败', { error: error.message });
      res.status(500).json({
        success: false,
        message: error.message || '服务器错误'
      });
    }
  }

  /**
   * 获取 POI 详情
   */
  async getPOIDetail(req, res) {
    try {
      const { poiId } = req.params;
      const allPOIs = await poiModel.getAllPOIs();
      const poi = allPOIs.find(p => p.id === poiId);
      
      if (!poi) {
        return res.status(404).json({
          success: false,
          message: 'POI 不存在'
        });
      }
      
      // 获取所属路口信息
      const node = await roadNodeModel.getNodeById(poi.roadNodeId);
      
      const detail = {
        ...poi,
        distanceText: GeoUtil.formatDistance(poi.distance),
        ratingText: this.formatRating(poi.rating),
        nodeInfo: node ? {
          id: node.id,
          name: node.name,
          highway: node.highway
        } : null
      };
      
      logger.info('获取 POI 详情成功', { poiId, poiName: poi.name });
      
      res.json({
        success: true,
        data: detail,
        message: '获取成功'
      });
      
    } catch (error) {
      logger.error('获取 POI 详情失败', { error: error.message });
      res.status(500).json({
        success: false,
        message: error.message || '服务器错误'
      });
    }
  }

  /**
   * 格式化评分
   */
  formatRating(rating) {
    if (!rating) return '暂无评分';
    const stars = Math.round(rating / 2);
    return '⭐'.repeat(stars) + ` ${rating.toFixed(1)}`;
  }

  /**
   * 获取类型中文名称
   */
  getTypeName(type) {
    const typeMap = {
      hotel: '酒店',
      restaurant: '餐厅',
      attraction: '景点'
    };
    return typeMap[type] || type;
  }
}

module.exports = new POIController();