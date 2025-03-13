@echo off
echo ===== Bullseye Mobile App Rebuild and Test =====
echo.

:: Check prerequisites - with more flexible approach
echo Checking prerequisites...

:: Try to find node in common locations if not in PATH
set NODE_FOUND=0
where node >nul 2>&1
if %ERRORLEVEL% equ 0 (
  set NODE_FOUND=1
  echo Node.js found in PATH
) else (
  if exist "C:\Program Files\nodejs\node.exe" (
    set PATH=%PATH%;C:\Program Files\nodejs
    set NODE_FOUND=1
    echo Node.js found in C:\Program Files\nodejs
  ) else if exist "C:\Program Files (x86)\nodejs\node.exe" (
    set PATH=%PATH%;C:\Program Files (x86)\nodejs
    set NODE_FOUND=1
    echo Node.js found in C:\Program Files (x86)\nodejs
  )
)

if %NODE_FOUND% equ 0 (
  echo WARNING: Node.js not found automatically. APK will not be rebuilt.
  echo Please verify you have Node.js installed for future builds.
  echo.
  echo Proceeding with testing the existing APK...
  goto :skip_build
)

:: Check for ADB
where adb >nul 2>&1
if %ERRORLEVEL% neq 0 (
  echo WARNING: ADB not found in PATH - may need to connect device manually
)

:: Clean up
echo.
echo Cleaning build files...
if exist android\app\build rmdir /s /q android\app\build
echo.

:: Install dependencies
echo Installing dependencies...
call npm install
if %ERRORLEVEL% neq 0 goto :error
echo.

:: Build Android app
echo Building Android app...
cd android
call ./gradlew assembleDebug --info
if %ERRORLEVEL% neq 0 goto :error
cd ..
echo.

echo App built successfully!
echo.

:skip_build
:: Install app on device
echo Checking for connected devices...
adb devices
echo.

echo Installing app on device...
adb install -r android\app\build\outputs\apk\debug\app-debug.apk
if %ERRORLEVEL% neq 0 (
  echo WARNING: Could not install app automatically. Please install manually.
) else (
  echo App installed successfully!
)
echo.

echo Starting app...
adb shell monkey -p com.bullseye.mobile -c android.intent.category.LAUNCHER 1
echo.

echo Starting log capture...
call capture_bullseye_logs.bat
goto :end

:error
echo.
echo ===== BUILD FAILED =====
exit /b 1

:end
echo.
echo ===== BUILD COMPLETED =====
exit /b 0
