import { z } from "zod";

const servicePortSchema = z.object({
  name: z.string().optional(),
  port: z.number().int().min(1).max(65535),
  targetPort: z.number().int().min(1).max(65535),
  protocol: z.enum(["TCP", "UDP"]).default("TCP"),
});

export const createServiceSchema = z.object({
  name: z
    .string()
    .min(1, "Service name is required")
    .max(253)
    .regex(
      /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/,
      "Service name must be lowercase alphanumeric with hyphens",
    ),
  namespace: z.string().default("default"),
  selector: z.record(z.string()).refine((obj) => Object.keys(obj).length > 0, {
    message: "At least one selector is required",
  }),
  ports: z.array(servicePortSchema).min(1, "At least one port is required"),
  type: z.enum(["ClusterIP", "NodePort", "LoadBalancer"]).default("ClusterIP"),
  labels: z.record(z.string()).optional(),
});

export type CreateServiceInput = z.infer<typeof createServiceSchema>;
