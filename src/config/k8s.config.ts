import * as k8s from "@kubernetes/client-node";

// Load kubeconfig from default location (~/.kube/config) or KUBECONFIG env
const kc = new k8s.KubeConfig();
kc.loadFromDefault();

// Create API clients
export const coreV1Api = kc.makeApiClient(k8s.CoreV1Api);
export const appsV1Api = kc.makeApiClient(k8s.AppsV1Api);
export const networkingV1Api = kc.makeApiClient(k8s.NetworkingV1Api);

export { kc };
