const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: [true, '学号不能为空'],
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
    type: Date,
    required: [true, '出生日期不能为空']
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: [true, '班级不能为空']
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: [true, '学校不能为空']
  },
  grade: {
    type: String,
    required: [true, '年级不能为空']
  },
  enrollmentDate: {
    type: Date,
    required: [true, '入学日期不能为空']
  },
  parentInfo: {
    parent1: {
      name: {
        type: String,
        required: [true, '家长姓名不能为空']
      },
      relation: {
        type: String,
        required: [true, '与学生关系不能为空']
      },
      phone: {
        type: String,
        required: [true, '联系电话不能为空'],
        match: [/^1[3-9]\d{9}$/, '请输入有效的手机号码']
      },
      email: {
        type: String,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, '请输入有效的邮箱地址']
      }
    },
    parent2: {
      name: String,
      relation: String,
      phone: {
        type: String,
        match: [/^1[3-9]\d{9}$/, '请输入有效的手机号码']
      },
      email: {
        type: String,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, '请输入有效的邮箱地址']
      }
    }
  },
  address: {
    province: String,
    city: String,
    district: String,
    street: String,
    detail: String
  },
  medicalInfo: {
    bloodType: {
      type: String,
      enum: ['A', 'B', 'AB', 'O', '未知']
    },
    allergies: [String],
    chronicConditions: [String],
    emergencyContact: {
      name: String,
      phone: String,
      relation: String
    }
  },
  attendance: [{
    date: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ['出勤', '缺勤', '迟到', '早退', '请假'],
      required: true
    },
    reason: String,
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  academicRecords: [{
    academicYear: {
      type: String,
      required: true
    },
    semester: {
      type: String,
      enum: ['第一学期', '第二学期'],
      required: true
    },
    subjects: [{
      name: {
        type: String,
        required: true
      },
      score: {
        type: Number,
        min: 0,
        max: 100
      },
      teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      comments: String
    }],
    overallGPA: Number,
    rank: Number,
    comments: String
  }],
  extracurricularActivities: [{
    name: String,
    type: String,
    startDate: Date,
    endDate: Date,
    achievements: String,
    supervisor: String
  }],
  disciplinaryRecords: [{
    date: {
      type: Date,
      required: true
    },
    incident: {
      type: String,
      required: true
    },
    action: String,
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['处理中', '已解决', '需跟进'],
      default: '处理中'
    }
  }],
  specialNeeds: {
    hasSpecialNeeds: {
      type: Boolean,
      default: false
    },
    details: String,
    accommodations: [String]
  },
  photo: {
    type: String,
    default: 'default-student.jpg'
  },
  status: {
    type: String,
    enum: ['在校', '转学', '毕业', '休学', '退学'],
    default: '在校'
  },
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
StudentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// 虚拟属性：年龄计算
StudentSchema.virtual('age').get(function() {
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

// 获取学生当前学期成绩
StudentSchema.methods.getCurrentSemesterRecords = function() {
  if (!this.academicRecords || this.academicRecords.length === 0) return null;
  
  // 按学年和学期排序，获取最新的学期记录
  const sortedRecords = [...this.academicRecords].sort((a, b) => {
    if (a.academicYear !== b.academicYear) {
      return b.academicYear.localeCompare(a.academicYear);
    }
    return b.semester.localeCompare(a.semester);
  });
  
  return sortedRecords[0];
};

// 设置toJSON选项以便在JSON输出中包含虚拟属性
StudentSchema.set('toJSON', { virtuals: true });
StudentSchema.set('toObject', { virtuals: true });

const Student = mongoose.model('Student', StudentSchema);

module.exports = Student; 