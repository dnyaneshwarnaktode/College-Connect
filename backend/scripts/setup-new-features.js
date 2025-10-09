const mongoose = require('mongoose');
require('dotenv').config();

// Import all models to ensure they are registered
require('../models/User');
require('../models/Team');
require('../models/Project');
require('../models/Event');
require('../models/ForumPost');
require('../models/TeamChat');
require('../models/Challenge');
require('../models/ChallengeSubmission');
require('../models/UserStats');
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

    // Challenge indexes
    await mongoose.connection.db.collection('challenges').createIndex({ category: 1, difficulty: 1 });
    await mongoose.connection.db.collection('challenges').createIndex({ createdBy: 1 });
    await mongoose.connection.db.collection('challenges').createIndex({ isActive: 1, isPublished: 1 });
    await mongoose.connection.db.collection('challenges').createIndex({ points: -1 });
    await mongoose.connection.db.collection('challenges').createIndex({ tags: 1 });

    // ChallengeSubmission indexes
    await mongoose.connection.db.collection('challengesubmissions').createIndex({ user: 1, challenge: 1 });
    await mongoose.connection.db.collection('challengesubmissions').createIndex({ challenge: 1, submittedAt: -1 });
    await mongoose.connection.db.collection('challengesubmissions').createIndex({ user: 1, submittedAt: -1 });
    await mongoose.connection.db.collection('challengesubmissions').createIndex({ status: 1 });
    await mongoose.connection.db.collection('challengesubmissions').createIndex({ isCorrect: 1 });

    // UserStats indexes
    await mongoose.connection.db.collection('userstats').createIndex({ totalScore: -1 });
    await mongoose.connection.db.collection('userstats').createIndex({ challengesSolved: -1 });
    await mongoose.connection.db.collection('userstats').createIndex({ currentStreak: -1 });
    await mongoose.connection.db.collection('userstats').createIndex({ rank: 1 });

    // ClassGroup indexes
    await mongoose.connection.db.collection('classgroups').createIndex({ teacher: 1 });
    await mongoose.connection.db.collection('classgroups').createIndex({ joinKey: 1 });
    await mongoose.connection.db.collection('classgroups').createIndex({ 'students.user': 1 });
    await mongoose.connection.db.collection('classgroups').createIndex({ courseCode: 1, semester: 1, academicYear: 1 });
    await mongoose.connection.db.collection('classgroups').createIndex({ isActive: 1 });

    console.log('✅ All indexes created successfully!');
  } catch (error) {
    console.error('Error creating indexes:', error);
  }
};

