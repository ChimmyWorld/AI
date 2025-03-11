import axios from 'axios';

// Determine if we're in production - more reliable than just checking NODE_ENV
const isProduction = () => {
  // Check if window location is not localhost
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    return !(['localhost', '127.0.0.1'].includes(hostname));
  }
  // Fallback to NODE_ENV
  return process.env.NODE_ENV === 'production';
};

// Create an axios instance with a base URL that works in both development and production
const api = axios.create({
  baseURL: isProduction()
    ? '/api'
    : 'http://localhost:10000/api',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

// Log configuration on startup for debugging
console.log(`API configured with baseURL: ${api.defaults.baseURL}, isProduction: ${isProduction()}`);

// Add a request interceptor to include auth token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor for global error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // More detailed error logging to help with debugging
    if (error.response) {
      // Server responded with a status code outside the 2xx range
      console.error(`API Error [${error.response.status}]:`, error.response.data);
    } else if (error.request) {
      // Request was made but no response received
      console.error("API Error: No response received", error.request);
    } else {
      // Something happened in setting up the request
      console.error("API Error:", error.message);
    }
    return Promise.reject(error);
  }
);

export const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const login = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getPosts = async () => {
  try {
    const response = await api.get('/posts');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const createPost = async (postData) => {
  try {
    const response = await api.post('/posts', postData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export default api;
