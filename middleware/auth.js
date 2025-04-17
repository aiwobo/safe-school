/**
 * 认证中间件
 */
const jwt = require('jsonwebtoken');
const config = require('../config');

// 验证JWT令牌
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN格式
  
  if (!token) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'AUTH_TOKEN_MISSING',
        message: '未提供身份验证令牌'
      }
    });
  }
  
  try {
    const user = jwt.verify(token, config.jwtSecret);
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_TOKEN_EXPIRED',
          message: '身份验证令牌已过期'
        }
      });
    }
    
    return res.status(403).json({
      success: false,
      error: {
        code: 'AUTH_TOKEN_INVALID',
        message: '无效的身份验证令牌'
      }
    });
  }
};

// 检查用户角色权限
const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_USER_NOT_AUTHENTICATED',
          message: '用户未经过身份验证'
        }
      });
    }
    
    if (roles.includes(req.user.role)) {
      next();
    } else {
      return res.status(403).json({
        success: false,
        error: {
          code: 'AUTH_INSUFFICIENT_PERMISSIONS',
          message: '用户没有足够的权限执行此操作'
        }
      });
    }
  };
};

// 生成JWT令牌
const generateToken = (user) => {
  const payload = {
    id: user.id,
    username: user.username,
    role: user.role
  };
  
  return jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiry });
};

// 生成刷新令牌
const generateRefreshToken = (user) => {
  const payload = {
    id: user.id,
    type: 'refresh'
  };
  
  return jwt.sign(payload, config.refreshTokenSecret, { expiresIn: config.refreshTokenExpiry });
};

module.exports = {
  authenticateToken,
  checkRole,
  generateToken,
  generateRefreshToken
}; 