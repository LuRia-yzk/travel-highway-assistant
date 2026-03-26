const roadNodeModel = require('../models/roadNodeModel');
const amapService = require('../services/amapService');
const GeoUtil = require('../utils/geoUtil');
const logger = require('../utils/logger');
const config = require('../config/index');

class HighwayController {
  /**
   * 获取所有高速路口
   */
  async getAllNodes(req, res) {
    try {
      const nodes = await roadNodeModel.getAllNodes();
      logger.info('获取所有路口成功', { count: nodes.length });
      
      res.json({
        success: true,
        data: nodes,
        message: '获取成功'
      });
    } catch (error) {
      logger.error('获取所有路口失败', { error: error.message });
      res.status(500).json({
        success: false,
        message: error.message || '服务器错误'
      });
    }
  }

  /**
   * 根据 ID 获取路口详情
   */
  async getNodeById(req, res) {
    try {
      const { id } = req.params;
      const node = await roadNodeModel.getNodeById(id);
      
      if (!node) {
        return res.status(404).json({
          success: false,
          message: '路口不存在'
        });
      }
      
      logger.info('获取路口详情成功', { nodeId: id });
      
      res.json({
        success: true,
        data: node,
        message: '获取成功'
      });
    } catch (error) {
      logger.error('获取路口详情失败', { error: error.message, nodeId: req.params.id });
      res.status(500).json({
        success: false,
        message: error.message || '服务器错误'
      });
    }
  }

  /**
   * 推荐前方路口（核心功能）
   */
  async recommendNodes(req, res) {
    try {
      const { latitude, longitude } = req.query;
      
      // 验证参数
      if (!latitude || !longitude) {
        return res.status(400).json({
          success: false,
          message: '缺少位置参数（latitude, longitude）'
        });
      }
      
      const userPos = {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude)
      };
      
      // 获取用户位置的地址信息
      const addressInfo = await amapService.getAddress(userPos.latitude, userPos.longitude);
      
      // 获取所有路口并推荐
      const allNodes = await roadNodeModel.getAllNodes();
      const recommendedNodes = GeoUtil.recommendNodes(
        allNodes,
        userPos,
        config.recommend.minCount,
        config.recommend.maxCount,
        config.recommend.defaultRadius
      );
      
      // 格式化返回数据
      const formattedNodes = recommendedNodes.map(node => ({
        ...node,
        distanceText: GeoUtil.formatDistance(node.distance),
        estimatedTime: Math.ceil(node.distance / 1000 * 0.8) // 估算分钟数（按 80km/h）
      }));
      
      logger.info('推荐路口成功', {
        userPos,
        recommendedCount: formattedNodes.length,
        address: addressInfo.success ? addressInfo.data.formatted_address : '未知'
      });
      
      res.json({
        success: true,
        data: {
          userLocation: userPos,
          address: addressInfo.success ? addressInfo.data.formatted_address : '',
          nodes: formattedNodes
        },
        message: `为您找到${formattedNodes.length}个推荐路口`
      });
      
    } catch (error) {
      logger.error('推荐路口失败', { error: error.message, params: req.query });
      res.status(500).json({
        success: false,
        message: error.message || '服务器错误'
      });
    }
  }

  /**
   * 搜索附近的路口
   */
  async searchNearby(req, res) {
    try {
      const { latitude, longitude, radius } = req.query;
      
      if (!latitude || !longitude) {
        return res.status(400).json({
          success: false,
          message: '缺少位置参数'
        });
      }
      
      const searchRadius = radius ? parseInt(radius) : config.recommend.defaultRadius;
      
      const nearbyNodes = await roadNodeModel.getNearbyNodes(
        parseFloat(latitude),
        parseFloat(longitude),
        searchRadius
      );
      
      const formattedNodes = nearbyNodes.map(node => ({
        ...node,
        distanceText: GeoUtil.formatDistance(node.distance)
      }));
      
      logger.info('搜索附近路口成功', {
        count: formattedNodes.length,
        radius: searchRadius
      });
      
      res.json({
        success: true,
        data: formattedNodes,
        message: `找到${formattedNodes.length}个路口`
      });
      
    } catch (error) {
      logger.error('搜索附近路口失败', { error: error.message });
      res.status(500).json({
        success: false,
        message: error.message || '服务器错误'
      });
    }
  }

  /**
   * 获取路口天气
   */
  async getWeather(req, res) {
    try {
      const { id } = req.params;
      const node = await roadNodeModel.getNodeById(id);
      
      if (!node) {
        return res.status(404).json({
          success: false,
          message: '路口不存在'
        });
      }
      
      // 通过逆地理编码获取城市
      const addressInfo = await amapService.getAddress(node.latitude, node.longitude);
      
      if (!addressInfo.success) {
        return res.status(500).json({
          success: false,
          message: '无法获取位置信息'
        });
      }
      
      const city = addressInfo.data.addressComponent.city;
      const weather = await amapService.getWeather(city);
      
      logger.info('获取路口天气成功', { nodeId: id, city });
      
      res.json({
        success: true,
        data: {
          node: {
            id: node.id,
            name: node.name
          },
          city,
          weather: weather.success ? weather.data : null
        },
        message: '获取成功'
      });
      
    } catch (error) {
      logger.error('获取路口天气失败', { error: error.message });
      res.status(500).json({
        success: false,
        message: error.message || '服务器错误'
      });
    }
  }
}

module.exports = new HighwayController();