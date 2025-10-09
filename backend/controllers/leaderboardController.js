const UserStats = require('../models/UserStats');
const User = require('../models/User');
const Challenge = require('../models/Challenge');
const ChallengeSubmission = require('../models/ChallengeSubmission');

// @desc    Get leaderboard
// @route   GET /api/leaderboard
// @access  Public
const getLeaderboard = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      category,
      timeframe = 'all' // all, week, month
    } = req.query;

    const skip = (page - 1) * limit;
    let query = {};

    // Filter by timeframe
    if (timeframe !== 'all') {
      const now = new Date();
      let startDate;

      switch (timeframe) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = null;
      }

      if (startDate) {
        // Get users who have submissions in the timeframe
        const activeUsers = await ChallengeSubmission.distinct('user', {
          submittedAt: { $gte: startDate },
          isCorrect: true
        });

        query.user = { $in: activeUsers };
      }
    }

    const leaderboard = await UserStats.find(query)
      .populate('user', 'name avatar department year')
      .sort({ totalScore: -1, challengesSolved: -1, currentStreak: -1 })
      .limit(limit * 1)
      .skip(skip);

    const totalUsers = await UserStats.countDocuments(query);

    // Add rank to each user
    const rankedLeaderboard = leaderboard.map((user, index) => ({
      ...user.toObject(),
      rank: skip + index + 1
    }));

    res.json({
      success: true,
      data: {
        leaderboard: rankedLeaderboard,
        pagination: {
          current: page,
          pages: Math.ceil(totalUsers / limit),
          total: totalUsers
        }
      }
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user's rank and stats
// @route   GET /api/leaderboard/user/:userId
// @access  Public
const getUserRank = async (req, res) => {
  try {
    const { userId } = req.params;

    const userStats = await UserStats.findOne({ user: userId })
      .populate('user', 'name avatar department year');

    if (!userStats) {
      return res.status(404).json({ message: 'User stats not found' });
    }

    // Calculate current rank
    const rank = await UserStats.countDocuments({
      $or: [
        { totalScore: { $gt: userStats.totalScore } },
        {
          totalScore: userStats.totalScore,
          challengesSolved: { $gt: userStats.challengesSolved }
        },
        {
          totalScore: userStats.totalScore,
          challengesSolved: userStats.challengesSolved,
          currentStreak: { $gt: userStats.currentStreak }
        }
      ]
    }) + 1;

    res.json({
      success: true,
      data: {
        ...userStats.toObject(),
        rank
      }
    });
  } catch (error) {
    console.error('Error fetching user rank:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get category-wise leaderboard
// @route   GET /api/leaderboard/category/:category
// @access  Public
const getCategoryLeaderboard = async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const skip = (page - 1) * limit;

    // Get users who have solved challenges in this category
    const categoryUsers = await UserStats.find({
      [`categoryStats.${category}.solved`]: { $gt: 0 }
    })
      .populate('user', 'name avatar department year')
      .sort({ [`categoryStats.${category}.score`]: -1, [`categoryStats.${category}.solved`]: -1 })
      .limit(limit * 1)
      .skip(skip);

    const totalUsers = await UserStats.countDocuments({
      [`categoryStats.${category}.solved`]: { $gt: 0 }
    });

    // Add rank to each user
    const rankedLeaderboard = categoryUsers.map((user, index) => ({
      ...user.toObject(),
      rank: skip + index + 1,
      categoryScore: user.categoryStats[category]?.score || 0,
      categorySolved: user.categoryStats[category]?.solved || 0
    }));

    res.json({
      success: true,
      data: {
        leaderboard: rankedLeaderboard,
        category,
        pagination: {
          current: page,
          pages: Math.ceil(totalUsers / limit),
          total: totalUsers
        }
      }
    });
  } catch (error) {
    console.error('Error fetching category leaderboard:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get streak leaderboard
// @route   GET /api/leaderboard/streaks
// @access  Public
const getStreakLeaderboard = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;

    const streakLeaderboard = await UserStats.find({})
      .populate('user', 'name avatar department year')
      .sort({ currentStreak: -1, longestStreak: -1 })
      .limit(limit * 1)
      .skip(skip);

    const totalUsers = await UserStats.countDocuments({});

    // Add rank to each user
    const rankedLeaderboard = streakLeaderboard.map((user, index) => ({
      ...user.toObject(),
      rank: skip + index + 1
    }));

    res.json({
      success: true,
      data: {
        leaderboard: rankedLeaderboard,
        pagination: {
          current: page,
          pages: Math.ceil(totalUsers / limit),
          total: totalUsers
        }
      }
    });
  } catch (error) {
    console.error('Error fetching streak leaderboard:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get global statistics
// @route   GET /api/leaderboard/stats
// @access  Public
const getGlobalStats = async (req, res) => {
  try {
    const totalUsers = await UserStats.countDocuments({});
    const totalChallenges = await Challenge.countDocuments({ isActive: true, isPublished: true });
    const totalSubmissions = await ChallengeSubmission.countDocuments({});
    const totalSolved = await ChallengeSubmission.countDocuments({ isCorrect: true });

    // Get top performers
    const topScorer = await UserStats.findOne({})
      .populate('user', 'name')
      .sort({ totalScore: -1 });

    const longestStreak = await UserStats.findOne({})
      .populate('user', 'name')
      .sort({ longestStreak: -1 });

    const mostSolved = await UserStats.findOne({})
      .populate('user', 'name')
      .sort({ challengesSolved: -1 });

    // Category statistics
    const categoryStats = {};
    const categories = ['dsa', 'aptitude', 'programming', 'web-development', 'mobile-development', 'ai-ml'];
    
    for (const category of categories) {
      const categoryUsers = await UserStats.countDocuments({
        [`categoryStats.${category}.solved`]: { $gt: 0 }
      });
      categoryStats[category] = categoryUsers;
    }

    res.json({
      success: true,
      data: {
        totalUsers,
        totalChallenges,
        totalSubmissions,
        totalSolved,
        successRate: totalSubmissions > 0 ? Math.round((totalSolved / totalSubmissions) * 100) : 0,
        topScorer: topScorer ? {
          name: topScorer.user.name,
          score: topScorer.totalScore
        } : null,
        longestStreak: longestStreak ? {
          name: longestStreak.user.name,
          streak: longestStreak.longestStreak
        } : null,
        mostSolved: mostSolved ? {
          name: mostSolved.user.name,
          solved: mostSolved.challengesSolved
        } : null,
        categoryStats
      }
    });
  } catch (error) {
    console.error('Error fetching global stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user's achievements
// @route   GET /api/leaderboard/achievements/:userId
// @access  Public
const getUserAchievements = async (req, res) => {
  try {
    const { userId } = req.params;

    const userStats = await UserStats.findOne({ user: userId })
      .populate('user', 'name avatar');

    if (!userStats) {
      return res.status(404).json({ message: 'User stats not found' });
    }

    res.json({
      success: true,
      data: {
        achievements: userStats.achievements,
        totalAchievements: userStats.achievements.length
      }
    });
  } catch (error) {
    console.error('Error fetching user achievements:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getLeaderboard,
  getUserRank,
  getCategoryLeaderboard,
  getStreakLeaderboard,
  getGlobalStats,
  getUserAchievements
};