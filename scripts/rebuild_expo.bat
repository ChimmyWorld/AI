@echo off
echo ===== Rebuilding Bullseye Mobile App with Expo =====
echo.

:: Create logs directory if it doesn't exist
if not exist logs mkdir logs

:: Clean up cache
echo Cleaning up cache...
call npm cache clean --force
echo.

:: Clear node_modules and reinstall
echo Removing node_modules and reinstalling dependencies...
if exist node_modules (
  rmdir /s /q node_modules
)
call npm install
echo.

:: Clear metro cache
echo Clearing metro bundler cache...
if exist %APPDATA%\Temp\metro-cache (
  rmdir /s /q %APPDATA%\Temp\metro-cache
)
if exist %APPDATA%\Temp\haste-map-metro-* (
  del /q %APPDATA%\Temp\haste-map-metro-*
)
echo.

:: Clear device
echo Clearing app from device...
adb shell pm clear com.bullseye.mobile
echo.

:: Prepare and build the bundle
echo Preparing JavaScript bundle...
call npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res
echo.

:: Build with Expo
echo Building APK with Expo...
call npx expo prebuild --platform android --clean
call npx expo build:android -t apk
echo.

:: Install on device
echo Installing on device...
for /r %%i in (*.apk) do (
  echo Found APK: %%i
  adb install -r "%%i"
)

echo.
echo ===== Rebuild Complete =====
echo Running capture_bullseye_logs.bat for debugging...
call capture_bullseye_logs.bat
