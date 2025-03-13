import ApiService from './api';

/**
 * User service for handling user-related API calls
 */
class UserService {
  /**
   * Get user profile by ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - User profile data
   */
  static async getUserProfile(userId) {
    return await ApiService.get(`/api/users/${userId}`, false);
  }

  /**
   * Get posts created by a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} - List of user's posts
   */
  static async getUserPosts(userId) {
    return await ApiService.get(`/api/users/${userId}/posts`, false);
  }

  /**
   * Get comments made by a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} - List of user's comments
   */
  static async getUserComments(userId) {
    return await ApiService.get(`/api/users/${userId}/comments`, false);
  }

  /**
   * Update user profile
   * @param {Object} profileData - Updated profile data
   * @returns {Promise<Object>} - Updated user profile
   */
  static async updateProfile(profileData) {
    return await ApiService.put('/api/users/profile', profileData);
  }

  /**
   * Change user password
   * @param {Object} passwordData - Password change data
   * @returns {Promise<Object>} - Response message
   */
  static async changePassword(passwordData) {
    return await ApiService.put('/api/users/password', passwordData);
  }

  /**
   * Upload user avatar
   * @param {Object} imageFile - Image file object
   * @returns {Promise<Object>} - Updated user profile with avatar
   */
  static async uploadAvatar(imageFile) {
    const formData = new FormData();
    
    formData.append('avatar', {
      uri: imageFile.uri,
      type: imageFile.type || 'image/jpeg',
      name: imageFile.fileName || 'avatar.jpg'
    });
    
    return await ApiService.uploadMedia('/api/users/avatar', formData);
  }
}

export default UserService;
