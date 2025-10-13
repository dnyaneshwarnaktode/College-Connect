const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const eventRoutes = require('./routes/events');
const forumRoutes = require('./routes/forum');
const projectRoutes = require('./routes/projects');
const teamRoutes = require('./routes/teams');
const analyticsRoutes = require('./routes/analytics');
const teamChatRoutes = require('./routes/teamChat');
const classGroupRoutes = require('./routes/classGroups');
const aiAssistantRoutes = require('./routes/aiAssistant');
const notificationRoutes = require('./routes/notifications');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

const app = express();

// Trust proxy for production deployments
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// CORS configuration (must be before other middleware)
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'https://college-connect-site.vercel.app',
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

// Static files
app.use('/uploads', express.static('uploads'));

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
app.use('/api/notifications', notificationRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Database connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📱 Environment: ${process.env.NODE_ENV}`);
    console.log(`🌐 API Health: http://localhost:${PORT}/api/health`);
  });
};

// For Vercel deployment
if (process.env.NODE_ENV === 'production' && process.env.VERCEL) {
  // Export the app for Vercel serverless functions
  module.exports = app;
} else {
  // Start server for local development
  startServer();

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    process.exit(1);
  });
}

// Always export the app for Vercel compatibility
module.exports = app;