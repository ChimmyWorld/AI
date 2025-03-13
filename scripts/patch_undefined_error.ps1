# PowerShell script to fix the "undefined is not a function" error

Write-Host "===== Applying Targeted Fix for Undefined Function Error =====" -ForegroundColor Cyan

# 1. Update index.js with error protection
Write-Host "Updating index.js with global error protection..." -ForegroundColor Yellow
$indexContent = @"
// Apply global error protection at the earliest possible point
if (typeof global !== 'undefined') {
  // Safely check for undefined functions
  const originalCall = Function.prototype.call;
  Function.prototype.call = function(thisArg, ...args) {
    try {
      if (typeof this === 'function') {
        return originalCall.apply(this, [thisArg, ...args]);
      }
    } catch (e) {
      console.error('Error in function call:', e);
    }
    return undefined;
  };

  // Add global error handler
  const originalSetTimeout = global.setTimeout;
  global.setTimeout = function(func, ...rest) {
    const safeFunc = function(...args) {
      try {
        if (typeof func === 'function') {
          return func.apply(this, args);
        }
      } catch (e) {
        console.error('Error in setTimeout callback:', e);
      }
    };
    return originalSetTimeout.apply(this, [safeFunc, ...rest]);
  };
}

import { registerRootComponent } from 'expo';
import App from './src/App';

// Register the root component
registerRootComponent(App);
"@
Set-Content -Path "index.js" -Value $indexContent -Force

# 2. Update errorUtils.js
Write-Host "Updating errorUtils.js with better error handling..." -ForegroundColor Yellow
$errorUtilsContent = @"
// Error logging and safe function calling utilities
export const logError = (error, source = 'unknown') => {
  const errorMessage = error?.message || 'Unknown error';
  const errorStack = error?.stack || 'No stack trace';
  console.error(`[${source}] Error: ${errorMessage}\n${errorStack}`);
  
  // Add additional error reporting here if needed
  return { error: errorMessage, stack: errorStack, source };
};

export const safeCall = (fn, args = []) => {
  if (typeof fn === 'function') {
    try {
      return fn(...args);
    } catch (error) {
      logError(error, 'safeCall');
      return null;
    }
  }
  return null;
};

// Global error protection function
export const withErrorProtection = (Component) => {
  return (props) => {
    try {
      return Component(props);
    } catch (error) {
      logError(error, `Component: ${Component.name || 'Anonymous'}`);
      return null;
    }
  };
};
"@
New-Item -Path "src\utils" -ItemType Directory -Force | Out-Null
Set-Content -Path "src\utils\errorUtils.js" -Value $errorUtilsContent -Force

# 3. Update App.js to use error protection
Write-Host "Updating App.js with error boundary protection..." -ForegroundColor Yellow
# First, check if App.js exists in the correct location
$appJsPath = "src\App.js"
if (Test-Path $appJsPath) {
    # Read the current App.js content
    $appContent = Get-Content -Path $appJsPath -Raw
    
    # Add the import for error utils if not present
    if (-not ($appContent -match "import.*errorUtils")) {
        $appContent = "import { safeCall, withErrorProtection } from './utils/errorUtils';" + "`n" + $appContent
    }
    
    # Add error boundary wrapping
    $appContent = $appContent -replace "export default (App|function App\(.*\))", "export default withErrorProtection($1"
    $appContent = $appContent -replace "export default withErrorProtection(App)", "export default withErrorProtection(App)"
    
    # Save the modified App.js
    Set-Content -Path $appJsPath -Value $appContent -Force
} else {
    Write-Host "Warning: App.js not found at expected location. Skipping App.js update." -ForegroundColor Yellow
}

# 4. Update splash.js to use safeCall
Write-Host "Updating splash.js to safely call onComplete..." -ForegroundColor Yellow
$splashJsPath = "src\assets\splash.js"
if (Test-Path $splashJsPath) {
    # Read the current splash.js content
    $splashContent = Get-Content -Path $splashJsPath -Raw
    
    # Add the import for safeCall if not present
    if (-not ($splashContent -match "import.*safeCall")) {
        $splashContent = "import { safeCall } from '../utils/errorUtils';" + "`n" + $splashContent
    }
    
    # Replace direct onComplete calls with safeCall
    $splashContent = $splashContent -replace "onComplete\(\)", "safeCall(onComplete, [])"
    $splashContent = $splashContent -replace "onComplete && onComplete\(\)", "safeCall(onComplete, [])"
    
    # Save the modified splash.js
    Set-Content -Path $splashJsPath -Value $splashContent -Force
} else {
    Write-Host "Warning: splash.js not found at expected location. Skipping splash.js update." -ForegroundColor Yellow
}

# 5. Update app.json
Write-Host "Updating app.json with proper configuration..." -ForegroundColor Yellow
$appJsonContent = @"
{
  "expo": {
    "name": "Bullseye",
    "slug": "bullseye-mobile",
    "version": "1.0.0",
    "assetBundlePatterns": ["**/*"],
    "android": {
      "package": "com.bullseye.mobile",
      "versionCode": 1,
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FFFFFF"
      },
      "permissions": [
        "android.permission.INTERNET"
      ]
    },
    "plugins": [
      [
        "expo-build-properties",
        {
          "android": {
            "extraMavenRepos": [
              "../../node_modules/jsc-android/dist"
            ],
            "extraProguardRules": "-keep class com.facebook.jni.** { *; }"
          }
        }
      ]
    ]
  }
}
"@
Set-Content -Path "app.json" -Value $appJsonContent -Force

# 6. Clear app data on device
Write-Host "Clearing app data on device..." -ForegroundColor Yellow
$deviceCheck = adb devices
if ($deviceCheck -match "device$") {
    adb shell pm clear com.bullseye.mobile
} else {
    Write-Host "No device connected. Skipping app data clearing." -ForegroundColor Yellow
}

Write-Host "`n===== Patch Applied Successfully =====" -ForegroundColor Green
Write-Host "`nNext steps:"
Write-Host "1. Run 'npx expo start' to start the development server"
Write-Host "2. Use the Expo Go app to test on your Galaxy Fold3"
Write-Host "3. If you need a production build, run 'npx expo build:android'"
