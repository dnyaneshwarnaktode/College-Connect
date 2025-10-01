const Project = require('../models/Project');
const User = require('../models/User');

// @desc    Get all projects
// @route   GET /api/projects
// @access  Public
const getProjects = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build query
    let query = { isPublic: true };

    // Search functionality
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { technologies: { $in: [searchRegex] } }
      ];
    }

    // Filter by category
    if (req.query.category && req.query.category !== 'all') {
      query.category = req.query.category;
    }

    // Filter by status
    if (req.query.status && req.query.status !== 'all') {
      query.status = req.query.status;
    }

    // Filter by owner
    if (req.query.owner) {
      query.owner = req.query.owner;
    }

    // Sort options
    let sortOption = { createdAt: -1 }; // Default: newest first
    
    if (req.query.sort === 'likes') {
      sortOption = { likes: -1 };
    } else if (req.query.sort === 'views') {
      sortOption = { views: -1 };
    } else if (req.query.sort === 'members') {
      sortOption = { 'members.length': -1 };
    }

    const projects = await Project.find(query)
      .populate('owner', 'name role department avatar')
      .populate('members.user', 'name role department avatar')
      .sort(sortOption)
      .skip(skip)
      .limit(limit);

    const total = await Project.countDocuments(query);

    res.json({
      success: true,
      count: projects.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      projects
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Public
const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name role department avatar bio')
      .populate('members.user', 'name role department avatar');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    if (!project.isPublic && (!req.user || 
        (project.owner.toString() !== req.user.id && 
         !project.members.some(member => member.user._id.toString() === req.user.id) &&
         req.user.role !== 'admin'))) {
      return res.status(403).json({
        success: false,
        message: 'Project is private'
      });
    }

    // Increment view count if user is authenticated
    if (req.user) {
      project.views += 1;
      await project.save();
    }

    res.json({
      success: true,
      project
    });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create project
// @route   POST /api/projects
// @access  Private
const createProject = async (req, res) => {
  try {
    const {
      title,
      description,
      technologies,
      category,
      status,
      githubUrl,
      liveUrl,
      image,
      tags,
      isPublic,
      startDate,
      endDate
    } = req.body;

    const project = await Project.create({
      title,
      description,
      technologies,
      category,
      status: status || 'planning',
      githubUrl: githubUrl || '',
      liveUrl: liveUrl || '',
      image: image || '',
      tags: tags || [],
      isPublic: isPublic !== undefined ? isPublic : true,
      startDate: startDate || new Date(),
      endDate,
      owner: req.user.id
    });

    await project.populate('owner', 'name role department avatar');

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      project
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private (Owner/Admin)
const updateProject = async (req, res) => {
  try {
    const {
      title,
      description,
      technologies,
      category,
      status,
      githubUrl,
      liveUrl,
      image,
      tags,
      isPublic,
      startDate,
      endDate,
      progress
    } = req.body;

    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (technologies) updateData.technologies = technologies;
    if (category) updateData.category = category;
    if (status) updateData.status = status;
    if (githubUrl !== undefined) updateData.githubUrl = githubUrl;
    if (liveUrl !== undefined) updateData.liveUrl = liveUrl;
    if (image !== undefined) updateData.image = image;
    if (tags) updateData.tags = tags;
    if (isPublic !== undefined) updateData.isPublic = isPublic;
    if (startDate) updateData.startDate = startDate;
    if (endDate !== undefined) updateData.endDate = endDate;
    if (progress !== undefined) updateData.progress = progress;

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('owner', 'name role department avatar')
     .populate('members.user', 'name role department avatar');

    res.json({
      success: true,
      message: 'Project updated successfully',
      project
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private (Owner/Admin)
const deleteProject = async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Like/Unlike project
// @route   POST /api/projects/:id/like
// @access  Private
const likeProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const likedIndex = project.likedBy.indexOf(req.user.id);
    let message;

    if (likedIndex > -1) {
      // Unlike
      project.likedBy.splice(likedIndex, 1);
      message = 'Project unliked';
    } else {
      // Like
      project.likedBy.push(req.user.id);
      message = 'Project liked';
    }

    await project.save();

    res.json({
      success: true,
      message,
      likes: project.likes,
      isLiked: likedIndex === -1
    });
  } catch (error) {
    console.error('Like project error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Join project
// @route   POST /api/projects/:id/join
// @access  Private
const joinProject = async (req, res) => {
  try {
    const { role } = req.body;
    
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if already a member
    const alreadyMember = project.members.some(
      member => member.user.toString() === req.user.id
    );

    if (alreadyMember) {
      return res.status(400).json({
        success: false,
        message: 'Already a member of this project'
      });
    }

    // Add member
    project.members.push({
      user: req.user.id,
      role: role || 'contributor',
      joinedAt: new Date()
    });

    await project.save();
    await project.populate('members.user', 'name role department avatar');

    res.json({
      success: true,
      message: 'Successfully joined project',
      project
    });
  } catch (error) {
    console.error('Join project error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Leave project
// @route   DELETE /api/projects/:id/leave
// @access  Private
const leaveProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if owner trying to leave
    if (project.owner.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Project owner cannot leave the project'
      });
    }

    // Find and remove member
    const memberIndex = project.members.findIndex(
      member => member.user.toString() === req.user.id
    );

    if (memberIndex === -1) {
      return res.status(400).json({
        success: false,
        message: 'Not a member of this project'
      });
    }

    project.members.splice(memberIndex, 1);
    await project.save();

    res.json({
      success: true,
      message: 'Successfully left project'
    });
  } catch (error) {
    console.error('Leave project error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get project members
// @route   GET /api/projects/:id/members
// @access  Private
const getProjectMembers = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('members.user', 'name email role department avatar bio');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.json({
      success: true,
      members: project.members,
      count: project.members.length
    });
  } catch (error) {
    console.error('Get project members error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  likeProject,
  joinProject,
  leaveProject,
  getProjectMembers
};