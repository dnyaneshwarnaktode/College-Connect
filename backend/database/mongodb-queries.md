# MongoDB Atlas Setup and Queries for CollegeConnect

## 1. MongoDB Atlas Cluster Setup

### Step 1: Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a free account
3. Create a new cluster (M0 Sandbox - Free tier)
4. Choose your preferred cloud provider and region

### Step 2: Database Access Setup
1. Go to "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Create a user with username and password
4. Set privileges to "Read and write to any database"

### Step 3: Network Access Setup
1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. Add your current IP or use "0.0.0.0/0" for development (not recommended for production)

### Step 4: Get Connection String
1. Go to "Clusters" and click "Connect"
2. Choose "Connect your application"
3. Copy the connection string
4. Replace `<password>` with your database user password

## 2. Environment Configuration

Create a `.env` file in your backend directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Atlas Configuration
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/collegeconnect?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
JWT_EXPIRE=7d

# CORS Configuration
CLIENT_URL=http://localhost:3000
```

## 3. Database Initialization

### Run the initialization script:
```bash
cd backend
npm install
node database/init-database.js
```

### Create indexes for better performance:
```bash
node database/create-indexes.js
```

## 4. Manual MongoDB Queries (if needed)

### Create Collections with Validation

```javascript
// Users Collection
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "email", "password", "role", "department"],
      properties: {
        name: { bsonType: "string", maxLength: 100 },
        email: { bsonType: "string", pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$" },
        role: { enum: ["student", "faculty", "admin"] },
        department: { bsonType: "string" },
        year: { bsonType: "int", minimum: 1, maximum: 6 },
        isActive: { bsonType: "bool" }
      }
    }
  }
});

// Events Collection
db.createCollection("events", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["title", "description", "date", "time", "location", "category", "capacity", "createdBy"],
      properties: {
        title: { bsonType: "string", maxLength: 200 },
        category: { enum: ["academic", "cultural", "sports", "technical"] },
        capacity: { bsonType: "int", minimum: 1 },
        isActive: { bsonType: "bool" }
      }
    }
  }
});

// Forum Posts Collection
db.createCollection("forumposts", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["title", "content", "author", "category"],
      properties: {
        title: { bsonType: "string", maxLength: 200 },
        content: { bsonType: "string", maxLength: 5000 },
        category: { enum: ["general", "academic", "projects", "help"] },
        likes: { bsonType: "int", minimum: 0 },
        views: { bsonType: "int", minimum: 0 }
      }
    }
  }
});

// Projects Collection
db.createCollection("projects", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["title", "description", "technologies", "category", "status", "owner"],
      properties: {
        title: { bsonType: "string", maxLength: 200 },
        category: { enum: ["web", "mobile", "ai", "data", "other"] },
        status: { enum: ["planning", "active", "completed", "on-hold"] },
        technologies: { bsonType: "array", items: { bsonType: "string" } },
        isPublic: { bsonType: "bool" }
      }
    }
  }
});

