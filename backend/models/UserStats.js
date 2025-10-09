const mongoose = require('mongoose');

const userStatsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  totalScore: {
    type: Number,
    default: 0,
    min: 0
  },
  challengesSolved: {
    type: Number,
    default: 0,
    min: 0
  },
  challengesAttempted: {
    type: Number,
    default: 0,
    min: 0
  },
  currentStreak: {
    type: Number,
    default: 0,
    min: 0
  },
  longestStreak: {
    type: Number,
    default: 0,
    min: 0
  },
  lastSubmissionDate: {
    type: Date
  },
  streakStartDate: {
    type: Date
  },
  categoryStats: {
    dsa: {
      solved: { type: Number, default: 0 },
      attempted: { type: Number, default: 0 },
      score: { type: Number, default: 0 }
    },
    aptitude: {
      solved: { type: Number, default: 0 },
      attempted: { type: Number, default: 0 },
      score: { type: Number, default: 0 }
    },
    programming: {
      solved: { type: Number, default: 0 },
      attempted: { type: Number, default: 0 },
      score: { type: Number, default: 0 }
    },
    'web-development': {
      solved: { type: Number, default: 0 },
      attempted: { type: Number, default: 0 },
      score: { type: Number, default: 0 }
    },
    'mobile-development': {
      solved: { type: Number, default: 0 },
      attempted: { type: Number, default: 0 },
      score: { type: Number, default: 0 }
    },
    'ai-ml': {
      solved: { type: Number, default: 0 },
      attempted: { type: Number, default: 0 },
      score: { type: Number, default: 0 }
    }
  },
  difficultyStats: {
    easy: {
      solved: { type: Number, default: 0 },
      attempted: { type: Number, default: 0 },
      score: { type: Number, default: 0 }
    },
    medium: {
      solved: { type: Number, default: 0 },
      attempted: { type: Number, default: 0 },
      score: { type: Number, default: 0 }
    },
    hard: {
      solved: { type: Number, default: 0 },
      attempted: { type: Number, default: 0 },
      score: { type: Number, default: 0 }
    },
    expert: {
      solved: { type: Number, default: 0 },
      attempted: { type: Number, default: 0 },
      score: { type: Number, default: 0 }
    }
  },
  achievements: [{
    name: String,
    description: String,
    icon: String,
    unlockedAt: {
      type: Date,
      default: Date.now
    }
  }],
  rank: {
    type: Number,
    default: 0
  },
  previousRank: {
    type: Number,
    default: 0
  },
  rankUpdatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
userStatsSchema.index({ totalScore: -1 });
userStatsSchema.index({ challengesSolved: -1 });
userStatsSchema.index({ currentStreak: -1 });
userStatsSchema.index({ rank: 1 });

// Method to update streak
userStatsSchema.methods.updateStreak = function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const lastSubmission = this.lastSubmissionDate ? new Date(this.lastSubmissionDate) : null;
  if (lastSubmission) {
    lastSubmission.setHours(0, 0, 0, 0);
  }
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (!lastSubmission) {
    // First submission
    this.currentStreak = 1;
    this.streakStartDate = today;
  } else if (lastSubmission.getTime() === today.getTime()) {
    // Already submitted today, no change
    return;
  } else if (lastSubmission.getTime() === yesterday.getTime()) {
    // Consecutive day
    this.currentStreak += 1;
  } else {
    // Streak broken
    this.currentStreak = 1;
    this.streakStartDate = today;
  }
  
  // Update longest streak
  if (this.currentStreak > this.longestStreak) {
    this.longestStreak = this.currentStreak;
  }
  
  this.lastSubmissionDate = today;
};

// Method to update stats after challenge submission
userStatsSchema.methods.updateStats = function(challenge, submission) {
  // Update general stats
  this.challengesAttempted += 1;
  
  if (submission.isCorrect) {
    this.challengesSolved += 1;
    this.totalScore += submission.score;
    
    // Update category stats
    if (this.categoryStats[challenge.category]) {
      this.categoryStats[challenge.category].solved += 1;
      this.categoryStats[challenge.category].score += submission.score;
    }
    
    // Update difficulty stats
    if (this.difficultyStats[challenge.difficulty]) {
      this.difficultyStats[challenge.difficulty].solved += 1;
      this.difficultyStats[challenge.difficulty].score += submission.score;
    }
    
    // Update streak
    this.updateStreak();
  }
  
  // Update attempted counts
  if (this.categoryStats[challenge.category]) {
    this.categoryStats[challenge.category].attempted += 1;
  }
  
  if (this.difficultyStats[challenge.difficulty]) {
    this.difficultyStats[challenge.difficulty].attempted += 1;
  }
  
  // Check for achievements
  this.checkAchievements();
};

// Method to check and unlock achievements
userStatsSchema.methods.checkAchievements = function() {
  const achievements = [];
  
  // First solve achievement
  if (this.challengesSolved === 1 && !this.achievements.find(a => a.name === 'First Solve')) {
    achievements.push({
      name: 'First Solve',
      description: 'Solved your first challenge!',
      icon: '🎉'
    });
  }
  
  // Streak achievements
  if (this.currentStreak === 7 && !this.achievements.find(a => a.name === 'Week Warrior')) {
    achievements.push({
      name: 'Week Warrior',
      description: 'Maintained a 7-day streak!',
      icon: '🔥'
    });
  }
  
  if (this.currentStreak === 30 && !this.achievements.find(a => a.name === 'Monthly Master')) {
    achievements.push({
      name: 'Monthly Master',
      description: 'Maintained a 30-day streak!',
      icon: '👑'
    });
  }
  
  // Score achievements
  if (this.totalScore >= 1000 && !this.achievements.find(a => a.name === 'Score Master')) {
    achievements.push({
      name: 'Score Master',
      description: 'Earned 1000+ points!',
      icon: '⭐'
    });
  }
  
  // Category mastery achievements
  Object.keys(this.categoryStats).forEach(category => {
    const stats = this.categoryStats[category];
    if (stats.solved >= 10 && !this.achievements.find(a => a.name === `${category} Expert`)) {
      achievements.push({
        name: `${category} Expert`,
        description: `Solved 10+ ${category} challenges!`,
        icon: '🏆'
      });
    }
  });
  
  this.achievements.push(...achievements);
};

module.exports = mongoose.model('UserStats', userStatsSchema);
