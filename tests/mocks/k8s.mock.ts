/**
 * Mock utilities for Kubernetes clients
 * Provides mock implementations for testing without requiring a live cluster
 */

import { vi } from 'vitest';
import * as k8s from '@kubernetes/client-node';

/**
 * Mock response structure for Kubernetes API calls
 */
export interface MockK8sResponse<T = any> {
  response: {
    statusCode: number;
    statusMessage?: string;
  };
  body: T;
}

/**
 * Create a mock CoreV1Api client
 */
export function createMockCoreV1Api() {
  return {
    listNamespace: vi.fn(),
    readNamespace: vi.fn(),
    createNamespace: vi.fn(),
    deleteNamespace: vi.fn(),
    patchNamespace: vi.fn(),
    
    listNamespacedPod: vi.fn(),
    readNamespacedPod: vi.fn(),
    createNamespacedPod: vi.fn(),
    deleteNamespacedPod: vi.fn(),
    patchNamespacedPod: vi.fn(),
    
    listNamespacedService: vi.fn(),
    readNamespacedService: vi.fn(),
    createNamespacedService: vi.fn(),
    deleteNamespacedService: vi.fn(),
    patchNamespacedService: vi.fn(),
    
    listPodForAllNamespaces: vi.fn(),
    listServiceForAllNamespaces: vi.fn(),
  };
}

/**
 * Create a mock AppsV1Api client
 */
export function createMockAppsV1Api() {
  return {
    listNamespacedDeployment: vi.fn(),
    readNamespacedDeployment: vi.fn(),
    createNamespacedDeployment: vi.fn(),
    deleteNamespacedDeployment: vi.fn(),
    patchNamespacedDeployment: vi.fn(),
  };
}

/**
 * Create a mock NetworkingV1Api client
 */
export function createMockNetworkingV1Api() {
  return {
    listNamespacedIngress: vi.fn(),
    readNamespacedIngress: vi.fn(),
    createNamespacedIngress: vi.fn(),
    deleteNamespacedIngress: vi.fn(),
    patchNamespacedIngress: vi.fn(),
  };
}

/**
 * Create a mock KubeConfig
 */
export function createMockKubeConfig() {
  return {
    loadFromDefault: vi.fn(),
    loadFromFile: vi.fn(),
    loadFromString: vi.fn(),
    loadFromCluster: vi.fn(),
    makeApiClient: vi.fn(),
    getCurrentCluster: vi.fn(),
    getCurrentContext: vi.fn(),
    getCurrentUser: vi.fn(),
  };
}

/**
 * Create a complete set of mock K8s clients
 */
export function createMockK8sClients() {
  const coreV1Api = createMockCoreV1Api();
  const appsV1Api = createMockAppsV1Api();
  const networkingV1Api = createMockNetworkingV1Api();
  const kc = createMockKubeConfig();

  return {
    coreV1Api,
    appsV1Api,
    networkingV1Api,
    kc,
  };
}

/**
 * Mock successful namespace response
 */
export function mockNamespaceResponse(name: string = 'default'): k8s.V1Namespace {
  return {
    apiVersion: 'v1',
    kind: 'Namespace',
    metadata: {
      name,
      uid: `uid-${name}`,
      creationTimestamp: new Date(),
      resourceVersion: '1',
    },
    spec: {},
    status: {
      phase: 'Active',
    },
  };
}

/**
 * Mock successful pod response
 */
export function mockPodResponse(
  name: string = 'test-pod',
  namespace: string = 'default'
): k8s.V1Pod {
  return {
    apiVersion: 'v1',
    kind: 'Pod',
    metadata: {
      name,
      namespace,
      uid: `uid-${name}`,
      creationTimestamp: new Date(),
      resourceVersion: '1',
    },
    spec: {
      containers: [
        {
          name: 'test-container',
          image: 'nginx:latest',
          resources: {
            limits: {
              cpu: '500m',
              memory: '512Mi',
            },
            requests: {
              cpu: '250m',
              memory: '256Mi',
            },
          },
        },
      ],
    },
    status: {
      phase: 'Running',
    },
  };
}

