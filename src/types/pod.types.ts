export interface ResourceQuantity {
  cpu?: string;
  memory?: string;
}

export interface ResourceRequirements {
  requests?: ResourceQuantity;
  limits?: ResourceQuantity;
}

export interface EnvVar {
  name: string;
  value: string;
}

export interface CreatePodRequest {
  name: string;
  namespace?: string;
  image: string;
  resources?: ResourceRequirements;
  labels?: Record<string, string>;
  env?: EnvVar[];
  command?: string[];
  args?: string[];
}

export interface UpdatePodRequest {
  labels?: Record<string, string>;
}

export interface PodResponse {
  name: string;
  namespace: string;
  status: string;
  phase: string;
  podIP?: string;
  hostIP?: string;
  startTime?: Date;
  containers: ContainerInfo[];
  labels?: Record<string, string>;
}

export interface ContainerInfo {
  name: string;
  image: string;
  ready: boolean;
  restartCount: number;
  resources?: ResourceRequirements;
}
