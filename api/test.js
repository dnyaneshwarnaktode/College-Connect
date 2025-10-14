// Simple test API for Vercel
const express = require('express');
const app = express();

// Basic middleware
app.use(express.json());

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'API is working!',
    timestamp: new Date().toISOString()
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Health check passed',
    timestamp: new Date().toISOString(),
    dependencies: {
      express: !!require('express'),
      cors: !!require('cors'),
      helmet: !!require('helmet')
    }
  });
});

module.exports = app;
