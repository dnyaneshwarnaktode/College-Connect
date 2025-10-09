const mongoose = require('mongoose');

const classGroupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Class group name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Class group description is required'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true
  },
  courseCode: {
    type: String,
    required: [true, 'Course code is required'],
    trim: true,
    uppercase: true
  },
  semester: {
    type: String,
    required: [true, 'Semester is required'],
    enum: ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th']
  },
  academicYear: {
    type: String,
    required: [true, 'Academic year is required'],
    trim: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  joinKey: {
    type: String,
    required: false,
    unique: true,
    uppercase: true,
    minlength: 8,
    maxlength: 8
  },
  students: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    studentId: {
      type: String,
      required: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  maxStudents: {
    type: Number,
    required: [true, 'Maximum students limit is required'],
    min: [1, 'Maximum students must be at least 1'],
    max: [200, 'Maximum students cannot exceed 200']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  settings: {
    allowStudentChat: {
      type: Boolean,
      default: true
    },
    allowStudentPosts: {
      type: Boolean,
      default: true
    },
    requireApprovalForPosts: {
      type: Boolean,
      default: false
    },
    showLeaderboard: {
      type: Boolean,
      default: true
    },
    allowFileSharing: {
      type: Boolean,
      default: true
    }
  },
  announcements: [{
    title: {
      type: String,
      required: true,
      maxlength: [200, 'Announcement title cannot exceed 200 characters']
    },
    content: {
      type: String,
      required: true,
      maxlength: [1000, 'Announcement content cannot exceed 1000 characters']
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    isPinned: {
      type: Boolean,
      default: false
    },
    expiresAt: {
      type: Date
    }
  }],
  assignments: [{
    title: {
      type: String,
      required: true,
      maxlength: [200, 'Assignment title cannot exceed 200 characters']
    },
    description: {
      type: String,
      required: true,
      maxlength: [2000, 'Assignment description cannot exceed 2000 characters']
    },
    dueDate: {
      type: Date,
      required: true
    },
    maxPoints: {
      type: Number,
      required: true,
      min: [1, 'Points must be at least 1']
    },
    attachments: [{
      filename: String,
      originalName: String,
      url: String,
      size: Number
    }],
    submissions: [{
      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      submittedAt: {
        type: Date,
        default: Date.now
      },
      files: [{
        filename: String,
        originalName: String,
        url: String,
        size: Number
      }],
      grade: {
        type: Number,
        min: 0,
        max: 100
      },
      feedback: String,
      gradedAt: Date,
      gradedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
   }],
   
   // Files and resources uploaded by faculty
   files: [{
     fileName: {
       type: String,
       required: true
     },
     originalName: String,
     fileType: String,
     fileSize: Number,
     fileUrl: {
       type: String,
       required: true
     },
     uploadedBy: {
       type: mongoose.Schema.Types.ObjectId,
       ref: 'User',
       required: true
     },
     uploadedAt: {
       type: Date,
       default: Date.now
     },
     description: String,
     category: {
       type: String,
       enum: ['lecture', 'assignment', 'resource', 'announcement'],
       default: 'resource'
     }
   }],
   
   // Doubts/questions from students
   doubts: [{
     student: {
       type: mongoose.Schema.Types.ObjectId,
       ref: 'User',
       required: true
     },
     studentId: String,
     question: {
       type: String,
       required: true,
       maxlength: [500, 'Question cannot exceed 500 characters']
     },
     description: {
       type: String,
       maxlength: [2000, 'Description cannot exceed 2000 characters']
     },
     attachments: [{
       filename: String,
       originalName: String,
       url: String,
       size: Number
     }],
     status: {
       type: String,
       enum: ['pending', 'answered', 'resolved'],
       default: 'pending'
     },
     answer: {
       text: String,
       answeredBy: {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'User'
       },
       answeredAt: Date,
       attachments: [{
         filename: String,
         originalName: String,
         url: String,
         size: Number
       }]
     },
     createdAt: {
       type: Date,
       default: Date.now
     },
     updatedAt: {
       type: Date,
       default: Date.now
     }
   }],
   
   statistics: {
     totalStudents: {
       type: Number,
       default: 0
     },
     activeStudents: {
       type: Number,
       default: 0
     },
     totalAssignments: {
       type: Number,
       default: 0
     },
     completedAssignments: {
       type: Number,
       default: 0
     },
     averageGrade: {
       type: Number,
       default: 0
     },
     totalFiles: {
       type: Number,
       default: 0
     },
     totalDoubts: {
       type: Number,
       default: 0
     },
     pendingDoubts: {
       type: Number,
       default: 0
     }
   }
}, {
  timestamps: true
});

// Indexes for better query performance
classGroupSchema.index({ teacher: 1 });
classGroupSchema.index({ joinKey: 1 });
classGroupSchema.index({ 'students.user': 1 });
classGroupSchema.index({ courseCode: 1, semester: 1, academicYear: 1 });
classGroupSchema.index({ isActive: 1 });

// Virtual for current student count
classGroupSchema.virtual('currentStudents').get(function() {
  return this.students.filter(student => student.isActive).length;
});

// Virtual for available spots
classGroupSchema.virtual('availableSpots').get(function() {
  return Math.max(0, this.maxStudents - this.currentStudents);
});

// Virtual for checking if class is full
classGroupSchema.virtual('isFull').get(function() {
  return this.currentStudents >= this.maxStudents;
});

// Method to generate unique join key
classGroupSchema.statics.generateJoinKey = function() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Method to add student to class
classGroupSchema.methods.addStudent = function(userId, studentId) {
  if (this.isFull) {
    throw new Error('Class is full');
  }
  
  const existingStudent = this.students.find(
    student => student.user.toString() === userId.toString()
  );
  
  if (existingStudent) {
    if (existingStudent.isActive) {
      throw new Error('Student is already in this class');
    } else {
      existingStudent.isActive = true;
      existingStudent.joinedAt = new Date();
    }
  } else {
    this.students.push({
      user: userId,
      studentId: studentId,
      joinedAt: new Date(),
      isActive: true
    });
  }
  
  this.statistics.totalStudents = this.students.length;
  this.statistics.activeStudents = this.currentStudents;
  
  return this.save();
};

// Method to remove student from class
classGroupSchema.methods.removeStudent = function(userId) {
  const student = this.students.find(
    student => student.user.toString() === userId.toString()
  );
  
  if (student) {
    student.isActive = false;
    this.statistics.activeStudents = this.currentStudents;
    return this.save();
  }
  
  throw new Error('Student not found in this class');
};

// Pre-save middleware to generate join key if not provided
classGroupSchema.pre('save', async function(next) {
  try {
    // Always generate a join key if not present
    if (!this.joinKey) {
      // Generate a simple join key using timestamp and random string
      const timestamp = Date.now().toString(36);
      const random = Math.random().toString(36).substring(2, 6).toUpperCase();
      this.joinKey = (timestamp + random).substring(0, 8).toUpperCase();
    }
    
    // Update statistics safely
    if (this.students && Array.isArray(this.students)) {
      this.statistics.totalStudents = this.students.length;
      this.statistics.activeStudents = this.students.filter(student => student.isActive).length;
    } else {
      this.statistics.totalStudents = 0;
      this.statistics.activeStudents = 0;
    }
    
     if (this.assignments && Array.isArray(this.assignments)) {
       this.statistics.totalAssignments = this.assignments.length;
     } else {
       this.statistics.totalAssignments = 0;
     }
     
     if (this.files && Array.isArray(this.files)) {
       this.statistics.totalFiles = this.files.length;
     } else {
       this.statistics.totalFiles = 0;
     }
     
     if (this.doubts && Array.isArray(this.doubts)) {
       this.statistics.totalDoubts = this.doubts.length;
       this.statistics.pendingDoubts = this.doubts.filter(doubt => doubt.status === 'pending').length;
     } else {
       this.statistics.totalDoubts = 0;
       this.statistics.pendingDoubts = 0;
     }
    
    next();
  } catch (error) {
    console.error('Pre-save middleware error:', error);
    next(error);
  }
});

module.exports = mongoose.model('ClassGroup', classGroupSchema);
