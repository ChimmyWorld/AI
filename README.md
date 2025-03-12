# Bullseye Mobile App

A community forum app allowing users to discuss topics in Free, Q&A, and AI categories. Connect with others, share content, and earn karma through meaningful interactions.

## Features

- **User Authentication**: Secure login and registration system
- **Three Categories**: Free discussions, Q&A format, and AI-focused topics
- **Media Support**: Upload and share images and videos
- **Interactive Content**: Comment on posts and vote on content
- **Karma System**: Track user reputation and contributions
- **Modern UI**: Clean, intuitive interface with splash screen

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development, Mac only)

### Installation

1. Clone the repository:
```
git clone https://github.com/ChimmyWorld/Bullseye.git
cd bullseye-mobile
```

2. Install dependencies:
```
npm install
```

3. Start the development server:
```
npx expo start
```

## Building for Production

### Android APK

To build an Android APK for distribution:

```
eas build -p android --profile production
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
API_URL=your_api_url
CLOUDINARY_URL=your_cloudinary_url
```

## Folder Structure

```
bullseye-mobile/
├── assets/               # Images, fonts, and other static assets
├── src/                  # Source code
│   ├── assets/           # JS-based assets (splash screen, etc.)
│   ├── components/       # Reusable components
│   ├── hooks/            # Custom React hooks
│   ├── screens/          # Screen components
│   └── utils/            # Utility functions
├── App.js                # Main application component
├── app.json              # Expo configuration
└── eas.json              # EAS Build configuration
```

## Google Play Submission Checklist

- [x] Splash Screen
- [x] Privacy Policy
- [x] Terms and Conditions
- [x] User Registration/Login
- [x] App Icon
- [x] App Metadata in app.json
- [x] Production APK Build

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please email support@bullseye-app.com or open an issue on GitHub.
