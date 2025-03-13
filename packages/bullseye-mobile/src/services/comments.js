import ApiService from './api';

/**
 * Comment service for handling comment-related API calls
 */
class CommentService {
  /**
   * Get comments for a post
   * @param {string} postId - Post ID
   * @returns {Promise<Array>} - List of comments
   */
  static async getComments(postId) {
    return await ApiService.get(`/api/posts/${postId}/comments`, false);
  }

  /**
   * Add a comment to a post
   * @param {string} postId - Post ID
   * @param {Object} commentData - Comment data
   * @returns {Promise<Object>} - Created comment
   */
  static async addComment(postId, commentData) {
    return await ApiService.post(`/api/posts/${postId}/comments`, commentData);
  }

  /**
   * Update a comment
   * @param {string} postId - Post ID
   * @param {string} commentId - Comment ID
   * @param {Object} commentData - Updated comment data
   * @returns {Promise<Object>} - Updated comment
   */
  static async updateComment(postId, commentId, commentData) {
    return await ApiService.put(`/api/posts/${postId}/comments/${commentId}`, commentData);
  }

  /**
   * Delete a comment
   * @param {string} postId - Post ID
   * @param {string} commentId - Comment ID
   * @returns {Promise<Object>} - Deletion response
   */
  static async deleteComment(postId, commentId) {
    return await ApiService.delete(`/api/posts/${postId}/comments/${commentId}`);
  }

  /**
   * Vote on a comment
   * @param {string} postId - Post ID
   * @param {string} commentId - Comment ID
   * @param {string} voteType - 'up' or 'down'
   * @returns {Promise<Object>} - Updated comment votes
   */
  static async voteComment(postId, commentId, voteType) {
    return await ApiService.post(`/api/posts/${postId}/comments/${commentId}/vote`, { voteType });
  }
}

export default CommentService;
