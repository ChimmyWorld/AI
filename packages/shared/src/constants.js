/**
 * Shared constants for both web and mobile applications
 */

// Post categories
const POST_CATEGORIES = {
  FREE: 'free',
  QA: 'q&a',
  AI: 'ai'
};

// User roles
const USER_ROLES = {
  USER: 'user',
  MODERATOR: 'moderator',
  ADMIN: 'admin'
};

// API endpoints
const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh'
  },
  POSTS: {
    BASE: '/api/posts',
    BY_ID: (id) => `/api/posts/${id}`,
    BY_CATEGORY: (category) => `/api/posts/category/${category}`,
    BY_USER: (userId) => `/api/posts/user/${userId}`,
    UPVOTE: (id) => `/api/posts/${id}/upvote`,
    DOWNVOTE: (id) => `/api/posts/${id}/downvote`
  },
  COMMENTS: {
    BASE: '/api/comments',
    BY_POST: (postId) => `/api/comments/post/${postId}`,
    BY_ID: (id) => `/api/comments/${id}`
  },
  USERS: {
    BASE: '/api/users',
    PROFILE: (userId) => `/api/users/${userId}/profile`,
    KARMA: (userId) => `/api/users/${userId}/karma`
  }
};

module.exports = {
  POST_CATEGORIES,
  USER_ROLES,
  API_ENDPOINTS
};
