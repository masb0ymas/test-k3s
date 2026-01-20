import * as k8s from "@kubernetes/client-node";
import { networkingV1Api } from "../config/k8s.config.js";
import type { CreateIngressInput } from "../validators/ingress.validator.js";
import type {
  IngressResponse,
  IngressRule,
  IngressPath,
  TraefikConfig,
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
   * Create a new ingress with domain rules and Traefik configuration
   */
  async createIngress(input: CreateIngressInput): Promise<IngressResponse> {
    // Build annotations with Traefik support
    const annotations = this.buildTraefikAnnotations(input);

    const ingress: k8s.V1Ingress = {
      apiVersion: "networking.k8s.io/v1",
      kind: "Ingress",
      metadata: {
        name: input.name,
        namespace: input.namespace,
        labels: input.labels,
        annotations,
      },
      spec: {
        // Set Traefik as the ingress class
        ingressClassName: "traefik",
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
   * Build Traefik-specific annotations from input
   */
  private buildTraefikAnnotations(
    input: CreateIngressInput,
  ): Record<string, string> {
    const annotations: Record<string, string> = {
      // Always use Traefik as ingress controller
      "kubernetes.io/ingress.class": "traefik",
      ...input.annotations,
    };

    if (input.traefik) {
      const { traefik } = input;

      // Entry points (e.g., web, websecure)
      if (traefik.entryPoints?.length) {
        annotations["traefik.ingress.kubernetes.io/router.entrypoints"] =
          traefik.entryPoints.join(",");
      }

      // Middlewares
      if (traefik.middlewares?.length) {
        annotations["traefik.ingress.kubernetes.io/router.middlewares"] =
          traefik.middlewares.join(",");
      }

      // TLS cert resolver (Let's Encrypt)
      if (traefik.certResolver) {
        annotations["traefik.ingress.kubernetes.io/router.tls.certresolver"] =
          traefik.certResolver;
        annotations["traefik.ingress.kubernetes.io/router.tls"] = "true";
      }

      // Router priority
      if (traefik.priority !== undefined) {
        annotations["traefik.ingress.kubernetes.io/router.priority"] = String(
          traefik.priority,
        );
      }

      // Sticky sessions
      if (traefik.sticky) {
        annotations["traefik.ingress.kubernetes.io/service.sticky.cookie"] =
          "true";
        annotations[
          "traefik.ingress.kubernetes.io/service.sticky.cookie.name"
        ] = "traefik_sticky";
      }

      // Pass host header
      if (traefik.passHostHeader !== undefined) {
        annotations["traefik.ingress.kubernetes.io/service.passhostheader"] =
          String(traefik.passHostHeader);
      }
    }

    return annotations;
  }

  /**
   * Parse Traefik configuration from annotations
   */
  private parseTraefikConfig(
    annotations?: Record<string, string>,
  ): TraefikConfig | undefined {
    if (!annotations) return undefined;

    const config: TraefikConfig = {};

    const entryPoints =
      annotations["traefik.ingress.kubernetes.io/router.entrypoints"];
    if (entryPoints) {
      config.entryPoints = entryPoints.split(",");
    }

    const middlewares =
      annotations["traefik.ingress.kubernetes.io/router.middlewares"];
    if (middlewares) {
      config.middlewares = middlewares.split(",");
    }

    const certResolver =
      annotations["traefik.ingress.kubernetes.io/router.tls.certresolver"];
    if (certResolver) {
      config.certResolver = certResolver;
    }

    const priority =
      annotations["traefik.ingress.kubernetes.io/router.priority"];
    if (priority) {
      config.priority = parseInt(priority, 10);
    }

    const sticky =
      annotations["traefik.ingress.kubernetes.io/service.sticky.cookie"];
    if (sticky === "true") {
      config.sticky = true;
    }

    const passHost =
      annotations["traefik.ingress.kubernetes.io/service.passhostheader"];
    if (passHost) {
      config.passHostHeader = passHost === "true";
    }

    // Only return if we found any Traefik config
    return Object.keys(config).length > 0 ? config : undefined;
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
      traefik: this.parseTraefikConfig(ing.metadata?.annotations),
    };
  }
}

export const ingressService = new IngressService();
