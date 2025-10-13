const express = require('express');
const {
  getNotifications,
  markNotificationAsRead,
  markAllAsRead,
  deleteNotification,
  getNotificationCount,
  createNotification
} = require('../controllers/notificationController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

// @route   GET /api/notifications
// @desc    Get user notifications
// @access  Private
router.get('/', getNotifications);

// @route   GET /api/notifications/count
// @desc    Get notification count
// @access  Private
router.get('/count', getNotificationCount);

// @route   POST /api/notifications
// @desc    Create notification
// @access  Private (Admin/System)
router.post('/', createNotification);

// @route   PUT /api/notifications/read-all
// @desc    Mark all notifications as read
// @access  Private
router.put('/read-all', markAllAsRead);

// @route   PUT /api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.put('/:id/read', markNotificationAsRead);

// @route   DELETE /api/notifications/:id
// @desc    Delete notification
// @access  Private
router.delete('/:id', deleteNotification);

module.exports = router;
