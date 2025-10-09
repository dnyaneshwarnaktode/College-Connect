const TeamChat = require('../models/TeamChat');
const Team = require('../models/Team');
const User = require('../models/User');

// @desc    Get team chat messages
// @route   GET /api/teams/:teamId/chat
// @access  Private (Team members only)
const getTeamChat = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Check if user is member of the team
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    const isMember = team.members.some(
      member => member.user.toString() === req.user.id && member.isActive
    );

    if (!isMember) {
      return res.status(403).json({ message: 'Access denied. Not a team member.' });
    }

    const skip = (page - 1) * limit;

    const messages = await TeamChat.find({ 
      team: teamId, 
      isDeleted: false 
    })
      .populate('sender', 'name avatar')
      .populate('replyTo')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip(skip);

    const totalMessages = await TeamChat.countDocuments({ 
      team: teamId, 
      isDeleted: false 
    });

    res.json({
      success: true,
      data: {
        messages: messages.reverse(), // Reverse to show oldest first
        pagination: {
          current: page,
          pages: Math.ceil(totalMessages / limit),
          total: totalMessages
        }
      }
    });
  } catch (error) {
    console.error('Error fetching team chat:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Send message to team chat
// @route   POST /api/teams/:teamId/chat
// @access  Private (Team members only)
const sendMessage = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { message, messageType = 'text', replyTo, attachments } = req.body;

    // Check if user is member of the team
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    const isMember = team.members.some(
      member => member.user.toString() === req.user.id && member.isActive
    );

    if (!isMember) {
      return res.status(403).json({ message: 'Access denied. Not a team member.' });
    }

    const chatMessage = await TeamChat.create({
      team: teamId,
      sender: req.user.id,
      message,
      messageType,
      replyTo,
      attachments
    });

    const populatedMessage = await TeamChat.findById(chatMessage._id)
      .populate('sender', 'name avatar')
      .populate('replyTo');

    res.status(201).json({
      success: true,
      data: populatedMessage
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Edit team chat message
// @route   PUT /api/teams/:teamId/chat/:messageId
// @access  Private (Message sender only)
const editMessage = async (req, res) => {
  try {
    const { teamId, messageId } = req.params;
    const { message } = req.body;

    const chatMessage = await TeamChat.findOne({
      _id: messageId,
      team: teamId,
      sender: req.user.id,
      isDeleted: false
    });

    if (!chatMessage) {
      return res.status(404).json({ message: 'Message not found' });
    }

    chatMessage.message = message;
    chatMessage.isEdited = true;
    chatMessage.editedAt = new Date();

    await chatMessage.save();

    const populatedMessage = await TeamChat.findById(chatMessage._id)
      .populate('sender', 'name avatar')
      .populate('replyTo');

    res.json({
      success: true,
      data: populatedMessage
    });
  } catch (error) {
    console.error('Error editing message:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete team chat message
// @route   DELETE /api/teams/:teamId/chat/:messageId
// @access  Private (Message sender or team leader)
const deleteMessage = async (req, res) => {
  try {
    const { teamId, messageId } = req.params;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    const chatMessage = await TeamChat.findOne({
      _id: messageId,
      team: teamId,
      isDeleted: false
    });

    if (!chatMessage) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if user is sender or team leader
    const isSender = chatMessage.sender.toString() === req.user.id;
    const isLeader = team.leader.toString() === req.user.id;

    if (!isSender && !isLeader) {
      return res.status(403).json({ message: 'Access denied' });
    }

    chatMessage.isDeleted = true;
    chatMessage.deletedAt = new Date();
    await chatMessage.save();

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add reaction to team chat message
// @route   POST /api/teams/:teamId/chat/:messageId/reaction
// @access  Private (Team members only)
const addReaction = async (req, res) => {
  try {
    const { teamId, messageId } = req.params;
    const { emoji } = req.body;

    // Check if user is member of the team
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    const isMember = team.members.some(
      member => member.user.toString() === req.user.id && member.isActive
    );

    if (!isMember) {
      return res.status(403).json({ message: 'Access denied. Not a team member.' });
    }

    const chatMessage = await TeamChat.findOne({
      _id: messageId,
      team: teamId,
      isDeleted: false
    });

    if (!chatMessage) {
      return res.status(404).json({ message: 'Message not found' });
    }

    await chatMessage.addReaction(req.user.id, emoji);

    const updatedMessage = await TeamChat.findById(chatMessage._id)
      .populate('sender', 'name avatar')
      .populate('reactions.user', 'name');

    res.json({
      success: true,
      data: updatedMessage
    });
  } catch (error) {
    console.error('Error adding reaction:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get team chat statistics
// @route   GET /api/teams/:teamId/chat/stats
// @access  Private (Team members only)
const getChatStats = async (req, res) => {
  try {
    const { teamId } = req.params;

    // Check if user is member of the team
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    const isMember = team.members.some(
      member => member.user.toString() === req.user.id && member.isActive
    );

    if (!isMember) {
      return res.status(403).json({ message: 'Access denied. Not a team member.' });
    }

    const totalMessages = await TeamChat.countDocuments({ 
      team: teamId, 
      isDeleted: false 
    });

    const todayMessages = await TeamChat.countDocuments({
      team: teamId,
      isDeleted: false,
      createdAt: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0))
      }
    });

    const activeMembers = await TeamChat.distinct('sender', {
      team: teamId,
      isDeleted: false,
      createdAt: {
        $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
      }
    });

    res.json({
      success: true,
      data: {
        totalMessages,
        todayMessages,
        activeMembers: activeMembers.length,
        totalMembers: team.members.filter(member => member.isActive).length
      }
    });
  } catch (error) {
    console.error('Error fetching chat stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getTeamChat,
  sendMessage,
  editMessage,
  deleteMessage,
  addReaction,
  getChatStats
};