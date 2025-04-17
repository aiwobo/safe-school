const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const config = require('../config');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, '用户名不能为空'],
    unique: true,
    trim: true,
    minlength: [3, '用户名不能少于3个字符'],
    maxlength: [50, '用户名不能超过50个字符']
  },
  password: {
    type: String,
    required: [true, '密码不能为空'],
    minlength: [6, '密码不能少于6个字符'],
    select: false
  },
  name: {
    type: String,
    required: [true, '姓名不能为空'],
    trim: true
  },
  role: {
    type: String,
    enum: ['admin', 'manager', 'staff', 'teacher', 'parent', 'student'],
    default: 'staff'
  },
  email: {
    type: String,
    required: [true, '邮箱不能为空'],
    unique: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, '请提供有效的邮箱地址']
  },
  phone: {
    type: String,
    match: [/^1[3-9]\d{9}$/, '请提供有效的手机号码']
  },
  department: {
    type: String,
    trim: true
  },
  position: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  lastLogin: {
    type: Date
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// 更新时间中间件
UserSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// 密码加密中间件
UserSchema.pre('save', async function(next) {
  // 只有密码被修改时才重新加密
  if (!this.isModified('password')) {
    next();
  }
  
  try {
    const salt = await bcrypt.genSalt(config.security.bcryptSaltRounds);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// 验证密码方法
UserSchema.methods.matchPassword = async function(enteredPassword) {
  try {
    return await bcrypt.compare(enteredPassword, this.password);
  } catch (error) {
    throw new Error(error);
  }
};

// 创建用户模型
const User = mongoose.model('User', UserSchema);

module.exports = User; 