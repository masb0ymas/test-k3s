# Testing Infrastructure Setup

This document describes the complete testing infrastructure that has been set up for the K3s Backend API project.

## ✅ Completed Setup

### 1. Testing Dependencies Installed

All required testing dependencies are installed and configured:

- **vitest** (v4.0.18): Modern, fast test runner with native TypeScript support
- **@vitest/ui** (v4.0.18): Interactive UI for running and debugging tests
- **@vitest/coverage-v8** (v4.0.18): Code coverage reporting using V8
- **supertest** (v7.2.2): HTTP assertion library for integration testing
- **@types/supertest** (v6.0.3): TypeScript types for supertest
- **fast-check** (v4.5.3): Property-based testing library

### 2. Test Directory Structure

Complete test directory structure created:

```
tests/
├── unit/                    # Unit tests for individual components
│   ├── example.test.ts      # Example test (can be removed)
│   └── mocks-verification.test.ts  # Verification of mock utilities
├── integration/             # Integration tests for API endpoints
├── properties/              # Property-based tests
│   └── infrastructure-verification.property.test.ts
├── mocks/                   # Mock utilities
│   ├── k8s.mock.ts         # Kubernetes client mocks
│   └── express.mock.ts     # Express request/response mocks
├── utils/                   # Test helper utilities
│   └── test-helpers.ts     # Common test utilities
├── setup.ts                 # Global test setup
├── README.md               # Test documentation
└── INFRASTRUCTURE.md       # This file
```

### 3. Vitest Configuration

**File**: `vitest.config.ts`

Key configuration features:
- **Environment**: Node.js
- **Test patterns**: Includes unit, integration, and property tests
- **Coverage provider**: V8 with 80% threshold for all metrics
- **Coverage reports**: Text, JSON, HTML, and LCOV formats
- **Test timeout**: 30 seconds
- **Globals**: Enabled for convenient test writing
- **Setup files**: Automatic loading of test setup
- **Reporters**: Verbose output
- **Parallel execution**: Thread-based parallelization
- **Path aliases**: `@` for src, `@tests` for tests

Coverage thresholds (as per requirements):
- Lines: 80%
- Functions: 80%
- Branches: 80%
- Statements: 80%

### 4. Mock Utilities

#### Kubernetes Mocks (`tests/mocks/k8s.mock.ts`)

Comprehensive mock implementations for Kubernetes clients:

**Mock Clients**:
- `createMockCoreV1Api()` - Core Kubernetes API (pods, services, namespaces)
- `createMockAppsV1Api()` - Apps API (deployments)
- `createMockNetworkingV1Api()` - Networking API (ingresses)
- `createMockKubeConfig()` - Kubernetes configuration
- `createMockK8sClients()` - Complete set of all clients

**Mock Response Generators**:
- `mockPodResponse()` - Generate mock pod objects
- `mockServiceResponse()` - Generate mock service objects
- `mockNamespaceResponse()` - Generate mock namespace objects
- `mockIngressResponse()` - Generate mock ingress objects
- `mockListResponse()` - Generate list responses with multiple items

**Mock Error Generators**:
- `mockK8sError()` - Generic Kubernetes API error
- `mockNotFoundError()` - 404 Not Found error
- `mockConflictError()` - 409 Conflict error (already exists)
- `mockForbiddenError()` - 403 Forbidden error
- `mockInternalServerError()` - 500 Internal Server Error

**Helper Functions**:
- `setupSuccessfulMock()` - Configure mock for successful API call
- `setupFailedMock()` - Configure mock for failed API call
- `resetMockClient()` - Reset all mocks in a client
- `resetAllMockClients()` - Reset all mocks in all clients

#### Express Mocks (`tests/mocks/express.mock.ts`)

Mock implementations for Express objects:

**Mock Creators**:
- `createMockRequest()` - Mock Express Request with overrides
- `createMockResponse()` - Mock Express Response with tracking
- `createMockNext()` - Mock NextFunction
- `createMockExpressContext()` - Complete set of Express mocks

**Helper Functions**:
- `getResponseBody()` - Extract response body from mock
- `getResponseStatus()` - Extract status code from mock
- `wasNextCalledWithError()` - Check if next was called with error
- `getNextError()` - Get the error passed to next

### 5. Test Helper Utilities (`tests/utils/test-helpers.ts`)

Reusable test utilities:

**Async Utilities**:
- `wait(ms)` - Async delay
- `retry(fn, maxAttempts, delayMs)` - Retry logic for flaky operations
- `createDeferred()` - Create externally resolvable promise

