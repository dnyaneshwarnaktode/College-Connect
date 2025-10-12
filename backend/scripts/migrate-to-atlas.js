const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Event = require('./models/Event');
const ForumPost = require('./models/ForumPost');
const Project = require('./models/Project');
const Team = require('./models/Team');
const ClassGroup = require('./models/ClassGroup');
const TeamChat = require('./models/TeamChat');

// Migration script to transfer data from local MongoDB to Atlas
async function migrateToAtlas() {
  let localConnection, atlasConnection;
  
  try {
    console.log('🚀 Starting MongoDB Atlas Migration...\n');
    
    // Connect to local MongoDB
    console.log('📡 Connecting to local MongoDB...');
    const localUri = 'mongodb://localhost:27017/collegeconnect';
    localConnection = await mongoose.createConnection(localUri);
    console.log('✅ Connected to local MongoDB');
    
    // Connect to Atlas
    console.log('☁️ Connecting to MongoDB Atlas...');
    const atlasUri = process.env.MONGODB_URI;
    if (!atlasUri) {
      throw new Error('MONGODB_URI not found in environment variables');
    }
    atlasConnection = await mongoose.createConnection(atlasUri);
    console.log('✅ Connected to MongoDB Atlas');
    
    // Get local collections
    const localDb = localConnection.db;
    const atlasDb = atlasConnection.db;
    
    // List of collections to migrate
    const collections = [
      'users', 'events', 'forumposts', 'projects', 'teams', 
      'classgroups', 
      'teamchats'
    ];
    
    console.log('\n📦 Starting data migration...\n');
    
    for (const collectionName of collections) {
      try {
        console.log(`🔄 Migrating ${collectionName}...`);
        
        // Get all documents from local collection
        const localCollection = localDb.collection(collectionName);
        const documents = await localCollection.find({}).toArray();
        
        if (documents.length > 0) {
          // Insert documents into Atlas collection
          const atlasCollection = atlasDb.collection(collectionName);
          await atlasCollection.insertMany(documents);
          console.log(`✅ Migrated ${documents.length} documents from ${collectionName}`);
        } else {
          console.log(`ℹ️ No documents found in ${collectionName}`);
        }
      } catch (error) {
        console.error(`❌ Error migrating ${collectionName}:`, error.message);
      }
    }
    
    console.log('\n🎉 Migration completed successfully!');
    console.log('\n📊 Migration Summary:');
    
    // Display collection counts
    for (const collectionName of collections) {
      try {
        const count = await atlasDb.collection(collectionName).countDocuments();
        console.log(`   ${collectionName}: ${count} documents`);
      } catch (error) {
        console.log(`   ${collectionName}: Error counting documents`);
      }
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    // Close connections
    if (localConnection) {
      await localConnection.close();
      console.log('\n🔌 Local MongoDB connection closed');
    }
    if (atlasConnection) {
      await atlasConnection.close();
      console.log('🔌 Atlas MongoDB connection closed');
    }
  }
}

// Run migration
migrateToAtlas();
