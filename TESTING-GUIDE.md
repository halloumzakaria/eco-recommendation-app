# 🧪 Eco-Recommendation Testing Guide

This guide covers how to run and write unit tests for the Eco-Recommendation application.

## 📋 Test Structure

```
eco-recommendation/
├── backend/
│   ├── tests/
│   │   ├── setup.js                 # Test setup and teardown
│   │   ├── productController.test.js # Product API tests
│   │   ├── authRoutes.test.js       # Authentication tests
│   │   └── models.test.js           # Database model tests
│   ├── jest.config.js               # Jest configuration
│   └── package.json                 # Test dependencies
├── frontend/
│   ├── src/
│   │   ├── setupTests.js            # Frontend test setup
│   │   ├── pages/__tests__/
│   │   │   └── AdminDashboard.test.js
│   │   └── components/__tests__/
│   │       ├── ProductList.test.js
│   │       └── Login.test.js
│   └── package.json                 # Test dependencies
├── run-tests.sh                     # Unix test runner
├── run-tests.ps1                    # PowerShell test runner
└── TESTING-GUIDE.md                 # This guide
```

## 🚀 Running Tests

### Quick Start

**Windows (PowerShell):**
```powershell
.\run-tests.ps1
```

**Linux/Mac (Bash):**
```bash
./run-tests.sh
```

### Individual Service Tests

**Backend Tests:**
```bash
cd backend
npm install
npm test
```

**Frontend Tests:**
```bash
cd frontend
npm install
npm test
```

### Test Commands

| Command | Description |
|---------|-------------|
| `npm test` | Run all tests once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |

## 📊 Test Coverage

The test suite covers:

### Backend Tests
- ✅ **API Endpoints**: All REST API routes
- ✅ **Authentication**: Login, register, JWT validation
- ✅ **Product Management**: CRUD operations
- ✅ **Database Models**: Sequelize model validation
- ✅ **Error Handling**: API error responses
- ✅ **Authorization**: Admin-only endpoints

### Frontend Tests
- ✅ **Components**: React component rendering
- ✅ **User Interactions**: Form submissions, button clicks
- ✅ **API Integration**: Mock API calls
- ✅ **Routing**: Navigation between pages
- ✅ **State Management**: Component state updates
- ✅ **Error Handling**: Error message display

## 🛠️ Writing New Tests

### Backend Test Example

```javascript
// tests/newController.test.js
const request = require('supertest');
const app = require('../server');

describe('New Controller Tests', () => {
  it('should handle GET request', async () => {
    const response = await request(app)
      .get('/api/new-endpoint')
      .expect(200);
    
    expect(response.body).toHaveProperty('data');
  });
});
```

### Frontend Test Example

```javascript
// src/components/__tests__/NewComponent.test.js
import React from 'react';
import { render, screen } from '@testing-library/react';
import NewComponent from '../NewComponent';

describe('NewComponent', () => {
  it('should render correctly', () => {
    render(<NewComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

## 🔧 Test Configuration

### Jest Configuration (Backend)

```javascript
// backend/jest.config.js
module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: [
    'controllers/**/*.js',
    'routes/**/*.js',
    'models/**/*.js'
  ],
  coverageDirectory: 'coverage',
  verbose: true
};
```

### React Testing Setup

```javascript
// frontend/src/setupTests.js
import '@testing-library/jest-dom';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;
```

## 📝 Test Best Practices

### 1. **Arrange, Act, Assert (AAA)**
```javascript
it('should create a product', async () => {
  // Arrange
  const productData = { name: 'Test Product', price: 19.99 };
  
  // Act
  const response = await request(app)
    .post('/api/products')
    .send(productData);
  
  // Assert
  expect(response.status).toBe(201);
  expect(response.body).toHaveProperty('id');
});
```

### 2. **Mock External Dependencies**
```javascript
// Mock API calls
jest.mock('../../utils/api');
const mockApi = api;
mockApi.get.mockResolvedValue({ data: mockData });
```

### 3. **Test Error Cases**
```javascript
it('should handle API errors', async () => {
  mockApi.get.mockRejectedValue(new Error('API Error'));
  
  render(<Component />);
  
  await waitFor(() => {
    expect(screen.getByText('Error loading data')).toBeInTheDocument();
  });
});
```

### 4. **Use Descriptive Test Names**
```javascript
// Good
it('should display all products in admin dashboard')

// Bad
it('should work')
```

## 🐛 Debugging Tests

### Common Issues

1. **Database Connection Errors**
   - Ensure test database is configured
   - Check test setup file

2. **Mock Not Working**
   - Verify mock is defined before import
   - Check mock implementation

3. **Async Test Failures**
   - Use `waitFor()` for async operations
   - Check test timeout settings

### Debug Commands

```bash
# Run specific test file
npm test -- productController.test.js

# Run tests with verbose output
npm test -- --verbose

# Run tests in debug mode
npm test -- --detectOpenHandles
```

## 📈 Coverage Reports

After running tests with coverage:

```bash
cd backend && npm run test:coverage
cd frontend && npm test -- --coverage
```

Coverage reports are generated in:
- Backend: `backend/coverage/`
- Frontend: `frontend/coverage/`

## 🔄 Continuous Integration

Tests are automatically run on:
- Pull requests
- Main branch pushes
- Pre-commit hooks (if configured)

## 📚 Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)

## 🆘 Troubleshooting

### Test Environment Issues

1. **Node Version**: Ensure Node.js 18+ is installed
2. **Dependencies**: Run `npm install` in both directories
3. **Database**: Ensure PostgreSQL is running for integration tests

### Common Error Solutions

| Error | Solution |
|-------|----------|
| `Cannot find module` | Run `npm install` |
| `Database connection failed` | Check test database setup |
| `Mock not working` | Verify mock placement and syntax |
| `Timeout in tests` | Increase test timeout or fix async issues |

---

**Happy Testing! 🧪✨**
