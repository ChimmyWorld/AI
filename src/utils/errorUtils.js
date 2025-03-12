import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Logs errors to AsyncStorage for later review
 * @param {Error} error - The error object
 * @param {string} context - Where the error occurred
 */
export const logError = async (error, context = 'Unknown Context') => {
  try {
    const errorLog = {
      timestamp: new Date().toISOString(),
      error: error?.toString() || 'Unknown error',
      stack: error?.stack || 'No stack trace available',
      context,
    };
    
    // Get existing logs if any
    const existingLogsString = await AsyncStorage.getItem('errorLogs');
    const existingLogs = existingLogsString ? JSON.parse(existingLogsString) : [];
    
    // Add new log and store back (keep max 50 logs to prevent storage issues)
    const updatedLogs = [errorLog, ...existingLogs].slice(0, 50);
    await AsyncStorage.setItem('errorLogs', JSON.stringify(updatedLogs));
    
    // Also log to console for immediate debugging
    console.error(`[${context}] Error:`, error);
    if (error?.stack) console.error(error.stack);
    
    return true;
  } catch (storageError) {
    // Last resort fallback if even error logging fails
    console.error('Failed to store error log:', storageError);
    return false;
  }
};

/**
 * Safe function wrapper to prevent undefined function calls
 * @param {Function} fn - The function to safely call
 * @param {Array} args - Arguments to pass to the function
 * @param {*} defaultValue - Value to return if function is undefined or throws
 */
export const safeCall = (fn, args = [], defaultValue = null) => {
  if (typeof fn !== 'function') {
    console.warn('Attempted to call undefined function');
    return defaultValue;
  }
  
  try {
    return fn(...args);
  } catch (error) {
    logError(error, 'safeCall');
    return defaultValue;
  }
};