const createSampleData = async () => {
  try {
    console.log('Creating sample data...');

    const User = mongoose.model('User');
    const Challenge = mongoose.model('Challenge');
    const ClassGroup = mongoose.model('ClassGroup');

    // Check if sample data already exists
    const existingChallenges = await Challenge.countDocuments();
    const existingClassGroups = await ClassGroup.countDocuments();

    if (existingChallenges > 0 && existingClassGroups > 0) {
      console.log('Sample data already exists, skipping...');
      return;
    }

    // Get a faculty user to create challenges and class groups
    const facultyUser = await User.findOne({ role: 'faculty' });
    if (!facultyUser) {
      console.log('No faculty user found, skipping sample data creation...');
      return;
    }

    // Create sample challenges
    if (existingChallenges === 0) {
      const sampleChallenges = [
        {
          title: "Two Sum",
          description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
          category: "dsa",
          difficulty: "easy",
          points: 10,
          timeLimit: 30,
          problemStatement: "You may assume that each input would have exactly one solution, and you may not use the same element twice.",
          inputFormat: "First line contains n (number of elements). Second line contains n integers. Third line contains target.",
          outputFormat: "Print two indices separated by space.",
          constraints: "2 <= nums.length <= 10^4, -10^9 <= nums[i] <= 10^9, -10^9 <= target <= 10^9",
          sampleInput: [
            {
              input: "4\n2 7 11 15\n9",
              output: "0 1",
              explanation: "nums[0] + nums[1] = 2 + 7 = 9"
            }
          ],
          testCases: [
            { input: "4\n2 7 11 15\n9", expectedOutput: "0 1", isHidden: true },
            { input: "3\n3 2 4\n6", expectedOutput: "1 2", isHidden: true }
          ],
          hints: ["Use a hash map to store numbers and their indices", "For each number, check if target - number exists in the map"],
          solution: "Use hash map approach for O(n) time complexity",
          tags: ["array", "hash-table"],
          createdBy: facultyUser._id,
          isPublished: true,
          publishedAt: new Date()
        },
        {
          title: "Reverse Linked List",
          description: "Given the head of a singly linked list, reverse the list, and return the reversed list.",
          category: "dsa",
          difficulty: "easy",
          points: 15,
          timeLimit: 45,
          problemStatement: "A linked list can be reversed either iteratively or recursively.",
          inputFormat: "First line contains n (number of nodes). Next n lines contain node values.",
          outputFormat: "Print the reversed linked list values separated by space.",
          constraints: "The number of nodes in the list is in the range [0, 5000]. -5000 <= Node.val <= 5000",
          sampleInput: [
            {
              input: "3\n1\n2\n3",
              output: "3 2 1",
              explanation: "Original: 1->2->3, Reversed: 3->2->1"
            }
          ],
          testCases: [
            { input: "3\n1\n2\n3", expectedOutput: "3 2 1", isHidden: true },
            { input: "2\n1\n2", expectedOutput: "2 1", isHidden: true }
          ],
          hints: ["Use three pointers: prev, current, and next", "Iterate through the list and reverse the links"],
          solution: "Iterative approach using three pointers",
          tags: ["linked-list", "recursion"],
          createdBy: facultyUser._id,
          isPublished: true,
          publishedAt: new Date()
        },
        {
          title: "Maximum Subarray Sum",
          description: "Given an integer array nums, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.",
          category: "dsa",
          difficulty: "medium",
          points: 25,
          timeLimit: 60,
          problemStatement: "This is a classic dynamic programming problem known as Kadane's algorithm.",
          inputFormat: "First line contains n (number of elements). Second line contains n integers.",
          outputFormat: "Print the maximum subarray sum.",
          constraints: "1 <= nums.length <= 10^5, -10^4 <= nums[i] <= 10^4",
          sampleInput: [
            {
              input: "5\n-2 1 -3 4 -1",
              output: "4",
              explanation: "The subarray [4] has the largest sum = 4"
            }
          ],
          testCases: [
            { input: "5\n-2 1 -3 4 -1", expectedOutput: "4", isHidden: true },
            { input: "1\n1", expectedOutput: "1", isHidden: true }
          ],
          hints: ["Use Kadane's algorithm", "Keep track of current sum and maximum sum"],
          solution: "Kadane's algorithm with O(n) time complexity",
          tags: ["array", "dynamic-programming"],
          createdBy: facultyUser._id,
          isPublished: true,
          publishedAt: new Date()
        },
        {
          title: "Binary Tree Inorder Traversal",
          description: "Given the root of a binary tree, return the inorder traversal of its nodes' values.",
          category: "dsa",
          difficulty: "easy",
          points: 12,
          timeLimit: 30,
          problemStatement: "Inorder traversal: left -> root -> right",
          inputFormat: "First line contains n (number of nodes). Next n lines contain node values in level order.",
          outputFormat: "Print inorder traversal values separated by space.",
          constraints: "The number of nodes in the tree is in the range [0, 100]. -100 <= Node.val <= 100",
          sampleInput: [
            {
              input: "3\n1\n2\n3",
              output: "2 1 3",
              explanation: "Tree structure: 1->2,3, Inorder: 2->1->3"
            }
          ],
          testCases: [
            { input: "3\n1\n2\n3", expectedOutput: "2 1 3", isHidden: true },
            { input: "1\n1", expectedOutput: "1", isHidden: true }
          ],
          hints: ["Use recursion or iterative approach with stack", "Process left subtree, then root, then right subtree"],
          solution: "Recursive inorder traversal",
          tags: ["tree", "stack"],
          createdBy: facultyUser._id,
          isPublished: true,
          publishedAt: new Date()
        },
        {
          title: "Valid Parentheses",
          description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
          category: "dsa",
          difficulty: "easy",
          points: 10,
          timeLimit: 30,
          problemStatement: "An input string is valid if: 1) Open brackets must be closed by the same type of brackets. 2) Open brackets must be closed in the correct order.",
          inputFormat: "Single line containing the string s.",
          outputFormat: "Print 'true' if valid, 'false' otherwise.",
          constraints: "1 <= s.length <= 10^4, s consists of parentheses only '()[]{}'",
          sampleInput: [
            {
              input: "()",
              output: "true",
              explanation: "Valid parentheses"
            },
            {
              input: "()[]{}",
              output: "true",
              explanation: "Valid parentheses"
            },
            {
              input: "(]",
              output: "false",
              explanation: "Invalid parentheses"
            }
          ],
          testCases: [
            { input: "()", expectedOutput: "true", isHidden: true },
            { input: "()[]{}", expectedOutput: "true", isHidden: true },
            { input: "(]", expectedOutput: "false", isHidden: true }
          ],
          hints: ["Use a stack to keep track of opening brackets", "When you encounter a closing bracket, check if it matches the top of the stack"],
          solution: "Use stack to validate parentheses",
          tags: ["string", "stack"],
          createdBy: facultyUser._id,
          isPublished: true,
          publishedAt: new Date()
        }
      ];

      await Challenge.insertMany(sampleChallenges);
      console.log('✅ Sample challenges created!');
    }

    // Create sample class groups
    if (existingClassGroups === 0) {
      const sampleClassGroups = [
        {
          name: "Data Structures & Algorithms",
          description: "Learn fundamental data structures and algorithms through hands-on practice and problem solving.",
          subject: "Computer Science",
          courseCode: "CS301",
          semester: "3rd",
          academicYear: "2024-2025",
          teacher: facultyUser._id,
          maxStudents: 50,
          settings: {
            allowStudentChat: true,
            allowStudentPosts: true,
            requireApprovalForPosts: false,
            showLeaderboard: true,
            allowFileSharing: true
          }
        },
        {
          name: "Web Development Fundamentals",
          description: "Introduction to web development using HTML, CSS, and JavaScript.",
          subject: "Computer Science",
          courseCode: "CS302",
          semester: "3rd",
          academicYear: "2024-2025",
          teacher: facultyUser._id,
          maxStudents: 40,
          settings: {
            allowStudentChat: true,
            allowStudentPosts: true,
            requireApprovalForPosts: false,
            showLeaderboard: true,
            allowFileSharing: true
          }
        },
        {
          name: "Database Management Systems",
          description: "Learn database design, SQL queries, and database administration.",
          subject: "Computer Science",
          courseCode: "CS303",
          semester: "4th",
          academicYear: "2024-2025",
          teacher: facultyUser._id,
          maxStudents: 45,
          settings: {
            allowStudentChat: true,
            allowStudentPosts: true,
            requireApprovalForPosts: false,
            showLeaderboard: true,
            allowFileSharing: true
          }
        }
      ];

      await ClassGroup.insertMany(sampleClassGroups);
      console.log('✅ Sample class groups created!');
    }

    console.log('🎉 Sample data setup completed!');
  } catch (error) {
    console.error('Error creating sample data:', error);
  }
};

const main = async () => {
  try {
    await connectDB();
    await createIndexes();
    await createSampleData();
    
    console.log('\n🚀 Database setup completed successfully!');
    console.log('\nNew collections created:');
    console.log('📝 TeamChat - Team messaging system');
    console.log('🎯 Challenge - Coding challenges and problems');
    console.log('📊 ChallengeSubmission - User submissions and results');
    console.log('🏆 UserStats - User statistics and achievements');
    console.log('📚 ClassGroup - Private class groups for teachers');
    
    console.log('\n✨ Features ready:');
    console.log('💬 Team Chat - Real-time messaging for team members');
    console.log('🧩 Challenges - DSA, Aptitude, and Programming challenges');
    console.log('📈 Leaderboard - Rankings and achievements');
    console.log('🔥 Streaks - Daily coding streaks like LeetCode');
    console.log('👨‍🏫 Class Groups - Private classes with assignments');
    
    process.exit(0);
  } catch (error) {
    console.error('Setup failed:', error);
    process.exit(1);
  }
};

main();
