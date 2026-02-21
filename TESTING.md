
# Testing Guide

This document describes the testing setup and how to run tests for the Finance Tracker application.

## Overview

The project has comprehensive test coverage for both frontend and backend:

- **Backend**: Jest with Supertest for API testing
- **Frontend**: Vitest with React Testing Library for component and hook testing

## Test Coverage Goals

- Backend: Minimum 75% branches, 80% functions/lines/statements
- Frontend: Minimum 70% branches, 75% functions/lines/statements
- Unit tests for all controllers, middleware, and business logic
- Integration tests for API endpoints
- Component tests for React components
- Hook tests for custom React hooks

## Running Tests

### Run All Tests

```bash
# Run both backend and frontend tests
chmod +x run-tests.sh
./run-tests.sh
```

### Backend Tests Only

```bash
cd backend
npm install  # First time only
npm test     # Run all tests with coverage
npm run test:watch  # Run in watch mode
```

### Frontend Tests Only

```bash
cd frontend
npm install  # First time only
npm test     # Run all tests with coverage
npm run test:watch  # Run in watch mode
```

## Backend Testing

### Technology Stack

- **Jest**: Testing framework
- **Supertest**: HTTP assertions
- **TypeScript**: Type-safe tests

### Test Structure

```
backend/src/__tests__/
├── controllers/
│   ├── authController.test.ts
│   ├── categoryController.test.ts
│   └── transactionController.test.ts
├── middleware/
│   └── auth.test.ts
└── utils/
    └── testHelpers.ts
```

### What's Tested

#### Auth Controller
- ✅ User registration with validation
- ✅ Email uniqueness checking
- ✅ Password hashing
- ✅ JWT token generation
- ✅ User login
- ✅ Invalid credentials handling
- ✅ Error handling

#### Category Controller
- ✅ Get all categories for user
- ✅ Create new category
- ✅ Update category
- ✅ Delete category
- ✅ Category validation (name, type, color)
- ✅ Authorization (user can only access their categories)
- ✅ Error handling

#### Transaction Controller
- ✅ Get all transactions
- ✅ Filter by date range
- ✅ Filter by type (income/expense)
- ✅ Create transaction
- ✅ Update transaction
- ✅ Delete transaction
- ✅ Get analytics
- ✅ Transaction validation
- ✅ Authorization
- ✅ Error handling

#### Auth Middleware
- ✅ Token validation
- ✅ Token extraction from header
- ✅ Expired token handling
- ✅ Invalid token handling
- ✅ Missing token handling

### Running Specific Tests

```bash
# Run specific test file
npm test -- authController.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="should register"

# Update snapshots
npm test -- -u
```

### Coverage Report

After running tests, view coverage at:
- `backend/coverage/lcov-report/index.html`

## Frontend Testing

### Technology Stack

- **Vitest**: Fast unit test framework
- **React Testing Library**: Component testing
- **jsdom**: Browser environment simulation

### Test Structure

```
frontend/src/__tests__/
├── hooks/
│   ├── useAuth.test.tsx
│   └── useTheme.test.tsx
├── utils/
│   └── utils.test.ts
└── setup.ts
```

### What's Tested

#### useAuth Hook
- ✅ Initialize with null user/token
- ✅ Load from localStorage
- ✅ Login functionality
- ✅ Register functionality
- ✅ Logout functionality
- ✅ Token persistence
- ✅ Error handling
- ✅ Provider validation

#### useTheme Hook
- ✅ Initialize with system theme
- ✅ Load theme from localStorage
- ✅ Set light/dark theme
- ✅ Apply theme to DOM
- ✅ System theme detection
- ✅ Theme persistence
- ✅ Provider validation

#### Utils
- ✅ Currency formatting
- ✅ Date formatting
- ✅ Class name merging (cn)
- ✅ Tailwind conflict resolution
- ✅ Edge cases

### Running Specific Tests

```bash
# Run specific test file
npm test -- useAuth.test.tsx

# Run in UI mode
npm test -- --ui

# Run with specific reporter
npm test -- --reporter=verbose
```

### Coverage Report

After running tests, view coverage at:
- `frontend/coverage/index.html`

## Writing New Tests

### Backend Test Example

```typescript
import { mockAuthRequest, mockResponse } from '../utils/testHelpers';
import { myController } from '../../controllers/myController';

describe('My Controller', () => {
  it('should do something', async () => {
    const req = mockAuthRequest(1, 'test@example.com', {
      body: { data: 'test' }
    });
    const res = mockResponse();

    await myController(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true
    }));
  });
});
```

### Frontend Test Example

```typescript
import { renderHook, act } from '@testing-library/react';
import { useMyHook } from '../../hooks/useMyHook';

describe('useMyHook', () => {
  it('should update state', () => {
    const { result } = renderHook(() => useMyHook());

    act(() => {
      result.current.updateValue('new value');
    });

    expect(result.current.value).toBe('new value');
  });
});
```

## Continuous Integration

### GitHub Actions (Example)

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Run tests
        run: |
          chmod +x run-tests.sh
          ./run-tests.sh

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./backend/coverage/coverage-final.json,./frontend/coverage/coverage-final.json
```

## Test Data and Mocking

### Backend Mocking

Database queries are mocked using Jest:

```typescript
import * as database from '../../config/database';
jest.mock('../../config/database');

const mockQuery = database.query as jest.MockedFunction<typeof database.query>;
mockQuery.mockResolvedValueOnce({ rows: [{ id: 1 }] } as any);
```

### Frontend Mocking

API calls are mocked using Vitest:

```typescript
import * as api from '../../lib/api';
vi.mock('../../lib/api');

vi.spyOn(api.authApi, 'login').mockResolvedValue({
  data: { token: 'abc', user: { id: 1 } }
});
```

## Debugging Tests

### Backend

```bash
# Run with debugging
node --inspect-brk node_modules/.bin/jest --runInBand

# Add debugger statement in test
test('something', () => {
  debugger;
  // ...
});
```

### Frontend

```bash
# Run with debugging
npm test -- --inspect-brk

# Use screen.debug() in tests
import { screen } from '@testing-library/react';
screen.debug(); // Prints DOM
```

## Common Issues

### Issue: Tests timeout

**Solution**: Increase timeout in test:

```typescript
it('long test', async () => {
  // ...
}, 10000); // 10 second timeout
```

### Issue: Module not found

**Solution**: Check path aliases in config files:
- Backend: `jest.config.js`
- Frontend: `vitest.config.ts`

### Issue: Coverage below threshold

**Solution**: Add more test cases or adjust thresholds in config.

## Best Practices

1. **Test behavior, not implementation**
   - Test what the function does, not how it does it

2. **Use descriptive test names**
   - ✅ `should return 404 when transaction not found`
   - ❌ `test1`

3. **Arrange-Act-Assert pattern**
   ```typescript
   it('should do something', () => {
     // Arrange
     const input = 'test';

     // Act
     const result = myFunction(input);

     // Assert
     expect(result).toBe('expected');
   });
   ```

4. **Mock external dependencies**
   - Database calls
   - API requests
   - File system operations

5. **Clean up after tests**
   - Clear mocks: `jest.clearAllMocks()` / `vi.clearAllMocks()`
   - Clean up React components: Auto-handled by Testing Library

6. **Test edge cases**
   - Empty inputs
   - Null/undefined values
   - Error conditions
   - Boundary values

## Resources

- [Jest Documentation](https://jestjs.io/)
- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://testingjavascript.com/)
