import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * A component that catches JavaScript errors anywhere in its child component tree,
 * logs them, and displays a fallback UI instead of crashing the app.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    
    // Log error to console for debugging
    console.error("Error caught by ErrorBoundary:", error);
    console.error("Component stack:", errorInfo?.componentStack);
    
    // Store error in AsyncStorage for later viewing
    this.storeError(error, errorInfo);
  }
  
  storeError = async (error, errorInfo) => {
    try {
      const errorLog = {
        timestamp: new Date().toISOString(),
        error: error?.toString() || 'Unknown error',
        stack: error?.stack || 'No stack trace',
        componentStack: errorInfo?.componentStack || 'No component stack',
      };
      
      // Get existing logs if any
      const existingLogsString = await AsyncStorage.getItem('errorLogs');
      const existingLogs = existingLogsString ? JSON.parse(existingLogsString) : [];
      
      // Add new log and store back (limit to 50 entries)
      const updatedLogs = [errorLog, ...existingLogs].slice(0, 50);
      await AsyncStorage.setItem('errorLogs', JSON.stringify(updatedLogs));
    } catch (storageError) {
      console.error('Failed to store error log:', storageError);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorMessage}>{this.state.error?.toString() || 'Unknown error'}</Text>
          <View style={styles.errorDetails}>
            <Text style={styles.errorStack}>
              {this.state.errorInfo?.componentStack || 'No component stack available'}
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.button}
            onPress={() => this.setState({ hasError: false, error: null, errorInfo: null })}>
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
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
    backgroundColor: '#f8f9fa',
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#dc3545',
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 16,
    color: '#343a40',
    marginBottom: 15,
    textAlign: 'center',
  },
  errorDetails: {
    width: '100%',
    maxHeight: 250,
    padding: 10,
    backgroundColor: '#f1f3f5',
    borderRadius: 5,
    marginBottom: 20,
  },
  errorStack: {
    fontSize: 12,
    color: '#6c757d',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  button: {
    backgroundColor: '#007bff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ErrorBoundary;
