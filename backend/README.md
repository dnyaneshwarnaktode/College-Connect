# CollegeConnect Backend API

A comprehensive backend API for the CollegeConnect college engagement platform built with Node.js, Express, and MongoDB.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **User Management**: Complete user CRUD with role-based permissions
- **Events System**: Create, manage, and register for college events
- **Forum Platform**: Discussion posts with replies and likes
- **Project Showcase**: Collaborative project management
- **Team Management**: Create and join teams for various activities
- **AI Assistant**: Intelligent chatbot powered by OpenAI for platform assistance
- **Analytics Dashboard**: Comprehensive platform analytics for admins
- **Security**: Rate limiting, CORS, helmet, input validation
- **Database**: MongoDB with Mongoose ODM

## 🛠 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Express Validator
- **Security**: Helmet, CORS, Rate Limiting
- **File Upload**: Multer
- **AI Integration**: OpenAI API for intelligent assistance
- **Environment**: dotenv

## 📁 Project Structure

```
backend/
├── controllers/          # Route controllers
├── middleware/          # Custom middleware
├── models/             # Mongoose models
├── routes/             # API routes
├── utils/              # Utility functions
├── uploads/            # File uploads directory
├── .env.example        # Environment variables template
├── server.js           # Main server file
└── package.json        # Dependencies and scripts
```

## 🔧 Installation & Setup

1. **Clone and navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your configuration:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/collegeconnect
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRE=7d
   CLIENT_URL=http://localhost:3000
   OPENAI_API_KEY=your-openai-api-key-here
   ```

4. **Start MongoDB**
   - Local: `mongod`
   - Or use MongoDB Atlas cloud database

5. **Run the server**
   ```bash
   # Development mode with nodemon
   npm run dev
   
   # Production mode
   npm start
   ```

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/auth/register` | Register new user | Public |
| POST | `/auth/login` | User login | Public |
| GET | `/auth/me` | Get current user | Private |
| PUT | `/auth/profile` | Update profile | Private |
| PUT | `/auth/change-password` | Change password | Private |

### User Management

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/users` | Get all users | Admin |
| GET | `/users/:id` | Get single user | Private |
| POST | `/users` | Create user | Admin |
| PUT | `/users/:id` | Update user | Admin/Self |
| DELETE | `/users/:id` | Delete user | Admin |
| GET | `/users/stats` | User statistics | Admin |

### Events

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/events` | Get all events | Public |
| GET | `/events/:id` | Get single event | Public |
| POST | `/events` | Create event | Admin/Faculty |
| PUT | `/events/:id` | Update event | Owner/Admin |
| DELETE | `/events/:id` | Delete event | Owner/Admin |
| POST | `/events/:id/register` | Register for event | Private |
| DELETE | `/events/:id/register` | Unregister from event | Private |

### Forums

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/forums` | Get all posts | Public |
| GET | `/forums/:id` | Get single post | Public |
| POST | `/forums` | Create post | Private |
| PUT | `/forums/:id` | Update post | Owner/Admin |
| DELETE | `/forums/:id` | Delete post | Owner/Admin |
| POST | `/forums/:id/like` | Like/unlike post | Private |
| POST | `/forums/:id/replies` | Add reply | Private |

### Projects

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/projects` | Get all projects | Public |
| GET | `/projects/:id` | Get single project | Public |
| POST | `/projects` | Create project | Private |
| PUT | `/projects/:id` | Update project | Owner/Admin |
| DELETE | `/projects/:id` | Delete project | Owner/Admin |
| POST | `/projects/:id/like` | Like/unlike project | Private |
| POST | `/projects/:id/join` | Join project | Private |

### Teams

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/teams` | Get all teams | Public |
| GET | `/teams/:id` | Get single team | Public |
| POST | `/teams` | Create team | Private |
| PUT | `/teams/:id` | Update team | Leader/Admin |
| DELETE | `/teams/:id` | Delete team | Leader/Admin |
| POST | `/teams/:id/join` | Join team | Private |
| DELETE | `/teams/:id/leave` | Leave team | Private |

### AI Assistant

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/assistant` | Chat with AI assistant | Private |
| GET | `/assistant/suggestions` | Get suggested questions | Private |

### Analytics

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/analytics/dashboard` | Dashboard stats | Admin |
| GET | `/analytics/users` | User analytics | Admin |
| GET | `/analytics/events` | Event analytics | Admin |
| GET | `/analytics/forums` | Forum analytics | Admin |
| GET | `/analytics/projects` | Project analytics | Admin |
| GET | `/analytics/teams` | Team analytics | Admin |

## 🔐 Authentication

The API uses JWT tokens for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 👥 User Roles

- **Student**: Basic access to all features
- **Faculty**: Can create events, moderate content
- **Admin**: Full access to all features and analytics

## 🛡 Security Features

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS**: Configured for frontend domain
- **Helmet**: Security headers
- **Input Validation**: Express Validator
- **Password Hashing**: bcryptjs
- **JWT Security**: Secure token generation and validation

## 📊 Database Models

### User Model
- Authentication and profile information
- Role-based permissions
- Activity tracking

### Event Model
- Event details and registration system
- Capacity management
- Category-based organization

### ForumPost Model
- Discussion posts with nested replies
- Like system and view tracking
- Category-based filtering

### Project Model
- Project showcase with collaboration
- Technology stack tracking
- Member management

### Team Model
- Team creation and management
- Role-based team hierarchy
- Meeting scheduling and social links

## 🚀 Deployment

### Environment Variables for Production
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/collegeconnect
JWT_SECRET=your-production-secret-key
CLIENT_URL=https://your-frontend-domain.com
```

### Recommended Hosting Platforms
- **Backend**: Railway, Render, Heroku
- **Database**: MongoDB Atlas
- **File Storage**: AWS S3, Cloudinary

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test
```

## 📝 API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [ ... ]
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the API documentation
- Review the error messages and logs

---

**CollegeConnect Backend API** - Empowering college communities through technology! 🎓