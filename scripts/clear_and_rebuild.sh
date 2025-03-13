#!/bin/bash
# Full cleanup and rebuild script

echo "===== Full App Cleanup and Rebuild ====="
echo

# Clear caches
echo "Clearing React Native caches..."
rm -rf node_modules/.cache
rm -rf $TMPDIR/react-*
rm -rf $TMPDIR/metro-*

# Clear build directories
echo "Clearing build directories..."
rm -rf android/app/build
rm -rf android/build
rm -rf build

# Remove node_modules and reinstall
echo "Reinstalling dependencies..."
rm -rf node_modules
rm -f package-lock.json
npm install

# Clean Gradle project
echo "Cleaning Android project..."
cd android && ./gradlew clean && cd ..

# Clear Metro bundler cache
echo "Clearing Metro bundler cache..."
npm start -- --reset-cache &
sleep 5
kill $!

# Rebuild the app
echo "Building the app..."
cd android && ./gradlew assembleDebug --info

echo
echo "===== Rebuild complete! ====="
echo "Next steps:"
echo "1. Install on device: adb install -r android/app/build/outputs/apk/debug/app-debug.apk"
echo "2. Start log capture: ./capture_bullseye_logs.bat"
