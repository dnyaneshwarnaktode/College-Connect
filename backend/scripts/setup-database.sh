#!/bin/bash

# CollegeConnect Database Setup Script
echo "🚀 Setting up CollegeConnect Database..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "📝 Please create a .env file based on .env.example"
    echo "🔗 Make sure to add your MongoDB Atlas connection string"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    echo "📦 Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Run database initialization
echo "🗄️  Initializing database with sample data..."
node database/init-database.js

if [ $? -eq 0 ]; then
    echo "✅ Database initialization completed successfully!"
    
    # Create indexes for better performance
    echo "🔍 Creating database indexes..."
    node database/create-indexes.js
    
    if [ $? -eq 0 ]; then
        echo "✅ Database indexes created successfully!"
        echo ""
        echo "🎉 Database setup completed!"
        echo ""
        echo "📋 Sample Login Credentials:"
        echo "   Admin:   admin@college.edu / admin123"
        echo "   Faculty: prof@college.edu / faculty123"
        echo "   Student: student@college.edu / student123"
        echo ""
        echo "🚀 You can now start the server with: npm run dev"
    else
        echo "❌ Failed to create database indexes"
        exit 1
    fi
else
    echo "❌ Database initialization failed!"
    echo "🔍 Please check your MongoDB Atlas connection string in .env file"
    exit 1
fi