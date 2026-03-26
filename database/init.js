const fs = require('fs');
const path = require('path');

/**
 * 数据库初始化脚本
 * 用于检查和初始化数据文件
 */

// 路口数据样例
const roadNodesData = {
  roadNodes: [
    {
      id: "1",
      name: "北京服务区",
      highway: "G2 京沪高速",
      latitude: 39.9042,
      longitude: 116.4074,
      milestone: "K15+500",
      facilities: ["加油站", "餐厅", "洗手间", "停车场"],
      description: "位于 G2 京沪高速北京段，距离北京市中心约 15 公里"
    },
    {
      id: "2",
      name: "廊坊北出口",
      highway: "G2 京沪高速",
      latitude: 39.5238,
      longitude: 116.6831,
      milestone: "K45+200",
      facilities: ["收费站", "加油站"],
      description: "G2 京沪高速廊坊市区北部出口"
    },
    {
      id: "3",
      name: "天津武清服务区",
      highway: "G2 京沪高速",
      latitude: 39.3782,
      longitude: 117.0137,
      milestone: "K78+800",
      facilities: ["加油站", "餐厅", "便利店", "洗手间", "停车场", "充电桩"],
      description: "G2 京沪高速天津武清段，设施齐全的大型服务区"
    },
    {
      id: "4",
      name: "沧州服务区",
      highway: "G2 京沪高速",
      latitude: 38.3037,
      longitude: 116.8386,
      milestone: "K145+600",
      facilities: ["加油站", "餐厅", "洗手间", "停车场"],
      description: "G2 京沪高速河北沧州段"
    },
    {
      id: "5",
      name: "德州东出口",
      highway: "G2 京沪高速",
      latitude: 37.4513,
      longitude: 116.3594,
      milestone: "K198+300",
      facilities: ["收费站", "加油站", "餐厅"],
      description: "G2 京沪高速山东德州东出口"
    },
    {
      id: "6",
      name: "济南服务区",
      highway: "G2 京沪高速",
      latitude: 36.6512,
      longitude: 117.1201,
      milestone: "K256+700",
      facilities: ["加油站", "餐厅", "便利店", "洗手间", "停车场", "维修站"],
      description: "G2 京沪高速济南段，提供车辆维修服务"
    },
    {
      id: "7",
      name: "泰安出口",
      highway: "G2 京沪高速",
      latitude: 36.2084,
      longitude: 117.0897,
      milestone: "K298+400",
      facilities: ["收费站", "加油站", "餐厅", "酒店"],
      description: "G2 京沪高速泰安出口，靠近泰山景区"
    },
    {
      id: "8",
      name: "曲阜服务区",
      highway: "G2 京沪高速",
      latitude: 35.5967,
      longitude: 116.9922,
      milestone: "K345+200",
      facilities: ["加油站", "餐厅", "便利店", "洗手间", "停车场", "特产店"],
      description: "G2 京沪高速曲阜段，临近孔子故里"
    }
  ]
};

// POI 数据样例
const poisData = {
  pois: [
    {
      id: "1",
      roadNodeId: "1",
      name: "北京国际大酒店",
      type: "hotel",
      typeName: "酒店",
      latitude: 39.9052,
      longitude: 116.4084,
      address: "北京市朝阳区建国门外大街",
      rating: 4.8,
      price: "¥888",
      distance: 150,
      image: "https://picsum.photos/300/200?random=1",
      description: "五星级酒店，设施豪华"
    },
    {
      id: "2",
      roadNodeId: "1",
      name: "全聚德烤鸭店",
      type: "restaurant",
      typeName: "餐厅",
      latitude: 39.9032,
      longitude: 116.4064,
      address: "北京市朝阳区东三环",
      rating: 4.7,
      price: "¥200",
      distance: 280,
      image: "https://picsum.photos/300/200?random=2",
      description: "正宗北京烤鸭老字号"
    },
    {
      id: "3",
      roadNodeId: "1",
      name: "故宫博物院",
      type: "attraction",
      typeName: "景点",
      latitude: 39.9163,
      longitude: 116.3972,
      address: "北京市东城区景山前街 4 号",
      rating: 4.9,
      price: "门票¥60",
      distance: 2100,
      image: "https://picsum.photos/300/200?random=3",
      description: "世界文化遗产，明清皇宫"
    }
  ]
};

/**
 * 初始化数据文件
 */
function initDataFiles() {
  const dbDir = __dirname;
  
  // 检查并创建路口数据文件
  const roadNodesPath = path.join(dbDir, 'roadNodes.json');
  if (!fs.existsSync(roadNodesPath)) {
    console.log('创建路口数据文件...');
    fs.writeFileSync(roadNodesPath, JSON.stringify(roadNodesData, null, 2), 'utf-8');
    console.log('✓ 路口数据文件创建成功');
  } else {
    console.log('✓ 路口数据文件已存在');
  }
  
  // 检查并创建 POI 数据文件
  const poisPath = path.join(dbDir, 'pois.json');
  if (!fs.existsSync(poisPath)) {
    console.log('创建 POI 数据文件...');
    fs.writeFileSync(poisPath, JSON.stringify(poisData, null, 2), 'utf-8');
    console.log('✓ POI 数据文件创建成功');
  } else {
    console.log('✓ POI 数据文件已存在');
  }
  
  console.log('\n数据初始化完成！');
}

// 如果直接运行此文件
if (require.main === module) {
  console.log('开始初始化数据库...\n');
  initDataFiles();
}

module.exports = {
  initDataFiles,
  roadNodesData,
  poisData
};