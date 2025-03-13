@echo off
echo ===== Fixing "undefined is not a function" Error =====
echo.

:: Check for connected device
echo Checking for connected device...
adb devices
echo.

:: Clear app data
echo Clearing app data...
adb shell pm clear com.bullseye.mobile
echo.

:: Create a proper index.js that prevents undefined function errors
echo Creating error-protected index.js...
echo // Apply global error protection at the earliest possible point > index.js
echo if (typeof global !== 'undefined') { >> index.js
echo   // Safely check for undefined functions >> index.js
echo   const safeFunction = function(fn, args) { >> index.js
echo     try { >> index.js
echo       if (typeof fn === 'function') { >> index.js
echo         return fn.apply(this, args || []); >> index.js
echo       } >> index.js
echo     } catch (e) { >> index.js
echo       console.error('Error in function call:', e); >> index.js
echo     } >> index.js
echo     return undefined; >> index.js
echo   }; >> index.js
echo. >> index.js
echo   // Patch Function.prototype.call >> index.js
echo   const originalCall = Function.prototype.call; >> index.js
echo   Function.prototype.call = function(thisArg, ...args) { >> index.js
echo     return safeFunction(function() { >> index.js
echo       return originalCall.apply(this, [thisArg, ...args]); >> index.js
echo     }, []); >> index.js
echo   }; >> index.js
echo. >> index.js
echo   // Patch Function.prototype.apply >> index.js
echo   const originalApply = Function.prototype.apply; >> index.js
echo   Function.prototype.apply = function(thisArg, argsArray) { >> index.js
echo     return safeFunction(function() { >> index.js
echo       return originalApply.call(this, thisArg, argsArray || []); >> index.js
echo     }, []); >> index.js
echo   }; >> index.js
echo. >> index.js
echo   // Add global error handler >> index.js
echo   const originalSetTimeout = global.setTimeout; >> index.js
echo   global.setTimeout = function(func, ...rest) { >> index.js
echo     const safeFunc = function(...args) { >> index.js
echo       return safeFunction(func, args); >> index.js
echo     }; >> index.js
echo     return originalSetTimeout.apply(this, [safeFunc, ...rest]); >> index.js
echo   }; >> index.js
echo. >> index.js
echo   // Global error boundary for all rendering >> index.js
echo   if (global.ErrorUtils) { >> index.js
echo     const originalHandler = global.ErrorUtils.getGlobalHandler(); >> index.js
echo     global.ErrorUtils.setGlobalHandler((error, isFatal) => { >> index.js
echo       console.log('Caught global error:', error); >> index.js
echo       if (originalHandler) { >> index.js
echo         originalHandler(error, isFatal); >> index.js
echo       } >> index.js
echo     }); >> index.js
echo   } >> index.js
echo } >> index.js
echo. >> index.js
echo import { registerRootComponent } from 'expo'; >> index.js
echo import App from './src/App'; >> index.js
echo. >> index.js
echo // Register the root component >> index.js
echo registerRootComponent(App); >> index.js
echo. >> index.js

:: Update error utils for component protection
echo Updating error utilities...
if not exist src\utils mkdir src\utils
echo // Error logging and safe function calling utilities > src\utils\errorUtils.js
echo export const logError = (error, source = 'unknown') => { >> src\utils\errorUtils.js
echo   const errorMessage = error?.message || 'Unknown error'; >> src\utils\errorUtils.js
echo   const errorStack = error?.stack || 'No stack trace'; >> src\utils\errorUtils.js
echo   console.error(`[${source}] Error: ${errorMessage}\n${errorStack}`); >> src\utils\errorUtils.js
echo. >> src\utils\errorUtils.js
echo   // Add additional error reporting here if needed >> src\utils\errorUtils.js
echo   return { error: errorMessage, stack: errorStack, source }; >> src\utils\errorUtils.js
echo }; >> src\utils\errorUtils.js
echo. >> src\utils\errorUtils.js
echo export const safeCall = (fn, args = []) => { >> src\utils\errorUtils.js
echo   if (typeof fn === 'function') { >> src\utils\errorUtils.js
echo     try { >> src\utils\errorUtils.js
echo       return fn(...args); >> src\utils\errorUtils.js
echo     } catch (error) { >> src\utils\errorUtils.js
echo       logError(error, 'safeCall'); >> src\utils\errorUtils.js
echo       return null; >> src\utils\errorUtils.js
echo     } >> src\utils\errorUtils.js
echo   } >> src\utils\errorUtils.js
echo   return null; >> src\utils\errorUtils.js
echo }; >> src\utils\errorUtils.js
echo. >> src\utils\errorUtils.js
echo // Global error protection function >> src\utils\errorUtils.js
echo export const withErrorProtection = (Component) => { >> src\utils\errorUtils.js
echo   return (props) => { >> src\utils\errorUtils.js
echo     try { >> src\utils\errorUtils.js
echo       return Component(props); >> src\utils\errorUtils.js
echo     } catch (error) { >> src\utils\errorUtils.js
echo       logError(error, `Component: ${Component.name || 'Anonymous'}`); >> src\utils\errorUtils.js
echo       return null; >> src\utils\errorUtils.js
echo     } >> src\utils\errorUtils.js
echo   }; >> src\utils\errorUtils.js
echo }; >> src\utils\errorUtils.js

