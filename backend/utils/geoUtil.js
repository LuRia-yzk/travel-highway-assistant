/**
 * 地理计算工具类
 */
class GeoUtil {
  /**
   * 计算两点间距离（Haversine 公式）
   * @param {number} lat1 - 起点纬度
   * @param {number} lng1 - 起点经度
   * @param {number} lat2 - 终点纬度
   * @param {number} lng2 - 终点经度
   * @returns {number} 距离（米）
   */
  static calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371000; // 地球半径（米）
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * 角度转弧度
   */
  static toRad(degrees) {
    return degrees * Math.PI / 180;
  }

  /**
   * 判断点 B 是否在点 A 的前方（基于行驶方向）
   * @param {object} userPos - 用户位置 {latitude, longitude}
   * @param {object} nodeA - 路口 A {latitude, longitude}
   * @param {object} nodeB - 路口 B {latitude, longitude}
   * @returns {boolean} true 表示 B 在 A 前方
   */
  static isNodeAhead(userPos, nodeA, nodeB) {
    const distUserA = this.calculateDistance(userPos.latitude, userPos.longitude, nodeA.latitude, nodeA.longitude);
    const distUserB = this.calculateDistance(userPos.latitude, userPos.longitude, nodeB.latitude, nodeB.longitude);
    
    // 如果 B 离用户更远，说明 B 在 A 前方
    return distUserB > distUserA;
  }

  /**
   * 推荐前方路口
   * @param {array} nodes - 所有路口数组
   * @param {object} userPos - 用户位置 {latitude, longitude}
   * @param {number} minCount - 最少推荐数量
   * @param {number} maxCount - 最多推荐数量
   * @param {number} maxDistance - 最大搜索距离（米）
   * @returns {array} 推荐的路口列表
   */
  static recommendNodes(nodes, userPos, minCount = 2, maxCount = 4, maxDistance = 50000) {
    // 计算每个路口与用户的距离和方位
    const nodesWithInfo = nodes.map(node => {
      const distance = this.calculateDistance(userPos.latitude, userPos.longitude, node.latitude, node.longitude);
      const bearing = this.calculateBearing(userPos.latitude, userPos.longitude, node.latitude, node.longitude);
      return { ...node, distance, bearing };
    });

    // 过滤掉太远的路口
    const nearbyNodes = nodesWithInfo.filter(node => node.distance <= maxDistance);

    // 按距离排序
    nearbyNodes.sort((a, b) => a.distance - b.distance);

    // 获取最近的路口作为参考点
    if (nearbyNodes.length === 0) {
      return [];
    }

    const referenceNode = nearbyNodes[0];
    
    // 筛选出在参考点前方的路口
    const aheadNodes = nearbyNodes.filter(node => {
      if (node.id === referenceNode.id) return false;
      return this.isNodeAhead(userPos, referenceNode, node);
    });

    // 组合结果：参考点 + 前方的路口
    const result = [referenceNode, ...aheadNodes].slice(0, maxCount);

    // 确保至少返回 minCount 个路口
    if (result.length < minCount && nearbyNodes.length >= minCount) {
      return nearbyNodes.slice(0, minCount);
    }

    return result;
  }

  /**
   * 计算方位角（从点 1 到点 2 的方向）
   * @returns {number} 方位角（度数）
   */
  static calculateBearing(lat1, lng1, lat2, lng2) {
    const y = Math.sin(this.toRad(lng2 - lng1)) * Math.cos(this.toRad(lat2));
    const x = Math.cos(this.toRad(lat1)) * Math.sin(this.toRad(lat2)) -
              Math.sin(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) * Math.cos(this.toRad(lng2 - lng1));
    
    const bearing = Math.atan2(y, x);
    return (bearing * 180 / Math.PI + 360) % 360;
  }

  /**
   * 格式化距离显示
   * @param {number} meters - 距离（米）
   * @returns {string} 格式化后的距离字符串
   */
  static formatDistance(meters) {
    if (meters < 1000) {
      return `${Math.round(meters)}米`;
    } else {
      return `${(meters / 1000).toFixed(1)}公里`;
    }
  }

  /**
   * 判断点是否在矩形区域内
   */
  static isPointInBox(point, box) {
    return point.latitude >= box.latMin && 
           point.latitude <= box.latMax && 
           point.longitude >= box.lngMin && 
           point.longitude <= box.lngMax;
  }

  /**
   * 根据中心点和半径计算边界框
   */
  static getBoundingBox(center, radiusMeters) {
    const latDelta = radiusMeters / 111000; // 大约 1 度纬度 = 111km
    const lngDelta = radiusMeters / (111000 * Math.cos(this.toRad(center.latitude)));
    
    return {
      latMin: center.latitude - latDelta,
      latMax: center.latitude + latDelta,
      lngMin: center.longitude - lngDelta,
      lngMax: center.longitude + lngDelta
    };
  }
}

module.exports = GeoUtil;