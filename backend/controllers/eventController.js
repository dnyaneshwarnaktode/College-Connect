const Event = require('../models/Event');
const User = require('../models/User');
const NotificationService = require('../services/notificationService');

// @desc    Get all events
// @route   GET /api/events
// @access  Public
const getEvents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build query
    let query = { isActive: true };

    // Search functionality
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { organizer: searchRegex },
        { location: searchRegex }
      ];
    }

    // Filter by category
    if (req.query.category && req.query.category !== 'all') {
      query.category = req.query.category;
    }

    // Filter by date range
    if (req.query.startDate || req.query.endDate) {
      query.date = {};
      if (req.query.startDate) {
        query.date.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        query.date.$lte = new Date(req.query.endDate);
      }
    }

    // Filter upcoming events
    if (req.query.upcoming === 'true') {
      query.date = { $gte: new Date() };
    }

    const events = await Event.find(query)
      .populate('createdBy', 'name email role')
      .sort({ date: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Event.countDocuments(query);

    res.json({
      success: true,
      count: events.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      events
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
const getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('createdBy', 'name email role department')
      .populate('registeredUsers.user', 'name email role department');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.json({
      success: true,
      event
    });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create event
// @route   POST /api/events
// @access  Private (Admin/Faculty)
const createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      date,
      time,
      location,
      category,
      organizer,
      capacity,
      image,
      tags
    } = req.body;

    const event = await Event.create({
      title,
      description,
      date,
      time,
      location,
      category,
      organizer,
      capacity,
      image: image || '',
      tags: tags || [],
      createdBy: req.user.id
    });

    await event.populate('createdBy', 'name email role');

    // Create notifications for all users about the new event
    try {
      const allUsers = await NotificationService.getAllUsers();
      await NotificationService.createNewEventNotification(allUsers, event.title, event._id);
    } catch (error) {
      console.error('Error creating new event notifications:', error);
    }

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      event
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private (Owner/Admin)
const updateEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      date,
      time,
      location,
      category,
      organizer,
      capacity,
      image,
      tags,
      isActive
    } = req.body;

    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (date) updateData.date = date;
    if (time) updateData.time = time;
    if (location) updateData.location = location;
    if (category) updateData.category = category;
    if (organizer) updateData.organizer = organizer;
    if (capacity) updateData.capacity = capacity;
    if (image !== undefined) updateData.image = image;
    if (tags) updateData.tags = tags;
    if (isActive !== undefined) updateData.isActive = isActive;

    const event = await Event.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email role');

    res.json({
      success: true,
      message: 'Event updated successfully',
      event
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private (Owner/Admin)
const deleteEvent = async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);

    // Remove event from users' registered events
    await User.updateMany(
      { registeredEvents: req.params.id },
      { $pull: { registeredEvents: req.params.id } }
    );

    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Register for event
// @route   POST /api/events/:id/register
// @access  Private
const registerForEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    if (!event.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Event is not active'
      });
    }

    // Check if event is in the past
    if (new Date(event.date) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot register for past events'
      });
    }

    // Check if already registered
    const alreadyRegistered = event.registeredUsers.some(
      reg => reg.user.toString() === req.user.id
    );

    if (alreadyRegistered) {
      return res.status(400).json({
        success: false,
        message: 'Already registered for this event'
      });
    }

    // Check capacity
    if (event.registeredUsers.length >= event.capacity) {
      return res.status(400).json({
        success: false,
        message: 'Event is full'
      });
    }

    // Register user
    event.registeredUsers.push({
      user: req.user.id,
      registeredAt: new Date()
    });

    await event.save();

    // Add event to user's registered events
    await User.findByIdAndUpdate(
      req.user.id,
      { $addToSet: { registeredEvents: event._id } }
    );

    // Create notification for successful registration
    try {
      await NotificationService.createEventRegistrationNotification(
        req.user.id, 
        event.title, 
        event._id
      );
    } catch (error) {
      console.error('Error creating registration notification:', error);
    }

    res.json({
      success: true,
      message: 'Successfully registered for event',
      event
    });
  } catch (error) {
    console.error('Register for event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Unregister from event
// @route   DELETE /api/events/:id/register
// @access  Private
const unregisterFromEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if registered
    const registrationIndex = event.registeredUsers.findIndex(
      reg => reg.user.toString() === req.user.id
    );

    if (registrationIndex === -1) {
      return res.status(400).json({
        success: false,
        message: 'Not registered for this event'
      });
    }

    // Remove registration
    event.registeredUsers.splice(registrationIndex, 1);
    await event.save();

    // Remove event from user's registered events
    await User.findByIdAndUpdate(
      req.user.id,
      { $pull: { registeredEvents: event._id } }
    );

    res.json({
      success: true,
      message: 'Successfully unregistered from event'
    });
  } catch (error) {
    console.error('Unregister from event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get event registrations
// @route   GET /api/events/:id/registrations
// @access  Private (Admin/Faculty)
const getEventRegistrations = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('registeredUsers.user', 'name email role department year');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.json({
      success: true,
      registrations: event.registeredUsers,
      count: event.registeredUsers.length,
      capacity: event.capacity
    });
  } catch (error) {
    console.error('Get event registrations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
  unregisterFromEvent,
  getEventRegistrations
};