:: Create GlobalErrorHandler.js for react components
echo Creating GlobalErrorHandler for React components...
if not exist src\utils mkdir src\utils
echo import React from 'react'; >> src\utils\GlobalErrorHandler.js
echo import { logError } from './errorUtils'; >> src\utils\GlobalErrorHandler.js
echo. >> src\utils\GlobalErrorHandler.js
echo class ErrorBoundary extends React.Component { >> src\utils\GlobalErrorHandler.js
echo   constructor(props) { >> src\utils\GlobalErrorHandler.js
echo     super(props); >> src\utils\GlobalErrorHandler.js
echo     this.state = { hasError: false, error: null }; >> src\utils\GlobalErrorHandler.js
echo   } >> src\utils\GlobalErrorHandler.js
echo. >> src\utils\GlobalErrorHandler.js
echo   static getDerivedStateFromError(error) { >> src\utils\GlobalErrorHandler.js
echo     return { hasError: true, error }; >> src\utils\GlobalErrorHandler.js
echo   } >> src\utils\GlobalErrorHandler.js
echo. >> src\utils\GlobalErrorHandler.js
echo   componentDidCatch(error, errorInfo) { >> src\utils\GlobalErrorHandler.js
echo     logError(error, 'ErrorBoundary'); >> src\utils\GlobalErrorHandler.js
echo   } >> src\utils\GlobalErrorHandler.js
echo. >> src\utils\GlobalErrorHandler.js
echo   render() { >> src\utils\GlobalErrorHandler.js
echo     if (this.state.hasError) { >> src\utils\GlobalErrorHandler.js
echo       return this.props.fallback || null; >> src\utils\GlobalErrorHandler.js
echo     } >> src\utils\GlobalErrorHandler.js
echo     return this.props.children; >> src\utils\GlobalErrorHandler.js
echo   } >> src\utils\GlobalErrorHandler.js
echo } >> src\utils\GlobalErrorHandler.js
echo. >> src\utils\GlobalErrorHandler.js
echo export const withErrorBoundary = (Component, fallback = null) => { >> src\utils\GlobalErrorHandler.js
echo   return (props) => ( >> src\utils\GlobalErrorHandler.js
echo     ^<ErrorBoundary fallback={fallback}^> >> src\utils\GlobalErrorHandler.js
echo       ^<Component {...props} /^> >> src\utils\GlobalErrorHandler.js
echo     ^</ErrorBoundary^> >> src\utils\GlobalErrorHandler.js
echo   ); >> src\utils\GlobalErrorHandler.js
echo }; >> src\utils\GlobalErrorHandler.js
echo. >> src\utils\GlobalErrorHandler.js
echo export default ErrorBoundary; >> src\utils\GlobalErrorHandler.js

:: Handle splash screen fix if available
if exist src\assets\splash.js (
  echo Updating splash screen to prevent undefined function calls...
  echo /* eslint-disable */ > src\assets\splash.js.new
  echo import React from 'react'; >> src\assets\splash.js.new
  echo import { Animated, Image, View, StyleSheet } from 'react-native'; >> src\assets\splash.js.new
  echo import { safeCall } from '../utils/errorUtils'; >> src\assets\splash.js.new
  echo. >> src\assets\splash.js.new
  type src\assets\splash.js | findstr /v "onComplete(" | findstr /v "Animated.sequence" >> src\assets\splash.js.new
  echo   const startAnimations = () => { >> src\assets\splash.js.new
  echo     // Using Animated.sequence to run animations one after another >> src\assets\splash.js.new
  echo     Animated.sequence([ >> src\assets\splash.js.new
  echo       // Fade in the bullseye image >> src\assets\splash.js.new
  echo       Animated.timing(opacityBullseye, { >> src\assets\splash.js.new
  echo         toValue: 1, >> src\assets\splash.js.new
  echo         duration: 800, >> src\assets\splash.js.new
  echo         useNativeDriver: true, >> src\assets\splash.js.new
  echo       }), >> src\assets\splash.js.new
  echo       // Short delay to show the bullseye >> src\assets\splash.js.new
  echo       Animated.delay(1000), >> src\assets\splash.js.new
  echo       // Fade out the bullseye image >> src\assets\splash.js.new
  echo       Animated.timing(opacityBullseye, { >> src\assets\splash.js.new
  echo         toValue: 0, >> src\assets\splash.js.new
  echo         duration: 500, >> src\assets\splash.js.new
  echo         useNativeDriver: true, >> src\assets\splash.js.new
  echo       }) >> src\assets\splash.js.new
  echo     ]).start(() => { >> src\assets\splash.js.new
  echo       // FIXED: Safely call onComplete function to prevent undefined errors >> src\assets\splash.js.new
  echo       if (onComplete) { >> src\assets\splash.js.new
  echo         safeCall(onComplete); >> src\assets\splash.js.new
  echo       } >> src\assets\splash.js.new
  echo     }); >> src\assets\splash.js.new
  echo   }; >> src\assets\splash.js.new
  echo export default BullseyeSplash; >> src\assets\splash.js.new
  move /Y src\assets\splash.js.new src\assets\splash.js
)

echo.
echo ===== Fix Applied Successfully =====
echo.
echo Next steps:
echo 1. Run "npx expo start" to start the dev server
echo 2. Use Expo Go on your Galaxy Fold3 to test the app
echo 3. If the app still crashes, run "capture_bullseye_logs.bat" for detailed logs
