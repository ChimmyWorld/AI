import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { logError } from './errorUtils';

/**
 * GlobalErrorHandler - Higher-Order Component that adds error boundary functionality
 * to any component it wraps
 * 
 * @param {React.Component} WrappedComponent - The component to wrap with error handling
 * @param {string} componentName - Name for logging purposes
 * @param {Function} fallbackRender - Optional custom fallback UI
 * @returns {React.Component} - Enhanced component with error boundary
 */
export const withErrorBoundary = (WrappedComponent, componentName = 'UnknownComponent', fallbackRender = null) => {
  class ErrorBoundary extends React.Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
      // Update state so next render will show fallback UI
      return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
      // Log the error
      logError(error, `ErrorBoundary:${componentName}`);
      console.error(`Error in ${componentName}:`, error);
      console.error('Component stack:', errorInfo?.componentStack);
    }

    resetError = () => {
      this.setState({ hasError: false, error: null });
    };

    render() {
      if (this.state.hasError) {
        // You can render any custom fallback UI
        if (fallbackRender) {
          return fallbackRender(this.state.error, this.resetError);
        }
        
        // Default fallback UI
        return (
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>Something went wrong</Text>
            <Text style={styles.errorText}>
              {this.state.error?.toString() || 'An unexpected error occurred'}
            </Text>
            <TouchableOpacity style={styles.retryButton} onPress={this.resetError}>
              <Text style={styles.retryText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        );
      }

      return <WrappedComponent {...this.props} />;
    }
  }

  // Set display name for debugging
  ErrorBoundary.displayName = `withErrorBoundary(${componentName})`;
  
  return ErrorBoundary;
};

/**
 * Wrap a React functional component with try/catch for handling errors within render and effects
 * 
 * @param {Function} Component - React functional component
 * @param {string} componentName - Component name for logging
 * @returns {Function} - Enhanced component with try/catch
 */
export const withTryCatch = (Component, componentName = 'UnknownComponent') => {
  const WrappedComponent = (props) => {
    try {
      return <Component {...props} />;
    } catch (error) {
      logError(error, `withTryCatch:${componentName}`);
      console.error(`Error in ${componentName}:`, error);
      return null; // Or a simple fallback
    }
  };
  
  WrappedComponent.displayName = `withTryCatch(${componentName})`;
  return WrappedComponent;
};

/**
 * HOC that combines both error boundary and try/catch protection
 */
export const withCompleteErrorProtection = (
  Component, 
  componentName = 'UnknownComponent',
  fallbackRender = null
) => {
  return withErrorBoundary(
    withTryCatch(Component, componentName),
    componentName,
    fallbackRender
  );
};

// Default styles for error UI
const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: 10,
  },
  errorText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#4caf50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 4,
  },
  retryText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default {
  withErrorBoundary,
  withTryCatch,
  withCompleteErrorProtection
};
