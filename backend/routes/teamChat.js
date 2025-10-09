const express = require('express');
const router = express.Router();
const {
  getTeamChat,
  sendMessage,
  editMessage,
  deleteMessage,
  addReaction,
  getChatStats
} = require('../controllers/teamChatController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// @route   GET /api/teams/:teamId/chat
// @desc    Get team chat messages
// @access  Private (Team members only)
router.get('/:teamId/chat', getTeamChat);

// @route   POST /api/teams/:teamId/chat
// @desc    Send message to team chat
// @access  Private (Team members only)
router.post('/:teamId/chat', sendMessage);

// @route   PUT /api/teams/:teamId/chat/:messageId
// @desc    Edit team chat message
// @access  Private (Message sender only)
router.put('/:teamId/chat/:messageId', editMessage);

// @route   DELETE /api/teams/:teamId/chat/:messageId
// @desc    Delete team chat message
// @access  Private (Message sender or team leader)
router.delete('/:teamId/chat/:messageId', deleteMessage);

// @route   POST /api/teams/:teamId/chat/:messageId/reaction
// @desc    Add reaction to team chat message
// @access  Private (Team members only)
router.post('/:teamId/chat/:messageId/reaction', addReaction);

// @route   GET /api/teams/:teamId/chat/stats
// @desc    Get team chat statistics
// @access  Private (Team members only)
router.get('/:teamId/chat/stats', getChatStats);

module.exports = router;
