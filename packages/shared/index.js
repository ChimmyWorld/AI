/**
 * Main entry point for @community-forum/shared package
 * This file exports all shared utilities, constants, and helpers
 */

// API endpoints
const apiEndpoints = require('./src/api/endpoints');

// Utility functions
const formatters = require('./src/utils/formatters');

// Export all utilities
module.exports = {
  api: {
    endpoints: apiEndpoints.ENDPOINTS,
    getBaseUrl: apiEndpoints.getBaseUrl,
    getFullUrl: apiEndpoints.getFullUrl
  },
  utils: {
    formatTimeAgo: formatters.formatTimeAgo,
    formatNumber: formatters.formatNumber,
    formatUsername: formatters.formatUsername,
    truncateText: formatters.truncateText
  }
};
