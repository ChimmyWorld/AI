/**
 * Shared API endpoints for all applications in the monorepo
 */

// Base URLs for different environments
const API_BASE = {
  development: 'https://chimmyworld-ai.onrender.com/api',
  production: 'https://chimmyworld-ai.onrender.com/api',
  test: 'http://localhost:3000/api'
};

// Determine current environment
const getEnvironment = () => {
  // We can enhance this to detect environment based on build flags
  return process.env.NODE_ENV || 'development';
};

// Get base URL for the current environment
const getBaseUrl = () => {
  const env = getEnvironment();
  return API_BASE[env] || API_BASE.development;
};

// API Endpoints
const ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    VERIFY: '/auth/verify',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    PROFILE: '/auth/profile',
  },
  
  // Post endpoints
  POSTS: {
    BASE: '/posts',
    BY_ID: (id) => `/posts/${id}`,
    BY_CATEGORY: (category) => `/posts/category/${category}`,
    BY_USER: (userId) => `/posts/user/${userId}`,
    VOTE: (id) => `/posts/${id}/vote`,
    COMMENTS: (id) => `/posts/${id}/comments`,
  },
  
  // Comment endpoints
  COMMENTS: {
    BASE: '/comments',
    BY_ID: (id) => `/comments/${id}`,
    VOTE: (id) => `/comments/${id}/vote`,
  },
  
  // User endpoints
  USERS: {
    BASE: '/users',
    BY_ID: (id) => `/users/${id}`,
    PROFILE: (username) => `/users/profile/${username}`,
  },
  
  // Media endpoints
  MEDIA: {
    UPLOAD: '/media/upload',
    BY_ID: (id) => `/media/${id}`,
  },
  
  // Health check endpoint
  HEALTH: '/health',
  
  // Debug endpoints for mobile applications
  DEBUG: {
    LOG: '/debug/log',
    METRICS: '/debug/metrics',
    REPORT: '/debug/report',
  }
};

/**
 * Get the full URL for an API endpoint
 * @param {string} endpoint - The API endpoint path
 * @returns {string} - The full URL for the endpoint
 */
const getFullUrl = (endpoint) => {
  return `${getBaseUrl()}${endpoint}`;
};

/**
 * Get all api endpoint configurations
 * @returns {Object} - All API endpoints
 */
const getEndpoints = () => {
  return ENDPOINTS;
};

module.exports = {
  getBaseUrl,
  getFullUrl,
  getEndpoints,
  ENDPOINTS
};
