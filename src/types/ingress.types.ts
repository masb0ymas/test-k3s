export interface IngressPath {
  path: string;
  pathType: "Prefix" | "Exact" | "ImplementationSpecific";
  serviceName: string;
  servicePort: number;
}

export interface IngressRule {
  host: string;
  paths: IngressPath[];
}

export interface CreateIngressRequest {
  name: string;
  namespace?: string;
  rules: IngressRule[];
  labels?: Record<string, string>;
  annotations?: Record<string, string>;
  tls?: {
    hosts: string[];
    secretName?: string;
  }[];
}

export interface IngressResponse {
  name: string;
  namespace: string;
  rules: IngressRule[];
  hosts: string[];
  addresses?: string[];
  labels?: Record<string, string>;
  annotations?: Record<string, string>;
  creationTimestamp?: Date;
}