// Teams Collection
db.createCollection("teams", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "description", "type", "leader", "maxMembers"],
      properties: {
        name: { bsonType: "string", maxLength: 100 },
        type: { enum: ["club", "project", "competition"] },
        maxMembers: { bsonType: "int", minimum: 1, maximum: 100 },
        isOpen: { bsonType: "bool" },
        isActive: { bsonType: "bool" }
      }
    }
  }
});
```

### Sample Data Insertion Queries

```javascript
// Insert Sample Users
db.users.insertMany([
  {
    name: "John Admin",
    email: "admin@college.edu",
    password: "$2a$10$hashedpassword", // This will be hashed by the application
    role: "admin",
    department: "Administration",
    bio: "College Administrator",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Dr. Sarah Wilson",
    email: "prof@college.edu",
    password: "$2a$10$hashedpassword",
    role: "faculty",
    department: "Computer Science",
    bio: "CS Professor and AI Researcher",
    skills: ["Machine Learning", "Web Development"],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Alex Johnson",
    email: "student@college.edu",
    password: "$2a$10$hashedpassword",
    role: "student",
    department: "Computer Science",
    year: 3,
    bio: "Third-year CS student",
    skills: ["React", "Node.js", "Python"],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

// Insert Sample Events
db.events.insertMany([
  {
    title: "Tech Symposium 2024",
    description: "Annual technology symposium featuring latest trends in AI and Web Development.",
    date: new Date("2024-03-15"),
    time: "09:00",
    location: "Main Auditorium",
    category: "technical",
    organizer: "Computer Science Department",
    capacity: 200,
    registered: 0,
    registeredUsers: [],
    isActive: true,
    createdBy: ObjectId("user_id_here"),
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);
```

### Useful Query Examples

```javascript
// Find all active users by role
db.users.find({ role: "student", isActive: true });

// Find upcoming events
db.events.find({ 
  date: { $gte: new Date() }, 
  isActive: true 
}).sort({ date: 1 });

// Find popular forum posts
db.forumposts.find().sort({ likes: -1, views: -1 }).limit(10);

// Find projects by technology
db.projects.find({ 
  technologies: { $in: ["React", "Node.js"] },
  isPublic: true 
});

// Find open teams with available spots
db.teams.find({ 
  isOpen: true, 
  isActive: true,
  $expr: { $lt: [{ $size: "$members" }, "$maxMembers"] }
});

// Get user statistics
db.users.aggregate([
  { $group: { _id: "$role", count: { $sum: 1 } } }
]);

// Get event registration statistics
db.events.aggregate([
  {
    $group: {
      _id: "$category",
      totalEvents: { $sum: 1 },
      totalCapacity: { $sum: "$capacity" },
      totalRegistered: { $sum: "$registered" }
    }
  }
]);
```

## 5. Performance Optimization

### Indexes for Better Query Performance
```javascript
// User indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });
db.users.createIndex({ department: 1 });

// Event indexes
db.events.createIndex({ date: 1 });
db.events.createIndex({ category: 1 });
db.events.createIndex({ createdBy: 1 });

// Forum post indexes
db.forumposts.createIndex({ category: 1 });
db.forumposts.createIndex({ author: 1 });
db.forumposts.createIndex({ createdAt: -1 });

// Project indexes
db.projects.createIndex({ category: 1 });
db.projects.createIndex({ status: 1 });
db.projects.createIndex({ owner: 1 });

// Team indexes
db.teams.createIndex({ type: 1 });
db.teams.createIndex({ leader: 1 });
db.teams.createIndex({ isOpen: 1 });

// Text search indexes
db.events.createIndex({ title: "text", description: "text" });
db.forumposts.createIndex({ title: "text", content: "text" });
db.projects.createIndex({ title: "text", description: "text" });
```

## 6. Backup and Maintenance

### Regular Maintenance Queries
```javascript
// Clean up old inactive users (run periodically)
db.users.updateMany(
  { lastLogin: { $lt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) } },
  { $set: { isActive: false } }
);

// Archive old events
db.events.updateMany(
  { date: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
  { $set: { isActive: false } }
);

// Get database statistics
db.stats();
db.users.stats();
db.events.stats();
```

## 7. Security Considerations

1. **Never store plain text passwords** - Always hash with bcrypt
2. **Use environment variables** for sensitive data
3. **Implement rate limiting** on API endpoints
4. **Validate all input data** before database operations
5. **Use MongoDB Atlas IP whitelist** for production
6. **Enable MongoDB Atlas encryption** at rest
7. **Regular backup** your database
8. **Monitor database performance** and queries

## 8. Troubleshooting

### Common Issues and Solutions

1. **Connection Issues**
   - Check IP whitelist in MongoDB Atlas
   - Verify connection string format
   - Ensure network connectivity

2. **Authentication Errors**
   - Verify database user credentials
   - Check user permissions in Atlas

3. **Performance Issues**
   - Review and optimize queries
   - Ensure proper indexes are created
   - Monitor slow queries in Atlas

4. **Data Validation Errors**
   - Check schema validation rules
   - Verify required fields are provided
   - Validate data types and constraints