export interface ServicePort {
  name?: string;
  port: number;
  targetPort: number;
  protocol?: "TCP" | "UDP";
}

export interface CreateServiceRequest {
  name: string;
  namespace?: string;
  selector: Record<string, string>;
  ports: ServicePort[];
  type?: "ClusterIP" | "NodePort" | "LoadBalancer";
  labels?: Record<string, string>;
}

export interface ServiceResponse {
  name: string;
  namespace: string;
  type: string;
  clusterIP?: string;
  externalIP?: string[];
  ports: ServicePort[];
  selector?: Record<string, string>;
  labels?: Record<string, string>;
  creationTimestamp?: Date;
}
