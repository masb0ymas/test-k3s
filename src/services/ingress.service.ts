import * as k8s from "@kubernetes/client-node";
import { networkingV1Api } from "../config/k8s.config.js";
import type { CreateIngressInput } from "../validators/ingress.validator.js";
import type {
  IngressResponse,
  IngressRule,
  IngressPath,
} from "../types/ingress.types.js";

export class IngressService {
  /**
   * List all ingresses, optionally filtered by namespace
   */
  async listIngresses(namespace?: string): Promise<IngressResponse[]> {
    let response: k8s.V1IngressList;

    if (namespace) {
      const result = await networkingV1Api.listNamespacedIngress(namespace);
      response = result.body;
    } else {
      const result = await networkingV1Api.listIngressForAllNamespaces();
      response = result.body;
    }

    return response.items.map((ing) => this.mapIngressToResponse(ing));
  }

  /**
   * Get a specific ingress by name and namespace
   */
  async getIngress(namespace: string, name: string): Promise<IngressResponse> {
    const result = await networkingV1Api.readNamespacedIngress(name, namespace);
    return this.mapIngressToResponse(result.body);
  }

  /**
   * Create a new ingress with domain rules
   */
  async createIngress(input: CreateIngressInput): Promise<IngressResponse> {
    const ingress: k8s.V1Ingress = {
      apiVersion: "networking.k8s.io/v1",
      kind: "Ingress",
      metadata: {
        name: input.name,
        namespace: input.namespace,
        labels: input.labels,
        annotations: input.annotations,
      },
      spec: {
        rules: input.rules.map((rule) => ({
          host: rule.host,
          http: {
            paths: rule.paths.map((path) => ({
              path: path.path,
              pathType: path.pathType,
              backend: {
                service: {
                  name: path.serviceName,
                  port: {
                    number: path.servicePort,
                  },
                },
              },
            })),
          },
        })),
        tls: input.tls?.map((t) => ({
          hosts: t.hosts,
          secretName: t.secretName,
        })),
      },
    };

    const result = await networkingV1Api.createNamespacedIngress(
      input.namespace || "default",
      ingress,
    );

    return this.mapIngressToResponse(result.body);
  }

  /**
   * Delete an ingress
   */
  async deleteIngress(namespace: string, name: string): Promise<void> {
    await networkingV1Api.deleteNamespacedIngress(name, namespace);
  }

  /**
   * Map Kubernetes Ingress object to API response
   */
  private mapIngressToResponse(ing: k8s.V1Ingress): IngressResponse {
    const rules: IngressRule[] = (ing.spec?.rules || []).map((rule) => ({
      host: rule.host || "",
      paths: (rule.http?.paths || []).map(
        (p): IngressPath => ({
          path: p.path || "/",
          pathType: (p.pathType || "Prefix") as
            | "Prefix"
            | "Exact"
            | "ImplementationSpecific",
          serviceName: p.backend.service?.name || "",
          servicePort: p.backend.service?.port?.number || 0,
        }),
      ),
    }));

    const hosts = rules.map((r) => r.host).filter(Boolean);
    const addresses = ing.status?.loadBalancer?.ingress?.map(
      (i) => i.ip || i.hostname || "",
    );

    return {
      name: ing.metadata?.name || "",
      namespace: ing.metadata?.namespace || "default",
      rules,
      hosts,
      addresses,
      labels: ing.metadata?.labels,
      annotations: ing.metadata?.annotations,
      creationTimestamp: ing.metadata?.creationTimestamp,
    };
  }
}

export const ingressService = new IngressService();
