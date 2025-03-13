import ApiService from './api';

/**
 * Notification service for handling notification-related API calls
 */
class NotificationService {
  /**
   * Get user notifications
   * @param {Object} options - Pagination options
   * @returns {Promise<Array>} - List of notifications
   */
  static async getNotifications(options = {}) {
    const queryParams = new URLSearchParams();
    
    if (options.page) queryParams.append('page', options.page);
    if (options.limit) queryParams.append('limit', options.limit);
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return await ApiService.get(`/api/notifications${queryString}`);
  }

  /**
   * Mark a notification as read
   * @param {string} notificationId - Notification ID
   * @returns {Promise<Object>} - Updated notification
   */
  static async markAsRead(notificationId) {
    return await ApiService.put(`/api/notifications/${notificationId}/read`);
  }

  /**
   * Mark all notifications as read
   * @returns {Promise<Object>} - Response message
   */
  static async markAllAsRead() {
    return await ApiService.put('/api/notifications/read-all');
  }

  /**
   * Delete a notification
   * @param {string} notificationId - Notification ID
   * @returns {Promise<Object>} - Response message
   */
  static async deleteNotification(notificationId) {
    return await ApiService.delete(`/api/notifications/${notificationId}`);
  }

  /**
   * Get unread notification count
   * @returns {Promise<Object>} - Count of unread notifications
   */
  static async getUnreadCount() {
    return await ApiService.get('/api/notifications/unread-count');
  }
}

export default NotificationService;
