const express = require('express');
const {
  getTeams,
  getTeam,
  createTeam,
  updateTeam,
  deleteTeam,
  joinTeam,
  leaveTeam,
  getTeamMembers,
  updateMemberRole
} = require('../controllers/teamController');
const { protect, checkOwnership, optionalAuth } = require('../middleware/auth');
const Team = require('../models/Team');

const router = express.Router();

// Public routes (with optional auth for personalization)
router.get('/', optionalAuth, getTeams);
router.get('/:id', optionalAuth, getTeam);

// Protected routes
router.use(protect);

// Team routes
router.post('/', createTeam);
router.post('/:id/join', joinTeam);
router.delete('/:id/leave', leaveTeam);
router.get('/:id/members', getTeamMembers);

// Leader or admin only routes
router.put('/:id', checkOwnership(Team), updateTeam);
router.delete('/:id', checkOwnership(Team), deleteTeam);
router.put('/:id/members/:memberId', checkOwnership(Team), updateMemberRole);

module.exports = router;