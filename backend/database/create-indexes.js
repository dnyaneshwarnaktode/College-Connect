const mongoose = require('mongoose');
require('dotenv').config();

async function createIndexes() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB Atlas');

    const db = mongoose.connection.db;

    // User Collection Indexes
    console.log('Creating User indexes...');
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ role: 1 });
    await db.collection('users').createIndex({ department: 1 });
    await db.collection('users').createIndex({ isActive: 1 });
    await db.collection('users').createIndex({ createdAt: -1 });

    // Event Collection Indexes
    console.log('Creating Event indexes...');
    await db.collection('events').createIndex({ date: 1 });
    await db.collection('events').createIndex({ category: 1 });
    await db.collection('events').createIndex({ createdBy: 1 });
    await db.collection('events').createIndex({ isActive: 1 });
    await db.collection('events').createIndex({ 'registeredUsers.user': 1 });
    await db.collection('events').createIndex({ title: 'text', description: 'text' });

    // ForumPost Collection Indexes
    console.log('Creating ForumPost indexes...');
    await db.collection('forumposts').createIndex({ category: 1 });
    await db.collection('forumposts').createIndex({ author: 1 });
    await db.collection('forumposts').createIndex({ createdAt: -1 });
    await db.collection('forumposts').createIndex({ likes: -1 });
    await db.collection('forumposts').createIndex({ views: -1 });
    await db.collection('forumposts').createIndex({ 'replies.author': 1 });
    await db.collection('forumposts').createIndex({ title: 'text', content: 'text' });

    // Project Collection Indexes
    console.log('Creating Project indexes...');
    await db.collection('projects').createIndex({ category: 1 });
    await db.collection('projects').createIndex({ status: 1 });
    await db.collection('projects').createIndex({ owner: 1 });
    await db.collection('projects').createIndex({ 'members.user': 1 });
    await db.collection('projects').createIndex({ likes: -1 });
    await db.collection('projects').createIndex({ views: -1 });
    await db.collection('projects').createIndex({ isPublic: 1 });
    await db.collection('projects').createIndex({ title: 'text', description: 'text' });

    // Team Collection Indexes
    console.log('Creating Team indexes...');
    await db.collection('teams').createIndex({ type: 1 });
    await db.collection('teams').createIndex({ leader: 1 });
    await db.collection('teams').createIndex({ 'members.user': 1 });
    await db.collection('teams').createIndex({ isOpen: 1 });
    await db.collection('teams').createIndex({ isActive: 1 });
    await db.collection('teams').createIndex({ name: 'text', description: 'text' });

    // Compound Indexes for better query performance
    console.log('Creating compound indexes...');
    await db.collection('events').createIndex({ category: 1, date: 1 });
    await db.collection('events').createIndex({ isActive: 1, date: 1 });
    await db.collection('forumposts').createIndex({ category: 1, createdAt: -1 });
    await db.collection('projects').createIndex({ category: 1, status: 1 });
    await db.collection('teams').createIndex({ type: 1, isOpen: 1 });

    console.log('All indexes created successfully!');

    // List all indexes for verification
    console.log('\n=== INDEX VERIFICATION ===');
    const collections = ['users', 'events', 'forumposts', 'projects', 'teams'];
    
    for (const collectionName of collections) {
      console.log(`\n${collectionName.toUpperCase()} INDEXES:`);
      const indexes = await db.collection(collectionName).listIndexes().toArray();
      indexes.forEach(index => {
        console.log(`- ${index.name}: ${JSON.stringify(index.key)}`);
      });
    }

  } catch (error) {
    console.error('Index creation failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
}

createIndexes();