const User = require('../models/User');
const Event = require('../models/Event');
const ForumPost = require('../models/ForumPost');
const Project = require('../models/Project');
const Team = require('../models/Team');

// @desc    Get public home page statistics
// @route   GET /api/analytics/public-stats
// @access  Public
const getPublicStats = async (req, res) => {
  try {
    // Get basic counts for home page
    const totalUsers = await User.countDocuments({ isActive: true });
    const totalEvents = await Event.countDocuments({ isActive: true });
    const totalProjects = await Project.countDocuments({ isPublic: true });
    const totalPosts = await ForumPost.countDocuments();

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalEvents,
        totalProjects,
        totalPosts
      }
    });
  } catch (error) {
    console.error('Get public stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/analytics/dashboard
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    const timeRange = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - timeRange);

    // Get all events with registrations
    const events = await Event.find({ isActive: true })
      .populate('registeredUsers.user', 'name email')
      .lean();

    // Get all forum posts with replies and likes
    const posts = await ForumPost.find()
      .populate('author', 'name')
      .populate('replies.author', 'name')
      .lean();

    // Get all projects with status
    const projects = await Project.find({ isPublic: true })
      .populate('members.user', 'name')
      .lean();

    // Get all teams with open status
    const teams = await Team.find({ isActive: true })
      .populate('members.user', 'name')
      .lean();

    // Basic counts
    const totalUsers = await User.countDocuments({ isActive: true });
    const totalEvents = events.length;
    const totalPosts = posts.length;
    const totalProjects = projects.length;
    const totalTeams = teams.length;

    // Recent activity counts
    const recentUsers = await User.countDocuments({
      createdAt: { $gte: startDate },
      isActive: true
    });
    const recentEvents = await Event.countDocuments({
      createdAt: { $gte: startDate },
      isActive: true
    });
    const recentPosts = await ForumPost.countDocuments({
      createdAt: { $gte: startDate }
    });
    const recentProjects = await Project.countDocuments({
      createdAt: { $gte: startDate },
      isPublic: true
    });

    // Calculate registrations, likes, replies
    const totalRegistrations = events.reduce((sum, event) => sum + (event.registeredUsers?.length || 0), 0);
    const totalLikes = posts.reduce((sum, post) => sum + (post.likes || 0), 0);
    const totalReplies = posts.reduce((sum, post) => sum + (post.replies?.length || 0), 0);
    const activeProjects = projects.filter(p => p.status === 'active').length;
    const openTeams = teams.filter(t => t.isOpen).length;

    // Growth percentages (mock calculation)
    const userGrowth = totalUsers > 0 ? Math.round((recentUsers / totalUsers) * 100) : 0;
    const eventGrowth = totalEvents > 0 ? Math.round((recentEvents / totalEvents) * 100) : 0;
    const postGrowth = totalPosts > 0 ? Math.round((recentPosts / totalPosts) * 100) : 0;
    const projectGrowth = totalProjects > 0 ? Math.round((recentProjects / totalProjects) * 100) : 0;

    res.json({
      success: true,
      stats: {
        overview: {
          totalUsers,
          totalEvents,
          totalPosts,
          totalProjects,
          totalTeams,
          totalRegistrations,
          totalLikes,
          totalReplies,
          activeProjects,
          openTeams
        },
        growth: {
          users: `+${userGrowth}%`,
          events: `+${eventGrowth}%`,
          posts: `+${postGrowth}%`,
          projects: `+${projectGrowth}%`
        },
        recent: {
          users: recentUsers,
          events: recentEvents,
          posts: recentPosts,
          projects: recentProjects
        },
        // Raw data for frontend processing
        events: events.map(event => ({
          _id: event._id,
          title: event.title,
          category: event.category,
          registered: event.registeredUsers?.length || 0,
          capacity: event.capacity,
          createdAt: event.createdAt
        })),
        posts: posts.map(post => ({
          _id: post._id,
          title: post.title,
          category: post.category,
          likes: post.likes || 0,
          replies: post.replies || [],
          createdAt: post.createdAt
        })),
        projects: projects.map(project => ({
          _id: project._id,
          title: project.title,
          status: project.status,
          category: project.category,
          members: project.members || [],
          createdAt: project.createdAt
        })),
        teams: teams.map(team => ({
          _id: team._id,
          name: team.name,
          type: team.type,
          isOpen: team.isOpen,
          members: team.members || [],
          maxMembers: team.maxMembers,
          createdAt: team.createdAt
        }))
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get user analytics
// @route   GET /api/analytics/users
// @access  Private/Admin
const getUserAnalytics = async (req, res) => {
  try {
    // Role distribution
    const roleStats = await User.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    // Department distribution
    const departmentStats = await User.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Registration trends (last 12 months)
    const registrationTrends = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) },
          isActive: true
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      success: true,
      analytics: {
        roleDistribution: roleStats,
        departmentDistribution: departmentStats,
        registrationTrends
      }
    });
  } catch (error) {
    console.error('Get user analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get event analytics
// @route   GET /api/analytics/events
// @access  Private/Admin
const getEventAnalytics = async (req, res) => {
  try {
    // Category distribution
    const categoryStats = await Event.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    // Registration stats
    const registrationStats = await Event.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalCapacity: { $sum: '$capacity' },
          totalRegistered: { $sum: '$registered' },
          averageCapacity: { $avg: '$capacity' },
          averageRegistered: { $avg: '$registered' }
        }
      }
    ]);

    // Upcoming vs past events
    const now = new Date();
    const upcomingEvents = await Event.countDocuments({
      date: { $gte: now },
      isActive: true
    });
    const pastEvents = await Event.countDocuments({
      date: { $lt: now },
      isActive: true
    });

    // Monthly event creation trends
    const eventTrends = await Event.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) },
          isActive: true
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      success: true,
      analytics: {
        categoryDistribution: categoryStats,
        registrationStats: registrationStats[0] || {},
        eventStatus: {
          upcoming: upcomingEvents,
          past: pastEvents
        },
        creationTrends: eventTrends
      }
    });
  } catch (error) {
    console.error('Get event analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get forum analytics
// @route   GET /api/analytics/forums
// @access  Private/Admin
const getForumAnalytics = async (req, res) => {
  try {
    // Category distribution
    const categoryStats = await ForumPost.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    // Engagement stats
    const engagementStats = await ForumPost.aggregate([
      {
        $group: {
          _id: null,
          totalPosts: { $sum: 1 },
          totalLikes: { $sum: '$likes' },
          totalViews: { $sum: '$views' },
          totalReplies: { $sum: { $size: '$replies' } },
          averageLikes: { $avg: '$likes' },
          averageViews: { $avg: '$views' },
          averageReplies: { $avg: { $size: '$replies' } }
        }
      }
    ]);

    // Top contributors
    const topContributors = await ForumPost.aggregate([
      { $group: { _id: '$author', postCount: { $sum: 1 } } },
      { $sort: { postCount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          name: '$user.name',
          role: '$user.role',
          department: '$user.department',
          postCount: 1
        }
      }
    ]);

    // Activity trends
    const activityTrends = await ForumPost.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          posts: { $sum: 1 },
          likes: { $sum: '$likes' },
          replies: { $sum: { $size: '$replies' } }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      success: true,
      analytics: {
        categoryDistribution: categoryStats,
        engagement: engagementStats[0] || {},
        topContributors,
        activityTrends
      }
    });
  } catch (error) {
    console.error('Get forum analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get project analytics
// @route   GET /api/analytics/projects
// @access  Private/Admin
const getProjectAnalytics = async (req, res) => {
  try {
    // Category distribution
    const categoryStats = await Project.aggregate([
      { $match: { isPublic: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    // Status distribution
    const statusStats = await Project.aggregate([
      { $match: { isPublic: true } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Technology trends
    const technologyStats = await Project.aggregate([
      { $match: { isPublic: true } },
      { $unwind: '$technologies' },
      { $group: { _id: '$technologies', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 15 }
    ]);

    // Collaboration stats
    const collaborationStats = await Project.aggregate([
      { $match: { isPublic: true } },
      {
        $group: {
          _id: null,
          totalProjects: { $sum: 1 },
          totalMembers: { $sum: { $size: '$members' } },
          averageMembers: { $avg: { $size: '$members' } },
          totalLikes: { $sum: '$likes' },
          totalViews: { $sum: '$views' }
        }
      }
    ]);

    res.json({
      success: true,
      analytics: {
        categoryDistribution: categoryStats,
        statusDistribution: statusStats,
        technologyTrends: technologyStats,
        collaboration: collaborationStats[0] || {}
      }
    });
  } catch (error) {
    console.error('Get project analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get team analytics
// @route   GET /api/analytics/teams
// @access  Private/Admin
const getTeamAnalytics = async (req, res) => {
  try {
    // Type distribution
    const typeStats = await Team.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    // Membership stats
    const membershipStats = await Team.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalTeams: { $sum: 1 },
          totalMembers: { $sum: { $size: '$members' } },
          averageMembers: { $avg: { $size: '$members' } },
          totalCapacity: { $sum: '$maxMembers' }
        }
      }
    ]);

    // Team size distribution
    const sizeDistribution = await Team.aggregate([
      { $match: { isActive: true } },
      {
        $bucket: {
          groupBy: { $size: '$members' },
          boundaries: [0, 5, 10, 20, 50, 100],
          default: '100+',
          output: { count: { $sum: 1 } }
        }
      }
    ]);

    // Open vs closed teams
    const availabilityStats = await Team.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$isOpen', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      analytics: {
        typeDistribution: typeStats,
        membership: membershipStats[0] || {},
        sizeDistribution,
        availability: availabilityStats
      }
    });
  } catch (error) {
    console.error('Get team analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get engagement metrics
// @route   GET /api/analytics/engagement
// @access  Private/Admin
const getEngagementMetrics = async (req, res) => {
  try {
    const timeRange = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - timeRange);

    // Daily active users (users who logged in recently)
    const activeUsers = await User.countDocuments({
      lastLogin: { $gte: startDate },
      isActive: true
    });

    // Event registrations in time range
    const eventRegistrations = await Event.aggregate([
      {
        $match: {
          'registeredUsers.registeredAt': { $gte: startDate }
        }
      },
      {
        $project: {
          recentRegistrations: {
            $filter: {
              input: '$registeredUsers',
              cond: { $gte: ['$$this.registeredAt', startDate] }
            }
          }
        }
      },
      {
        $group: {
          _id: null,
          totalRegistrations: { $sum: { $size: '$recentRegistrations' } }
        }
      }
    ]);

    // Forum engagement
    const forumEngagement = await ForumPost.aggregate([
      {
        $match: {
          $or: [
            { createdAt: { $gte: startDate } },
            { 'replies.createdAt': { $gte: startDate } }
          ]
        }
      },
      {
        $group: {
          _id: null,
          newPosts: {
            $sum: {
              $cond: [{ $gte: ['$createdAt', startDate] }, 1, 0]
            }
          },
          newReplies: {
            $sum: {
              $size: {
                $filter: {
                  input: '$replies',
                  cond: { $gte: ['$$this.createdAt', startDate] }
                }
              }
            }
          }
        }
      }
    ]);

    // Project and team joins
    const projectJoins = await Project.aggregate([
      {
        $match: {
          'members.joinedAt': { $gte: startDate }
        }
      },
      {
        $project: {
          recentJoins: {
            $filter: {
              input: '$members',
              cond: { $gte: ['$$this.joinedAt', startDate] }
            }
          }
        }
      },
      {
        $group: {
          _id: null,
          totalJoins: { $sum: { $size: '$recentJoins' } }
        }
      }
    ]);

    const teamJoins = await Team.aggregate([
      {
        $match: {
          'members.joinedAt': { $gte: startDate }
        }
      },
      {
        $project: {
          recentJoins: {
            $filter: {
              input: '$members',
              cond: { $gte: ['$$this.joinedAt', startDate] }
            }
          }
        }
      },
      {
        $group: {
          _id: null,
          totalJoins: { $sum: { $size: '$recentJoins' } }
        }
      }
    ]);

    res.json({
      success: true,
      metrics: {
        activeUsers,
        eventRegistrations: eventRegistrations[0]?.totalRegistrations || 0,
        forumActivity: {
          newPosts: forumEngagement[0]?.newPosts || 0,
          newReplies: forumEngagement[0]?.newReplies || 0
        },
        projectJoins: projectJoins[0]?.totalJoins || 0,
        teamJoins: teamJoins[0]?.totalJoins || 0,
        timeRange
      }
    });
  } catch (error) {
    console.error('Get engagement metrics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getPublicStats,
  getDashboardStats,
  getUserAnalytics,
  getEventAnalytics,
  getForumAnalytics,
  getProjectAnalytics,
  getTeamAnalytics,
  getEngagementMetrics
};