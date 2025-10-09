const Challenge = require('../models/Challenge');
const ChallengeSubmission = require('../models/ChallengeSubmission');
const UserStats = require('../models/UserStats');
const User = require('../models/User');

// @desc    Get all challenges with filtering and pagination
// @route   GET /api/challenges
// @access  Public
const getChallenges = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      difficulty,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {
      isActive: true,
      isPublished: true
    };

    if (category) {
      query.category = category;
    }

    if (difficulty) {
      query.difficulty = difficulty;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const skip = (page - 1) * limit;
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const challenges = await Challenge.find(query)
      .populate('createdBy', 'name')
      .select('-solution -testCases')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip(skip);

    const totalChallenges = await Challenge.countDocuments(query);

    res.json({
      success: true,
      data: {
        challenges,
        pagination: {
          current: page,
          pages: Math.ceil(totalChallenges / limit),
          total: totalChallenges
        }
      }
    });
  } catch (error) {
    console.error('Error fetching challenges:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single challenge by ID
// @route   GET /api/challenges/:id
// @access  Public
const getChallenge = async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id)
      .populate('createdBy', 'name')
      .select('-solution -testCases');

    if (!challenge || !challenge.isActive || !challenge.isPublished) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    res.json({
      success: true,
      data: challenge
    });
  } catch (error) {
    console.error('Error fetching challenge:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create new challenge
// @route   POST /api/challenges
// @access  Private (Faculty/Admin only)
const createChallenge = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      difficulty,
      points,
      timeLimit,
      problemStatement,
      inputFormat,
      outputFormat,
      constraints,
      sampleInput,
      testCases,
      hints,
      solution,
      tags
    } = req.body;

    // Check if user has permission to create challenges
    if (req.user.role !== 'faculty' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Faculty or admin role required.' });
    }

    const challenge = await Challenge.create({
      title,
      description,
      category,
      difficulty,
      points,
      timeLimit,
      problemStatement,
      inputFormat,
      outputFormat,
      constraints,
      sampleInput,
      testCases,
      hints,
      solution,
      tags,
      createdBy: req.user.id
    });

    const populatedChallenge = await Challenge.findById(challenge._id)
      .populate('createdBy', 'name');

    res.status(201).json({
      success: true,
      data: populatedChallenge
    });
  } catch (error) {
    console.error('Error creating challenge:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update challenge
// @route   PUT /api/challenges/:id
// @access  Private (Creator or Admin only)
const updateChallenge = async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);

    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    // Check if user has permission to update
    if (challenge.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedChallenge = await Challenge.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name');

    res.json({
      success: true,
      data: updatedChallenge
    });
  } catch (error) {
    console.error('Error updating challenge:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete challenge
// @route   DELETE /api/challenges/:id
// @access  Private (Creator or Admin only)
const deleteChallenge = async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);

    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    // Check if user has permission to delete
    if (challenge.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    challenge.isActive = false;
    await challenge.save();

    res.json({
      success: true,
      message: 'Challenge deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting challenge:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Submit solution for challenge
// @route   POST /api/challenges/:id/submit
// @access  Private
const submitSolution = async (req, res) => {
  try {
    const { code, language } = req.body;
    const challengeId = req.params.id;

    const challenge = await Challenge.findById(challengeId);
    if (!challenge || !challenge.isActive || !challenge.isPublished) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    // Check if user already solved this challenge
    const existingSubmission = await ChallengeSubmission.findOne({
      user: req.user.id,
      challenge: challengeId,
      isCorrect: true
    });

    if (existingSubmission) {
      return res.status(400).json({ message: 'Challenge already solved' });
    }

    // Simulate code execution and testing
    const startTime = Date.now();
    const testResults = [];
    let isCorrect = true;
    let errorMessage = null;

    // Mock test execution (in real implementation, this would use a code execution service)
    for (let i = 0; i < challenge.testCases.length; i++) {
      const testCase = challenge.testCases[i];
      
      // Simulate execution time and memory usage
      const executionTime = Math.random() * 1000; // 0-1000ms
      const memoryUsage = Math.random() * 50; // 0-50MB
      
      // Mock result (in real implementation, this would be actual test execution)
      const passed = Math.random() > 0.3; // 70% success rate for demo
      
      testResults.push({
        testCase: testCase._id,
        passed,
        actualOutput: passed ? testCase.expectedOutput : 'Wrong output',
        executionTime,
        memoryUsage
      });

      if (!passed) {
        isCorrect = false;
        errorMessage = 'Wrong Answer';
      }
    }

    const timeTaken = (Date.now() - startTime) / 1000 / 60; // Convert to minutes
    const memoryUsed = Math.random() * 100; // Mock memory usage

    // Create submission
    const submission = await ChallengeSubmission.create({
      user: req.user.id,
      challenge: challengeId,
      code,
      language,
      status: isCorrect ? 'accepted' : 'wrong-answer',
      timeTaken,
      memoryUsed,
      testResults,
      errorMessage,
      isCorrect
    });

    // Calculate score if correct
    if (isCorrect) {
      submission.calculateScore(challenge.points);
      await submission.save();

      // Update challenge statistics
      await challenge.updateStats(true, timeTaken);

      // Update user stats
      let userStats = await UserStats.findOne({ user: req.user.id });
      if (!userStats) {
        userStats = await UserStats.create({ user: req.user.id });
      }
      await userStats.updateStats(challenge, submission);

      // Update leaderboard ranks
      await updateLeaderboardRanks();
    } else {
      await challenge.updateStats(false, timeTaken);
    }

    res.status(201).json({
      success: true,
      data: submission
    });
  } catch (error) {
    console.error('Error submitting solution:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user's submissions for a challenge
// @route   GET /api/challenges/:id/submissions
// @access  Private
const getUserSubmissions = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const submissions = await ChallengeSubmission.find({
      user: req.user.id,
      challenge: req.params.id
    })
      .sort({ submittedAt: -1 })
      .limit(limit * 1)
      .skip(skip);

    const totalSubmissions = await ChallengeSubmission.countDocuments({
      user: req.user.id,
      challenge: req.params.id
    });

    res.json({
      success: true,
      data: {
        submissions,
        pagination: {
          current: page,
          pages: Math.ceil(totalSubmissions / limit),
          total: totalSubmissions
        }
      }
    });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get challenge categories and difficulties
// @route   GET /api/challenges/filters
// @access  Public
const getChallengeFilters = async (req, res) => {
  try {
    const categories = await Challenge.distinct('category', { isActive: true, isPublished: true });
    const difficulties = await Challenge.distinct('difficulty', { isActive: true, isPublished: true });
    const tags = await Challenge.distinct('tags', { isActive: true, isPublished: true });

    res.json({
      success: true,
      data: {
        categories,
        difficulties,
        tags: tags.filter(tag => tag).sort()
      }
    });
  } catch (error) {
    console.error('Error fetching filters:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper function to update leaderboard ranks
const updateLeaderboardRanks = async () => {
  try {
    const users = await UserStats.find({})
      .sort({ totalScore: -1, challengesSolved: -1 })
      .select('user totalScore challengesSolved');

    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const newRank = i + 1;
      
      if (user.rank !== newRank) {
        user.previousRank = user.rank;
        user.rank = newRank;
        user.rankUpdatedAt = new Date();
        await user.save();
      }
    }
  } catch (error) {
    console.error('Error updating leaderboard ranks:', error);
  }
};

module.exports = {
  getChallenges,
  getChallenge,
  createChallenge,
  updateChallenge,
  deleteChallenge,
  submitSolution,
  getUserSubmissions,
  getChallengeFilters
};