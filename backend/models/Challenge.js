const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Challenge title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Challenge description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  category: {
    type: String,
    required: [true, 'Challenge category is required'],
    enum: ['dsa', 'aptitude', 'programming', 'web-development', 'mobile-development', 'ai-ml'],
    lowercase: true
  },
  difficulty: {
    type: String,
    required: [true, 'Challenge difficulty is required'],
    enum: ['easy', 'medium', 'hard', 'expert'],
    lowercase: true
  },
  points: {
    type: Number,
    required: [true, 'Challenge points are required'],
    min: [1, 'Points must be at least 1'],
    max: [1000, 'Points cannot exceed 1000']
  },
  timeLimit: {
    type: Number, // in minutes
    required: [true, 'Time limit is required'],
    min: [1, 'Time limit must be at least 1 minute'],
    max: [300, 'Time limit cannot exceed 300 minutes']
  },
  problemStatement: {
    type: String,
    required: [true, 'Problem statement is required']
  },
  inputFormat: {
    type: String,
    required: [true, 'Input format is required']
  },
  outputFormat: {
    type: String,
    required: [true, 'Output format is required']
  },
  constraints: {
    type: String,
    required: [true, 'Constraints are required']
  },
  sampleInput: [{
    input: String,
    output: String,
    explanation: String
  }],
  testCases: [{
    input: String,
    expectedOutput: String,
    isHidden: {
      type: Boolean,
      default: true
    }
  }],
  hints: [{
    type: String,
    maxlength: [500, 'Hint cannot exceed 500 characters']
  }],
  solution: {
    type: String,
    select: false // Hidden by default, only shown after solving
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  publishedAt: {
    type: Date
  },
  attempts: {
    type: Number,
    default: 0,
    min: 0
  },
  solvedBy: {
    type: Number,
    default: 0,
    min: 0
  },
  averageTime: {
    type: Number, // in minutes
    default: 0
  },
  successRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  }
}, {
  timestamps: true
});

// Indexes for better query performance
challengeSchema.index({ category: 1, difficulty: 1 });
challengeSchema.index({ createdBy: 1 });
challengeSchema.index({ isActive: 1, isPublished: 1 });
challengeSchema.index({ points: -1 });
challengeSchema.index({ tags: 1 });

// Virtual for success rate calculation
challengeSchema.virtual('calculatedSuccessRate').get(function() {
  if (this.attempts === 0) return 0;
  return Math.round((this.solvedBy / this.attempts) * 100);
});

// Method to update statistics
challengeSchema.methods.updateStats = function(isSolved, timeTaken) {
  this.attempts += 1;
  
  if (isSolved) {
    this.solvedBy += 1;
    // Update average time
    this.averageTime = ((this.averageTime * (this.solvedBy - 1)) + timeTaken) / this.solvedBy;
  }
  
  this.successRate = this.calculatedSuccessRate;
  return this.save();
};

// Pre-save middleware to set publishedAt
challengeSchema.pre('save', function(next) {
  if (this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

module.exports = mongoose.model('Challenge', challengeSchema);
