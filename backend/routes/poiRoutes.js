const express = require('express');
const router = express.Router();
const poiController = require('../controllers/poiController');

/**
 * @api {get} /api/poi/exit/:exitId 获取指定路口的所有 POI
 * @apiName GetPOIsByExit
 * @apiGroup POI
 * 
 * @apiParam {String} exitId 路口 ID
 * 
 * @apiSuccess {Boolean} success 请求是否成功
 * @apiSuccess {Object} data POI 数据
 * @apiSuccess {Object} data.node 路口信息
 * @apiSuccess {Object} data.summary POI 统计信息
 * @apiSuccess {Object} data.pois POI 列表（按类型分组）
 */
router.get('/exit/:exitId', (req, res) => poiController.getPOIsByExit(req, res));

/**
 * @api {get} /api/poi/exit/:exitId/type/:type 根据类型获取 POI
 * @apiName GetPOIsByType
 * @apiGroup POI
 * 
 * @apiParam {String} exitId 路口 ID
 * @apiParam {String} type POI 类型（hotel/restaurant/attraction）
 */
router.get('/exit/:exitId/type/:type', (req, res) => poiController.getPOIsByType(req, res));

/**
 * @api {get} /api/poi/nearby 搜索附近 POI
 * @apiName SearchNearby
 * @apiGroup POI
 * 
 * @apiQuery {Number} latitude 纬度（必填）
 * @apiQuery {Number} longitude 经度（必填）
 * @apiQuery {String} [type] POI 类型（可选）
 * @apiQuery {Number} [radius=3000] 搜索半径（米，可选）
 */
router.get('/nearby', (req, res) => poiController.searchNearby(req, res));

/**
 * @api {get} /api/poi/:poiId 获取 POI 详情
 * @apiName GetPOIDetail
 * @apiGroup POI
 * 
 * @apiParam {String} poiId POI ID
 */
router.get('/:poiId', (req, res) => poiController.getPOIDetail(req, res));

module.exports = router;