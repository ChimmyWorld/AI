/**
 * Shared validation functions for both web and mobile applications
 */
const { POST_CATEGORIES, USER_ROLES } = require('./constants');

/**
 * Validates email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if email is valid
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates password strength
 * @param {string} password - Password to validate
 * @returns {boolean} - True if password meets criteria
 */
const isValidPassword = (password) => {
  // Password should be at least 8 characters with at least one uppercase, lowercase, number, and special character
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

/**
 * Validates post category
 * @param {string} category - Category to validate
 * @returns {boolean} - True if category is valid
 */
const isValidCategory = (category) => {
  return Object.values(POST_CATEGORIES).includes(category);
};

/**
 * Validates user role
 * @param {string} role - Role to validate
 * @returns {boolean} - True if role is valid
 */
const isValidRole = (role) => {
  return Object.values(USER_ROLES).includes(role);
};

/**
 * Validates post content (not empty)
 * @param {string} content - Post content to validate
 * @returns {boolean} - True if content is valid
 */
const isValidPostContent = (content) => {
  return content && content.trim().length > 0;
};

/**
 * Validates image file type
 * @param {string} mimeType - File MIME type
 * @returns {boolean} - True if file type is a valid image
 */
const isValidImageType = (mimeType) => {
  const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  return validImageTypes.includes(mimeType);
};

/**
 * Validates video file type
 * @param {string} mimeType - File MIME type
 * @returns {boolean} - True if file type is a valid video
 */
const isValidVideoType = (mimeType) => {
  const validVideoTypes = ['video/mp4', 'video/webm', 'video/ogg'];
  return validVideoTypes.includes(mimeType);
};

module.exports = {
  isValidEmail,
  isValidPassword,
  isValidCategory,
  isValidRole,
  isValidPostContent,
  isValidImageType,
  isValidVideoType
};
