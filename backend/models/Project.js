const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide project title'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide project description'],
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  technologies: [{
    type: String,
    required: true,
    trim: true
  }],
  category: {
    type: String,
    required: [true, 'Please provide project category'],
    enum: ['web', 'mobile', 'ai', 'data', 'other'],
    lowercase: true
  },
  status: {
    type: String,
    required: [true, 'Please provide project status'],
    enum: ['planning', 'active', 'completed', 'on-hold'],
    default: 'planning',
    lowercase: true
  },
  owner: {
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
      enum: ['owner', 'collaborator', 'contributor'],
      default: 'contributor'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  githubUrl: {
    type: String,
    validate: {
      validator: function(v) {
        if (!v) return true;
        return /^https:\/\/github\.com\/[\w\-\.]+\/[\w\-\.]+\/?$/.test(v);
      },
      message: 'Please provide a valid GitHub URL'
    }
  },
  liveUrl: {
    type: String,
    validate: {
      validator: function(v) {
        if (!v) return true;
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Please provide a valid URL'
    }
  },
  image: {
    type: String,
    default: ''
  },
  likes: {
    type: Number,
    default: 0,
    min: 0
  },
  likedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  views: {
    type: Number,
    default: 0,
    min: 0
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  }
}, {
  timestamps: true
});

// Index for better query performance
projectSchema.index({ category: 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ owner: 1 });
projectSchema.index({ 'members.user': 1 });
projectSchema.index({ likes: -1 });
projectSchema.index({ views: -1 });

// Virtual for member count
projectSchema.virtual('memberCount').get(function() {
  return this.members.length;
});

// Virtual for checking if project is active
projectSchema.virtual('isActive').get(function() {
  return this.status === 'active';
});

// Update likes count before saving
projectSchema.pre('save', function(next) {
  this.likes = this.likedBy.length;
  next();
});

// Ensure owner is always in members array
projectSchema.pre('save', function(next) {
  const ownerInMembers = this.members.some(member => 
    member.user.toString() === this.owner.toString()
  );
  
  if (!ownerInMembers) {
    this.members.unshift({
      user: this.owner,
      role: 'owner',
      joinedAt: this.createdAt || new Date()
    });
  }
  
  next();
});

module.exports = mongoose.model('Project', projectSchema);