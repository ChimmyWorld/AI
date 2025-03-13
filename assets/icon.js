// This is a placeholder file to generate icons
// We'll use React components to draw the icons programmatically
// In a production app, you would use actual image files

import { Platform } from 'react-native';

// This file provides configuration for icon settings
export const ICON_CONFIG = {
  size: Platform.OS === 'web' ? 32 : 24,
  color: '#FF4500',
};
