const axios = require('axios');
const config = require('../config/index');

class AMapService {
  constructor() {
    this.key = config.amap.key;
    this.baseUrl = config.amapBaseUrl;
  }

  // 逆地理编码（坐标转地址）
  async getAddress(latitude, longitude) {
    try {
      const response = await axios.get(`${this.baseUrl}/geocode/regeo`, {
        params: {
          key: this.key,
          location: `${longitude},${latitude}`,
          extensions: 'all',
          s: 'rsv3'
        }
      });
      
      if (response.data.status === '1') {
        return {
          success: true,
          data: response.data.regeocode
        };
      } else {
        return {
          success: false,
          message: response.data.info || '逆地理编码失败'
        };
      }
    } catch (error) {
      console.error('逆地理编码错误:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  // 周边搜索 POI
  async searchAround(latitude, longitude, types = '', radius = 3000) {
    try {
      const response = await axios.get(`${this.baseUrl}/place/around`, {
        params: {
          key: this.key,
          location: `${longitude},${latitude}`,
          types: types,
          radius: radius,
          offset: 20,
          page: 1,
          extensions: 'all'
        }
      });
      
      if (response.data.status === '1') {
        return {
          success: true,
          data: response.data.pois,
          count: response.data.count
        };
      } else {
        return {
          success: false,
          message: response.data.info || '周边搜索失败'
        };
      }
    } catch (error) {
      console.error('周边搜索错误:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  // 搜索特定类型的 POI
  async searchByType(latitude, longitude, typeKeywords, radius = 3000) {
    try {
      const response = await axios.get(`${this.baseUrl}/place/text`, {
        params: {
          key: this.key,
          keywords: typeKeywords,
          location: `${longitude},${latitude}`,
          radius: radius,
          offset: 20,
          page: 1,
          extensions: 'all'
        }
      });
      
      if (response.data.status === '1') {
        return {
          success: true,
          data: response.data.pois,
          count: response.data.count
        };
      } else {
        return {
          success: false,
          message: response.data.info || 'POI 搜索失败'
        };
      }
    } catch (error) {
      console.error('POI 搜索错误:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  // 路径规划（驾车）
  async drivingRoute(origin, destination) {
    try {
      const response = await axios.get(`${this.baseUrl}/direction/driving`, {
        params: {
          key: this.key,
          origin: `${origin.longitude},${origin.latitude}`,
          destination: `${destination.longitude},${destination.latitude}`,
          extensions: 'all',
          output: 'json'
        }
      });
      
      if (response.data.status === '1') {
        return {
          success: true,
          data: response.data.route
        };
      } else {
        return {
          success: false,
          message: response.data.info || '路径规划失败'
        };
      }
    } catch (error) {
      console.error('路径规划错误:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  // 天气查询
  async getWeather(city) {
    try {
      const response = await axios.get(`${this.baseUrl}/weather/weatherInfo`, {
        params: {
          key: this.key,
          city: city,
          extensions: 'all'
        }
      });
      
      if (response.data.status === '1') {
        return {
          success: true,
          data: response.data.lives && response.data.lives[0]
        };
      } else {
        return {
          success: false,
          message: response.data.info || '天气查询失败'
        };
      }
    } catch (error) {
      console.error('天气查询错误:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }
}

module.exports = new AMapService();