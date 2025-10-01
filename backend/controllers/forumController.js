const ForumPost = require('../models/ForumPost');
const User = require('../models/User');

// @desc    Get all forum posts
// @route   GET /api/forums
// @access  Public
const getPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build query
    let query = {};

    // Search functionality
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query.$or = [
        { title: searchRegex },
        { content: searchRegex }
      ];
    }

    // Filter by category
    if (req.query.category && req.query.category !== 'all') {
      query.category = req.query.category;
    }

    // Filter by author
    if (req.query.author) {
      query.author = req.query.author;
    }

    // Sort options
    let sortOption = { createdAt: -1 }; // Default: newest first
    
    if (req.query.sort === 'likes') {
      sortOption = { likes: -1 };
    } else if (req.query.sort === 'replies') {
      sortOption = { 'replies.length': -1 };
    } else if (req.query.sort === 'views') {
      sortOption = { views: -1 };
    }

    const posts = await ForumPost.find(query)
      .populate('author', 'name role department avatar')
      .populate('replies.author', 'name role department avatar')
      .sort(sortOption)
      .skip(skip)
      .limit(limit);

    const total = await ForumPost.countDocuments(query);

    res.json({
      success: true,
      count: posts.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      posts
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single forum post
// @route   GET /api/forums/:id
// @access  Public
const getPost = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id)
      .populate('author', 'name role department avatar')
      .populate('replies.author', 'name role department avatar');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Increment view count if user is authenticated and hasn't viewed before
    if (req.user && !post.viewedBy.includes(req.user.id)) {
      post.viewedBy.push(req.user.id);
      post.views += 1;
      await post.save();
    }

    res.json({
      success: true,
      post
    });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create forum post
// @route   POST /api/forums
// @access  Private
const createPost = async (req, res) => {
  try {
    const { title, content, category, tags } = req.body;

    const post = await ForumPost.create({
      title,
      content,
      category,
      tags: tags || [],
      author: req.user.id
    });

    await post.populate('author', 'name role department avatar');

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      post
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update forum post
// @route   PUT /api/forums/:id
// @access  Private (Owner/Admin)
const updatePost = async (req, res) => {
  try {
    const { title, content, category, tags, isPinned, isLocked } = req.body;

    const updateData = {};
    if (title) updateData.title = title;
    if (content) updateData.content = content;
    if (category) updateData.category = category;
    if (tags) updateData.tags = tags;
    
    // Only admin can pin/lock posts
    if (req.user.role === 'admin') {
      if (isPinned !== undefined) updateData.isPinned = isPinned;
      if (isLocked !== undefined) updateData.isLocked = isLocked;
    }

    // Mark as edited if content changed
    if (content && content !== req.resource.content) {
      updateData.isEdited = true;
    }

    const post = await ForumPost.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('author', 'name role department avatar');

    res.json({
      success: true,
      message: 'Post updated successfully',
      post
    });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete forum post
// @route   DELETE /api/forums/:id
// @access  Private (Owner/Admin)
const deletePost = async (req, res) => {
  try {
    await ForumPost.findByIdAndDelete(req.params.id);

    // Remove post from users' liked posts
    await User.updateMany(
      { likedPosts: req.params.id },
      { $pull: { likedPosts: req.params.id } }
    );

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Like/Unlike forum post
// @route   POST /api/forums/:id/like
// @access  Private
const likePost = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const likedIndex = post.likedBy.indexOf(req.user.id);
    let message;

    if (likedIndex > -1) {
      // Unlike
      post.likedBy.splice(likedIndex, 1);
      message = 'Post unliked';
      
      // Remove from user's liked posts
      await User.findByIdAndUpdate(
        req.user.id,
        { $pull: { likedPosts: post._id } }
      );
    } else {
      // Like
      post.likedBy.push(req.user.id);
      message = 'Post liked';
      
      // Add to user's liked posts
      await User.findByIdAndUpdate(
        req.user.id,
        { $addToSet: { likedPosts: post._id } }
      );
    }

    await post.save();

    res.json({
      success: true,
      message,
      likes: post.likes,
      isLiked: likedIndex === -1
    });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Add reply to forum post
// @route   POST /api/forums/:id/replies
// @access  Private
const addReply = async (req, res) => {
  try {
    const { content } = req.body;

    const post = await ForumPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    if (post.isLocked) {
      return res.status(400).json({
        success: false,
        message: 'Post is locked for replies'
      });
    }

    const reply = {
      content,
      author: req.user.id
    };

    post.replies.push(reply);
    await post.save();

    await post.populate('replies.author', 'name role department avatar');

    const newReply = post.replies[post.replies.length - 1];

    res.status(201).json({
      success: true,
      message: 'Reply added successfully',
      reply: newReply
    });
  } catch (error) {
    console.error('Add reply error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update reply
// @route   PUT /api/forums/:postId/replies/:replyId
// @access  Private (Owner/Admin)
const updateReply = async (req, res) => {
  try {
    const { content } = req.body;
    const { postId, replyId } = req.params;

    const post = await ForumPost.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const reply = post.replies.id(replyId);

    if (!reply) {
      return res.status(404).json({
        success: false,
        message: 'Reply not found'
      });
    }

    // Check ownership
    if (reply.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this reply'
      });
    }

    reply.content = content;
    reply.isEdited = true;

    await post.save();

    res.json({
      success: true,
      message: 'Reply updated successfully',
      reply
    });
  } catch (error) {
    console.error('Update reply error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete reply
// @route   DELETE /api/forums/:postId/replies/:replyId
// @access  Private (Owner/Admin)
const deleteReply = async (req, res) => {
  try {
    const { postId, replyId } = req.params;

    const post = await ForumPost.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const reply = post.replies.id(replyId);

    if (!reply) {
      return res.status(404).json({
        success: false,
        message: 'Reply not found'
      });
    }

    // Check ownership
    if (reply.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this reply'
      });
    }

    reply.remove();
    await post.save();

    res.json({
      success: true,
      message: 'Reply deleted successfully'
    });
  } catch (error) {
    console.error('Delete reply error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Like/Unlike reply
// @route   POST /api/forums/:postId/replies/:replyId/like
// @access  Private
const likeReply = async (req, res) => {
  try {
    const { postId, replyId } = req.params;

    const post = await ForumPost.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const reply = post.replies.id(replyId);

    if (!reply) {
      return res.status(404).json({
        success: false,
        message: 'Reply not found'
      });
    }

    const likedIndex = reply.likedBy.indexOf(req.user.id);
    let message;

    if (likedIndex > -1) {
      // Unlike
      reply.likedBy.splice(likedIndex, 1);
      message = 'Reply unliked';
    } else {
      // Like
      reply.likedBy.push(req.user.id);
      message = 'Reply liked';
    }

    await post.save();

    res.json({
      success: true,
      message,
      likes: reply.likes,
      isLiked: likedIndex === -1
    });
  } catch (error) {
    console.error('Like reply error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
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
};