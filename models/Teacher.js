const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const TeacherSchema = new mongoose.Schema({
  teacherNumber: {
    type: String,
    required: [true, '教师编号不能为空'],
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: [true, '姓名不能为空'],
    trim: true
  },
  gender: {
    type: String,
    enum: ['男', '女', '其他'],
    required: [true, '性别不能为空']
  },
  dateOfBirth: {
    type: Date
  },
  idNumber: {
    type: String,
    trim: true,
    unique: true,
    sparse: true
  },
  email: {
    type: String,
    required: [true, '邮箱不能为空'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, '请提供有效的邮箱地址']
  },
  phone: {
    type: String,
    required: [true, '手机号不能为空'],
    trim: true
  },
  password: {
    type: String,
    required: [true, '密码不能为空'],
    minlength: [6, '密码至少6个字符'],
    select: false
  },
  address: {
    street: String,
    city: String,
    province: String,
    postalCode: String,
    country: {
      type: String,
      default: '中国'
    }
  },
  photo: {
    type: String,
    default: 'default.jpg'
  },
  qualifications: [{
    degree: {
      type: String,
      enum: ['学士', '硕士', '博士', '其他']
    },
    major: String,
    institution: String,
    year: Number,
    certificateNumber: String
  }],
  certifications: [{
    name: String,
    issuedBy: String,
    issueDate: Date,
    expiryDate: Date,
    certificateNumber: String
  }],
  subjects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject'
  }],
  primarySubject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject'
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  },
  position: {
    type: String,
    enum: ['教师', '班主任', '学科组长', '年级组长', '教研组长', '副校长', '校长'],
    default: '教师'
  },
  employmentType: {
    type: String,
    enum: ['全职', '兼职', '临时'],
    default: '全职'
  },
  employmentStatus: {
    type: String,
    enum: ['在职', '离职', '休假', '退休'],
    default: '在职'
  },
  joinDate: {
    type: Date,
    default: Date.now
  },
  lastWorkingDate: Date,
  classes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class'
  }],
  headOf: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class'
  }],
  teachingHours: {
    type: Number,
    default: 0
  },
  schedule: [{
    day: {
      type: String,
      enum: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    },
    periods: [{
      period: Number,
      subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject'
      },
      class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class'
      },
      classroom: String,
      startTime: String,
      endTime: String
    }]
  }],
  evaluations: [{
    academicYear: {
      type: String,
      match: [/^\d{4}-\d{4}$/, '学年格式应为YYYY-YYYY']
    },
    semester: {
      type: String,
      enum: ['第一学期', '第二学期']
    },
    evaluator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    },
    teachingSkills: {
      type: Number,
      min: 1,
      max: 5
    },
    classroomManagement: {
      type: Number,
      min: 1,
      max: 5
    },
    studentRelationship: {
      type: Number,
      min: 1,
      max: 5
    },
    colleagueRelationship: {
      type: Number,
      min: 1,
      max: 5
    },
    professionalDevelopment: {
      type: Number,
      min: 1,
      max: 5
    },
    comments: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  achievements: [{
    title: String,
    description: String,
    date: Date,
    awardedBy: String,
    certificateUrl: String
  }],
  notifications: [{
    title: String,
    message: String,
    date: {
      type: Date,
      default: Date.now
    },
    read: {
      type: Boolean,
      default: false
    }
  }],
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String,
    address: String
  },
  role: {
    type: String,
    enum: ['teacher', 'admin'],
    default: 'teacher'
  },
  permissions: [{
    type: String,
    enum: [
      'view_classes', 'create_class', 'update_class', 'delete_class',
      'view_students', 'create_student', 'update_student', 'delete_student',
      'view_teachers', 'create_teacher', 'update_teacher', 'delete_teacher',
      'view_subjects', 'create_subject', 'update_subject', 'delete_subject',
      'view_schedules', 'create_schedule', 'update_schedule', 'delete_schedule',
      'view_attendances', 'create_attendance', 'update_attendance', 'delete_attendance',
      'view_grades', 'create_grade', 'update_grade', 'delete_grade',
      'view_announcements', 'create_announcement', 'update_announcement', 'delete_announcement',
      'view_events', 'create_event', 'update_event', 'delete_event',
      'view_reports', 'create_report', 'update_report', 'delete_report'
    ]
  }],
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  lastLogin: Date,
  status: {
    type: String,
    enum: ['活跃', '非活跃', '停用'],
    default: '活跃'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 加密密码
TeacherSchema.pre('save', async function(next) {
  // 更新时间
  this.updatedAt = Date.now();
  
  // 密码未修改时不加密
  if (!this.isModified('password')) {
    return next();
  }

  // 加密密码
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// 比较密码
TeacherSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// 生成重置密码Token
TeacherSchema.methods.getResetPasswordToken = function() {
  // 生成token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // 哈希token并设置到resetPasswordToken字段
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // 设置过期时间 - 10分钟
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

// 获取当前教师的课程表
TeacherSchema.methods.getCurrentSchedule = function() {
  const today = new Date();
  const dayMap = {
    0: '周日',
    1: '周一',
    2: '周二',
    3: '周三',
    4: '周四',
    5: '周五',
    6: '周六'
  };
  const currentDay = dayMap[today.getDay()];
  
  return this.schedule.find(day => day.day === currentDay) || null;
};

// 根据学科查找教师
TeacherSchema.statics.findBySubject = function(subjectId) {
  return this.find({ subjects: subjectId }).populate('subjects');
};

// 根据部门查找教师
TeacherSchema.statics.findByDepartment = function(departmentId) {
  return this.find({ department: departmentId }).populate('department');
};

// 根据班级查找教师
TeacherSchema.statics.findByClass = function(classId) {
  return this.find({ classes: classId }).populate('classes');
};

// 虚拟属性：年龄计算
TeacherSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
});

// 虚拟属性：计算工龄
TeacherSchema.virtual('yearsOfService').get(function() {
  if (!this.joinDate) return 0;
  
  const today = new Date();
  const joinDate = new Date(this.joinDate);
  let years = today.getFullYear() - joinDate.getFullYear();
  const monthDiff = today.getMonth() - joinDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < joinDate.getDate())) {
    years--;
  }
  
  return years;
});

const Teacher = mongoose.model('Teacher', TeacherSchema);

module.exports = Teacher; 