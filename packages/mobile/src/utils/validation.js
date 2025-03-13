/**
 * Mobile-specific validation utilities that leverage shared validations
 */
import { validators } from '@community-forum/shared';

/**
 * Validates a user login form
 * @param {Object} loginData - Login data to validate
 * @returns {Object} - Object with validation result and any errors
 */
export const validateLoginForm = (loginData) => {
  const errors = {};
  
  // Validate email using shared validator
  if (!validators.isValidEmail(loginData.email)) {
    errors.email = 'Please enter a valid email address';
  }
  
  // Mobile-specific minimal password validation
  if (!loginData.password || loginData.password.length === 0) {
    errors.password = 'Password is required';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validates a post submission form
 * @param {Object} postData - Post data to validate
 * @returns {Object} - Object with validation result and any errors
 */
export const validatePostForm = (postData) => {
  const errors = {};
  
  // Validate post content using shared validator
  if (!validators.isValidPostContent(postData.content)) {
    errors.content = 'Post content cannot be empty';
  }
  
  // Validate category using shared validator
  if (!validators.isValidCategory(postData.category)) {
    errors.category = 'Please select a valid category';
  }
  
  // Mobile-specific validation for title
  if (!postData.title || postData.title.length < 3) {
    errors.title = 'Title must be at least 3 characters';
  }
  
  // Mobile-specific media validation
  if (postData.media && postData.media.type) {
    if (postData.media.type.startsWith('image/') && !validators.isValidImageType(postData.media.type)) {
      errors.media = 'Invalid image format. Please use JPEG, PNG, GIF, or WebP';
    } else if (postData.media.type.startsWith('video/') && !validators.isValidVideoType(postData.media.type)) {
      errors.media = 'Invalid video format. Please use MP4, WebM, or OGG';
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validates a media file before upload
 * @param {Object} file - File object with type and size properties
 * @returns {Object} - Object with validation result and any error message
 */
export const validateMediaFile = (file) => {
  // Check if file exists
  if (!file) {
    return { isValid: false, error: 'No file selected' };
  }
  
  // Check file type
  const isImage = file.type.startsWith('image/');
  const isVideo = file.type.startsWith('video/');
  
  if (isImage && !validators.isValidImageType(file.type)) {
    return { isValid: false, error: 'Invalid image format. Please use JPEG, PNG, GIF, or WebP' };
  }
  
  if (isVideo && !validators.isValidVideoType(file.type)) {
    return { isValid: false, error: 'Invalid video format. Please use MP4, WebM, or OGG' };
  }
  
  if (!isImage && !isVideo) {
    return { isValid: false, error: 'File must be an image or video' };
  }
  
  // Check file size (10MB max)
  const maxSize = 10 * 1024 * 1024; // 10MB in bytes
  if (file.size > maxSize) {
    return { isValid: false, error: 'File too large. Maximum size is 10MB' };
  }
  
  return { isValid: true };
};
