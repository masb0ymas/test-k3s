import { z } from "zod";

const ingressPathSchema = z.object({
  path: z.string().default("/"),
  pathType: z
    .enum(["Prefix", "Exact", "ImplementationSpecific"])
    .default("Prefix"),
  serviceName: z.string().min(1, "Service name is required"),
  servicePort: z.number().int().min(1).max(65535),
});

const ingressRuleSchema = z.object({
  host: z.string().min(1, "Host is required"),
  paths: z.array(ingressPathSchema).min(1, "At least one path is required"),
});

const tlsSchema = z.object({
  hosts: z.array(z.string()).min(1),
  secretName: z.string().optional(),
});

export const createIngressSchema = z.object({
  name: z
    .string()
    .min(1, "Ingress name is required")
    .max(253)
    .regex(
      /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/,
      "Ingress name must be lowercase alphanumeric with hyphens",
    ),
  namespace: z.string().default("default"),
  rules: z.array(ingressRuleSchema).min(1, "At least one rule is required"),
  labels: z.record(z.string()).optional(),
  annotations: z.record(z.string()).optional(),
  tls: z.array(tlsSchema).optional(),
});

export type CreateIngressInput = z.infer<typeof createIngressSchema>;
