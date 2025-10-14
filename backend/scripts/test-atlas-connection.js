const mongoose = require('mongoose');
require('dotenv').config();

// Import models to test schema
const User = require('../models/User');
const Event = require('../models/Event');
const ForumPost = require('../models/ForumPost');
const Project = require('../models/Project');
const Team = require('../models/Team');

async function testAtlasConnection() {
  try {
    console.log('🧪 Testing MongoDB Atlas Connection...\n');
    
    // Test connection
    console.log('📡 Connecting to Atlas...');
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ Connected to: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    
    // Test database operations
    console.log('\n🔍 Testing database operations...');
    
    // Test User model
    const userCount = await User.countDocuments();
    console.log(`👥 Users: ${userCount}`);
    
    // Test Event model
    const eventCount = await Event.countDocuments();
    console.log(`📅 Events: ${eventCount}`);
    
    // Test ForumPost model
    const postCount = await ForumPost.countDocuments();
    console.log(`💬 Forum Posts: ${postCount}`);
    
    // Test Project model
    const projectCount = await Project.countDocuments();
    console.log(`📁 Projects: ${projectCount}`);
    
    // Test Team model
    const teamCount = await Team.countDocuments();
    console.log(`👥 Teams: ${teamCount}`);
    
    // Test creating a sample document
    console.log('\n✍️ Testing document creation...');
    const testUser = new User({
      name: 'Atlas Test User',
      email: 'atlas-test@college.edu',
      password: 'test123',
      role: 'student',
      department: 'Computer Science',
      year: 1,
      bio: 'Test user for Atlas connection',
      isActive: true
    });
    
    await testUser.save();
    console.log('✅ Successfully created test user');
    
    // Clean up test user
    await User.deleteOne({ email: 'atlas-test@college.edu' });
    console.log('🧹 Cleaned up test user');
    
    console.log('\n🎉 Atlas connection test completed successfully!');
    console.log('✅ Your MongoDB Atlas setup is working correctly.');
    
  } catch (error) {
    console.error('❌ Atlas connection test failed:', error.message);
    console.error('\n🔧 Troubleshooting tips:');
    console.error('1. Check your MONGODB_URI in .env file');
    console.error('2. Verify database user credentials');
    console.error('3. Check network access settings in Atlas');
    console.error('4. Ensure cluster is running');
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Connection closed');
  }
}

// Run test
testAtlasConnection();