**Test Setup Utilities**:
- `suppressConsole()` - Suppress console output during tests
- `mockEnv(vars)` - Mock environment variables
- `useFakeTimers()` - Mock timers for time-dependent tests

**Random Data Generators**:
- `randomString(length)` - Generate random string
- `randomInt(min, max)` - Generate random integer
- `randomK8sName()` - Generate Kubernetes-style name
- `randomNamespace()` - Generate namespace name
- `randomPodName()` - Generate pod name
- `randomServiceName()` - Generate service name
- `randomIngressName()` - Generate ingress name

**Assertion Helpers**:
- `assertDefined(value)` - Assert value is not null/undefined
- `assertThrows(fn, expectedError)` - Assert function throws
- `assertDoesNotThrow(fn)` - Assert function doesn't throw

### 6. Global Test Setup (`tests/setup.ts`)

Automatic setup for all tests:

**Environment Variables**:
- `NODE_ENV=test`
- `PORT=3000`
- `DEFAULT_NAMESPACE=default`
- `K8S_TIMEOUT=5000`
- `RATE_LIMIT_WINDOW_MS=900000`
- `RATE_LIMIT_MAX_REQUESTS=100`
- `CORS_ORIGINS=*`
- `LOG_LEVEL=error` (reduced noise in tests)
- `LOG_FORMAT=json`
- `SHUTDOWN_TIMEOUT_MS=30000`
- `DEFAULT_PAGE_SIZE=100`
- `MAX_PAGE_SIZE=1000`

**Lifecycle Hooks**:
- `beforeAll()` - Set environment variables
- `afterAll()` - Cleanup
- `beforeEach()` - Reset state
- `afterEach()` - Cleanup

### 7. Test Documentation (`tests/README.md`)

Comprehensive documentation including:
- Directory structure explanation
- Test type descriptions (unit, integration, property)
- Mock utilities documentation
- Test helper documentation
- Running tests guide
- Coverage requirements
- Writing tests examples
- Best practices
- Troubleshooting guide

## 🧪 Verification Tests

Two verification test files have been created to ensure the infrastructure works:

### 1. Mock Utilities Verification (`tests/unit/mocks-verification.test.ts`)

Tests that verify all mock utilities are working correctly:
- ✅ Kubernetes client mocks
- ✅ Mock response generators
- ✅ Mock error generators
- ✅ Express mocks
- ✅ Test helper utilities

**Status**: All 20 tests passing

### 2. Property-Based Testing Verification (`tests/properties/infrastructure-verification.property.test.ts`)

Tests that verify fast-check is working correctly:
- ✅ Basic property tests
- ✅ Random data generation
- ✅ Custom arbitraries
- ✅ Counterexample detection
- ✅ Async properties

**Status**: All 7 tests passing

## 📊 Test Commands

All npm scripts are configured and working:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- tests/unit/example.test.ts

# Run specific test type
npm test -- tests/unit          # Unit tests only
npm test -- tests/integration   # Integration tests only
npm test -- tests/properties    # Property tests only
```

## ✅ Requirements Validation

This setup satisfies all requirements from task 1:

### Requirement 11.1: Unit tests for all service layer methods
- ✅ Test directory structure created (`tests/unit/`)
- ✅ Mock utilities for Kubernetes clients available
- ✅ Test helpers for common operations available

### Requirement 11.2: Unit tests for all validators
- ✅ Test directory structure created (`tests/unit/`)
- ✅ Mock utilities for Express objects available
- ✅ Property-based testing infrastructure for validation testing

### Requirement 11.3: Integration tests for all API endpoints
- ✅ Test directory structure created (`tests/integration/`)
- ✅ Supertest installed and configured
- ✅ Mock utilities for full request/response cycle

### Requirement 11.4: Mocked Kubernetes clients
- ✅ Comprehensive mock implementations created
- ✅ Mock response generators for all resource types
- ✅ Mock error generators for common error scenarios
- ✅ Helper functions for easy mock setup

## 🎯 Next Steps

The testing infrastructure is now complete and ready for use. The next tasks will involve:

1. **Task 2**: Create centralized configuration module with tests
2. **Task 3**: Enhance Kubernetes configuration with tests
3. **Task 4**: Update application startup with tests
4. And so on...

Each subsequent task will add tests using this infrastructure to build up to the 80% coverage requirement.

## 📝 Notes

- All dependencies are installed and working
- All mock utilities are tested and verified
- Property-based testing with fast-check is configured
- Coverage thresholds are set to 80% as required
- Test documentation is comprehensive
- Path aliases are configured for convenient imports
- Global test setup handles environment configuration

The testing infrastructure is production-ready and follows best practices for TypeScript testing with Vitest.
