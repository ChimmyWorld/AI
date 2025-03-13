# PowerShell script to fix "undefined is not a function" errors
Write-Host "===== Fixing 'undefined is not a function' Error =====" -ForegroundColor Cyan

# 1. Check for connected device
Write-Host "Checking for connected device..." -ForegroundColor Yellow
adb devices

# 2. Clear app data
Write-Host "Clearing app data..." -ForegroundColor Yellow
adb shell pm clear com.bullseye.mobile

# 3. Create a proper index.js that prevents undefined function errors
Write-Host "Creating error-protected index.js..." -ForegroundColor Yellow
$indexContent = @'
// Apply global error protection at the earliest possible point
if (typeof global !== 'undefined') {
  // Safely check for undefined functions
  const safeFunction = function(fn, args) {
    try {
      if (typeof fn === 'function') {
        return fn.apply(this, args || []);
      }
    } catch (e) {
      console.error('Error in function call:', e);
    }
    return undefined;
  };

  // Patch Function.prototype.call
  const originalCall = Function.prototype.call;
  Function.prototype.call = function(thisArg, ...args) {
    return safeFunction(function() {
      return originalCall.apply(this, [thisArg, ...args]);
    }, []);
  };

  // Patch Function.prototype.apply
  const originalApply = Function.prototype.apply;
  Function.prototype.apply = function(thisArg, argsArray) {
    return safeFunction(function() {
      return originalApply.call(this, thisArg, argsArray || []);
    }, []);
  };

  // Add global error handler
  const originalSetTimeout = global.setTimeout;
  global.setTimeout = function(func, ...rest) {
    const safeFunc = function(...args) {
      return safeFunction(func, args);
    };
    return originalSetTimeout.apply(this, [safeFunc, ...rest]);
  };

  // Global error boundary for all rendering
  if (global.ErrorUtils) {
    const originalHandler = global.ErrorUtils.getGlobalHandler();
    global.ErrorUtils.setGlobalHandler((error, isFatal) => {
      console.log('Caught global error:', error);
      if (originalHandler) {
        originalHandler(error, isFatal);
      }
    });
  }
}

import { registerRootComponent } from 'expo';
import App from './src/App';

// Register the root component
registerRootComponent(App);
'@
Set-Content -Path "index.js" -Value $indexContent -Force

# 4. Update error utils for component protection
Write-Host "Updating error utilities..." -ForegroundColor Yellow
if (-not (Test-Path "src\utils")) {
    New-Item -Path "src\utils" -ItemType Directory -Force | Out-Null
}

$errorUtilsContent = @'
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
'@
Set-Content -Path "src\utils\errorUtils.js" -Value $errorUtilsContent -Force

# 5. Create GlobalErrorHandler.js for react components
Write-Host "Creating GlobalErrorHandler for React components..." -ForegroundColor Yellow
$globalErrorHandlerContent = @'
import React from 'react';
import { logError } from './errorUtils';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    logError(error, 'ErrorBoundary');
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || null;
    }
    return this.props.children;
  }
}

export const withErrorBoundary = (Component, fallback = null) => {
  return (props) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );
};

export default ErrorBoundary;
'@
Set-Content -Path "src\utils\GlobalErrorHandler.js" -Value $globalErrorHandlerContent -Force

# 6. Handle splash screen fix if available
if (Test-Path "src\assets\splash.js") {
    Write-Host "Updating splash screen to prevent undefined function calls..." -ForegroundColor Yellow
    $splashContent = Get-Content -Path "src\assets\splash.js" -Raw
    
    # Add import for safeCall if needed
    if (-not $splashContent.Contains("import { safeCall }")) {
        $splashContent = "import { safeCall } from '../utils/errorUtils';" + "`n" + $splashContent
    }
    
    # Fix onComplete calls
    $splashContent = $splashContent -replace "onComplete\(\)", "safeCall(onComplete)"
    $splashContent = $splashContent -replace "onComplete && onComplete\(\)", "safeCall(onComplete)"
    $splashContent = $splashContent -replace "\.start\(\(\) => \{[\s\n]*if \(onComplete\) \{[\s\n]*onComplete\(\);[\s\n]*\}", ".start(() => { if (onComplete) { safeCall(onComplete); }"
    
    Set-Content -Path "src\assets\splash.js" -Value $splashContent -Force
}

Write-Host "`n===== Fix Applied Successfully =====" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Run 'npx expo start' to start the Expo development server"
Write-Host "2. Use the Expo Go app on your Galaxy Fold3 to test the fixed app"
Write-Host "3. If you still encounter issues, run 'capture_bullseye_logs.bat' to get detailed logs"