/**
 * Mock successful service response
 */
export function mockServiceResponse(
  name: string = 'test-service',
  namespace: string = 'default'
): k8s.V1Service {
  return {
    apiVersion: 'v1',
    kind: 'Service',
    metadata: {
      name,
      namespace,
      uid: `uid-${name}`,
      creationTimestamp: new Date(),
      resourceVersion: '1',
    },
    spec: {
      selector: {
        app: 'test',
      },
      ports: [
        {
          name: 'http',
          port: 80,
          targetPort: 8080,
          protocol: 'TCP',
        },
      ],
      type: 'ClusterIP',
    },
    status: {},
  };
}

/**
 * Mock successful ingress response
 */
export function mockIngressResponse(
  name: string = 'test-ingress',
  namespace: string = 'default'
): k8s.V1Ingress {
  return {
    apiVersion: 'networking.k8s.io/v1',
    kind: 'Ingress',
    metadata: {
      name,
      namespace,
      uid: `uid-${name}`,
      creationTimestamp: new Date(),
      resourceVersion: '1',
    },
    spec: {
      rules: [
        {
          host: 'example.com',
          http: {
            paths: [
              {
                path: '/',
                pathType: 'Prefix',
                backend: {
                  service: {
                    name: 'test-service',
                    port: {
                      number: 80,
                    },
                  },
                },
              },
            ],
          },
        },
      ],
    },
    status: {},
  };
}

/**
 * Mock list response with multiple items
 */
export function mockListResponse<T>(items: T[]): { body: { items: T[] } } {
  return {
    body: {
      items,
    },
  };
}

/**
 * Mock Kubernetes API error
 */
export function mockK8sError(
  statusCode: number,
  reason: string,
  message: string
): Error {
  const error = new Error(message) as any;
  error.statusCode = statusCode;
  error.body = {
    kind: 'Status',
    apiVersion: 'v1',
    status: 'Failure',
    message,
    reason,
    code: statusCode,
  };
  return error;
}

/**
 * Mock 404 Not Found error
 */
export function mockNotFoundError(resourceType: string, name: string): Error {
  return mockK8sError(
    404,
    'NotFound',
    `${resourceType} "${name}" not found`
  );
}

/**
 * Mock 409 Conflict error (resource already exists)
 */
export function mockConflictError(resourceType: string, name: string): Error {
  return mockK8sError(
    409,
    'AlreadyExists',
    `${resourceType} "${name}" already exists`
  );
}

/**
 * Mock 403 Forbidden error
 */
export function mockForbiddenError(action: string): Error {
  return mockK8sError(
    403,
    'Forbidden',
    `User is not authorized to ${action}`
  );
}

/**
 * Mock 500 Internal Server Error
 */
export function mockInternalServerError(message: string = 'Internal server error'): Error {
  return mockK8sError(500, 'InternalError', message);
}

/**
 * Setup mock for successful API call
 */
export function setupSuccessfulMock<T>(
  mockFn: any,
  response: T
): void {
  mockFn.mockResolvedValue({
    response: { statusCode: 200 },
    body: response,
  });
}

/**
 * Setup mock for failed API call
 */
export function setupFailedMock(
  mockFn: any,
  error: Error
): void {
  mockFn.mockRejectedValue(error);
}

/**
 * Reset all mocks in a client
 */
export function resetMockClient(client: any): void {
  Object.values(client).forEach((fn: any) => {
    if (fn && typeof fn.mockReset === 'function') {
      fn.mockReset();
    }
  });
}

/**
 * Reset all mocks in all clients
 */
export function resetAllMockClients(clients: ReturnType<typeof createMockK8sClients>): void {
  resetMockClient(clients.coreV1Api);
  resetMockClient(clients.appsV1Api);
  resetMockClient(clients.networkingV1Api);
  resetMockClient(clients.kc);
}
