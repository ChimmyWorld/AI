// Axios configuration for API calls
import axios from 'axios';

// Helper function to check if we are in production
const isProduction = () => {
  return import.meta.env.PROD || window.location.hostname !== 'localhost';
};

// Get the host from window location for dynamic API URL
const getApiBaseUrl = () => {
  const host = window.location.host;
  
  // For the browser preview which runs on different origins
  if (host.includes('127.0.0.1')) {
    console.log('Browser preview detected, using direct localhost URL');
    return 'http://localhost:10002/api';
  }
  
  // For local development
  return isProduction()
    ? '/api'
    : 'http://localhost:10002/api';
};

// Create an axios instance with a base URL that works in both development and production
const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true,
  // Add timeout to prevent long-hanging requests
  timeout: 15000
});

// Log configuration on startup for debugging
console.log(`API configured with baseURL: ${api.defaults.baseURL}, isProduction: ${isProduction()}, host: ${window.location.host}`);

// Add request interceptor for authentication token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  console.error('API Request Error:', error);
  return Promise.reject(error);
});

// Add response interceptor for common error handling
api.interceptors.response.use((response) => {
  return response;
}, (error) => {
  console.error('API Error:', error.message || 'No response received', error.response?.data || {});
  return Promise.reject(error);
});

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
