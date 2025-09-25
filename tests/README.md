# Test Suite Documentation

This directory contains a comprehensive test suite for the Sentiment Analysis application.

## Test Structure

```
tests/
├── unit/                    # Unit tests for individual functions and classes
│   └── sentiment-analyzer.test.js
├── integration/             # Integration tests for DOM and localStorage
│   └── localStorage.test.js
├── e2e/                     # End-to-end tests using Playwright
│   └── sentiment-analysis.spec.js
├── setup.js                 # Test setup and mocks
└── README.md               # This file
```

## Running Tests

### Prerequisites
Install dependencies:
```bash
npm install
```

### Run All Tests
```bash
npm test
```

### Run Specific Test Types
```bash
# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# End-to-end tests only
npm run test:e2e
```

### Run with Coverage
```bash
npm run test:coverage
```

### Run in Watch Mode
```bash
npm run test:watch
```

## Test Coverage

### Unit Tests Coverage
- ✅ Sentiment analysis logic
- ✅ History management
- ✅ Data validation
- ✅ Error handling
- ✅ Edge cases

### Integration Tests Coverage
- ✅ localStorage operations
- ✅ Data persistence
- ✅ History management

### E2E Tests Coverage
- ✅ Single text analysis workflow
- ✅ Batch analysis workflow
- ✅ History management workflow
- ✅ Navigation between sections
- ✅ Performance testing

## Test Configuration

### Vitest Configuration (`vitest.config.js`)
- Environment: jsdom for DOM simulation
- Setup file: `tests/setup.js` for global mocks
- Coverage: v8 provider with HTML, JSON, and text reports

### Playwright Configuration (`playwright.config.js`)
- Test directory: `tests/e2e/`
- Browsers: Chromium, Firefox, WebKit
- Base URL: `http://localhost:5173`
- Auto-start dev server for testing