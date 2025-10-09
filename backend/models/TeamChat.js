const mongoose = require('mongoose');

const teamChatSchema = new mongoose.Schema({
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: [true, 'Message content is required'],
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file', 'link'],
    default: 'text'
  },
  attachments: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    url: String
  }],
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TeamChat'
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  },
  reactions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    emoji: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for better query performance
teamChatSchema.index({ team: 1, createdAt: -1 });
teamChatSchema.index({ sender: 1 });
teamChatSchema.index({ replyTo: 1 });

// Virtual for reaction count
teamChatSchema.virtual('reactionCount').get(function() {
  return this.reactions.length;
});

// Method to add reaction
teamChatSchema.methods.addReaction = function(userId, emoji) {
  const existingReaction = this.reactions.find(
    reaction => reaction.user.toString() === userId.toString() && reaction.emoji === emoji
  );
  
  if (existingReaction) {
    this.reactions = this.reactions.filter(
      reaction => !(reaction.user.toString() === userId.toString() && reaction.emoji === emoji)
    );
  } else {
    this.reactions.push({ user: userId, emoji });
  }
  
  return this.save();
};

module.exports = mongoose.model('TeamChat', teamChatSchema);
