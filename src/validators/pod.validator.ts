import { z } from "zod";

const resourceQuantitySchema = z.object({
  cpu: z.string().optional(),
  memory: z.string().optional(),
});

const resourceRequirementsSchema = z.object({
  requests: resourceQuantitySchema.optional(),
  limits: resourceQuantitySchema.optional(),
});

const envVarSchema = z.object({
  name: z.string().min(1),
  value: z.string(),
});

export const createPodSchema = z.object({
  name: z
    .string()
    .min(1, "Pod name is required")
    .max(253, "Pod name must be at most 253 characters")
    .regex(
      /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/,
      "Pod name must be lowercase alphanumeric with hyphens",
    ),
  namespace: z.string().default("default"),
  image: z.string().min(1, "Container image is required"),
  resources: resourceRequirementsSchema.optional(),
  labels: z.record(z.string()).optional(),
  env: z.array(envVarSchema).optional(),
  command: z.array(z.string()).optional(),
  args: z.array(z.string()).optional(),
});

export const updatePodSchema = z.object({
  labels: z.record(z.string()).optional(),
});

export type CreatePodInput = z.infer<typeof createPodSchema>;
export type UpdatePodInput = z.infer<typeof updatePodSchema>;
