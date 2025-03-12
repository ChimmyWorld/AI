import { AppRegistry, Platform } from 'react-native';
import App from './src/App';
import { name as appName } from './app.json';

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
  AppRegistry.registerComponent('BullseyeMobile', () => App);
}
