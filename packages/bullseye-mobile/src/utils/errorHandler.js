/**
 * Global error handling utilities for Bullseye Mobile App
 * 
 * This module provides a centralized error handling system to:
 * 1. Catch and log errors safely
 * 2. Prevent app crashes from undefined functions
 * 3. Store error logs for debugging purposes
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Platform } from 'react-native';

// Maximum number of error logs to store
const MAX_ERROR_LOGS = 50;

/**
 * Initialize global error handlers
 * Should be called at app startup
 */
export const initializeErrorHandlers = () => {
  // Set up global error boundary
  if (global.ErrorUtils) {
    const originalHandler = global.ErrorUtils.getGlobalHandler();
    
    global.ErrorUtils.setGlobalHandler(async (error, isFatal) => {
      try {
        await logErrorToStorage({
          error: error.message,
          stack: error.stack,
          isFatal,
          timestamp: new Date().toISOString(),
          type: 'global'
        });
        
        console.error(
          `[GLOBAL ERROR] ${isFatal ? 'FATAL: ' : ''}${error.message}\n${error.stack}`
        );
      } catch (loggingError) {
        // Last resort error logging
        console.error('Failed to log error:', loggingError);
      }
      
      // Call original handler
      if (originalHandler) {
        originalHandler(error, isFatal);
      }
    });
  }
  
  // Patch Function prototype to handle undefined functions
  if (!global.__isErrorHandlerPatched) {
    const originalCall = Function.prototype.call;
    Function.prototype.call = function(thisArg, ...args) {
      return safeFunction(function() {
        return originalCall.apply(this, [thisArg, ...args]);
      }, []);
    };
    
    const originalApply = Function.prototype.apply;
    Function.prototype.apply = function(thisArg, argsArray) {
      return safeFunction(function() {
        return originalApply.call(this, thisArg, argsArray || []);
      }, []);
    };
    
    // Mark as patched to avoid double-patching
    global.__isErrorHandlerPatched = true;
    
    console.log('[ErrorHandler] Global error protections initialized');
  }
};

/**
 * Safely execute a function, catching any errors
 * @param {Function} fn - Function to execute
 * @param {Array} args - Arguments to pass to the function
 * @param {string} source - Source identifier for error logging
 * @returns {any} - Return value from function or undefined on error
 */
export const safeFunction = (fn, args = [], source = 'unknown') => {
  if (typeof fn !== 'function') {
    // Log an attempted call to undefined function
    logError(
      new Error(`Attempted to call undefined function from ${source}`),
      source
    );
    return undefined;
  }
  
  try {
    return fn(...args);
  } catch (error) {
    logError(error, source);
    return undefined;
  }
};

/**
 * Log an error to console and storage
 * @param {Error} error - Error object
 * @param {string} source - Source of the error
 */
export const logError = async (error, source = 'unknown') => {
  const errorMessage = error?.message || 'Unknown error';
  const errorStack = error?.stack || 'No stack trace';
  const timestamp = new Date().toISOString();
  
  console.error(`[${source}] Error: ${errorMessage}\n${errorStack}`);
  
  // Store in AsyncStorage for the debug screen
  await logErrorToStorage({
    error: errorMessage,
    stack: errorStack,
    source,
    timestamp,
    type: 'caught'
  });
  
  return { error: errorMessage, stack: errorStack, source };
};

/**
 * Add an error to AsyncStorage log history
 * @param {object} errorData - Error data to log
 */
export const logErrorToStorage = async (errorData) => {
  try {
    // Get existing logs
    const existingLogsStr = await AsyncStorage.getItem('errorLogs');
    let logs = existingLogsStr ? JSON.parse(existingLogsStr) : [];
    
    // Add new log at the beginning
    logs.unshift(errorData);
    
    // Limit log size
    if (logs.length > MAX_ERROR_LOGS) {
      logs = logs.slice(0, MAX_ERROR_LOGS);
    }
    
    // Save back to storage
    await AsyncStorage.setItem('errorLogs', JSON.stringify(logs));
  } catch (error) {
    // Last resort error logging
    console.error('Failed to store error log:', error);
  }
};

/**
 * Creates a try/catch wrapper for component methods
 * @param {Component} component - Component to wrap methods for
 * @param {Array} methodNames - List of method names to wrap
 */
export const protectComponentMethods = (component, methodNames) => {
  if (!component) return;
  
  const componentName = component.constructor.name || 'UnknownComponent';
  
  methodNames.forEach(methodName => {
    const originalMethod = component[methodName];
    if (typeof originalMethod === 'function') {
      component[methodName] = function(...args) {
        return safeFunction(
          originalMethod.bind(component),
          args,
          `${componentName}.${methodName}`
        );
      };
    }
  });
};

/**
 * Safe wrapper for React component lifecycle methods
 * @param {Component} WrappedComponent - Component to protect
 * @returns {Component} Protected component
 */
export const withErrorProtection = (WrappedComponent) => {
  return class ErrorProtectedComponent extends WrappedComponent {
    constructor(props) {
      super(props);
      
      // Protect common lifecycle methods
      const methodsToProtect = [
        'componentDidMount',
        'componentDidUpdate',
        'componentWillUnmount',
        'render',
        'shouldComponentUpdate',
        'getDerivedStateFromProps',
        'getSnapshotBeforeUpdate'
      ];
      
      // Add any custom methods from the component
      const customMethods = Object.getOwnPropertyNames(WrappedComponent.prototype)
        .filter(name => 
          typeof this[name] === 'function' && 
          name !== 'constructor' &&
          !methodsToProtect.includes(name)
        );
      
      // Protect all methods
      protectComponentMethods(this, [...methodsToProtect, ...customMethods]);
    }
    
    componentDidCatch(error, info) {
      // Log the error
      logError(error, `${WrappedComponent.name || 'Component'}.componentDidCatch`);
      
      // Call original if it exists
      if (super.componentDidCatch) {
        super.componentDidCatch(error, info);
      }
    }
  };
};

/**
 * Show an error alert to the user
 * @param {string} title - Alert title
 * @param {string} message - Error message
 * @param {Function} onOk - Callback when OK is pressed
 */
export const showErrorAlert = (title, message, onOk = null) => {
  Alert.alert(
    title,
    message,
    [{ text: 'OK', onPress: onOk }],
    { cancelable: false }
  );
};

export default {
  initializeErrorHandlers,
  safeFunction,
  logError,
  logErrorToStorage,
  protectComponentMethods,
  withErrorProtection,
  showErrorAlert
};
