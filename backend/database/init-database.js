const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Event = require('../models/Event');
const ForumPost = require('../models/ForumPost');
const Project = require('../models/Project');
const Team = require('../models/Team');

// Sample data
const sampleUsers = [
  {
    name: 'John Admin',
    email: 'admin@college.edu',
    password: 'admin123',
    role: 'admin',
    department: 'Administration',
    bio: 'College Administrator managing student affairs',
    isActive: true
  },
  {
    name: 'Dr. Sarah Wilson',
    email: 'prof@college.edu',
    password: 'faculty123',
    role: 'faculty',
    department: 'Computer Science',
    bio: 'Professor of Computer Science, AI researcher',
    skills: ['Machine Learning', 'Web Development', 'Data Science'],
    isActive: true
  },
  {
    name: 'Alex Johnson',
    email: 'student@college.edu',
    password: 'student123',
    role: 'student',
    department: 'Computer Science',
    year: 3,
    bio: 'Third-year CS student passionate about web development',
    skills: ['React', 'Node.js', 'Python', 'TypeScript'],
    isActive: true
  },
  {
    name: 'Jane Smith',
    email: 'jane.smith@college.edu',
    password: 'password123',
    role: 'student',
    department: 'Mathematics',
    year: 2,
    bio: 'Mathematics major interested in data analysis',
    skills: ['Python', 'R', 'Statistics'],
    isActive: true
  },
  {
    name: 'Dr. Michael Brown',
    email: 'prof.brown@college.edu',
    password: 'password123',
    role: 'faculty',
    department: 'Physics',
    bio: 'Physics professor specializing in quantum mechanics',
    skills: ['Quantum Physics', 'Research', 'Laboratory Management'],
    isActive: true
  }
];

const sampleEvents = [
  {
    title: 'Tech Symposium 2024',
    description: 'Annual technology symposium featuring latest trends in AI, Web Development, and Data Science.',
    date: new Date('2024-03-15'),
    time: '09:00',
    location: 'Main Auditorium',
    category: 'technical',
    organizer: 'Computer Science Department',
    capacity: 200,
    tags: ['technology', 'AI', 'web development']
  },
  {
    title: 'Cultural Night',
    description: 'Celebrate diversity with performances, food, and cultural exhibitions from around the world.',
    date: new Date('2024-03-20'),
    time: '18:00',
    location: 'Campus Grounds',
    category: 'cultural',
    organizer: 'Student Council',
    capacity: 500,
    tags: ['culture', 'diversity', 'performance']
  },
  {
    title: 'Hackathon 2024',
    description: '48-hour coding competition with exciting prizes and mentorship from industry experts.',
    date: new Date('2024-04-01'),
    time: '09:00',
    location: 'Innovation Lab',
    category: 'technical',
    organizer: 'Tech Club',
    capacity: 100,
    tags: ['hackathon', 'coding', 'competition']
  }
];

const sampleForumPosts = [
  {
    title: 'Best resources for learning React?',
    content: 'I\'m a beginner looking to learn React. What are the best online resources, tutorials, or books you\'d recommend?',
    category: 'academic',
    tags: ['react', 'learning', 'resources']
  },
  {
    title: 'Study Group for Data Structures',
    content: 'Looking to form a study group for the upcoming Data Structures exam. Anyone interested in joining?',
    category: 'academic',
    tags: ['study group', 'data structures', 'exam']
  },
  {
    title: 'Project Ideas for Final Year',
    content: 'Need some innovative project ideas for my final year computer science project. Any suggestions?',
    category: 'projects',
    tags: ['final year', 'project ideas', 'computer science']
  }
];

const sampleProjects = [
  {
    title: 'EcoTracker App',
    description: 'Mobile app to track personal carbon footprint and suggest eco-friendly alternatives.',
    technologies: ['React Native', 'Node.js', 'MongoDB', 'Express'],
    category: 'mobile',
    status: 'active',
    githubUrl: 'https://github.com/example/ecotracker',
    tags: ['environment', 'mobile', 'sustainability']
  },
  {
    title: 'Smart Library System',
    description: 'AI-powered library management system with book recommendations and automated cataloging.',
    technologies: ['Python', 'TensorFlow', 'Flask', 'PostgreSQL'],
    category: 'ai',
    status: 'completed',
    githubUrl: 'https://github.com/example/smartlibrary',
    liveUrl: 'https://smartlibrary-demo.com',
    tags: ['AI', 'library', 'automation']
  }
];

const sampleTeams = [
  {
    name: 'Robotics Club',
    description: 'Building autonomous robots and competing in national competitions.',
    type: 'club',
    maxMembers: 20,
    isOpen: true,
    tags: ['robotics', 'engineering', 'competition'],
    isActive: true
  },
  {
    name: 'Web Dev Squad',
    description: 'Collaborative team working on modern web applications and learning new technologies.',
    type: 'project',
    maxMembers: 8,
    isOpen: true,
    tags: ['web development', 'react', 'javascript'],
    isActive: true
  }
];

async function initializeDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB Atlas');

    // Clear existing data (optional - remove in production)
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Event.deleteMany({});
    await ForumPost.deleteMany({});
    await Project.deleteMany({});
    await Team.deleteMany({});

    // Create users
    console.log('Creating users...');
    const users = await User.create(sampleUsers);
    console.log(`Created ${users.length} users`);

    // Create events with proper user references
    console.log('Creating events...');
    const eventsWithCreator = sampleEvents.map((event, index) => ({
      ...event,
      createdBy: users[index % users.length]._id
    }));
    const events = await Event.create(eventsWithCreator);
    console.log(`Created ${events.length} events`);

    // Create forum posts with proper user references
    console.log('Creating forum posts...');
    const postsWithAuthor = sampleForumPosts.map((post, index) => ({
      ...post,
      author: users[(index + 2) % users.length]._id
    }));
    const posts = await ForumPost.create(postsWithAuthor);
    console.log(`Created ${posts.length} forum posts`);

    // Create projects with proper user references
    console.log('Creating projects...');
    const projectsWithOwner = sampleProjects.map((project, index) => ({
      ...project,
      owner: users[(index + 1) % users.length]._id
    }));
    const projects = await Project.create(projectsWithOwner);
    console.log(`Created ${projects.length} projects`);

    // Create teams with proper user references
    console.log('Creating teams...');
    const teamsWithLeader = sampleTeams.map((team, index) => ({
      ...team,
      leader: users[(index + 1) % users.length]._id
    }));
    const teams = await Team.create(teamsWithLeader);
    console.log(`Created ${teams.length} teams`);

    console.log('Database initialization completed successfully!');
    
    // Display created data summary
    console.log('\n=== DATABASE SUMMARY ===');
    console.log(`Users: ${users.length}`);
    console.log(`Events: ${events.length}`);
    console.log(`Forum Posts: ${posts.length}`);
    console.log(`Projects: ${projects.length}`);
    console.log(`Teams: ${teams.length}`);
    
    console.log('\n=== SAMPLE LOGIN CREDENTIALS ===');
    console.log('Admin: admin@college.edu / admin123');
    console.log('Faculty: prof@college.edu / faculty123');
    console.log('Student: student@college.edu / student123');

  } catch (error) {
    console.error('Database initialization failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run initialization
initializeDatabase();