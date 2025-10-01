const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Please provide reply content'],
    maxlength: [1000, 'Reply cannot be more than 1000 characters']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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
  isEdited: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const forumPostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide post title'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Please provide post content'],
    maxlength: [5000, 'Content cannot be more than 5000 characters']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: [true, 'Please provide post category'],
    enum: ['general', 'academic', 'projects', 'help'],
    lowercase: true
  },
  replies: [replySchema],
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
  viewedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isPinned: {
    type: Boolean,
    default: false
  },
  isLocked: {
    type: Boolean,
    default: false
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }]
}, {
  timestamps: true
});

// Index for better query performance
forumPostSchema.index({ category: 1 });
forumPostSchema.index({ author: 1 });
forumPostSchema.index({ createdAt: -1 });
forumPostSchema.index({ likes: -1 });
forumPostSchema.index({ views: -1 });

// Virtual for reply count
forumPostSchema.virtual('replyCount').get(function() {
  return this.replies.length;
});

// Virtual for latest reply
forumPostSchema.virtual('latestReply').get(function() {
  if (this.replies.length === 0) return null;
  return this.replies[this.replies.length - 1];
});

// Update likes count before saving
forumPostSchema.pre('save', function(next) {
  this.likes = this.likedBy.length;
  
  // Update reply likes
  this.replies.forEach(reply => {
    reply.likes = reply.likedBy.length;
  });
  
  next();
});

module.exports = mongoose.model('ForumPost', forumPostSchema);