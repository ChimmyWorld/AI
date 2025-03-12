import { AppRegistry, Platform, LogBox, ErrorUtils } from 'react-native';
import App from './src/App';
import { name as appName } from './app.json';

// Ignore specific warnings that might clutter logs
LogBox.ignoreLogs([
  'Warning: componentWillReceiveProps',
  'Warning: componentWillMount',
  'Remote debugger',
]);

// Global error handler for uncaught JS errors
const errorHandler = (error, isFatal) => {
  console.error('Unhandled error:', error);
  
  if (isFatal) {
    console.error('FATAL ERROR:', error.name, error.message);
    console.error('Stack:', error.stack);
  }
};

// Set up the global error handler
if (Platform.OS !== 'web') {
  ErrorUtils.setGlobalHandler(errorHandler);
}

// Register the app with the correct name
if (Platform.OS === 'web') {
  // For web, we need a different setup
  AppRegistry.registerComponent('main', () => App);
  
  // Initialize web
  if (window.document) {
    const rootTag = document.getElementById('root') || document.getElementById('app');
    const renderApp = () => {
      AppRegistry.runApplication('main', {
        rootTag,
        initialProps: {},
      });
    };
    
    if (document.readyState === 'complete') {
      renderApp();
    } else {
      document.addEventListener('DOMContentLoaded', renderApp);
    }
  }
} else {
  // For native platforms
  AppRegistry.registerComponent(appName, () => App);
}
