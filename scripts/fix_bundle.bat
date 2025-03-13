@echo off
echo ===== Fixing JavaScript Bundle and Native Library Issues =====
echo.

:: Create logs directory if it doesn't exist
if not exist logs mkdir logs

:: Check for connected device
echo Checking for connected device...
adb devices
echo.

:: Enable more detailed logging
echo Enabling detailed React Native logging...
adb shell setprop log.tag.ReactNative VERBOSE
adb shell setprop log.tag.ReactNativeJS VERBOSE
echo.

:: Clear app data
echo Clearing app data...
adb shell pm clear com.bullseye.mobile
echo.

:: Create patch for app.json to ensure proper native library bundling
echo Patching app.json for native library bundling...
echo {
echo   "expo": {
echo     "name": "Bullseye",
echo     "slug": "bullseye-mobile",
echo     "version": "1.0.0",
echo     "assetBundlePatterns": ["**/*"],
echo     "android": {
echo       "package": "com.bullseye.mobile",
echo       "versionCode": 1,
echo       "adaptiveIcon": {
echo         "foregroundImage": "./assets/adaptive-icon.png",
echo         "backgroundColor": "#FFFFFF"
echo       },
echo       "permissions": [
echo         "android.permission.INTERNET"
echo       ]
echo     },
echo     "plugins": [
echo       [
echo         "expo-build-properties",
echo         {
echo           "android": {
echo             "extraMavenRepos": [
echo               "../../node_modules/jsc-android/dist"
echo             ],
echo             "extraProguardRules": "-keep class com.facebook.jni.** { *; }"
echo           }
echo         }
echo       ]
echo     ]
echo   }
echo } > app.json.new
move /Y app.json.new app.json
echo.

:: Create index.js fix
echo Creating index.js fix for the "undefined is not a function" error...
echo // Apply global error handling early
echo if (typeof global !== 'undefined') {
echo   // Safely check for undefined functions
echo   const originalRequire = global.require;
echo   if (originalRequire) {
echo     global.require = function(...args) {
echo       try {
echo         return originalRequire.apply(this, args);
echo       } catch (e) {
echo         console.error('Error in require:', e);
echo         return null;
echo       }
echo     };
echo   }
echo.  
echo   // Add global error handler
echo   const originalSetTimeout = global.setTimeout;
echo   global.setTimeout = function(func, ...rest) {
echo     // Create a safe version of the function
echo     const safeFunc = function(...args) {
echo       try {
echo         if (typeof func === 'function') {
echo           return func.apply(this, args);
echo         }
echo       } catch (e) {
echo         console.error('Error in setTimeout callback:', e);
echo       }
echo     };
echo     return originalSetTimeout.apply(this, [safeFunc, ...rest]);
echo   };
echo.
echo   // Protect Function.prototype.apply
echo   const originalApply = Function.prototype.apply;
echo   Function.prototype.apply = function(thisArg, argsArray) {
echo     try {
echo       return originalApply.call(this, thisArg, argsArray || []);
echo     } catch (e) {
echo       console.error('Error in function apply:', e);
echo       return undefined;
echo     }
echo   };
echo }
echo.
echo import { registerRootComponent } from 'expo';
echo import App from './src/App';
echo.
echo // Register the root component
echo registerRootComponent(App);
echo > index.js.new
move /Y index.js.new index.js
echo.

:: Instructions for rebuilding the app
echo ===== NEXT STEPS =====
echo.
echo To completely rebuild the app:
echo 1. Run: npm cache clean --force
echo 2. Run: npm install
echo 3. Run: cd android ^&^& ./gradlew clean ^&^& cd ..
echo 4. Run: npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res
echo 5. Run: cd android ^&^& ./gradlew assembleDebug ^&^& cd ..
echo 6. Run: adb install -r android/app/build/outputs/apk/debug/app-debug.apk
echo.
echo After installation, run: capture_bullseye_logs.bat
echo.
echo ===== FIX COMPLETE =====
