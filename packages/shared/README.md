# Community Forum Shared Package

This package contains shared code, utilities, and constants that are used by both the web and mobile applications in the Community Forum mono-repo.

## Contents

- **Constants**: Shared constants like post categories, user roles, and API endpoints
- **Validators**: Common validation functions for emails, passwords, post content, etc.
- **Formatters**: Utility functions for formatting dates, numbers, and text

## Usage

### In Web Application

```javascript
// In packages/web
const { constants, validators, formatters } = require('@community-forum/shared');

// Using constants
const freeCategory = constants.POST_CATEGORIES.FREE;

// Using validators
const isValid = validators.isValidEmail('user@example.com');

// Using formatters
const formattedDate = formatters.formatRelativeTime(new Date());
```

### In Mobile Application

```javascript
// In packages/mobile
import { constants, validators, formatters } from '@community-forum/shared';

// Using constants
const freeCategory = constants.POST_CATEGORIES.FREE;

// Using validators
const isValid = validators.isValidEmail('user@example.com');

// Using formatters
const formattedDate = formatters.formatRelativeTime(new Date());
```

## Development

To build the shared package:

```bash
cd packages/shared
npm run build
```

To test the shared package:

```bash
cd packages/shared
npm test
```
