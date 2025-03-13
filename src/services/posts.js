import ApiService from './api';

/**
 * Post service for handling post-related API calls
 */
class PostService {
  /**
   * Get all posts
   * @param {Object} options - Pagination and filter options
   * @returns {Promise<Array>} - List of posts
   */
  static async getPosts(options = {}) {
    const queryParams = new URLSearchParams();
    
    if (options.page) queryParams.append('page', options.page);
    if (options.limit) queryParams.append('limit', options.limit);
    if (options.sortBy) queryParams.append('sortBy', options.sortBy);
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return await ApiService.get(`/api/posts${queryString}`, false);
  }

  /**
   * Get posts by category
   * @param {string} category - Category name (free, qa, ai)
   * @param {Object} options - Pagination options
   * @returns {Promise<Array>} - List of posts in the category
   */
  static async getPostsByCategory(category, options = {}) {
    const queryParams = new URLSearchParams();
    
    if (options.page) queryParams.append('page', options.page);
    if (options.limit) queryParams.append('limit', options.limit);
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return await ApiService.get(`/api/posts/category/${category}${queryString}`, false);
  }

  /**
   * Get a single post by ID
   * @param {string} postId - Post ID
   * @returns {Promise<Object>} - Post data
   */
  static async getPost(postId) {
    return await ApiService.get(`/api/posts/${postId}`, false);
  }

  /**
   * Create a new post
   * @param {Object} postData - Post data
   * @param {Array} mediaFiles - Media files to upload
   * @returns {Promise<Object>} - Created post
   */
  static async createPost(postData, mediaFiles = []) {
    if (!mediaFiles || mediaFiles.length === 0) {
      // Simple post without media
      return await ApiService.post('/api/posts', postData);
    } else {
      // Post with media
      const formData = new FormData();
      
      // Add post data
      formData.append('title', postData.title);
      formData.append('content', postData.content);
      formData.append('category', postData.category);
      
      // Add media files
      mediaFiles.forEach((file, index) => {
        const fileType = file.type || 'image/jpeg';
        const fileName = file.fileName || `file${index}.jpg`;
        formData.append('media', {
          uri: file.uri,
          type: fileType,
          name: fileName
        });
      });
      
      return await ApiService.uploadMedia('/api/posts', formData);
    }
  }

  /**
   * Update an existing post
   * @param {string} postId - Post ID
   * @param {Object} postData - Updated post data
   * @returns {Promise<Object>} - Updated post
   */
  static async updatePost(postId, postData) {
    return await ApiService.put(`/api/posts/${postId}`, postData);
  }

  /**
   * Delete a post
   * @param {string} postId - Post ID
   * @returns {Promise<Object>} - Deletion response
   */
  static async deletePost(postId) {
    return await ApiService.delete(`/api/posts/${postId}`);
  }

  /**
   * Search for posts
   * @param {string} query - Search query
   * @returns {Promise<Array>} - Search results
   */
  static async searchPosts(query) {
    return await ApiService.get(`/api/posts/search?q=${encodeURIComponent(query)}`, false);
  }

  /**
   * Vote on a post
   * @param {string} postId - Post ID
   * @param {string} voteType - 'up' or 'down'
   * @returns {Promise<Object>} - Updated post votes
   */
  static async votePost(postId, voteType) {
    return await ApiService.post(`/api/posts/${postId}/vote`, { voteType });
  }
}

export default PostService;
