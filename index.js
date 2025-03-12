// Apply global error protection at the earliest possible point
if (typeof global !== 'undefined') {
  // Safely check for undefined functions
  const safeFunction = function(fn, args) {
    try {
      if (typeof fn === 'function') {
        return fn.apply(this, args || []);
      }
    } catch (e) {
      console.error('Error in function call:', e);
    }
    return undefined;
  };

  // Patch Function.prototype.call
  const originalCall = Function.prototype.call;
  Function.prototype.call = function(thisArg, ...args) {
    return safeFunction(function() {
      return originalCall.apply(this, [thisArg, ...args]);
    }, []);
  };

  // Patch Function.prototype.apply
  const originalApply = Function.prototype.apply;
  Function.prototype.apply = function(thisArg, argsArray) {
    return safeFunction(function() {
      return originalApply.call(this, thisArg, argsArray || []);
    }, []);
  };

  // Add global error handler
  const originalSetTimeout = global.setTimeout;
  global.setTimeout = function(func, ...rest) {
    const safeFunc = function(...args) {
      return safeFunction(func, args);
    };
    return originalSetTimeout.apply(this, [safeFunc, ...rest]);
  };

  // Global error boundary for all rendering
  if (global.ErrorUtils) {
    const originalHandler = global.ErrorUtils.getGlobalHandler();
    global.ErrorUtils.setGlobalHandler((error, isFatal) => {
      console.log('Caught global error:', error);
      if (originalHandler) {
        originalHandler(error, isFatal);
      }
    });
  }
}

import { registerRootComponent } from 'expo';
import App from './src/App';

// Register the root component
registerRootComponent(App);
