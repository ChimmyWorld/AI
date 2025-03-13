# Community Forum

A Reddit-like community website with categories for Free discussion, Q&A, and AI topics. Built with Node.js, Express, and MongoDB.

## Features

- Three categories: Free, Q&A, and AI discussions
- User authentication (register/login)
- Create posts with images and videos
- Comment system
- Voting system (upvotes/downvotes)
- User karma tracking
- Responsive UI

## Tech Stack

- Backend: Node.js, Express
- Database: MongoDB
- Authentication: JWT
- File Storage: Cloudinary
- Frontend: HTML, CSS, JavaScript, Bootstrap

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file with the following variables:
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

3. Start the server:
```bash
npm start
```

The application will be running at `http://localhost:3000`

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login user

### Posts
- GET `/api/posts` - Get all posts
- GET `/api/posts/category/:category` - Get posts by category
- POST `/api/posts` - Create new post
- POST `/api/posts/:id/comments` - Add comment to post
- POST `/api/posts/:id/vote` - Vote on post
