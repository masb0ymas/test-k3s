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

/**
 * Traefik-specific configuration options
 */
export interface TraefikConfig {
  /** Entry points to use (e.g., 'web', 'websecure') */
  entryPoints?: string[];
  /** Traefik middlewares to apply (e.g., 'default-redirect@kubernetescrd') */
  middlewares?: string[];
  /** Enable TLS with Let's Encrypt */
  certResolver?: string;
  /** Custom router priority */
  priority?: number;
  /** Enable sticky sessions */
  sticky?: boolean;
  /** Pass host header to backend */
  passHostHeader?: boolean;
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
  /** Traefik-specific configuration */
  traefik?: TraefikConfig;
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
  /** Detected Traefik configuration from annotations */
  traefik?: TraefikConfig;
}
