const express = require('express');
const {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
  unregisterFromEvent,
  getEventRegistrations
} = require('../controllers/eventController');
const { protect, authorize, checkOwnership } = require('../middleware/auth');
const Event = require('../models/Event');

const router = express.Router();

// Public routes
router.get('/', getEvents);
router.get('/:id', getEvent);

// Protected routes
router.use(protect);

// Registration routes
router.post('/:id/register', registerForEvent);
router.delete('/:id/register', unregisterFromEvent);

// Admin/Faculty only routes
router.post('/', authorize('admin', 'faculty'), createEvent);
router.get('/:id/registrations', authorize('admin', 'faculty'), getEventRegistrations);

// Owner or admin only routes
router.put('/:id', checkOwnership(Event), updateEvent);
router.delete('/:id', checkOwnership(Event), deleteEvent);

module.exports = router;