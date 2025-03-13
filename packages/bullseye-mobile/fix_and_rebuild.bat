@echo off
echo ===== Fixing and Rebuilding Bullseye Mobile App =====
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

:: Clean up caches
echo Cleaning up caches...
call npm cache clean --force
rmdir /s /q node_modules 2>nul
del package-lock.json 2>nul
echo.

:: Reinstall dependencies
echo Reinstalling dependencies...
call npm install
echo.

:: Set up assets directory
echo Setting up assets directory...
if not exist android\app\src\main\assets mkdir android\app\src\main\assets
if not exist android\app\src\main\res\drawable mkdir android\app\src\main\res\drawable
echo.

:: Build the bundle
echo Building JavaScript bundle...
set NODE_ENV=production
call npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android\app\src\main\assets\index.android.bundle --assets-dest android\app\src\main\res
echo.

:: Create a basic APK
echo Creating APK...
echo ^<?xml version="1.0" encoding="utf-8"?^>^<manifest xmlns:android="http://schemas.android.com/apk/res/android" package="com.bullseye.mobile"^>^<application android:label="Bullseye" android:icon="@mipmap/ic_launcher"^>^<activity android:name="com.facebook.react.devsupport.DevSettingsActivity" /^>^</application^>^</manifest^> > android\app\src\main\AndroidManifest.xml

:: Generate a simple debug APK
echo package com.bullseye.mobile; > android\app\src\main\java\com\bullseye\mobile\MainActivity.java
echo import com.facebook.react.ReactActivity; >> android\app\src\main\java\com\bullseye\mobile\MainActivity.java
echo import com.facebook.react.ReactActivityDelegate; >> android\app\src\main\java\com\bullseye\mobile\MainActivity.java
echo import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint; >> android\app\src\main\java\com\bullseye\mobile\MainActivity.java
echo import com.facebook.react.defaults.DefaultReactActivityDelegate; >> android\app\src\main\java\com\bullseye\mobile\MainActivity.java
echo public class MainActivity extends ReactActivity { >> android\app\src\main\java\com\bullseye\mobile\MainActivity.java
echo   protected String getMainComponentName() { return "Bullseye"; } >> android\app\src\main\java\com\bullseye\mobile\MainActivity.java
echo   protected ReactActivityDelegate createReactActivityDelegate() { >> android\app\src\main\java\com\bullseye\mobile\MainActivity.java
echo     return new DefaultReactActivityDelegate( >> android\app\src\main\java\com\bullseye\mobile\MainActivity.java
echo       this, getMainComponentName(), DefaultNewArchitectureEntryPoint.getFabricEnabled()); >> android\app\src\main\java\com\bullseye\mobile\MainActivity.java
echo   } >> android\app\src\main\java\com\bullseye\mobile\MainActivity.java
echo } >> android\app\src\main\java\com\bullseye\mobile\MainActivity.java

:: Use EAS build instead of direct build
echo Building with EAS (this might take a while)...
call npx eas-cli build --platform android --profile development --local
echo.

:: Find and install APK
echo Installing APK on device...
for /f "tokens=*" %%i in ('dir /s /b *.apk') do (
  echo Found APK: %%i
  adb install -r "%%i"
)

echo.
echo ===== Rebuild Complete =====
echo Running capture_bullseye_logs.bat to debug any issues...
call capture_bullseye_logs.bat
