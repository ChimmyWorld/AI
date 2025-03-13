import AsyncStorage from '@react-native-async-storage/async-storage';

// Update this with your actual backend URL
const API_URL = 'https://chimmyworld-ai.onrender.com'; 

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
      const response = await fetch(url, options);
      
      // Parse response body
      const responseData = await response.json();
      
      // Handle non-2xx responses
      if (!response.ok) {
        throw {
          status: response.status,
          message: responseData.message || 'Request failed',
          data: responseData
        };
      }
      
      return responseData;
    } catch (error) {
      console.error('API request error:', error);
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

export default ApiService;
