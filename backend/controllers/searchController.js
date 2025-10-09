const Event = require('../models/Event');
const Project = require('../models/Project');
const ForumPost = require('../models/ForumPost');
const Team = require('../models/Team');
const ClassGroup = require('../models/ClassGroup');

// @desc    Search events
// @route   GET /api/events/search
// @access  Private
const searchEvents = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.json({
        success: true,
        data: []
      });
    }

    const searchQuery = {
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { location: { $regex: q, $options: 'i' } },
        { tags: { $regex: q, $options: 'i' } }
      ],
      isActive: true
    };

    const events = await Event.find(searchQuery)
      .populate('organizer', 'name email')
      .sort({ createdAt: -1 })
      .limit(20);

    const formattedEvents = events.map(event => ({
      _id: event._id,
      title: event.title,
      description: event.description,
      category: event.category,
      organizerName: event.organizer?.name || 'Unknown',
      date: event.date,
      location: event.location,
      tags: event.tags || []
    }));

    res.json({
      success: true,
      data: formattedEvents
    });
  } catch (error) {
    console.error('Search events error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Search projects
// @route   GET /api/projects/search
// @access  Private
const searchProjects = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.json({
        success: true,
        data: []
      });
    }

    const searchQuery = {
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { technologies: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } }
      ],
      isPublic: true
    };

    const projects = await Project.find(searchQuery)
      .populate('owner', 'name email')
      .sort({ createdAt: -1 })
      .limit(20);

    const formattedProjects = projects.map(project => ({
      _id: project._id,
      title: project.title,
      description: project.description,
      category: project.category,
      ownerName: project.owner?.name || 'Unknown',
      createdAt: project.createdAt,
      technologies: project.technologies || []
    }));

    res.json({
      success: true,
      data: formattedProjects
    });
  } catch (error) {
    console.error('Search projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Search forum posts
// @route   GET /api/forums/search
// @access  Private
const searchForumPosts = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.json({
        success: true,
        data: []
      });
    }

    const searchQuery = {
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { content: { $regex: q, $options: 'i' } },
        { tags: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } }
      ],
      isActive: true
    };

    const posts = await ForumPost.find(searchQuery)
      .populate('author', 'name email')
      .sort({ createdAt: -1 })
      .limit(20);

    const formattedPosts = posts.map(post => ({
      _id: post._id,
      title: post.title,
      content: post.content,
      category: post.category,
      authorName: post.author?.name || 'Unknown',
      createdAt: post.createdAt,
      tags: post.tags || []
    }));

    res.json({
      success: true,
      data: formattedPosts
    });
  } catch (error) {
    console.error('Search forum posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Search teams
// @route   GET /api/teams/search
// @access  Private
const searchTeams = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.json({
        success: true,
        data: []
      });
    }

    const searchQuery = {
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { skills: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } }
      ],
      isActive: true
    };

    const teams = await Team.find(searchQuery)
      .populate('leader', 'name email')
      .sort({ createdAt: -1 })
      .limit(20);

    const formattedTeams = teams.map(team => ({
      _id: team._id,
      name: team.name,
      description: team.description,
      category: team.category,
      leaderName: team.leader?.name || 'Unknown',
      createdAt: team.createdAt,
      skills: team.skills || []
    }));

    res.json({
      success: true,
      data: formattedTeams
    });
  } catch (error) {
    console.error('Search teams error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Search class groups
// @route   GET /api/class-groups/search
// @access  Private
const searchClassGroups = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.json({
        success: true,
        data: []
      });
    }

    const searchQuery = {
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { subject: { $regex: q, $options: 'i' } },
        { courseCode: { $regex: q, $options: 'i' } }
      ],
      isActive: true
    };

    const classGroups = await ClassGroup.find(searchQuery)
      .populate('teacher', 'name email')
      .sort({ createdAt: -1 })
      .limit(20);

    const formattedClassGroups = classGroups.map(classGroup => ({
      _id: classGroup._id,
      name: classGroup.name,
      description: classGroup.description,
      subject: classGroup.subject,
      courseCode: classGroup.courseCode,
      semester: classGroup.semester,
      teacherName: classGroup.teacher?.name || 'Unknown',
      createdAt: classGroup.createdAt
    }));

    res.json({
      success: true,
      data: formattedClassGroups
    });
  } catch (error) {
    console.error('Search class groups error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  searchEvents,
  searchProjects,
  searchForumPosts,
  searchTeams,
  searchClassGroups
};
