import axios from 'axios';

const baseURL = process.env.NODE_ENV === 'production'
  ? 'https://community-forum-backend.onrender.com/api'
  : 'http://localhost:10000/api';

const api = axios.create({
  baseURL,
  withCredentials: true
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
