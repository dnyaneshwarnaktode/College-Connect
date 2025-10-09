const express = require('express');
const router = express.Router();
const {
  getLeaderboard,
  getUserRank,
  getCategoryLeaderboard,
  getStreakLeaderboard,
  getGlobalStats,
  getUserAchievements
} = require('../controllers/leaderboardController');

// Public routes (no authentication required)

// @route   GET /api/leaderboard
// @desc    Get leaderboard
// @access  Public
router.get('/', getLeaderboard);

// @route   GET /api/leaderboard/user/:userId
// @desc    Get user's rank and stats
// @access  Public
router.get('/user/:userId', getUserRank);

// @route   GET /api/leaderboard/category/:category
// @desc    Get category-wise leaderboard
// @access  Public
router.get('/category/:category', getCategoryLeaderboard);

// @route   GET /api/leaderboard/streaks
// @desc    Get streak leaderboard
// @access  Public
router.get('/streaks', getStreakLeaderboard);

// @route   GET /api/leaderboard/stats
// @desc    Get global statistics
// @access  Public
router.get('/stats', getGlobalStats);

// @route   GET /api/leaderboard/achievements/:userId
// @desc    Get user's achievements
// @access  Public
router.get('/achievements/:userId', getUserAchievements);

module.exports = router;
