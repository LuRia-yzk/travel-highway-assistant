const express = require('express');
const router = express.Router();
const highwayController = require('../controllers/highwayController');

/**
 * @api {get} /api/highway/all 获取所有高速路口
 * @apiName GetAllNodes
 * @apiGroup Highway
 * 
 * @apiSuccess {Boolean} success 请求是否成功
 * @apiSuccess {Array} data 路口列表
 * @apiSuccess {String} message 响应消息
 */
router.get('/all', (req, res) => highwayController.getAllNodes(req, res));

/**
 * @api {get} /api/highway/recommend 推荐前方路口
 * @apiName RecommendNodes
 * @apiGroup Highway
 * 
 * @apiQuery {Number} latitude 用户纬度（必填）
 * @apiQuery {Number} longitude 用户经度（必填）
 * 
 * @apiSuccess {Boolean} success 请求是否成功
 * @apiSuccess {Object} data 推荐结果
 * @apiSuccess {Object} data.userLocation 用户位置
 * @apiSuccess {String} data.address 用户位置地址
 * @apiSuccess {Array} data.nodes 推荐的路口列表
 */
router.get('/recommend', (req, res) => highwayController.recommendNodes(req, res));

/**
 * @api {get} /api/highway/nearby 搜索附近路口
 * @apiName SearchNearby
 * @apiGroup Highway
 * 
 * @apiQuery {Number} latitude 纬度（必填）
 * @apiQuery {Number} longitude 经度（必填）
 * @apiQuery {Number} [radius=50000] 搜索半径（米，可选）
 */
router.get('/nearby', (req, res) => highwayController.searchNearby(req, res));

/**
 * @api {get} /api/highway/:id 获取路口详情
 * @apiName GetNodeById
 * @apiGroup Highway
 * 
 * @apiParam {String} id 路口 ID
 * 
 * @apiSuccess {Boolean} success 请求是否成功
 * @apiSuccess {Object} data 路口详情
 */
router.get('/:id', (req, res) => highwayController.getNodeById(req, res));

/**
 * @api {get} /api/highway/:id/weather 获取路口天气
 * @apiName GetWeather
 * @apiGroup Highway
 * 
 * @apiParam {String} id 路口 ID
 */
router.get('/:id/weather', (req, res) => highwayController.getWeather(req, res));

module.exports = router;