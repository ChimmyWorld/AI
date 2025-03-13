import ApiService from './api';

/**
 * Authentication service
 */
class AuthService {
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} - Registration response
   */
  static async register(userData) {
    return await ApiService.post('/api/auth/register', userData, false);
  }

  /**
   * Login a user
   * @param {Object} credentials - User login credentials
   * @returns {Promise<Object>} - Login response with token
   */
  static async login(credentials) {
    const response = await ApiService.post('/api/auth/login', credentials, false);
    
    if (response && response.token) {
      await ApiService.setAuthToken(response.token);
    }
    
    return response;
  }

  /**
   * Logout the current user
   */
  static async logout() {
    await ApiService.setAuthToken(null);
  }

  /**
   * Check if user is authenticated
   * @returns {Promise<boolean>} - Authentication status
   */
  static async isAuthenticated() {
    const token = await ApiService.getAuthToken();
    return !!token;
  }

  /**
   * Get the current authenticated user info
   * @returns {Promise<Object>} - User data
   */
  static async getCurrentUser() {
    try {
      return await ApiService.get('/api/auth/me');
    } catch (error) {
      if (error.status === 401) {
        // Token expired or invalid, clear it
        await ApiService.setAuthToken(null);
      }
      throw error;
    }
  }
}

export default AuthService;
