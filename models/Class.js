const mongoose = require('mongoose');

const ClassSchema = new mongoose.Schema({
  className: {
    type: String,
    required: [true, '班级名称不能为空'],
    trim: true
  },
  grade: {
    type: String,
    required: [true, '年级不能为空'],
    enum: ['一年级', '二年级', '三年级', '四年级', '五年级', '六年级', '初一', '初二', '初三', '高一', '高二', '高三']
  },
  academicYear: {
    type: String,
    required: [true, '学年不能为空'],
    match: [/^\d{4}-\d{4}$/, '学年格式应为YYYY-YYYY']
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: [true, '学校不能为空']
  },
  classRoom: {
    type: String,
    required: [true, '教室不能为空']
  },
  headTeacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: [true, '班主任不能为空']
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  }],
  teachers: [{
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher'
    },
    subject: {
      type: String,
      required: [true, '科目不能为空']
    }
  }],
  schedule: [{
    weekDay: {
      type: String,
      enum: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      required: true
    },
    periods: [{
      period: {
        type: Number,
        required: true
      },
      subject: {
        type: String,
        required: true
      },
      teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
        required: true
      },
      classroom: {
        type: String,
        default: function() {
          return this.parent().parent().classRoom;
        }
      }
    }]
  }],
  classMotto: {
    type: String,
    default: '勤奋学习，全面发展'
  },
  classPhoto: {
    type: String,
    default: 'default-class.jpg'
  },
  classEvents: [{
    title: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    description: String,
    location: String,
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher'
    }
  }],
  announcements: [{
    title: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true
    },
    publishDate: {
      type: Date,
      default: Date.now
    },
    publisher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher'
    },
    attachments: [{
      filename: String,
      path: String,
      uploadDate: {
        type: Date,
        default: Date.now
      }
    }]
  }],
  classPerformance: {
    overallRanking: Number,
    averageAttendance: {
      type: Number,
      min: 0,
      max: 100
    },
    averageScores: [{
      subject: String,
      score: {
        type: Number,
        min: 0,
        max: 100
      }
    }],
    awards: [{
      title: String,
      date: Date,
      description: String
    }]
  },
  status: {
    type: String,
    enum: ['活跃', '已毕业', '已解散'],
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
});

// 更新时间中间件
ClassSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// 虚拟属性：学生人数
ClassSchema.virtual('studentCount').get(function() {
  return this.students ? this.students.length : 0;
});

// 获取班级的当前课程表
ClassSchema.methods.getCurrentSchedule = function() {
  return this.schedule;
};

// 添加学生到班级
ClassSchema.methods.addStudent = function(studentId) {
  if (!this.students.includes(studentId)) {
    this.students.push(studentId);
  }
  return this.save();
};

// 从班级移除学生
ClassSchema.methods.removeStudent = function(studentId) {
  this.students = this.students.filter(student => !student.equals(studentId));
  return this.save();
};

// 设置toJSON选项以便在JSON输出中包含虚拟属性
ClassSchema.set('toJSON', { virtuals: true });
ClassSchema.set('toObject', { virtuals: true });

const Class = mongoose.model('Class', ClassSchema);

module.exports = Class; 