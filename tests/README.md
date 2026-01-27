# Test Suite Documentation

This directory contains the comprehensive test suite for the K3s Backend API.

## Directory Structure

```
tests/
├── unit/              # Unit tests for individual components
├── integration/       # Integration tests for API endpoints
├── properties/        # Property-based tests for universal properties
├── mocks/            # Mock utilities for testing
├── utils/            # Test helper utilities
├── setup.ts          # Global test setup
└── README.md         # This file
```

## Test Types

### Unit Tests (`unit/`)

Unit tests focus on testing individual components in isolation:
- Configuration loading and validation
- Middleware functions
- Validators
- Service layer methods
- Utility functions

**Location**: `tests/unit/`
**Naming**: `*.test.ts`

### Integration Tests (`integration/`)

Integration tests verify end-to-end API behavior:
- HTTP endpoint responses
- Request/response flows
- Middleware stack integration
- Error handling

**Location**: `tests/integration/`
**Naming**: `*.test.ts`

### Property-Based Tests (`properties/`)

Property-based tests verify universal properties across all inputs:
- Error handling properties
- Validation properties
- Logging properties
- Pagination properties
- Sanitization properties

**Location**: `tests/properties/`
**Naming**: `*.property.test.ts`
**Framework**: fast-check
**Minimum iterations**: 100 per property

## Mock Utilities

### Kubernetes Mocks (`mocks/k8s.mock.ts`)

Provides mock implementations of Kubernetes clients:
- `createMockCoreV1Api()` - Mock CoreV1Api client
- `createMockAppsV1Api()` - Mock AppsV1Api client
- `createMockNetworkingV1Api()` - Mock NetworkingV1Api client
- `createMockK8sClients()` - Complete set of mock clients
- Mock response generators for pods, services, ingresses, namespaces
- Mock error generators for common Kubernetes errors

### Express Mocks (`mocks/express.mock.ts`)

Provides mock implementations of Express objects:
- `createMockRequest()` - Mock Express Request
- `createMockResponse()` - Mock Express Response
- `createMockNext()` - Mock NextFunction
- `createMockExpressContext()` - Complete set of Express mocks

## Test Helpers

### Common Utilities (`utils/test-helpers.ts`)

Reusable test utilities:
- `wait()` - Async delay
- `suppressConsole()` - Suppress console output
- `mockEnv()` - Mock environment variables
- `randomString()`, `randomInt()` - Random data generators
- `randomK8sName()`, `randomNamespace()`, etc. - Kubernetes name generators
- `assertThrows()`, `assertDoesNotThrow()` - Assertion helpers
- `retry()` - Retry logic for flaky operations

## Running Tests

### Run all tests
```bash
npm test
```

### Run with coverage
```bash
npm run test:coverage
```

### Run specific test type
```bash
# Unit tests only
npm test -- tests/unit

# Integration tests only
npm test -- tests/integration

# Property tests only
npm test -- tests/properties
```

### Run specific test file
```bash
npm test -- tests/unit/config/index.test.ts
```

### Run in watch mode
```bash
npm test -- --watch
```

### Run with UI
```bash
npm test -- --ui
```

## Coverage Requirements

- **Minimum coverage**: 80% across all modules
- **Target coverage**: 100% for validators and error handling
- **Coverage reports**: Generated in `coverage/` directory

## Writing Tests

### Unit Test Example

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { createMockK8sClients } from '@tests/mocks/k8s.mock';

describe('MyService', () => {
  let mockClients: ReturnType<typeof createMockK8sClients>;

  beforeEach(() => {
    mockClients = createMockK8sClients();
  });

  it('should do something', async () => {
    // Arrange
    mockClients.coreV1Api.listNamespace.mockResolvedValue({
      body: { items: [] }
    });

    // Act
    const result = await myService.doSomething();

    // Assert
    expect(result).toBeDefined();
  });
});
```

### Property Test Example

```typescript
import { describe, it } from 'vitest';
import * as fc from 'fast-check';

describe('Property: My Property', () => {
  it('should hold for all inputs', () => {
    fc.assert(
      fc.property(
        fc.string(),
        (input) => {
          // Test that property holds
          const result = myFunction(input);
          return result.length >= 0;
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Integration Test Example

```typescript
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '@/app';

describe('GET /api/pods', () => {
  it('should return list of pods', async () => {
    const response = await request(app)
      .get('/api/pods')
      .expect(200);

    expect(response.body).toHaveProperty('items');
    expect(Array.isArray(response.body.items)).toBe(true);
  });
});
```

## Best Practices

1. **Isolation**: Each test should be independent and not rely on other tests
2. **Mocking**: Use mocks to avoid requiring a live Kubernetes cluster
3. **Descriptive names**: Test names should clearly describe what is being tested
4. **Arrange-Act-Assert**: Follow the AAA pattern for clarity
5. **Edge cases**: Test boundary conditions and error cases
6. **Property tests**: Use property-based testing for universal properties
7. **Coverage**: Aim for high coverage but focus on meaningful tests
8. **Performance**: Keep tests fast by avoiding unnecessary delays

## Troubleshooting

### Tests timing out
- Increase timeout in vitest.config.ts
- Check for unresolved promises
- Ensure mocks are properly configured

### Coverage not meeting threshold
- Run coverage report to identify gaps
- Add tests for uncovered branches
- Focus on critical paths first

### Flaky tests
- Use `retry()` helper for operations that may be timing-dependent
- Ensure proper cleanup in afterEach hooks
- Check for shared state between tests

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [fast-check Documentation](https://fast-check.dev/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Kubernetes Client Node](https://github.com/kubernetes-client/javascript)
