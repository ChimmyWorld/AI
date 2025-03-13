/**
 * Error Boundary Higher-Order Component for Bullseye Mobile
 * 
 * This component provides a React Error Boundary wrapper that can be applied
 * to any component to prevent crashes from propagating up the component tree.
 */

import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { logError } from './errorHandler';

/**
 * Error boundary component that catches errors in its child component tree
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to our error tracking system
    logError(error, 'ErrorBoundary');
    this.setState({ errorInfo });
  }

  resetError = () => {
    this.setState({ 
      hasError: false,
      error: null,
      errorInfo: null
    });
    
    // Call custom reset handler if provided
    if (this.props.onReset) {
      this.props.onReset();
    }
  }

  render() {
    if (this.state.hasError) {
      // Render fallback UI
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </Text>

          {this.props.showDetails && (
            <View style={styles.detailsContainer}>
              <Text style={styles.stackTitle}>Error Details:</Text>
              <Text style={styles.stack}>
                {this.state.error?.stack || 'No stack trace available'}
              </Text>
            </View>
          )}

          <TouchableOpacity 
            style={styles.button}
            onPress={this.resetError}
          >
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // Render children when no error
    return this.props.children;
  }
}

/**
 * Higher-order component that wraps a component with an error boundary
 * 
 * @param {React.Component} WrappedComponent - Component to wrap
 * @param {Object} options - Configuration options
 * @param {boolean} options.showDetails - Whether to show error details in UI
 * @param {Function} options.onError - Custom error handler
 * @returns {React.Component} Wrapped component with error boundary
 */
export default function withErrorBoundary(WrappedComponent, options = {}) {
  const { showDetails = __DEV__, onError = null, componentName = '' } = options;
  
  // Define a display name for the wrapped component
  const wrappedName = componentName || WrappedComponent.displayName || WrappedComponent.name || 'Component';

  function WithErrorBoundary(props) {
    const handleReset = () => {
      // Call custom error handler with component info
      if (onError) {
        onError(wrappedName);
      }
    };

    return (
      <ErrorBoundary showDetails={showDetails} onReset={handleReset}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  }

  // Set display name for debugging purposes
  WithErrorBoundary.displayName = `WithErrorBoundary(${wrappedName})`;
  
  return WithErrorBoundary;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#d32f2f',
  },
  message: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  detailsContainer: {
    width: '100%',
    padding: 10,
    backgroundColor: '#eeeeee',
    borderRadius: 5,
    marginBottom: 20,
  },
  stackTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  stack: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
  },
  button: {
    backgroundColor: '#FF4500',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
