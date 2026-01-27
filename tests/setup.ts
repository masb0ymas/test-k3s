/**
 * Global test setup file
 * This file runs before all tests
 */

import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest';

// Set test environment variables
beforeAll(() => {
  process.env.NODE_ENV = 'test';
  process.env.PORT = '3000';
  process.env.DEFAULT_NAMESPACE = 'default';
  process.env.K8S_TIMEOUT = '5000';
  process.env.RATE_LIMIT_WINDOW_MS = '900000';
  process.env.RATE_LIMIT_MAX_REQUESTS = '100';
  process.env.CORS_ORIGINS = '*';
  process.env.LOG_LEVEL = 'error'; // Reduce noise in tests
  process.env.LOG_FORMAT = 'json';
  process.env.SHUTDOWN_TIMEOUT_MS = '30000';
  process.env.DEFAULT_PAGE_SIZE = '100';
  process.env.MAX_PAGE_SIZE = '1000';
});

// Clean up after all tests
afterAll(() => {
  // Cleanup if needed
});

// Reset state before each test
beforeEach(() => {
  // Reset any global state if needed
});

// Clean up after each test
afterEach(() => {
  // Cleanup if needed
});
