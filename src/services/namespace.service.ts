import * as k8s from "@kubernetes/client-node";
import { coreV1Api } from "../config/k8s.config.js";

export interface NamespaceResponse {
  name: string;
  status: string;
  creationTimestamp?: Date;
  labels?: Record<string, string>;
}

export class NamespaceService {
  /**
   * List all namespaces
   */
  async listNamespaces(): Promise<NamespaceResponse[]> {
    const result = await coreV1Api.listNamespace();

    return result.body.items.map((ns: k8s.V1Namespace) => ({
      name: ns.metadata?.name || "",
      status: ns.status?.phase || "Unknown",
      creationTimestamp: ns.metadata?.creationTimestamp,
      labels: ns.metadata?.labels,
    }));
  }

  /**
   * Get a specific namespace
   */
  async getNamespace(name: string): Promise<NamespaceResponse> {
    const result = await coreV1Api.readNamespace(name);

    return {
      name: result.body.metadata?.name || "",
      status: result.body.status?.phase || "Unknown",
      creationTimestamp: result.body.metadata?.creationTimestamp,
      labels: result.body.metadata?.labels,
    };
  }
}

export const namespaceService = new NamespaceService();
