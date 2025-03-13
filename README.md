# Community Forum Monorepo

This is a monorepo for the Community Forum platform, including web, mobile, and specialized mobile applications. The platform is a Reddit-like community forum with various features for user engagement.

## Project Structure

```
community-forum/
├── packages/
│   ├── web/          # Web application
│   ├── mobile/       # React Native mobile app
│   ├── bullseye-mobile/ # Specialized mobile app with enhanced debugging
│   └── shared/       # Shared code, utilities, and constants
└── package.json      # Root package.json for managing workspace
```

## Tech Stack

- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Authentication**: JWT
- **File Storage**: Cloudinary
- **Frontend**: 
  - Web: HTML, CSS, JavaScript, Bootstrap
  - Mobile: React Native, Expo

## Key Features

- Three categories: Free, Q&A, and AI discussions
- User authentication
- Media upload support (images/videos)
- Comments and voting system
- User karma tracking
- Enhanced debugging capabilities (in Bullseye Mobile)

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm (v6+)
- MongoDB instance
- Cloudinary account

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/ChimmyWorld/AI.git
   cd community-forum
   ```

2. Install dependencies for all packages:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create `.env` files in both the web and mobile package directories with the following variables:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

## Development

### Running the Web Application

```bash
npm run start:web
```

### Running the Mobile Application

```bash
npm run start:mobile
```

### Running the Bullseye Mobile Application

```bash
npm run start:bullseye
```

### Building for Production

#### Web
```bash
npm run build:web
```

#### Mobile
```bash
npm run build:mobile
```

#### Bullseye Mobile
```bash
npm run build:bullseye
```

## Shared Package

The `shared` package contains code that's used by both the web and mobile applications:

- API endpoints
- Utility functions (formatters, validators)
- Common constants

To import from the shared package in any of the applications:

```javascript
// In web or mobile packages
const { api, utils } = require('@community-forum/shared');

// Example usage
const apiUrl = api.getFullUrl(api.endpoints.POSTS.BASE);
const formattedTime = utils.formatTimeAgo(new Date());
```

## Testing

Run tests for all packages:
```bash
npm test
```

Or test specific packages:
```bash
npm run test:web
npm run test:mobile
npm run test:bullseye
```

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Submit a pull request

## License

ISC
