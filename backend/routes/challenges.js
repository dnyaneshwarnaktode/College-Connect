const express = require('express');
const router = express.Router();
const {
  getChallenges,
  getChallenge,
  createChallenge,
  updateChallenge,
  deleteChallenge,
  submitSolution,
  getUserSubmissions,
  getChallengeFilters
} = require('../controllers/challengeController');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/', getChallenges);
router.get('/filters', getChallengeFilters);
router.get('/:id', getChallenge);

// Protected routes
router.use(protect);

// @route   POST /api/challenges
// @desc    Create new challenge
// @access  Private (Faculty/Admin only)
router.post('/', createChallenge);

// @route   PUT /api/challenges/:id
// @desc    Update challenge
// @access  Private (Creator or Admin only)
router.put('/:id', updateChallenge);

// @route   DELETE /api/challenges/:id
// @desc    Delete challenge
// @access  Private (Creator or Admin only)
router.delete('/:id', deleteChallenge);

// @route   POST /api/challenges/:id/submit
// @desc    Submit solution for challenge
// @access  Private
router.post('/:id/submit', submitSolution);

// @route   GET /api/challenges/:id/submissions
// @desc    Get user's submissions for a challenge
// @access  Private
router.get('/:id/submissions', getUserSubmissions);

module.exports = router;
