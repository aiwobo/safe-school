/**
 * 应用程序配置文件
 */
module.exports = {
  // 服务器配置
  server: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development'
  },
  
  // 数据库配置
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 27017,
    name: process.env.DB_NAME || 'safe_school',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectionString: process.env.DB_URI || 'mongodb://localhost:27017/safe_school'
  },
  
  // JWT认证配置
  jwtSecret: process.env.JWT_SECRET || 'safe-school-secret-key-development',
  jwtExpiry: process.env.JWT_EXPIRY || '2h',
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET || 'safe-school-refresh-token-secret-development',
  refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY || '7d',
  
  // API配置
  api: {
    prefix: '/api',
    version: 'v1'
  },
  
  // 日志配置
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    filename: process.env.LOG_FILE || 'safe-school.log'
  },
  
  // 安全配置
  security: {
    bcryptSaltRounds: 10,
    corsOptions: {
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }
  },
  
  // 告警配置
  alerts: {
    notificationExpiry: process.env.NOTIFICATION_EXPIRY || '72h',
    priorityLevels: {
      low: 1,
      medium: 2,
      high: 3,
      critical: 4
    }
  }
}; 