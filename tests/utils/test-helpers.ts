/**
 * Common test helper utilities
 * Provides reusable functions for testing
 */

import { vi } from 'vitest';

/**
 * Wait for a specified amount of time
 */
export function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Create a spy on console methods to suppress output during tests
 */
export function suppressConsole() {
  const originalLog = console.log;
  const originalError = console.error;
  const originalWarn = console.warn;
  const originalInfo = console.info;

  beforeEach(() => {
    console.log = vi.fn();
    console.error = vi.fn();
    console.warn = vi.fn();
    console.info = vi.fn();
  });

  afterEach(() => {
    console.log = originalLog;
    console.error = originalError;
    console.warn = originalWarn;
    console.info = originalInfo;
  });
}

/**
 * Mock environment variables for a test
 */
export function mockEnv(vars: Record<string, string>) {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    Object.assign(process.env, vars);
  });

  afterEach(() => {
    process.env = originalEnv;
  });
}

/**
 * Create a mock timer for testing time-dependent code
 */
export function useFakeTimers() {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });
}

/**
 * Generate a random string
 */
export function randomString(length: number = 10): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generate a random integer between min and max (inclusive)
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate a random Kubernetes resource name
 */
export function randomK8sName(): string {
  const prefix = randomString(5);
  const suffix = randomString(5);
  return `${prefix}-${suffix}`;
}

/**
 * Generate a random namespace name
 */
export function randomNamespace(): string {
  return `ns-${randomString(8)}`;
}

/**
 * Generate a random pod name
 */
export function randomPodName(): string {
  return `pod-${randomString(8)}`;
}

/**
 * Generate a random service name
 */
export function randomServiceName(): string {
  return `svc-${randomString(8)}`;
}

/**
 * Generate a random ingress name
 */
export function randomIngressName(): string {
  return `ing-${randomString(8)}`;
}

/**
 * Assert that a value is defined (not null or undefined)
 */
export function assertDefined<T>(value: T | null | undefined, message?: string): asserts value is T {
  if (value === null || value === undefined) {
    throw new Error(message || 'Expected value to be defined');
  }
}

/**
 * Assert that a function throws an error
 */
export async function assertThrows(
  fn: () => any | Promise<any>,
  expectedError?: string | RegExp
): Promise<Error> {
  try {
    await fn();
    throw new Error('Expected function to throw an error');
  } catch (error) {
    if (expectedError) {
      const message = (error as Error).message;
      if (typeof expectedError === 'string') {
        if (!message.includes(expectedError)) {
          throw new Error(
            `Expected error message to include "${expectedError}", but got "${message}"`
          );
        }
      } else {
        if (!expectedError.test(message)) {
          throw new Error(
            `Expected error message to match ${expectedError}, but got "${message}"`
          );
        }
      }
    }
    return error as Error;
  }
}

/**
 * Assert that a function does not throw an error
 */
export async function assertDoesNotThrow(fn: () => any | Promise<any>): Promise<void> {
  try {
    await fn();
  } catch (error) {
    throw new Error(`Expected function not to throw, but got: ${(error as Error).message}`);
  }
}

/**
 * Create a deferred promise that can be resolved or rejected externally
 */
export function createDeferred<T>() {
  let resolve: (value: T) => void;
  let reject: (reason?: any) => void;

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return {
    promise,
    resolve: resolve!,
    reject: reject!,
  };
}

/**
 * Retry a function until it succeeds or max attempts is reached
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delayMs: number = 100
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxAttempts) {
        await wait(delayMs);
      }
    }
  }

  throw lastError;
}
