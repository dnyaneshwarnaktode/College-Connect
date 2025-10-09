const express = require('express');
const {
  getPublicStats,
  getDashboardStats,
  getUserAnalytics,
  getEventAnalytics,
  getForumAnalytics,
  getProjectAnalytics,
  getTeamAnalytics,
  getEngagementMetrics
} = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public route (no authentication required)
router.get('/public-stats', getPublicStats);

// All other routes require authentication
router.use(protect);

// Admin only routes
router.get('/dashboard', authorize('admin'), getDashboardStats);
router.get('/users', authorize('admin'), getUserAnalytics);
router.get('/events', authorize('admin'), getEventAnalytics);
router.get('/forums', authorize('admin'), getForumAnalytics);
router.get('/projects', authorize('admin'), getProjectAnalytics);
router.get('/teams', authorize('admin'), getTeamAnalytics);
router.get('/engagement', authorize('admin'), getEngagementMetrics);

module.exports = router;