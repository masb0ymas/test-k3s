/**
 * Mock utilities for Express request and response objects
 * Provides mock implementations for testing middleware and controllers
 */

import { vi } from 'vitest';
import { Request, Response, NextFunction } from 'express';

/**
 * Create a mock Express Request object
 */
export function createMockRequest(overrides: Partial<Request> = {}): Partial<Request> {
  return {
    method: 'GET',
    path: '/test',
    url: '/test',
    query: {},
    params: {},
    body: {},
    headers: {},
    ip: '127.0.0.1',
    get: vi.fn((header: string) => {
      const headers = (overrides.headers || {}) as Record<string, string>;
      return headers[header.toLowerCase()];
    }),
    ...overrides,
  };
}

/**
 * Create a mock Express Response object
 */
export function createMockResponse(): Partial<Response> & {
  status: ReturnType<typeof vi.fn>;
  json: ReturnType<typeof vi.fn>;
  send: ReturnType<typeof vi.fn>;
  setHeader: ReturnType<typeof vi.fn>;
  getHeader: ReturnType<typeof vi.fn>;
  end: ReturnType<typeof vi.fn>;
} {
  const res: any = {
    statusCode: 200,
    headersSent: false,
    locals: {},
  };

  res.status = vi.fn((code: number) => {
    res.statusCode = code;
    return res;
  });

  res.json = vi.fn((data: any) => {
    res.body = data;
    return res;
  });

  res.send = vi.fn((data: any) => {
    res.body = data;
    return res;
  });

  res.setHeader = vi.fn((name: string, value: string | string[]) => {
    if (!res.headers) {
      res.headers = {};
    }
    res.headers[name.toLowerCase()] = value;
    return res;
  });

  res.getHeader = vi.fn((name: string) => {
    if (!res.headers) {
      return undefined;
    }
    return res.headers[name.toLowerCase()];
  });

  res.end = vi.fn(() => {
    res.headersSent = true;
    return res;
  });

  res.on = vi.fn();
  res.once = vi.fn();
  res.emit = vi.fn();

  return res;
}

/**
 * Create a mock Express NextFunction
 */
export function createMockNext(): NextFunction {
  return vi.fn() as NextFunction;
}

/**
 * Create a complete set of mock Express objects
 */
export function createMockExpressContext(
  reqOverrides: Partial<Request> = {},
  resOverrides: Partial<Response> = {}
) {
  const req = createMockRequest(reqOverrides);
  const res = createMockResponse();
  const next = createMockNext();

  // Apply response overrides
  Object.assign(res, resOverrides);

  return { req, res, next };
}

/**
 * Helper to extract the response body from a mock response
 */
export function getResponseBody(res: any): any {
  return res.body;
}

/**
 * Helper to extract the response status code from a mock response
 */
export function getResponseStatus(res: any): number {
  return res.statusCode;
}

/**
 * Helper to check if next was called with an error
 */
export function wasNextCalledWithError(next: NextFunction): boolean {
  const mockNext = next as ReturnType<typeof vi.fn>;
  return mockNext.mock.calls.length > 0 && mockNext.mock.calls[0][0] instanceof Error;
}

/**
 * Helper to get the error passed to next
 */
export function getNextError(next: NextFunction): Error | undefined {
  const mockNext = next as ReturnType<typeof vi.fn>;
  if (mockNext.mock.calls.length > 0) {
    return mockNext.mock.calls[0][0];
  }
  return undefined;
}
