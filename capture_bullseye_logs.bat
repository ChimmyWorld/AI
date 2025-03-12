@echo off
echo Clearing previous logs...
adb logcat -c

echo Starting Bullseye log capture...
echo Press Ctrl+C when the app has crashed to stop capturing

:: Define the log file with timestamp
set timestamp=%date:~-4,4%%date:~-7,2%%date:~-10,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set timestamp=%timestamp: =0%
set logfile=logs\bullseye_log_%timestamp%.txt

:: Create logs directory if it doesn't exist
if not exist logs mkdir logs

:: Capture detailed logs with focus on React Native, JavaScript errors, and crash information
adb logcat -v threadtime "*:E" ReactNativeJS:* ReactNative:* JSCore:* System.err:* AndroidRuntime:* ActivityManager:* "com.bullseye.mobile:*" > %logfile%

echo Logs saved to %logfile%
echo Opening logs folder...
start explorer logs
