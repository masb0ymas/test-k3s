import * as k8s from "@kubernetes/client-node";
import { coreV1Api } from "../config/k8s.config.js";
import type {
  CreatePodInput,
  UpdatePodInput,
} from "../validators/pod.validator.js";
import type { PodResponse, ContainerInfo } from "../types/pod.types.js";

export class PodService {
  /**
   * List all pods, optionally filtered by namespace
   */
  async listPods(namespace?: string): Promise<PodResponse[]> {
    let response: k8s.V1PodList;

    if (namespace) {
      const result = await coreV1Api.listNamespacedPod(namespace);
      response = result.body;
    } else {
      const result = await coreV1Api.listPodForAllNamespaces();
      response = result.body;
    }

    return response.items.map((pod) => this.mapPodToResponse(pod));
  }

  /**
   * Get a specific pod by name and namespace
   */
  async getPod(namespace: string, name: string): Promise<PodResponse> {
    const result = await coreV1Api.readNamespacedPod(name, namespace);
    return this.mapPodToResponse(result.body);
  }

  /**
   * Create a new pod with optional resource limits
   */
  async createPod(input: CreatePodInput): Promise<PodResponse> {
    const pod: k8s.V1Pod = {
      apiVersion: "v1",
      kind: "Pod",
      metadata: {
        name: input.name,
        namespace: input.namespace,
        labels: input.labels || { app: input.name },
      },
      spec: {
        containers: [
          {
            name: input.name,
            image: input.image,
            resources: input.resources
              ? {
                  requests: input.resources.requests,
                  limits: input.resources.limits,
                }
              : undefined,
            env: input.env?.map((e) => ({ name: e.name, value: e.value })),
            command: input.command,
            args: input.args,
          },
        ],
      },
    };

    const result = await coreV1Api.createNamespacedPod(
      input.namespace || "default",
      pod,
    );

    return this.mapPodToResponse(result.body);
  }

  /**
   * Update pod labels (pods are largely immutable, only metadata can be updated)
   */
  async updatePod(
    namespace: string,
    name: string,
    input: UpdatePodInput,
  ): Promise<PodResponse> {
    const patchBody = {
      metadata: {
        labels: input.labels,
      },
    };

    const result = await coreV1Api.patchNamespacedPod(
      name,
      namespace,
      patchBody,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      { headers: { "Content-Type": "application/merge-patch+json" } },
    );

    return this.mapPodToResponse(result.body);
  }

  /**
   * Delete a pod
   */
  async deletePod(namespace: string, name: string): Promise<void> {
    await coreV1Api.deleteNamespacedPod(name, namespace);
  }

  /**
   * Map Kubernetes Pod object to API response
   */
  private mapPodToResponse(pod: k8s.V1Pod): PodResponse {
    const containers: ContainerInfo[] = (pod.spec?.containers || []).map(
      (container, index) => {
        const containerStatus = pod.status?.containerStatuses?.[index];
        return {
          name: container.name,
          image: container.image || "",
          ready: containerStatus?.ready || false,
          restartCount: containerStatus?.restartCount || 0,
          resources: container.resources
            ? {
                requests: container.resources.requests as
                  | Record<string, string>
                  | undefined,
                limits: container.resources.limits as
                  | Record<string, string>
                  | undefined,
              }
            : undefined,
        };
      },
    );

    return {
      name: pod.metadata?.name || "",
      namespace: pod.metadata?.namespace || "default",
      status: this.getPodStatusDescription(pod),
      phase: pod.status?.phase || "Unknown",
      podIP: pod.status?.podIP,
      hostIP: pod.status?.hostIP,
      startTime: pod.status?.startTime,
      containers,
      labels: pod.metadata?.labels,
    };
  }

  /**
   * Get human-readable pod status
   */
  private getPodStatusDescription(pod: k8s.V1Pod): string {
    const containerStatuses = pod.status?.containerStatuses || [];

    for (const cs of containerStatuses) {
      if (cs.state?.waiting?.reason) {
        return cs.state.waiting.reason;
      }
      if (cs.state?.terminated?.reason) {
        return cs.state.terminated.reason;
      }
    }

    return pod.status?.phase || "Unknown";
  }
}

export const podService = new PodService();
