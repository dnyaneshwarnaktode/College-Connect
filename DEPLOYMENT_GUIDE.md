# CollegeConnect - Deployment Guide

## 🚀 Vercel Deployment

### Required Environment Variables

Set these environment variables in your Vercel dashboard:

#### **Required:**
- `MONGODB_URI` - Your MongoDB connection string (e.g., `mongodb+srv://username:password@cluster.mongodb.net/collegeconnect`)
- `JWT_SECRET` - A secure random string for JWT token signing (e.g., `your-super-secret-jwt-key-here`)
- `JWT_EXPIRE` - JWT token expiration time (e.g., `7d`)

#### **Optional:**
- `OPENAI_API_KEY` - OpenAI API key for AI Assistant feature
- `NODE_ENV` - Environment (set to `production` for production)
- `CLIENT_URL` - Frontend URL for CORS (usually your Vercel app URL)

### Setting Environment Variables in Vercel

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add each variable with its value
5. Redeploy your application

### Database Setup

1. Create a MongoDB Atlas account
2. Create a new cluster
3. Get your connection string
4. Set `MONGODB_URI` environment variable

### Testing Deployment

After deployment, test these endpoints:

- `GET /api/health` - Check API status and configuration
- `POST /api/auth/login` - Test authentication
- `GET /api/events` - Test data retrieval

### Troubleshooting

#### 500 Internal Server Error
- Check that all required environment variables are set
- Verify MongoDB connection string is correct
- Check Vercel function logs for specific errors

#### CORS Errors
- Ensure `CLIENT_URL` is set to your frontend URL
- Check that your domain is in the allowed origins list

#### Database Connection Issues
- Verify MongoDB Atlas cluster is running
- Check network access settings in MongoDB Atlas
- Ensure connection string includes proper credentials

### Local Development

1. Copy `.env.example` to `.env`
2. Fill in your local values
3. Run `npm run dev` for frontend
4. Run `cd backend && npm run dev` for backend

## 📁 Project Structure

```
├── api/                 # Vercel serverless functions
├── backend/             # Backend API code
├── src/                 # Frontend React code
├── public/              # Static assets
├── vercel.json          # Vercel configuration
└── package.json         # Frontend dependencies
```

## 🔧 Configuration Files

- `vercel.json` - Vercel deployment configuration
- `api/index.js` - Serverless function entry point
- `backend/server.js` - Local development server
- `.env.example` - Environment variables template
