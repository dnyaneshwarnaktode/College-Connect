const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  searchEvents,
  searchProjects,
  searchForumPosts,
  searchTeams,
  searchClassGroups
} = require('../controllers/searchController');

// Search routes
router.get('/events/search', protect, searchEvents);
router.get('/projects/search', protect, searchProjects);
router.get('/forums/search', protect, searchForumPosts);
router.get('/teams/search', protect, searchTeams);
router.get('/class-groups/search', protect, searchClassGroups);

module.exports = router;
