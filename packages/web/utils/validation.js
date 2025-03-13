/**
 * Web-specific validation utilities that leverage shared validations
 */
const { validators } = require('@community-forum/shared');

/**
 * Validates a complete user registration form
 * @param {Object} userData - User data to validate
 * @returns {Object} - Object with validation result and any errors
 */
const validateUserRegistration = (userData) => {
  const errors = {};
  
  // Validate email using shared validator
  if (!validators.isValidEmail(userData.email)) {
    errors.email = 'Please enter a valid email address';
  }
  
  // Validate password using shared validator
  if (!validators.isValidPassword(userData.password)) {
    errors.password = 'Password must be at least 8 characters with uppercase, lowercase, number, and special character';
  }
  
  // Web-specific validation for username
  if (!userData.username || userData.username.length < 3) {
    errors.username = 'Username must be at least 3 characters';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validates a post submission
 * @param {Object} postData - Post data to validate
 * @returns {Object} - Object with validation result and any errors
 */
const validatePostSubmission = (postData) => {
  const errors = {};
  
  // Validate post content using shared validator
  if (!validators.isValidPostContent(postData.content)) {
    errors.content = 'Post content cannot be empty';
  }
  
  // Validate category using shared validator
  if (!validators.isValidCategory(postData.category)) {
    errors.category = 'Please select a valid category';
  }
  
  // Web-specific validation for title
  if (!postData.title || postData.title.length < 5) {
    errors.title = 'Title must be at least 5 characters';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

module.exports = {
  validateUserRegistration,
  validatePostSubmission
};
