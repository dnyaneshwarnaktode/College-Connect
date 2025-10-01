const express = require('express');
const {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  likePost,
  addReply,
  updateReply,
  deleteReply,
  likeReply
} = require('../controllers/forumController');
const { protect, checkOwnership, optionalAuth } = require('../middleware/auth');
const ForumPost = require('../models/ForumPost');

const router = express.Router();

// Public routes (with optional auth for personalization)
router.get('/', optionalAuth, getPosts);
router.get('/:id', optionalAuth, getPost);

// Protected routes
router.use(protect);

// Post routes
router.post('/', createPost);
router.put('/:id', checkOwnership(ForumPost), updatePost);
router.delete('/:id', checkOwnership(ForumPost), deletePost);
router.post('/:id/like', likePost);

// Reply routes
router.post('/:id/replies', addReply);
router.put('/:postId/replies/:replyId', updateReply);
router.delete('/:postId/replies/:replyId', deleteReply);
router.post('/:postId/replies/:replyId/like', likeReply);

module.exports = router;