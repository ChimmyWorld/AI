import AsyncStorage from '@react-native-async-storage/async-storage';
import { constants } from '@community-forum/shared';

// Update this with your actual backend URL
const API_URL = 'https://ai-ejoa.onrender.com'; 

/**
 * Base API service for making HTTP requests
 */
class ApiService {
  // Token management
  static async getAuthToken() {
    return await AsyncStorage.getItem('authToken');
  }

  static async setAuthToken(token) {
    if (token) {
      await AsyncStorage.setItem('authToken', token);
    } else {
      await AsyncStorage.removeItem('authToken');
    }
  }

  // Helper methods for making HTTP requests
  static async get(endpoint, requireAuth = true) {
    return this.request('GET', endpoint, null, requireAuth);
  }

  static async post(endpoint, data, requireAuth = true) {
    return this.request('POST', endpoint, data, requireAuth);
  }

  static async put(endpoint, data, requireAuth = true) {
    return this.request('PUT', endpoint, data, requireAuth);
  }

  static async delete(endpoint, requireAuth = true) {
    return this.request('DELETE', endpoint, null, requireAuth);
  }

  static async request(method, endpoint, data, requireAuth = true) {
    const url = `${API_URL}${endpoint}`;
    
    // Prepare headers
    const headers = {
      'Content-Type': 'application/json',
    };

    // Add auth token if required and available
    if (requireAuth) {
      const token = await this.getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    // Prepare request options
    const options = {
      method,
      headers,
    };

    // Add request body for methods that support it
    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(data);
    }

    // Make request
    try {
      console.log(`API Request: ${method} ${url}`);
      if (data) {
        console.log('Request Data:', JSON.stringify(data));
      }
      
      const response = await fetch(url, options);
      
      // Check content type to see if response is JSON
      const contentType = response.headers.get('content-type');
      
      let responseData;
      if (contentType && contentType.includes('application/json')) {
        // Parse JSON response
        responseData = await response.json();
      } else {
        // Handle non-JSON response
        const textResponse = await response.text();
        console.log('Non-JSON Response:', textResponse);
        
        // Try to create a meaningful response object
        responseData = {
          message: textResponse || 'Server returned non-JSON response',
          isTextResponse: true
        };
      }
      
      // Log response for debugging
      console.log(`API Response (${response.status}):`, responseData);
      
      // Handle non-2xx responses
      if (!response.ok) {
        throw {
          status: response.status,
          message: responseData.message || `Request failed with status ${response.status}`,
          data: responseData
        };
      }
      
      return responseData;
    } catch (error) {
      // Handle network errors and other exceptions
      console.error('API Request Error:', error);
      
      // Format error consistently
      if (!error.status) {
        // This is likely a network or parsing error
        error = {
          status: 0,
          message: error.message || 'Network error occurred',
          originalError: error
        };
      }
      
      throw error;
    }
  }

  // Upload media files
  static async uploadMedia(endpoint, formData, requireAuth = true) {
    const url = `${API_URL}${endpoint}`;
    
    // Prepare headers without Content-Type to let fetch set it with boundary
    const headers = {};

    // Add auth token if required
    if (requireAuth) {
      const token = await this.getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    // Make request
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        throw {
          status: response.status,
          message: responseData.message || 'Upload failed',
          data: responseData
        };
      }
      
      return responseData;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  }
}

// API Endpoints methods to use shared constants
ApiService.endpoints = {
  // Auth endpoints
  login: () => constants.API_ENDPOINTS.AUTH.LOGIN,
  register: () => constants.API_ENDPOINTS.AUTH.REGISTER,
  logout: () => constants.API_ENDPOINTS.AUTH.LOGOUT,
  refreshToken: () => constants.API_ENDPOINTS.AUTH.REFRESH,
  
  // Posts endpoints
  posts: {
    getAll: () => constants.API_ENDPOINTS.POSTS.BASE,
    getById: (id) => constants.API_ENDPOINTS.POSTS.BY_ID(id),
    getByCategory: (category) => constants.API_ENDPOINTS.POSTS.BY_CATEGORY(category),
    getByUser: (userId) => constants.API_ENDPOINTS.POSTS.BY_USER(userId),
    upvote: (id) => constants.API_ENDPOINTS.POSTS.UPVOTE(id),
    downvote: (id) => constants.API_ENDPOINTS.POSTS.DOWNVOTE(id)
  },
  
  // Comments endpoints
  comments: {
    getAll: () => constants.API_ENDPOINTS.COMMENTS.BASE,
    getByPost: (postId) => constants.API_ENDPOINTS.COMMENTS.BY_POST(postId),
    getById: (id) => constants.API_ENDPOINTS.COMMENTS.BY_ID(id)
  },
  
  // Users endpoints
  users: {
    getAll: () => constants.API_ENDPOINTS.USERS.BASE,
    getProfile: (userId) => constants.API_ENDPOINTS.USERS.PROFILE(userId),
    getKarma: (userId) => constants.API_ENDPOINTS.USERS.KARMA(userId)
  }
};

export default ApiService;
