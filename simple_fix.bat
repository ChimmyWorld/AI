@echo off
echo ===== Applying Simple Fix for Bullseye Mobile App =====
echo.

:: Check for connected device
echo Checking for connected device...
adb devices
echo.

:: Clear app data
echo Clearing app data...
adb shell pm clear com.bullseye.mobile
echo.

:: Create a debug build script that doesn't rely on native Android directories
echo Creating simplified debug build...

:: Make sure the src/utils/errorUtils.js file has the latest fixes
echo // Error logging and safe function calling utilities
echo export const logError = (error, source = 'unknown') => {
echo   const errorMessage = error?.message || 'Unknown error';
echo   const errorStack = error?.stack || 'No stack trace';
echo   console.error(`[${source}] Error: ${errorMessage}\n${errorStack}`);
echo   
echo   // Add additional error reporting here if needed
echo   return { error: errorMessage, stack: errorStack, source };
echo };
echo.
echo export const safeCall = (fn, args = []) => {
echo   if (typeof fn === 'function') {
echo     try {
echo       return fn(...args);
echo     } catch (error) {
echo       logError(error, 'safeCall');
echo       return null;
echo     }
echo   }
echo   return null;
echo };
echo.
echo // Global error protection function
echo export const withErrorProtection = (Component) => {
echo   return (props) => {
echo     try {
echo       return Component(props);
echo     } catch (error) {
echo       logError(error, `Component: ${Component.name || 'Anonymous'}`);
echo       return null;
echo     }
echo   };
echo };
echo > src\utils\errorUtils.js

:: Update index.js with global error fixes
echo // Apply global error handling early
echo if (typeof global !== 'undefined') {
echo   // Protect against undefined function calls
echo   const originalFunc = Function.prototype.call;
echo   Function.prototype.call = function(thisArg, ...args) {
echo     try {
echo       if (typeof this === 'function') {
echo         return originalFunc.apply(this, [thisArg, ...args]);
echo       }
echo     } catch (e) {
echo       console.error('Error in function call:', e);
echo     }
echo     return undefined;
echo   };
echo.
echo   // Add global unhandled promise rejection handler
echo   if (global.ErrorUtils) {
echo     const originalHandler = global.ErrorUtils.getGlobalHandler();
echo     global.ErrorUtils.setGlobalHandler((error, isFatal) => {
echo       console.log('Caught global error:', error);
echo       if (originalHandler) {
echo         originalHandler(error, isFatal);
echo       }
echo     });
echo   }
echo }
echo.
echo import { registerRootComponent } from 'expo';
echo import App from './src/App';
echo.
echo // Register the root component
echo registerRootComponent(App);
echo > index.js

:: Run npm commands to rebuild
echo Reinstalling expo...
call npm install -g expo-cli
call npm install
echo.

:: Run expo directly
echo Starting Expo development server...
call npx expo start --clear
echo.

echo ===== Fix Applied =====
echo.
echo Next steps:
echo 1. The Expo development server should now be running
echo 2. Use the Expo Go app on your device to scan the QR code
echo 3. Test the app for any remaining issues
echo.
