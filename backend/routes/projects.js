const express = require('express');
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  likeProject,
  joinProject,
  leaveProject,
  getProjectMembers
} = require('../controllers/projectController');
const { protect, checkOwnership, optionalAuth } = require('../middleware/auth');
const Project = require('../models/Project');

const router = express.Router();

// Public routes (with optional auth for personalization)
router.get('/', optionalAuth, getProjects);
router.get('/:id', optionalAuth, getProject);

// Protected routes
router.use(protect);

// Project routes
router.post('/', createProject);
router.post('/:id/like', likeProject);
router.post('/:id/join', joinProject);
router.delete('/:id/leave', leaveProject);
router.get('/:id/members', getProjectMembers);

// Owner or admin only routes
router.put('/:id', checkOwnership(Project), updateProject);
router.delete('/:id', checkOwnership(Project), deleteProject);

module.exports = router;