# PowerShell script to fix errors without causing infinite recursion
Write-Host "===== Applying Safe Error Handling =====" -ForegroundColor Cyan

# 1. Check for connected device
Write-Host "Checking for connected device..." -ForegroundColor Yellow
adb devices

# 2. Clear app data
Write-Host "Clearing app data..." -ForegroundColor Yellow
adb shell pm clear com.bullseye.mobile

# 3. Create a safer index.js file
Write-Host "Creating safer error-protected index.js..." -ForegroundColor Yellow
$indexContent = @'
// Safe error protection without recursive function patching
import { registerRootComponent } from 'expo';
import App from './src/App';

// Add global error logging
if (typeof global !== 'undefined') {
  // Global error handler for uncaught exceptions
  if (global.ErrorUtils) {
    const originalHandler = global.ErrorUtils.getGlobalHandler();
    global.ErrorUtils.setGlobalHandler((error, isFatal) => {
      console.log('Caught global error:', error);
      if (originalHandler) {
        try {
          originalHandler(error, isFatal);
        } catch (e) {
          console.error('Error in error handler:', e);
        }
      }
    });
  }

  // Safe setTimeout
  const originalSetTimeout = global.setTimeout;
  global.setTimeout = function(func, ...rest) {
    const safeFunc = function(...args) {
      try {
        if (typeof func === 'function') {
          return func(...args);
        }
      } catch (e) {
        console.error('Error in setTimeout callback:', e);
      }
    };
    return originalSetTimeout(safeFunc, ...rest);
  };
}

// Register the root component
registerRootComponent(App);
'@
Set-Content -Path "index.js" -Value $indexContent -Force

# 4. Update error utils with a simpler implementation
Write-Host "Updating error utilities with simplified implementation..." -ForegroundColor Yellow
if (-not (Test-Path "src\utils")) {
    New-Item -Path "src\utils" -ItemType Directory -Force | Out-Null
}

$errorUtilsContent = @'
// Simplified error logging and safe function calling utilities
export const logError = (error, source = 'unknown') => {
  const errorMessage = error ? (error.message || 'Unknown error') : 'Unknown error';
  const errorStack = error ? (error.stack || 'No stack trace') : 'No stack trace';
  console.error(`[${source}] Error: ${errorMessage}\n${errorStack}`);
  
  return { error: errorMessage, stack: errorStack, source };
};

// Safe function call without using Function.prototype methods
export const safeCall = (fn, args = []) => {
  if (typeof fn !== 'function') {
    return null;
  }
  
  try {
    return fn(...args);
  } catch (error) {
    logError(error, 'safeCall');
    return null;
  }
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

# 5. Create simpler GlobalErrorHandler.js
Write-Host "Creating simplified GlobalErrorHandler..." -ForegroundColor Yellow
$globalErrorHandlerContent = @'
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
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
    console.log('Component Stack:', errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return this.props.fallback || (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Something went wrong</Text>
          <Text style={styles.errorDetails}>{this.state.error?.message}</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8d7da'
  },
  errorText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#721c24',
    marginBottom: 10
  },
  errorDetails: {
    fontSize: 14,
    color: '#721c24'
  }
});

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

# 6. Update the splash screen if available
if (Test-Path "src\assets\splash.js") {
    Write-Host "Updating splash screen with safer function calls..." -ForegroundColor Yellow
    
    $splashContent = Get-Content -Path "src\assets\splash.js" -Raw
    
    # Add import for safeCall if needed
    if (-not $splashContent.Contains("import { safeCall }")) {
        $splashContent = "import { safeCall } from '../utils/errorUtils';" + "`n" + $splashContent
    }
    
    # Replace all instances of direct onComplete() calls with safeCall(onComplete)
    $splashContent = $splashContent -replace "onComplete\(\);", "safeCall(onComplete);"
    $splashContent = $splashContent -replace "onComplete\(\)", "safeCall(onComplete)"
    $splashContent = $splashContent -replace "onComplete && onComplete\(\)", "safeCall(onComplete)"
    $splashContent = $splashContent -replace "\.start\(\(\) => \{\s*if \(onComplete\) \{\s*onComplete\(\);\s*\}\s*\}\)", ".start(() => { safeCall(onComplete); })"
    
    Set-Content -Path "src\assets\splash.js" -Value $splashContent -Force
}

# 7. Update App.js to use error boundaries
Write-Host "Updating App.js to use error boundaries..." -ForegroundColor Yellow
if (Test-Path "src\App.js") {
    $appContent = Get-Content -Path "src\App.js" -Raw
    
    # Add import for ErrorBoundary if needed
    if (-not $appContent.Contains("import ErrorBoundary")) {
        $importPattern = "import React"
        $replacement = "import React from 'react';"
        if (-not $appContent.Contains($replacement)) {
            # Handle different React import styles
            $appContent = $appContent -replace $importPattern, $replacement
        }
        $importIndex = $appContent.IndexOf("import React")
        
        if ($importIndex -ge 0) {
            $importLine = "import ErrorBoundary from './utils/GlobalErrorHandler';"
            $appContent = $appContent.Insert($importIndex + $replacement.Length + 1, "`n" + $importLine)
        }
    }
    
    # Wrap the main app component with ErrorBoundary if not already wrapped
    if (-not $appContent.Contains("<ErrorBoundary>")) {
        # Look for return statement in the App component
        $returnPattern = "return \("
        $returnIndex = $appContent.IndexOf($returnPattern)
        
        if ($returnIndex -ge 0) {
            $openingTag = "<ErrorBoundary>"
            $closingTag = "</ErrorBoundary>"
            
            # Find the matching closing parenthesis for the return statement
            $startPos = $returnIndex + $returnPattern.Length
            $braceCount = 1
            $endPos = $startPos
            
            for ($i = $startPos; $i -lt $appContent.Length; $i++) {
                $char = $appContent[$i]
                if ($char -eq '(') { $braceCount++ }
                if ($char -eq ')') { $braceCount-- }
                
                if ($braceCount -eq 0) {
                    $endPos = $i
                    break
                }
            }
            
            # Insert ErrorBoundary tags
            if ($endPos -gt $startPos) {
                $appContent = $appContent.Insert($endPos, $closingTag)
                $appContent = $appContent.Insert($startPos, $openingTag)
            }
        }
    }
    
    Set-Content -Path "src\App.js" -Value $appContent -Force
}

Write-Host "`n===== Safe Error Handling Applied =====" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Run 'npx expo start --clear' to start the Expo development server"
Write-Host "2. Use the Expo Go app on your Galaxy Fold3 to test the fixed app"
Write-Host "3. If you still encounter issues, run 'capture_bullseye_logs.bat' to get detailed logs"
