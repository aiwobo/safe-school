/**
 * 智慧校园安全生态平台 API 路由配置
 */

const express = require('express');
const router = express.Router();
const authController = require('./controllers/authController');
const deviceController = require('./controllers/deviceController');
const buildingController = require('./controllers/buildingController');
const alertController = require('./controllers/alertController');
const statisticsController = require('./controllers/statisticsController');
const settingsController = require('./controllers/settingsController');
const logController = require('./controllers/logController');
const { authenticateToken } = require('./middleware/auth');

// 中间件 - 身份验证
router.use((req, res, next) => {
  // 不需要验证的路由
  const publicRoutes = [
    '/api/auth/login',
    '/api/auth/refresh-token'
  ];
  
  if (publicRoutes.includes(req.path)) {
    return next();
  }
  
  // 其他路由验证token
  authenticateToken(req, res, next);
});

// ===== 用户认证路由 =====
router.post('/auth/login', authController.login);
router.post('/auth/logout', authController.logout);
router.get('/auth/me', authController.getCurrentUser);
router.post('/auth/refresh-token', authController.refreshToken);

// ===== 建筑物路由 =====
router.get('/buildings', buildingController.getAllBuildings);
router.get('/buildings/:id', buildingController.getBuildingById);
router.post('/buildings', buildingController.createBuilding);
router.put('/buildings/:id', buildingController.updateBuilding);

// ===== 设备路由 =====
router.get('/devices', deviceController.getAllDevices);
router.get('/devices/:id', deviceController.getDeviceById);
router.post('/devices', deviceController.createDevice);
router.put('/devices/:id', deviceController.updateDevice);
router.delete('/devices/:id', deviceController.deleteDevice);

// 设备传感器数据
router.get('/devices/:id/sensor-data', deviceController.getSensorData);

// 设备维护记录
router.get('/devices/:id/maintenance', deviceController.getMaintenanceRecords);
router.post('/devices/:id/maintenance', deviceController.addMaintenanceRecord);

// 设备历史记录
router.get('/devices/:id/history', deviceController.getDeviceHistory);

// ===== 报警路由 =====
router.get('/alerts', alertController.getAllAlerts);
router.get('/alerts/:id', alertController.getAlertById);
router.put('/alerts/:id', alertController.updateAlert);
router.post('/alerts', alertController.createAlert); // 主要用于测试

// 报警统计
router.get('/alerts/statistics', alertController.getAlertStatistics);

// ===== 数据统计路由 =====
router.get('/statistics/device-status', statisticsController.getDeviceStatusOverview);
router.get('/statistics/environmental', statisticsController.getEnvironmentalStatistics);
router.get('/statistics/buildings', statisticsController.getBuildingStatistics);
router.get('/statistics/dashboard', statisticsController.getDashboardData);

// ===== 系统设置路由 =====
router.get('/settings', settingsController.getAllSettings);
router.put('/settings', settingsController.updateSettings);

// ===== 日志路由 =====
router.get('/logs', logController.getOperationLogs);

// 404 路由处理
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'API_NOT_FOUND',
      message: '请求的API不存在'
    }
  });
});

module.exports = router; 