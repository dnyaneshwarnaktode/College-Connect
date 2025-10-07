# CollegeConnect Deployment Guide

This guide will help you deploy the CollegeConnect platform entirely on Vercel with MongoDB Atlas.

## Prerequisites

1. GitHub account
2. Vercel account
3. MongoDB Atlas account

## Step 1: MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster (free tier available)
3. Create a database user with read/write permissions
4. Whitelist your IP address (or use 0.0.0.0/0 for all IPs in development)
5. Get your connection string from "Connect" → "Connect your application"
6. Replace `<password>` and `<dbname>` in the connection string

Example connection string:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/collegeconnect?retryWrites=true&w=majority
```

## Step 2: Deploy on Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Leave empty (root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. Add Environment Variables:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: Generate a strong secret (32+ characters)
   - `NODE_ENV`: `production`
   - `CLIENT_URL`: `https://your-app-name.vercel.app` (will be set automatically)
   - `VITE_API_URL`: `/api` (for frontend)

6. Deploy the project
7. Your full-stack app will be available at your Vercel URL!

## How It Works

- **Frontend**: `https://your-app.vercel.app/` → Serves your React app
- **Backend API**: `https://your-app.vercel.app/api/` → Serves your Express API
- **File uploads**: `https://your-app.vercel.app/uploads/` → Serves uploaded files
- **Same domain** = No CORS issues! 🎉

## Environment Variables Summary

### Vercel Environment Variables
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/collegeconnect?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-here
NODE_ENV=production
CLIENT_URL=https://your-app-name.vercel.app
VITE_API_URL=/api
```

## Troubleshooting

### Common Issues

1. **Database Connection**: Verify your MongoDB Atlas connection string and IP whitelist
2. **Build Failures**: Check the build logs in Vercel for specific error messages
3. **Environment Variables**: Ensure all required environment variables are set
4. **CORS Issues**: Should not occur since frontend and backend are on the same domain

### Health Checks

- Backend Health: `https://your-app-name.vercel.app/api/health`
- Frontend: Your Vercel URL should load the application

## Local Development

For local development, create a `.env` file in the backend directory:

```env
MONGODB_URI=mongodb://localhost:27017/collegeconnect
JWT_SECRET=your-local-jwt-secret
NODE_ENV=development
CLIENT_URL=http://localhost:5173
PORT=5000
```

And in the root directory for frontend:

```env
VITE_API_URL=http://localhost:5000/api
```

## Benefits of Vercel Deployment

- ✅ **Single deployment** - Everything in one place
- ✅ **No CORS issues** - Same domain for frontend and backend
- ✅ **Automatic scaling** - Vercel handles serverless functions
- ✅ **Easy management** - One dashboard for everything
- ✅ **Free tier** - Vercel's generous free limits
- ✅ **Automatic HTTPS** - Secure by default
- ✅ **Global CDN** - Fast loading worldwide