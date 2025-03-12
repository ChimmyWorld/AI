@echo off
echo Clearing previous logs...
adb logcat -c

echo Starting Bullseye log capture...
echo Press Ctrl+C when the app has crashed to stop capturing

:: Define the log file with timestamp
set timestamp=%date:~-4,4%%date:~-7,2%%date:~-10,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set timestamp=%timestamp: =0%
set logfile=bullseye_log_%timestamp%.txt

:: Capture only logs related to the app package or relevant components
adb logcat -v threadtime "com.bullseye.mobile:*" "*:E" ReactNativeJS:* ReactNative:* expo:* System.err:* AndroidRuntime:* > %logfile%

echo Logs saved to %logfile%
