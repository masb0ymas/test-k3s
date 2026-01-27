import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// Mock the @kubernetes/client-node module before importing anything else
vi.mock('@kubernetes/client-node', async () => {
  const actual = await vi.importActual('@kubernetes/client-node');
  
  // Create a mock KubeConfig class that we can control
  const MockKubeConfigClass = vi.fn(function() {
    this.loadFromDefault = vi.fn();
    this.makeApiClient = vi.fn(() => ({}));
    this.getCurrentCluster = vi.fn();
    this.getCurrentContext = vi.fn();
    this.getCurrentUser = vi.fn();
  });
  
  return {
    ...actual,
    KubeConfig: MockKubeConfigClass,
  };
});

import * as k8s from '@kubernetes/client-node';
import {
  initializeK8sClients,
  verifyK8sConnectivity,
  checkK8sHealth,
} from '../../../src/config/k8s.config';
import {
  createMockCoreV1Api,
  mockListResponse,
  mockNamespaceResponse,
} from '../../mocks/k8s.mock';

describe('K8s Configuration Module', () => {
  let mockCoreV1Api: ReturnType<typeof createMockCoreV1Api>;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Create fresh mock for CoreV1Api
    mockCoreV1Api = createMockCoreV1Api();
  });

  describe('verifyK8sConnectivity', () => {
    it('should successfully verify connectivity with valid cluster', async () => {
      // Mock successful namespace list response
      const namespaces = [mockNamespaceResponse('default')];
      mockCoreV1Api.listNamespace.mockResolvedValue(
        mockListResponse(namespaces)
      );

      await expect(
        verifyK8sConnectivity(mockCoreV1Api as any)
      ).resolves.toBeUndefined();

      // Verify the API call was made with correct parameters
      expect(mockCoreV1Api.listNamespace).toHaveBeenCalledWith(
        undefined, // pretty
        undefined, // allowWatchBookmarks
        undefined, // continue
        undefined, // fieldSelector
        undefined, // labelSelector
        1 // limit
      );
    });

    it('should use custom timeout when provided', async () => {
      const namespaces = [mockNamespaceResponse('default')];
      mockCoreV1Api.listNamespace.mockResolvedValue(
        mockListResponse(namespaces)
      );

      await expect(
        verifyK8sConnectivity(mockCoreV1Api as any, 10000)
      ).resolves.toBeUndefined();

      expect(mockCoreV1Api.listNamespace).toHaveBeenCalled();
    });

    it('should throw descriptive error on connection timeout', async () => {
      // Mock a slow API call that exceeds timeout
      mockCoreV1Api.listNamespace.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 10000))
      );

      await expect(
        verifyK8sConnectivity(mockCoreV1Api as any, 100)
      ).rejects.toThrow(/Connection timeout/);

      await expect(
        verifyK8sConnectivity(mockCoreV1Api as any, 100)
      ).rejects.toThrow(/k3s cluster may be unreachable/);
    });

    it('should throw descriptive error on connection refused', async () => {
      const error = new Error('connect ECONNREFUSED 127.0.0.1:6443');
      mockCoreV1Api.listNamespace.mockRejectedValue(error);

      await expect(
        verifyK8sConnectivity(mockCoreV1Api as any)
      ).rejects.toThrow(/Connection refused/);

      await expect(
        verifyK8sConnectivity(mockCoreV1Api as any)
      ).rejects.toThrow(/cluster is not reachable/);
    });

    it('should throw descriptive error on host not found', async () => {
      const error = new Error('getaddrinfo ENOTFOUND invalid-host');
      mockCoreV1Api.listNamespace.mockRejectedValue(error);

      await expect(
        verifyK8sConnectivity(mockCoreV1Api as any)
      ).rejects.toThrow(/Host not found/);

      await expect(
        verifyK8sConnectivity(mockCoreV1Api as any)
      ).rejects.toThrow(/hostname in the kubeconfig could not be resolved/);
    });

    it('should throw descriptive error on unauthorized (401)', async () => {
      const error = new Error('Unauthorized');
      mockCoreV1Api.listNamespace.mockRejectedValue(error);

      await expect(
        verifyK8sConnectivity(mockCoreV1Api as any)
      ).rejects.toThrow(/Authentication failed/);

      await expect(
        verifyK8sConnectivity(mockCoreV1Api as any)
      ).rejects.toThrow(/credentials in the kubeconfig are invalid/);
    });

    it('should throw descriptive error on forbidden (403)', async () => {
      const error = new Error('Forbidden');
      mockCoreV1Api.listNamespace.mockRejectedValue(error);

      await expect(
        verifyK8sConnectivity(mockCoreV1Api as any)
      ).rejects.toThrow(/Authorization failed/);

      await expect(
        verifyK8sConnectivity(mockCoreV1Api as any)
      ).rejects.toThrow(/does not have permission to list namespaces/);
    });

    it('should throw descriptive error for generic errors', async () => {
      const error = new Error('Some unexpected error');
      mockCoreV1Api.listNamespace.mockRejectedValue(error);

      await expect(
        verifyK8sConnectivity(mockCoreV1Api as any)
      ).rejects.toThrow(/Some unexpected error/);

      await expect(
        verifyK8sConnectivity(mockCoreV1Api as any)
      ).rejects.toThrow(/verify the kubeconfig is valid/);
    });

    it('should handle non-Error exceptions', async () => {
      mockCoreV1Api.listNamespace.mockRejectedValue('string error');

      await expect(
        verifyK8sConnectivity(mockCoreV1Api as any)
      ).rejects.toThrow(/Unknown error/);
    });
  });

  describe('checkK8sHealth', () => {
    it('should return true for healthy cluster', async () => {
      const namespaces = [mockNamespaceResponse('default')];
      mockCoreV1Api.listNamespace.mockResolvedValue(
        mockListResponse(namespaces)
      );

      const result = await checkK8sHealth(mockCoreV1Api as any);
      
      expect(result).toBe(true);
      expect(mockCoreV1Api.listNamespace).toHaveBeenCalled();
    });

    it('should return false for unhealthy cluster', async () => {
      const error = new Error('Connection refused');
      mockCoreV1Api.listNamespace.mockRejectedValue(error);

      // Spy on console.error to verify logging
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await checkK8sHealth(mockCoreV1Api as any);
      
      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Kubernetes health check failed:',
        expect.stringContaining('Connection refused')
      );

      consoleErrorSpy.mockRestore();
    });

    it('should use custom timeout when provided', async () => {
      const namespaces = [mockNamespaceResponse('default')];
      mockCoreV1Api.listNamespace.mockResolvedValue(
        mockListResponse(namespaces)
      );

      const result = await checkK8sHealth(mockCoreV1Api as any, 10000);
      
      expect(result).toBe(true);
    });

    it('should not throw errors even on failure', async () => {
      const error = new Error('Catastrophic failure');
      mockCoreV1Api.listNamespace.mockRejectedValue(error);

      // Suppress console.error for this test
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await expect(
        checkK8sHealth(mockCoreV1Api as any)
      ).resolves.toBe(false);

      consoleErrorSpy.mockRestore();
    });
  });

  describe('initializeK8sClients', () => {
    beforeEach(() => {
      // Reset the KubeConfig mock before each test
      vi.clearAllMocks();
    });

    it('should successfully initialize clients with valid kubeconfig', async () => {
      // Create a mock instance that will be returned by new KubeConfig()
      const mockKcInstance = {
        loadFromDefault: vi.fn(),
        makeApiClient: vi.fn((apiType: any) => {
          if (apiType === k8s.CoreV1Api) return mockCoreV1Api;
          return {};
        }),
      };

      // Mock the KubeConfig constructor to return our instance
      (k8s.KubeConfig as any).mockImplementation(function(this: any) {
        return mockKcInstance;
      });

      // Mock successful connectivity verification
      const namespaces = [mockNamespaceResponse('default')];
      mockCoreV1Api.listNamespace.mockResolvedValue(
        mockListResponse(namespaces)
      );

      const clients = await initializeK8sClients();

      expect(clients).toBeDefined();
      expect(clients.coreV1Api).toBeDefined();
      expect(clients.appsV1Api).toBeDefined();
      expect(clients.networkingV1Api).toBeDefined();
      expect(clients.kc).toBeDefined();

      // Verify kubeconfig was loaded
      expect(mockKcInstance.loadFromDefault).toHaveBeenCalled();

      // Verify connectivity was checked
      expect(mockCoreV1Api.listNamespace).toHaveBeenCalled();
    });

    it('should throw descriptive error for invalid kubeconfig', async () => {
      const mockKcInstance = {
        loadFromDefault: vi.fn(() => {
          throw new Error('Unable to load kubeconfig');
        }),
        makeApiClient: vi.fn(),
      };

      (k8s.KubeConfig as any).mockImplementation(function(this: any) {
        return mockKcInstance;
      });

      await expect(initializeK8sClients()).rejects.toThrow(
        /Failed to load kubeconfig/
      );

      await expect(initializeK8sClients()).rejects.toThrow(
        /ensure a valid kubeconfig exists/
      );
    });

    it('should throw descriptive error for missing kubeconfig file', async () => {
      const mockKcInstance = {
        loadFromDefault: vi.fn(() => {
          throw new Error('ENOENT: no such file or directory');
        }),
        makeApiClient: vi.fn(),
      };

      (k8s.KubeConfig as any).mockImplementation(function(this: any) {
        return mockKcInstance;
      });

      await expect(initializeK8sClients()).rejects.toThrow(
        /Failed to load kubeconfig/
      );

      await expect(initializeK8sClients()).rejects.toThrow(
        /ENOENT: no such file or directory/
      );
    });

    it('should throw error when cluster is unreachable', async () => {
      const mockKcInstance = {
        loadFromDefault: vi.fn(),
        makeApiClient: vi.fn((apiType: any) => {
          if (apiType === k8s.CoreV1Api) return mockCoreV1Api;
          return {};
        }),
      };

      (k8s.KubeConfig as any).mockImplementation(function(this: any) {
        return mockKcInstance;
      });

      // Mock connection failure
      const error = new Error('connect ECONNREFUSED 127.0.0.1:6443');
      mockCoreV1Api.listNamespace.mockRejectedValue(error);

      await expect(initializeK8sClients()).rejects.toThrow(
        /Connection refused/
      );

      await expect(initializeK8sClients()).rejects.toThrow(
        /cluster is not reachable/
      );
    });

    it('should throw error on connection timeout', async () => {
      const mockKcInstance = {
        loadFromDefault: vi.fn(),
        makeApiClient: vi.fn((apiType: any) => {
          if (apiType === k8s.CoreV1Api) return mockCoreV1Api;
          return {};
        }),
      };

      (k8s.KubeConfig as any).mockImplementation(function(this: any) {
        return mockKcInstance;
      });

      // Mock slow API call
      mockCoreV1Api.listNamespace.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 10000))
      );

      await expect(initializeK8sClients()).rejects.toThrow(
        /Connection timeout/
      );
    });

    it('should throw error for authentication failures', async () => {
      const mockKcInstance = {
        loadFromDefault: vi.fn(),
        makeApiClient: vi.fn((apiType: any) => {
          if (apiType === k8s.CoreV1Api) return mockCoreV1Api;
          return {};
        }),
      };

      (k8s.KubeConfig as any).mockImplementation(function(this: any) {
        return mockKcInstance;
      });

      // Mock authentication error
      const error = new Error('Unauthorized');
      mockCoreV1Api.listNamespace.mockRejectedValue(error);

      await expect(initializeK8sClients()).rejects.toThrow(
        /Authentication failed/
      );
    });

    it('should throw error for authorization failures', async () => {
      const mockKcInstance = {
        loadFromDefault: vi.fn(),
        makeApiClient: vi.fn((apiType: any) => {
          if (apiType === k8s.CoreV1Api) return mockCoreV1Api;
          return {};
        }),
      };

      (k8s.KubeConfig as any).mockImplementation(function(this: any) {
        return mockKcInstance;
      });

      // Mock authorization error
      const error = new Error('Forbidden');
      mockCoreV1Api.listNamespace.mockRejectedValue(error);

      await expect(initializeK8sClients()).rejects.toThrow(
        /Authorization failed/
      );
    });

    it('should create all required API clients', async () => {
      const mockKcInstance = {
        loadFromDefault: vi.fn(),
        makeApiClient: vi.fn((apiType: any) => {
          if (apiType === k8s.CoreV1Api) return mockCoreV1Api;
          return {};
        }),
      };

      (k8s.KubeConfig as any).mockImplementation(function(this: any) {
        return mockKcInstance;
      });

      // Mock successful connectivity
      const namespaces = [mockNamespaceResponse('default')];
      mockCoreV1Api.listNamespace.mockResolvedValue(
        mockListResponse(namespaces)
      );

      const clients = await initializeK8sClients();

      // Verify makeApiClient was called for each API type
      expect(mockKcInstance.makeApiClient).toHaveBeenCalledWith(k8s.CoreV1Api);
      expect(mockKcInstance.makeApiClient).toHaveBeenCalledWith(k8s.AppsV1Api);
      expect(mockKcInstance.makeApiClient).toHaveBeenCalledWith(k8s.NetworkingV1Api);
      expect(mockKcInstance.makeApiClient).toHaveBeenCalledTimes(3);
    });

    it('should verify connectivity before returning clients', async () => {
      // Track call order
      const callOrder: string[] = [];
      
      const mockKcInstance = {
        loadFromDefault: vi.fn(),
        makeApiClient: vi.fn((apiType: any) => {
          callOrder.push('makeApiClient');
          if (apiType === k8s.CoreV1Api) return mockCoreV1Api;
          return {};
        }),
      };

      (k8s.KubeConfig as any).mockImplementation(function(this: any) {
        return mockKcInstance;
      });

      mockCoreV1Api.listNamespace.mockImplementation(async () => {
        callOrder.push('listNamespace');
        return mockListResponse([mockNamespaceResponse('default')]);
      });

      await initializeK8sClients();

      // Verify connectivity check happened after client creation
      expect(callOrder).toContain('makeApiClient');
      expect(callOrder).toContain('listNamespace');
      const makeApiIndex = callOrder.indexOf('makeApiClient');
      const listNamespaceIndex = callOrder.indexOf('listNamespace');
      expect(listNamespaceIndex).toBeGreaterThan(makeApiIndex);
    });
  });
});
