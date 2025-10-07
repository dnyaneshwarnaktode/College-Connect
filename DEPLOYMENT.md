# CollegeConnect Deployment Guide

This guide will help you deploy the CollegeConnect platform to Vercel (frontend) and Render (backend) with MongoDB Atlas.

## Prerequisites

1. GitHub account
2. Vercel account
3. Render account
4. MongoDB Atlas account

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

## Step 2: Backend Deployment on Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `collegeconnect-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Plan**: Free

5. Add Environment Variables:
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: Generate a strong secret (32+ characters)
   - `CLIENT_URL`: `https://collegeconnect-frontend.vercel.app`
   - `PORT`: `10000` (Render uses this port)

6. Deploy the service
7. Note down your backend URL (e.g., `https://collegeconnect-backend.onrender.com`)

## Step 3: Frontend Deployment on Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Leave empty (root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. Add Environment Variables:
   - `VITE_API_URL`: Your Render backend URL + `/api` (e.g., `https://college-connect-.onrender.com/api`)

6. Deploy the project
7. Note down your frontend URL (e.g., `https://college-connect-black.vercel.app`)

## Step 4: Update CORS Settings

After both deployments are complete:

1. Go to your Render backend service
2. Update the `CLIENT_URL` environment variable to your actual Vercel URL
3. Redeploy the backend

## Step 5: Database Initialization

1. Access your deployed backend health endpoint: `https://your-backend-url.onrender.com/api/health`
2. If you need to initialize the database with sample data, you can run the setup scripts locally with the production MongoDB URI

## Environment Variables Summary

### Backend (Render)
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/collegeconnect?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-here
CLIENT_URL=https://collegeconnect-frontend.vercel.app
PORT=10000
```

### Frontend (Vercel)
```
VITE_API_URL=https://collegeconnect-backend.onrender.com/api
```

## Troubleshooting

### Common Issues

1. **CORS Errors**: Make sure the `CLIENT_URL` in your backend matches your actual Vercel URL
2. **Database Connection**: Verify your MongoDB Atlas connection string and IP whitelist
3. **Build Failures**: Check the build logs in Render/Vercel for specific error messages
4. **Environment Variables**: Ensure all required environment variables are set

### Health Checks

- Backend Health: `https://your-backend-url.onrender.com/api/health`
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

## Production URLs

After successful deployment, your application will be available at:
- Frontend: `https://collegeconnect-frontend.vercel.app`
- Backend API: `https://collegeconnect-backend.onrender.com/api`
