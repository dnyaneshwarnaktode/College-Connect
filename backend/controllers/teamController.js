const Team = require('../models/Team');
const User = require('../models/User');

// @desc    Get all teams
// @route   GET /api/teams
// @access  Public
const getTeams = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build query
    let query = { isActive: true };

    // Search functionality
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { tags: { $in: [searchRegex] } }
      ];
    }

    // Filter by type
    if (req.query.type && req.query.type !== 'all') {
      query.type = req.query.type;
    }

    // Filter by availability
    if (req.query.isOpen !== undefined) {
      query.isOpen = req.query.isOpen === 'true';
    }

    // Filter by leader
    if (req.query.leader) {
      query.leader = req.query.leader;
    }

    const teams = await Team.find(query)
      .populate('leader', 'name role department avatar')
      .populate('members.user', 'name role department avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Team.countDocuments(query);

    res.json({
      success: true,
      count: teams.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      teams
    });
  } catch (error) {
    console.error('Get teams error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single team
// @route   GET /api/teams/:id
// @access  Public
const getTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('leader', 'name role department avatar bio')
      .populate('members.user', 'name role department avatar');

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    if (!team.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Team is not active'
      });
    }

    res.json({
      success: true,
      team
    });
  } catch (error) {
    console.error('Get team error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create team
// @route   POST /api/teams
// @access  Private
const createTeam = async (req, res) => {
  try {
    const {
      name,
      description,
      type,
      maxMembers,
      isOpen,
      tags,
      requirements,
      meetingSchedule,
      socialLinks
    } = req.body;

    const team = await Team.create({
      name,
      description,
      type,
      maxMembers,
      isOpen: isOpen !== undefined ? isOpen : true,
      tags: tags || [],
      requirements: requirements || [],
      meetingSchedule: meetingSchedule || {},
      socialLinks: socialLinks || {},
      leader: req.user.id
    });

    await team.populate('leader', 'name role department avatar');

    res.status(201).json({
      success: true,
      message: 'Team created successfully',
      team
    });
  } catch (error) {
    console.error('Create team error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update team
// @route   PUT /api/teams/:id
// @access  Private (Leader/Admin)
const updateTeam = async (req, res) => {
  try {
    const {
      name,
      description,
      type,
      maxMembers,
      isOpen,
      tags,
      requirements,
      meetingSchedule,
      socialLinks,
      isActive
    } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (type) updateData.type = type;
    if (maxMembers) updateData.maxMembers = maxMembers;
    if (isOpen !== undefined) updateData.isOpen = isOpen;
    if (tags) updateData.tags = tags;
    if (requirements) updateData.requirements = requirements;
    if (meetingSchedule) updateData.meetingSchedule = meetingSchedule;
    if (socialLinks) updateData.socialLinks = socialLinks;
    if (isActive !== undefined) updateData.isActive = isActive;

    const team = await Team.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('leader', 'name role department avatar')
     .populate('members.user', 'name role department avatar');

    res.json({
      success: true,
      message: 'Team updated successfully',
      team
    });
  } catch (error) {
    console.error('Update team error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete team
// @route   DELETE /api/teams/:id
// @access  Private (Leader/Admin)
const deleteTeam = async (req, res) => {
  try {
    await Team.findByIdAndDelete(req.params.id);

    // Remove team from users' joined teams
    await User.updateMany(
      { joinedTeams: req.params.id },
      { $pull: { joinedTeams: req.params.id } }
    );

    res.json({
      success: true,
      message: 'Team deleted successfully'
    });
  } catch (error) {
    console.error('Delete team error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Join team
// @route   POST /api/teams/:id/join
// @access  Private
const joinTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    if (!team.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Team is not active'
      });
    }

    if (!team.isOpen) {
      return res.status(400).json({
        success: false,
        message: 'Team is not accepting new members'
      });
    }

    // Check if already a member
    const alreadyMember = team.members.some(
      member => member.user.toString() === req.user.id && member.isActive
    );

    if (alreadyMember) {
      return res.status(400).json({
        success: false,
        message: 'Already a member of this team'
      });
    }

    // Check capacity
    const activeMembers = team.members.filter(member => member.isActive);
    if (activeMembers.length >= team.maxMembers) {
      return res.status(400).json({
        success: false,
        message: 'Team is full'
      });
    }

    // Add member
    team.members.push({
      user: req.user.id,
      role: 'member',
      joinedAt: new Date(),
      isActive: true
    });

    await team.save();

    // Add team to user's joined teams
    await User.findByIdAndUpdate(
      req.user.id,
      { $addToSet: { joinedTeams: team._id } }
    );

    await team.populate('members.user', 'name role department avatar');

    res.json({
      success: true,
      message: 'Successfully joined team',
      team
    });
  } catch (error) {
    console.error('Join team error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Leave team
// @route   DELETE /api/teams/:id/leave
// @access  Private
const leaveTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // Check if leader trying to leave
    if (team.leader.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Team leader cannot leave the team. Transfer leadership first or delete the team.'
      });
    }

    // Find and deactivate member
    const member = team.members.find(
      member => member.user.toString() === req.user.id && member.isActive
    );

    if (!member) {
      return res.status(400).json({
        success: false,
        message: 'Not an active member of this team'
      });
    }

    member.isActive = false;
    await team.save();

    // Remove team from user's joined teams
    await User.findByIdAndUpdate(
      req.user.id,
      { $pull: { joinedTeams: team._id } }
    );

    res.json({
      success: true,
      message: 'Successfully left team'
    });
  } catch (error) {
    console.error('Leave team error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get team members
// @route   GET /api/teams/:id/members
// @access  Private
const getTeamMembers = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('members.user', 'name email role department avatar bio');

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    const activeMembers = team.members.filter(member => member.isActive);

    res.json({
      success: true,
      members: activeMembers,
      count: activeMembers.length,
      maxMembers: team.maxMembers
    });
  } catch (error) {
    console.error('Get team members error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update member role
// @route   PUT /api/teams/:id/members/:memberId
// @access  Private (Leader/Admin)
const updateMemberRole = async (req, res) => {
  try {
    const { role } = req.body;
    const { id: teamId, memberId } = req.params;

    const team = await Team.findById(teamId);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    const member = team.members.id(memberId);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    // Validate role
    const validRoles = ['leader', 'co-leader', 'member'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role'
      });
    }

    // If promoting to leader, demote current leader
    if (role === 'leader') {
      const currentLeader = team.members.find(
        m => m.user.toString() === team.leader.toString()
      );
      if (currentLeader) {
        currentLeader.role = 'co-leader';
      }
      team.leader = member.user;
    }

    member.role = role;
    await team.save();

    res.json({
      success: true,
      message: 'Member role updated successfully',
      member
    });
  } catch (error) {
    console.error('Update member role error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getTeams,
  getTeam,
  createTeam,
  updateTeam,
  deleteTeam,
  joinTeam,
  leaveTeam,
  getTeamMembers,
  updateMemberRole
};