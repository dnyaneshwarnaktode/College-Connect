const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide team name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide team description'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  type: {
    type: String,
    required: [true, 'Please provide team type'],
    enum: ['club', 'project', 'competition'],
    lowercase: true
  },
  leader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['leader', 'co-leader', 'member'],
      default: 'member'
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
  maxMembers: {
    type: Number,
    required: [true, 'Please provide maximum members limit'],
    min: [1, 'Maximum members must be at least 1'],
    max: [100, 'Maximum members cannot exceed 100']
  },
  isOpen: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  requirements: [{
    type: String,
    trim: true
  }],
  meetingSchedule: {
    frequency: {
      type: String,
      enum: ['weekly', 'bi-weekly', 'monthly', 'as-needed'],
      default: 'as-needed'
    },
    day: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    },
    time: String,
    location: String
  },
  achievements: [{
    title: String,
    description: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  socialLinks: {
    website: String,
    discord: String,
    slack: String,
    github: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better query performance
teamSchema.index({ type: 1 });
teamSchema.index({ leader: 1 });
teamSchema.index({ 'members.user': 1 });
teamSchema.index({ isOpen: 1 });
teamSchema.index({ isActive: 1 });

// Virtual for current member count
teamSchema.virtual('currentMembers').get(function() {
  return this.members.filter(member => member.isActive).length;
});

// Virtual for available spots
teamSchema.virtual('availableSpots').get(function() {
  return Math.max(0, this.maxMembers - this.currentMembers);
});

// Virtual for checking if team is full
teamSchema.virtual('isFull').get(function() {
  return this.currentMembers >= this.maxMembers;
});

// Ensure leader is always in members array
teamSchema.pre('save', function(next) {
  const leaderInMembers = this.members.some(member => 
    member.user.toString() === this.leader.toString()
  );
  
  if (!leaderInMembers) {
    this.members.unshift({
      user: this.leader,
      role: 'leader',
      joinedAt: this.createdAt || new Date(),
      isActive: true
    });
  }
  
  next();
});

// Close team if it reaches maximum capacity
teamSchema.pre('save', function(next) {
  if (this.currentMembers >= this.maxMembers) {
    this.isOpen = false;
  }
  next();
});

module.exports = mongoose.model('Team', teamSchema);