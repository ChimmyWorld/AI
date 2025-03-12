// Error logging and safe function calling utilities
export const logError = (error, source = 'unknown') => {
  const errorMessage = error?.message || 'Unknown error';
  const errorStack = error?.stack || 'No stack trace';
  console.error(`[${source}] Error: ${errorMessage}\n${errorStack}`);
  
  // Add additional error reporting here if needed
  return { error: errorMessage, stack: errorStack, source };
};

export const safeCall = (fn, args = []) => {
  if (typeof fn === 'function') {
    try {
      return fn(...args);
    } catch (error) {
      logError(error, 'safeCall');
      return null;
    }
  }
  return null;
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
