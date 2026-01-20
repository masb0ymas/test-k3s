import * as k8s from "@kubernetes/client-node";
import { coreV1Api } from "../config/k8s.config.js";
import type { CreateServiceInput } from "../validators/service.validator.js";
import type { ServiceResponse, ServicePort } from "../types/service.types.js";

export class ServiceService {
  /**
   * List all services, optionally filtered by namespace
   */
  async listServices(namespace?: string): Promise<ServiceResponse[]> {
    let response: k8s.V1ServiceList;

    if (namespace) {
      const result = await coreV1Api.listNamespacedService(namespace);
      response = result.body;
    } else {
      const result = await coreV1Api.listServiceForAllNamespaces();
      response = result.body;
    }

    return response.items.map((svc) => this.mapServiceToResponse(svc));
  }

  /**
   * Get a specific service by name and namespace
   */
  async getService(namespace: string, name: string): Promise<ServiceResponse> {
    const result = await coreV1Api.readNamespacedService(name, namespace);
    return this.mapServiceToResponse(result.body);
  }

  /**
   * Create a new service
   */
  async createService(input: CreateServiceInput): Promise<ServiceResponse> {
    const service: k8s.V1Service = {
      apiVersion: "v1",
      kind: "Service",
      metadata: {
        name: input.name,
        namespace: input.namespace,
        labels: input.labels || { app: input.name },
      },
      spec: {
        type: input.type,
        selector: input.selector,
        ports: input.ports.map((p) => ({
          name: p.name,
          port: p.port,
          targetPort: p.targetPort,
          protocol: p.protocol || "TCP",
        })),
      },
    };

    const result = await coreV1Api.createNamespacedService(
      input.namespace || "default",
      service,
    );

    return this.mapServiceToResponse(result.body);
  }

  /**
   * Delete a service
   */
  async deleteService(namespace: string, name: string): Promise<void> {
    await coreV1Api.deleteNamespacedService(name, namespace);
  }

  /**
   * Map Kubernetes Service object to API response
   */
  private mapServiceToResponse(svc: k8s.V1Service): ServiceResponse {
    const ports: ServicePort[] = (svc.spec?.ports || []).map((p) => ({
      name: p.name,
      port: p.port,
      targetPort:
        typeof p.targetPort === "number"
          ? p.targetPort
          : parseInt(p.targetPort || "0", 10),
      protocol: p.protocol as "TCP" | "UDP",
    }));

    return {
      name: svc.metadata?.name || "",
      namespace: svc.metadata?.namespace || "default",
      type: svc.spec?.type || "ClusterIP",
      clusterIP: svc.spec?.clusterIP,
      externalIP: svc.status?.loadBalancer?.ingress?.map(
        (i) => i.ip || i.hostname || "",
      ),
      ports,
      selector: svc.spec?.selector,
      labels: svc.metadata?.labels,
      creationTimestamp: svc.metadata?.creationTimestamp,
    };
  }
}

export const serviceService = new ServiceService();
