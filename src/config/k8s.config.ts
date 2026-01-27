import * as k8s from "@kubernetes/client-node";
import { getConfig } from "./index";

/**
 * Interface representing the Kubernetes API clients
 */
export interface K8sClients {
  coreV1Api: k8s.CoreV1Api;
  appsV1Api: k8s.AppsV1Api;
  networkingV1Api: k8s.NetworkingV1Api;
  kc: k8s.KubeConfig;
}

/**
 * Verifies Kubernetes connectivity by making a lightweight API call with timeout
 * @param client - CoreV1Api client to test
 * @param timeoutMs - Timeout in milliseconds (default: 5000)
 * @throws {Error} If connection fails or times out
 */
export async function verifyK8sConnectivity(
  client: k8s.CoreV1Api,
  timeoutMs?: number
): Promise<void> {
  const config = getConfig();
  const timeout = timeoutMs ?? config.k8sTimeout;

  try {
    // Create a promise that rejects after timeout
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Kubernetes API connection timeout after ${timeout}ms`));
      }, timeout);
    });

    // Make a lightweight API call (list namespaces with limit=1)
    const apiCallPromise = client.listNamespace(
      undefined, // pretty
      undefined, // allowWatchBookmarks
      undefined, // continue
      undefined, // fieldSelector
      undefined, // labelSelector
      1 // limit - only fetch 1 namespace to minimize overhead
    );

    // Race between API call and timeout
    await Promise.race([apiCallPromise, timeoutPromise]);
  } catch (error) {
    if (error instanceof Error) {
      // Provide descriptive error messages based on error type
      if (error.message.includes('timeout')) {
        throw new Error(
          `Failed to connect to Kubernetes cluster: Connection timeout. ` +
          `The k3s cluster may be unreachable or not responding. ` +
          `Please verify the cluster is running and accessible.`
        );
      } else if (error.message.includes('ECONNREFUSED')) {
        throw new Error(
          `Failed to connect to Kubernetes cluster: Connection refused. ` +
          `The k3s cluster is not reachable at the configured address. ` +
          `Please verify the cluster is running and the kubeconfig is correct.`
        );
      } else if (error.message.includes('ENOTFOUND')) {
        throw new Error(
          `Failed to connect to Kubernetes cluster: Host not found. ` +
          `The cluster hostname in the kubeconfig could not be resolved. ` +
          `Please verify the kubeconfig server address is correct.`
        );
      } else if (error.message.includes('Unauthorized') || error.message.includes('401')) {
        throw new Error(
          `Failed to connect to Kubernetes cluster: Authentication failed. ` +
          `The credentials in the kubeconfig are invalid or expired. ` +
          `Please verify the kubeconfig authentication settings.`
        );
      } else if (error.message.includes('Forbidden') || error.message.includes('403')) {
        throw new Error(
          `Failed to connect to Kubernetes cluster: Authorization failed. ` +
          `The authenticated user does not have permission to list namespaces. ` +
          `Please verify the user has appropriate RBAC permissions.`
        );
      } else {
        throw new Error(
          `Failed to connect to Kubernetes cluster: ${error.message}. ` +
          `Please verify the kubeconfig is valid and the cluster is accessible.`
        );
      }
    }
    throw new Error(
      `Failed to connect to Kubernetes cluster: Unknown error. ` +
      `Please verify the kubeconfig is valid and the cluster is accessible.`
    );
  }
}

/**
 * Checks Kubernetes health status for use by health endpoint
 * Returns boolean without throwing to allow graceful health check responses
 * @param client - CoreV1Api client to test
 * @param timeoutMs - Timeout in milliseconds (default: 5000)
 * @returns true if healthy, false if unhealthy
 */
export async function checkK8sHealth(
  client: k8s.CoreV1Api,
  timeoutMs?: number
): Promise<boolean> {
  try {
    await verifyK8sConnectivity(client, timeoutMs);
    return true;
  } catch (error) {
    // Log error for debugging but return false instead of throwing
    console.error('Kubernetes health check failed:', error instanceof Error ? error.message : 'Unknown error');
    return false;
  }
}

/**
 * Initializes Kubernetes clients with connection verification
 * @returns Promise resolving to K8sClients object
 * @throws {Error} If kubeconfig is invalid or cluster is unreachable
 */
export async function initializeK8sClients(): Promise<K8sClients> {
  try {
    // Load kubeconfig from default location (~/.kube/config) or KUBECONFIG env
    const kc = new k8s.KubeConfig();
    
    try {
      kc.loadFromDefault();
    } catch (error) {
      throw new Error(
        `Failed to load kubeconfig: ${error instanceof Error ? error.message : 'Unknown error'}. ` +
        `Please ensure a valid kubeconfig exists at ~/.kube/config or set the KUBECONFIG environment variable.`
      );
    }

    // Create API clients
    const coreV1Api = kc.makeApiClient(k8s.CoreV1Api);
    const appsV1Api = kc.makeApiClient(k8s.AppsV1Api);
    const networkingV1Api = kc.makeApiClient(k8s.NetworkingV1Api);

    // Verify connectivity before returning clients
    await verifyK8sConnectivity(coreV1Api);

    return {
      coreV1Api,
      appsV1Api,
      networkingV1Api,
      kc,
    };
  } catch (error) {
    // Re-throw with context if not already a descriptive error
    if (error instanceof Error && error.message.includes('Failed to')) {
      throw error;
    }
    throw new Error(
      `Failed to initialize Kubernetes clients: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

// Legacy exports for backward compatibility (will be removed after migration)
// These are synchronous and don't verify connectivity
const kc = new k8s.KubeConfig();
try {
  kc.loadFromDefault();
} catch (error) {
  console.warn('Warning: Failed to load kubeconfig for legacy exports. Use initializeK8sClients() instead.');
}

export const coreV1Api = kc.makeApiClient(k8s.CoreV1Api);
export const appsV1Api = kc.makeApiClient(k8s.AppsV1Api);
export const networkingV1Api = kc.makeApiClient(k8s.NetworkingV1Api);
export { kc };
