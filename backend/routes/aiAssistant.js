const express = require('express');
const { OpenAI } = require('openai');
const User = require('../models/User');
const Event = require('../models/Event');
const Project = require('../models/Project');
const Team = require('../models/Team');
const ForumPost = require('../models/ForumPost');
const ClassGroup = require('../models/ClassGroup');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Initialize OpenAI only if API key is available
let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
}

// @desc    Test AI Assistant endpoint
// @route   GET /api/assistant/test
// @access  Private
router.get('/test', protect, async (req, res) => {
  try {
    console.log('Test endpoint called by user:', req.user?.id);
    res.status(200).json({
      success: true,
      message: 'AI Assistant test endpoint working',
      user: {
        id: req.user.id,
        name: req.user.name,
        role: req.user.role
      }
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Test endpoint error'
    });
  }
});

// @desc    Chat with AI Assistant
// @route   POST /api/assistant
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    console.log('AI Assistant request received:', { userId: req.user?.id, message: req.body?.message });
    
    // Check if OpenAI is configured
    if (!openai) {
      console.log('OpenAI not configured, returning 503');
      return res.status(503).json({
        success: false,
        message: 'AI Assistant is not configured. Please contact administrator.'
      });
    }

    const { message } = req.body;
    const userId = req.user.id;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    console.log('Fetching user data for userId:', userId);
    // Fetch user data
    const user = await User.findById(userId).select('name department year role skills bio');
    
    if (!user) {
      console.log('User not found for userId:', userId);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('User found:', { name: user.name, role: user.role });

    console.log('Fetching platform data...');
    
    // Test each query individually to identify the problematic one
    let events, projects, teams, forumPosts, classGroups;
    
    try {
      console.log('Fetching events...');
      events = await Event.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title description category date location');
      console.log('Events fetched successfully:', events.length);
    } catch (error) {
      console.error('Error fetching events:', error);
      events = [];
    }
    
    try {
      console.log('Fetching projects...');
      projects = await Project.find({ $or: [{ owner: userId }, { members: userId }] })
        .sort({ createdAt: -1 })
        .limit(3)
        .select('title description technologies category status');
      console.log('Projects fetched successfully:', projects.length);
    } catch (error) {
      console.error('Error fetching projects:', error);
      projects = [];
    }
    
    try {
      console.log('Fetching teams...');
      teams = await Team.find({ $or: [{ leader: userId }, { members: userId }] })
        .sort({ createdAt: -1 })
        .limit(3)
        .select('name description type tags');
      console.log('Teams fetched successfully:', teams.length);
    } catch (error) {
      console.error('Error fetching teams:', error);
      teams = [];
    }
    
    try {
      console.log('Fetching forum posts...');
      forumPosts = await ForumPost.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title content category authorName');
      console.log('Forum posts fetched successfully:', forumPosts.length);
    } catch (error) {
      console.error('Error fetching forum posts:', error);
      forumPosts = [];
    }
    
    try {
      console.log('Fetching class groups...');
      if (user.role === 'student' || user.role === 'faculty') {
        classGroups = await ClassGroup.find({ 
          $or: [
            { teacher: userId },
            { 'students.user': userId }
          ]
        })
        .sort({ createdAt: -1 })
        .limit(3)
        .select('name subject courseCode semester');
      } else {
        classGroups = [];
      }
      console.log('Class groups fetched successfully:', classGroups.length);
    } catch (error) {
      console.error('Error fetching class groups:', error);
      classGroups = [];
    }

    console.log('Platform data fetched:', { 
      eventsCount: events.length, 
      projectsCount: projects.length, 
      teamsCount: teams.length,
      forumPostsCount: forumPosts.length,
      classGroupsCount: classGroups.length
    });

    // For testing without OpenAI, return a simple response
    if (!process.env.OPENAI_API_KEY) {
      console.log('No OpenAI API key, returning test response');
      return res.status(200).json({
        success: true,
        data: {
          reply: `Hello ${user.name}! I can see you're a ${user.role} in the ${user.department} department. I found ${events.length} events, ${projects.length} projects, and ${teams.length} teams on the platform. However, I need to be configured with an OpenAI API key to provide intelligent responses. Please contact your administrator to set this up.`,
          timestamp: new Date().toISOString()
        }
      });
    }

    // Build context for AI
    const context = `
You are CollegeConnect Copilot — a friendly AI assistant for students and faculty at a college platform.

USER PROFILE:
- Name: ${user.name}
- Role: ${user.role}
- Department: ${user.department || 'Not specified'}
- Year: ${user.year || 'Not specified'}
- Skills: ${user.skills ? user.skills.join(', ') : 'None listed'}
- Bio: ${user.bio || 'No bio available'}

RECENT PLATFORM ACTIVITY:
- Upcoming Events: ${events.map(e => `${e.title} (${e.category}) - ${e.date}`).join(', ') || 'No events'}
- User's Projects: ${projects.map(p => `${p.title} (${p.category}) - ${p.status}`).join(', ') || 'No projects'}
- User's Teams: ${teams.map(t => `${t.name} (${t.type})`).join(', ') || 'No teams'}
- Recent Forum Posts: ${forumPosts.map(f => `${f.title} by ${f.authorName}`).join(', ') || 'No recent posts'}
- Class Groups: ${classGroups.map(c => `${c.name} (${c.courseCode})`).join(', ') || 'No class groups'}

PLATFORM CAPABILITIES:
- Events: Create, join, and manage college events
- Projects: Showcase and collaborate on projects
- Teams: Join clubs, project teams, and competitions
- Forums: Ask questions and share knowledge
- Class Groups: Private classes with assignments (for students/faculty)
- Team Chat: Real-time messaging for team collaboration

USER'S QUESTION: "${message}"

Please provide a helpful, personalized response based on the user's profile and platform data. Be friendly, informative, and suggest relevant actions they can take on the platform when appropriate.
`;

    // Send to OpenAI
    console.log('Sending request to OpenAI...');
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are CollegeConnect Copilot, an AI assistant for a college engagement platform. You help students and faculty with:
- Answering questions about the platform
- Suggesting relevant events, projects, and teams
- Providing academic and career advice
- Helping with project ideas and collaboration
- Explaining platform features
- Offering personalized recommendations

Be helpful, friendly, and encouraging. Use the user's profile and platform data to provide personalized responses.`
        },
        {
          role: 'user',
          content: context
        }
      ],
      max_tokens: 500,
      temperature: 0.7
    });

    console.log('OpenAI response received');
    const aiReply = response.choices[0].message.content;

    res.status(200).json({
      success: true,
      data: {
        reply: aiReply,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('AI Assistant Error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    
    // Handle OpenAI API errors
    if (error.code === 'insufficient_quota') {
      return res.status(503).json({
        success: false,
        message: 'AI service temporarily unavailable. Please try again later.'
      });
    }
    
    if (error.code === 'invalid_api_key') {
      return res.status(500).json({
        success: false,
        message: 'AI service configuration error.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again.'
    });
  }
});

// @desc    Get AI Assistant suggestions
// @route   GET /api/assistant/suggestions
// @access  Private
router.get('/suggestions', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('name role department year skills');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate contextual suggestions based on user profile
    const suggestions = [];

    if (user.role === 'student') {
      suggestions.push(
        'What events are happening this week?',
        'Help me find project ideas for my portfolio',
        'How can I improve my resume?',
        'What teams can I join in my department?',
        'Show me recent forum discussions'
      );
    } else if (user.role === 'faculty') {
      suggestions.push(
        'How can I create engaging class activities?',
        'What are the latest trends in education?',
        'Help me organize a workshop',
        'How to encourage student participation?',
        'What resources are available for faculty?'
      );
    } else if (user.role === 'admin') {
      suggestions.push(
        'How is the platform performing?',
        'What analytics should I focus on?',
        'How to improve user engagement?',
        'What new features should we consider?',
        'How to handle platform maintenance?'
      );
    }

    // Add general suggestions
    suggestions.push(
      'Tell me about CollegeConnect features',
      'How can I collaborate with others?',
      'What are some networking tips?',
      'Help me with time management',
      'How to make the most of college life?'
    );

    res.status(200).json({
      success: true,
      data: {
        suggestions: suggestions.slice(0, 8) // Limit to 8 suggestions
      }
    });

  } catch (error) {
    console.error('AI Suggestions Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get suggestions'
    });
  }
});

module.exports = router;
