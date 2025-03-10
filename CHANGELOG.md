# Changelog

## [1.1.0] - 2025-03-10
### Added
- React frontend with Material-UI
- Modern Reddit-like UI with left sidebar
- Profile management page with account settings
- Media upload support in posts

### Fixed
- Build failures in Render.com deployment
  - Issue: ES modules configuration conflict with Vite
  - Solution: Switched to CommonJS in vite.config.js
  - Build command updated to: `cd frontend && npm ci && NODE_ENV=production npm run build && cd .. && npm ci`

## [1.0.0] - Initial Release
### Features
- MongoDB integration
- User authentication with JWT
- Three categories: Free, Q&A, AI
- Post creation and management
- Comment system
- Voting system
