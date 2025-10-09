const mongoose = require('mongoose');

const challengeSubmissionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  challenge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Challenge',
    required: true
  },
  code: {
    type: String,
    required: [true, 'Code submission is required']
  },
  language: {
    type: String,
    required: [true, 'Programming language is required'],
    enum: ['javascript', 'python', 'java', 'cpp', 'c', 'go', 'rust', 'typescript'],
    lowercase: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'wrong-answer', 'time-limit-exceeded', 'runtime-error', 'compilation-error'],
    default: 'pending'
  },
  score: {
    type: Number,
    default: 0,
    min: 0
  },
  timeTaken: {
    type: Number, // in minutes
    required: true,
    min: 0
  },
  memoryUsed: {
    type: Number, // in MB
    default: 0
  },
  testResults: [{
    testCase: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Challenge.testCases'
    },
    passed: {
      type: Boolean,
      required: true
    },
    actualOutput: String,
    executionTime: Number, // in milliseconds
    memoryUsage: Number // in MB
  }],
  errorMessage: {
    type: String
  },
  isCorrect: {
    type: Boolean,
    default: false
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
challengeSubmissionSchema.index({ user: 1, challenge: 1 });
challengeSubmissionSchema.index({ challenge: 1, submittedAt: -1 });
challengeSubmissionSchema.index({ user: 1, submittedAt: -1 });
challengeSubmissionSchema.index({ status: 1 });
challengeSubmissionSchema.index({ isCorrect: 1 });

// Compound index to prevent duplicate submissions
challengeSubmissionSchema.index({ user: 1, challenge: 1, submittedAt: 1 }, { unique: true });

// Method to calculate score based on performance
challengeSubmissionSchema.methods.calculateScore = function(challengePoints) {
  if (!this.isCorrect) {
    this.score = 0;
    return;
  }
  
  // Base score from challenge points
  let baseScore = challengePoints;
  
  // Time bonus (faster solutions get more points)
  const timeBonus = Math.max(0, 1 - (this.timeTaken / 60)); // Bonus decreases with time
  const timeBonusPoints = Math.round(baseScore * timeBonus * 0.1); // 10% bonus max
  
  // Memory efficiency bonus
  const memoryBonus = Math.max(0, 1 - (this.memoryUsed / 100)); // Bonus for using less memory
  const memoryBonusPoints = Math.round(baseScore * memoryBonus * 0.05); // 5% bonus max
  
  this.score = baseScore + timeBonusPoints + memoryBonusPoints;
};

module.exports = mongoose.model('ChallengeSubmission', challengeSubmissionSchema);
