/**
 * Bullseye Mobile App Entry Point
 * 
 * This file initializes the global error protection system before
 * registering the main App component.
 */

import { registerRootComponent } from 'expo';
import { LogBox } from 'react-native';

// Initialize error handling before anything else
import { initializeErrorHandlers } from './src/utils/errorHandler';
initializeErrorHandlers();

// Import the root App component
import App from './src/App';

// Ignore specific warnings that aren't actionable
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  'ViewPropTypes will be removed from React Native',
  'AsyncStorage has been extracted from react-native'
]);

// Register the root component to start the app
registerRootComponent(App);
