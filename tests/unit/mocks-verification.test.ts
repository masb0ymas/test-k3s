/**
 * Test to verify mock utilities are working correctly
 * This ensures the testing infrastructure is properly set up
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  createMockK8sClients,
  mockPodResponse,
  mockServiceResponse,
  mockNamespaceResponse,
  mockIngressResponse,
  mockK8sError,
  mockNotFoundError,
  setupSuccessfulMock,
  setupFailedMock,
  resetAllMockClients,
} from '@tests/mocks/k8s.mock';
import {
  createMockExpressContext,
  getResponseBody,
  getResponseStatus,
  wasNextCalledWithError,
  getNextError,
} from '@tests/mocks/express.mock';
import {
  randomString,
  randomInt,
  randomK8sName,
  randomNamespace,
  assertDefined,
} from '@tests/utils/test-helpers';

describe('Mock Utilities Verification', () => {
  describe('Kubernetes Mocks', () => {
    let mockClients: ReturnType<typeof createMockK8sClients>;

    beforeEach(() => {
      mockClients = createMockK8sClients();
    });

    it('should create mock K8s clients', () => {
      expect(mockClients.coreV1Api).toBeDefined();
      expect(mockClients.appsV1Api).toBeDefined();
      expect(mockClients.networkingV1Api).toBeDefined();
      expect(mockClients.kc).toBeDefined();
    });

    it('should create mock pod response', () => {
      const pod = mockPodResponse('test-pod', 'default');
      expect(pod.metadata?.name).toBe('test-pod');
      expect(pod.metadata?.namespace).toBe('default');
      expect(pod.kind).toBe('Pod');
    });

    it('should create mock service response', () => {
      const service = mockServiceResponse('test-service', 'default');
      expect(service.metadata?.name).toBe('test-service');
      expect(service.metadata?.namespace).toBe('default');
      expect(service.kind).toBe('Service');
    });

    it('should create mock namespace response', () => {
      const namespace = mockNamespaceResponse('test-ns');
      expect(namespace.metadata?.name).toBe('test-ns');
      expect(namespace.kind).toBe('Namespace');
    });

    it('should create mock ingress response', () => {
      const ingress = mockIngressResponse('test-ingress', 'default');
      expect(ingress.metadata?.name).toBe('test-ingress');
      expect(ingress.metadata?.namespace).toBe('default');
      expect(ingress.kind).toBe('Ingress');
    });

    it('should create mock K8s errors', () => {
      const error = mockK8sError(404, 'NotFound', 'Resource not found');
      expect(error).toBeInstanceOf(Error);
      expect((error as any).statusCode).toBe(404);
      expect((error as any).body.reason).toBe('NotFound');
    });

    it('should create mock not found error', () => {
      const error = mockNotFoundError('Pod', 'test-pod');
      expect(error).toBeInstanceOf(Error);
      expect((error as any).statusCode).toBe(404);
      expect(error.message).toContain('test-pod');
    });

    it('should setup successful mock', () => {
      const mockFn = mockClients.coreV1Api.listNamespace;
      const namespace = mockNamespaceResponse('test');
      setupSuccessfulMock(mockFn, { items: [namespace] });

      expect(mockFn).toBeDefined();
    });

    it('should setup failed mock', () => {
      const mockFn = mockClients.coreV1Api.readNamespace;
      const error = mockNotFoundError('Namespace', 'test');
      setupFailedMock(mockFn, error);

      expect(mockFn).toBeDefined();
    });

    it('should reset all mock clients', () => {
      mockClients.coreV1Api.listNamespace();
      resetAllMockClients(mockClients);
      expect(mockClients.coreV1Api.listNamespace).toBeDefined();
    });
  });

  describe('Express Mocks', () => {
    it('should create mock Express context', () => {
      const { req, res, next } = createMockExpressContext();
      expect(req).toBeDefined();
      expect(res).toBeDefined();
      expect(next).toBeDefined();
    });

    it('should create mock request with overrides', () => {
      const { req } = createMockExpressContext({
        method: 'POST',
        path: '/api/pods',
        body: { name: 'test' },
      });
      expect(req.method).toBe('POST');
      expect(req.path).toBe('/api/pods');
      expect(req.body).toEqual({ name: 'test' });
    });

    it('should create mock response with methods', () => {
      const { res } = createMockExpressContext();
      res.status(200).json({ success: true });
      expect(getResponseStatus(res)).toBe(200);
      expect(getResponseBody(res)).toEqual({ success: true });
    });

    it('should track next function calls', () => {
      const { next } = createMockExpressContext();
      const error = new Error('Test error');
      next(error);
      expect(wasNextCalledWithError(next)).toBe(true);
      expect(getNextError(next)).toBe(error);
    });
  });

  describe('Test Helpers', () => {
    it('should generate random strings', () => {
      const str1 = randomString(10);
      const str2 = randomString(10);
      expect(str1).toHaveLength(10);
      expect(str2).toHaveLength(10);
      expect(str1).not.toBe(str2); // Should be different (statistically)
    });

    it('should generate random integers', () => {
      const num = randomInt(1, 10);
      expect(num).toBeGreaterThanOrEqual(1);
      expect(num).toBeLessThanOrEqual(10);
    });

    it('should generate random K8s names', () => {
      const name = randomK8sName();
      expect(name).toMatch(/^[a-z0-9]+-[a-z0-9]+$/);
    });

    it('should generate random namespace names', () => {
      const ns = randomNamespace();
      expect(ns).toMatch(/^ns-[a-z0-9]+$/);
    });

    it('should assert defined values', () => {
      const value = 'test';
      assertDefined(value);
      expect(value).toBe('test');
    });

    it('should throw on undefined values', () => {
      expect(() => assertDefined(undefined)).toThrow('Expected value to be defined');
    });
  });
});
