const mongoose = require('mongoose');
require('dotenv').config();

// Import all models to ensure they are registered
require('../models/User');
require('../models/Team');
require('../models/Project');
require('../models/Event');
require('../models/ForumPost');
require('../models/TeamChat');
require('../models/ClassGroup');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const createIndexes = async () => {
  try {
    console.log('Creating indexes for new collections...');

    // TeamChat indexes
    await mongoose.connection.db.collection('teamchats').createIndex({ team: 1, createdAt: -1 });
    await mongoose.connection.db.collection('teamchats').createIndex({ sender: 1 });
    await mongoose.connection.db.collection('teamchats').createIndex({ replyTo: 1 });


    // ClassGroup indexes
    await mongoose.connection.db.collection('classgroups').createIndex({ teacher: 1 });
    await mongoose.connection.db.collection('classgroups').createIndex({ joinKey: 1 });
    await mongoose.connection.db.collection('classgroups').createIndex({ 'students.user': 1 });

    console.log('✅ Indexes created successfully!');
  } catch (error) {
    console.error('Error creating indexes:', error);
  }
};

const createSampleData = async () => {
  try {
    console.log('Creating sample data...');

    const User = mongoose.model('User');
    const ClassGroup = mongoose.model('ClassGroup');

    // Check if sample data already exists
    const existingClassGroups = await ClassGroup.countDocuments();

    if (existingClassGroups > 0) {
      console.log('Sample data already exists, skipping...');
      return;
    }

    // Get a faculty user to create class groups
    const facultyUser = await User.findOne({ role: 'faculty' });
    if (!facultyUser) {
      console.log('No faculty user found, skipping sample data creation...');
      return;
    }

    // Create sample class groups
    if (existingClassGroups === 0) {
      const sampleClassGroups = [
        {
          name: "Data Structures & Algorithms",
          description: "Learn fundamental data structures and algorithms",
          subject: "Computer Science",
          courseCode: "CS201",
          semester: "3rd",
          academicYear: "2024-25",
          teacher: facultyUser._id,
          teacherName: facultyUser.name,
          joinKey: "CS201ABC",
          students: [],
          maxStudents: 50,
          isActive: true,
          settings: {
            allowStudentChat: true,
            allowStudentPosts: true,
            requireApprovalForPosts: false,
            allowFileSharing: true
          },
          announcements: [],
          assignments: [],
          files: [],
          doubts: [],
          statistics: {
            totalStudents: 0,
            activeStudents: 0,
            totalAssignments: 0,
            completedAssignments: 0,
            averageGrade: 0,
            totalFiles: 0,
            totalDoubts: 0,
            pendingDoubts: 0
          }
        },
        {
          name: "Web Development",
          description: "Modern web development with React and Node.js",
          subject: "Computer Science",
          courseCode: "CS301",
          semester: "5th",
          academicYear: "2024-25",
          teacher: facultyUser._id,
          teacherName: facultyUser.name,
          joinKey: "CS301XYZ",
          students: [],
          maxStudents: 40,
          isActive: true,
          settings: {
            allowStudentChat: true,
            allowStudentPosts: true,
            requireApprovalForPosts: false,
            allowFileSharing: true
          },
          announcements: [],
          assignments: [],
          files: [],
          doubts: [],
          statistics: {
            totalStudents: 0,
            activeStudents: 0,
            totalAssignments: 0,
            completedAssignments: 0,
            averageGrade: 0,
            totalFiles: 0,
            totalDoubts: 0,
            pendingDoubts: 0
          }
        }
      ];

      await ClassGroup.insertMany(sampleClassGroups);
      console.log('✅ Sample class groups created!');
    }

  } catch (error) {
    console.error('Error creating sample data:', error);
  }
};

const main = async () => {
  await connectDB();
  await createIndexes();
  await createSampleData();
  
  console.log('\n🚀 Database setup completed successfully!');
  console.log('\nNew collections created:');
  console.log('📝 TeamChat - Team messaging system');
  console.log('📚 ClassGroup - Private class groups for teachers');
  
  console.log('\n✨ Features ready:');
  console.log('💬 Team Chat - Real-time messaging for team members');
  console.log('👨‍🏫 Class Groups - Private classes with assignments');
  
  process.exit(0);
};

main().catch(error => {
  console.error('Setup failed:', error);
  process.exit(1);
});
