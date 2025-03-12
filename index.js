// Safe error protection without recursive function patching
import { registerRootComponent } from 'expo';
import App from './src/App';

// Add global error logging
if (typeof global !== 'undefined') {
  // Global error handler for uncaught exceptions
  if (global.ErrorUtils) {
    const originalHandler = global.ErrorUtils.getGlobalHandler();
    global.ErrorUtils.setGlobalHandler((error, isFatal) => {
      console.log('Caught global error:', error);
      if (originalHandler) {
        try {
          originalHandler(error, isFatal);
        } catch (e) {
          console.error('Error in error handler:', e);
        }
      }
    });
  }

  // Safe setTimeout
  const originalSetTimeout = global.setTimeout;
  global.setTimeout = function(func, ...rest) {
    const safeFunc = function(...args) {
      try {
        if (typeof func === 'function') {
          return func(...args);
        }
      } catch (e) {
        console.error('Error in setTimeout callback:', e);
      }
    };
    return originalSetTimeout(safeFunc, ...rest);
  };
}

// Register the root component
registerRootComponent(App);
