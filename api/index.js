// Vercel serverless function entry point
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

// Trust proxy for Vercel serverless functions
app.set('trust proxy', 1);

// Basic middleware
app.use(helmet());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'https://college-connect-site.vercel.app',
  'https://college-connect-black.vercel.app',
  process.env.CLIENT_URL,
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    for (const allowedOrigin of allowedOrigins) {
      if (allowedOrigin instanceof RegExp && allowedOrigin.test(origin)) {
        return callback(null, true);
      }
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'development' ? 1000 : 200,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  skipFailedRequests: false,
});
app.use('/api/', limiter);

// Health check endpoint (works without database)
app.get('/api/health', (req, res) => {
  const config = {
    mongodb: !!process.env.MONGODB_URI,
    jwt: !!process.env.JWT_SECRET,
    openai: !!process.env.OPENAI_API_KEY,
    environment: process.env.NODE_ENV || 'development'
  };
  
  res.status(200).json({
    success: true,
    message: 'CollegeConnect API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    configuration: config,
    status: config.mongodb && config.jwt ? 'ready' : 'configuration_required',
    routesLoaded: routesLoaded
  });
});

// Debug endpoint to test basic functionality
app.get('/api/debug', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Debug endpoint working',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    nodeVersion: process.version,
    routesLoaded: routesLoaded
  });
});

// Try to load routes with error handling
let routesLoaded = false;
try {
  // Import routes with error handling
  const authRoutes = require('../backend/routes/auth');
  const userRoutes = require('../backend/routes/users');
  const eventRoutes = require('../backend/routes/events');
  const forumRoutes = require('../backend/routes/forum');
  const projectRoutes = require('../backend/routes/projects');
  const teamRoutes = require('../backend/routes/teams');
  const analyticsRoutes = require('../backend/routes/analytics');
  const teamChatRoutes = require('../backend/routes/teamChat');
  const classGroupRoutes = require('../backend/routes/classGroups');
  const aiAssistantRoutes = require('../backend/routes/aiAssistant');
  const notificationRoutes = require('../backend/routes/notifications');

  // Import middleware
  const errorHandler = require('../backend/middleware/errorHandler');
  const notFound = require('../backend/middleware/notFound');

  // API routes
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/events', eventRoutes);
  app.use('/api/forums', forumRoutes);
  app.use('/api/projects', projectRoutes);
  app.use('/api/teams', teamRoutes);
  app.use('/api/analytics', analyticsRoutes);
  app.use('/api/teams', teamChatRoutes);
  app.use('/api/class-groups', classGroupRoutes);
  app.use('/api/assistant', aiAssistantRoutes);
  app.use('/api/notifications', notificationRoutes);

  // Error handling middleware
  app.use(notFound);
  app.use(errorHandler);

  routesLoaded = true;
  console.log('✅ All routes loaded successfully');
} catch (error) {
  console.error('❌ Error loading routes:', error.message);
  
  // Fallback error handler
  app.use('/api/*', (req, res) => {
    res.status(500).json({
      success: false,
      message: 'API routes failed to load. Check server logs.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  });
}

// Database connection (only if routes loaded successfully)
if (routesLoaded) {
  const mongoose = require('mongoose');
  
  const connectDB = async () => {
    try {
      if (mongoose.connection.readyState === 0) {
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) {
          console.error('MONGODB_URI environment variable is not set');
          throw new Error('Database connection string not configured');
        }
        const conn = await mongoose.connect(mongoUri);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
      }
    } catch (error) {
      console.error('Database connection error:', error);
      throw error;
    }
  };

  // Initialize database connection
  connectDB().catch(console.error);
}

// Export the Express app for Vercel
module.exports = app;

