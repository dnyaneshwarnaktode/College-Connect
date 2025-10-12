// Vercel serverless function entry point
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// Import routes
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

// Import middleware
const errorHandler = require('../backend/middleware/errorHandler');
const notFound = require('../backend/middleware/notFound');

const app = express();

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

// Add localhost wildcard for development
if (process.env.NODE_ENV === 'development') {
  allowedOrigins.push(/^http:\/\/localhost:\d+$/);
}

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Log the origin for debugging
    console.log('CORS Origin:', origin);
    
    // Check if origin is in allowed origins (string match)
    if (allowedOrigins.includes(origin)) {
      console.log('CORS Allowed:', origin);
      return callback(null, true);
    }
    
    // Check if origin matches any regex patterns (for localhost wildcard)
    for (const allowedOrigin of allowedOrigins) {
      if (allowedOrigin instanceof RegExp && allowedOrigin.test(origin)) {
        console.log('CORS Matched regex:', allowedOrigin, 'for origin:', origin);
        return callback(null, true);
      }
    }
    
    console.log('CORS Error - Origin not allowed:', origin);
    console.log('Allowed origins:', allowedOrigins);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

// Security middleware
app.use(helmet());

// Rate limiting (more lenient in development)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 1000 : 100, // Higher limit in dev mode
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use('/api/', limiter); // Apply only to API routes

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'CollegeConnect API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

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

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Database connection
const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 0) {
      const conn = await mongoose.connect(process.env.MONGODB_URI);
      console.log(`MongoDB Connected: ${conn.connection.host}`);
    }
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
};

// Initialize database connection
connectDB().catch(console.error);

// Export the Express app for Vercel
module.exports = app;

