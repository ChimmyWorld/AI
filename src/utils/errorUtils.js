// Simplified error logging and safe function calling utilities
export const logError = (error, source = 'unknown') => {
  const errorMessage = error ? (error.message || 'Unknown error') : 'Unknown error';
  const errorStack = error ? (error.stack || 'No stack trace') : 'No stack trace';
  console.error(`[${source}] Error: ${errorMessage}\n${errorStack}`);
  
  return { error: errorMessage, stack: errorStack, source };
};

// Safe function call without using Function.prototype methods
export const safeCall = (fn, args = []) => {
  if (typeof fn !== 'function') {
    return null;
  }
  
  try {
    return fn(...args);
  } catch (error) {
    logError(error, 'safeCall');
    return null;
  }
};

// Global error protection function
export const withErrorProtection = (Component) => {
  return (props) => {
    try {
      return Component(props);
    } catch (error) {
      logError(error, `Component: ${Component.name || 'Anonymous'}`);
      return null;
    }
  };
};
