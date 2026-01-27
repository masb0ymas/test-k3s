import { z } from 'zod';

/**
 * Configuration schema for environment variables
 * Validates all required and optional environment variables with sensible defaults
 */
const configSchema = z.object({
  // Server configuration
  PORT: z.string()
    .regex(/^\d+$/, 'PORT must be a valid number')
    .transform(Number)
    .default('3000'),
  
  NODE_ENV: z.enum(['development', 'production', 'test'])
    .default('development'),
  
  // Kubernetes configuration
  DEFAULT_NAMESPACE: z.string()
    .min(1, 'DEFAULT_NAMESPACE cannot be empty')
    .default('default'),
  
  K8S_TIMEOUT: z.string()
    .regex(/^\d+$/, 'K8S_TIMEOUT must be a valid number')
    .transform(Number)
    .default('5000'),
  
  // Rate limiting
  RATE_LIMIT_WINDOW_MS: z.string()
    .regex(/^\d+$/, 'RATE_LIMIT_WINDOW_MS must be a valid number')
    .transform(Number)
    .default('900000'), // 15 minutes
  
  RATE_LIMIT_MAX_REQUESTS: z.string()
    .regex(/^\d+$/, 'RATE_LIMIT_MAX_REQUESTS must be a valid number')
    .transform(Number)
    .default('100'),
  
  // CORS
  CORS_ORIGINS: z.string()
    .transform(s => s.split(',').map(origin => origin.trim()))
    .default('*'),
  
  // Logging
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error'])
    .default('info'),
  
  LOG_FORMAT: z.enum(['json', 'text'])
    .default('json'),
  
  // Shutdown
  SHUTDOWN_TIMEOUT_MS: z.string()
    .regex(/^\d+$/, 'SHUTDOWN_TIMEOUT_MS must be a valid number')
    .transform(Number)
    .default('30000'), // 30 seconds
  
  // Pagination
  DEFAULT_PAGE_SIZE: z.string()
    .regex(/^\d+$/, 'DEFAULT_PAGE_SIZE must be a valid number')
    .transform(Number)
    .default('100'),
  
  MAX_PAGE_SIZE: z.string()
    .regex(/^\d+$/, 'MAX_PAGE_SIZE must be a valid number')
    .transform(Number)
    .default('1000'),
});

/**
 * Application configuration interface
 * Represents the validated and typed configuration object
 */
export interface AppConfig {
  // Server configuration
  port: number;
  nodeEnv: 'development' | 'production' | 'test';
  
  // Kubernetes configuration
  defaultNamespace: string;
  k8sTimeout: number; // milliseconds
  
  // Rate limiting
  rateLimitWindowMs: number;
  rateLimitMaxRequests: number;
  
  // CORS
  corsOrigins: string[];
  
  // Logging
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  logFormat: 'json' | 'text';
  
  // Shutdown
  shutdownTimeoutMs: number;
  
  // Pagination
  defaultPageSize: number;
  maxPageSize: number;
}

/**
 * Validates configuration from environment variables
 * @param env - Environment variables object (defaults to process.env)
 * @returns Validated configuration object
 * @throws {Error} If validation fails with descriptive error messages
 */
export function validateConfig(env: Record<string, string | undefined> = process.env): AppConfig {
  try {
    const parsed = configSchema.parse(env);
    
    // Map parsed environment variables to AppConfig interface
    return {
      port: parsed.PORT,
      nodeEnv: parsed.NODE_ENV,
      defaultNamespace: parsed.DEFAULT_NAMESPACE,
      k8sTimeout: parsed.K8S_TIMEOUT,
      rateLimitWindowMs: parsed.RATE_LIMIT_WINDOW_MS,
      rateLimitMaxRequests: parsed.RATE_LIMIT_MAX_REQUESTS,
      corsOrigins: parsed.CORS_ORIGINS,
      logLevel: parsed.LOG_LEVEL,
      logFormat: parsed.LOG_FORMAT,
      shutdownTimeoutMs: parsed.SHUTDOWN_TIMEOUT_MS,
      defaultPageSize: parsed.DEFAULT_PAGE_SIZE,
      maxPageSize: parsed.MAX_PAGE_SIZE,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Format validation errors with descriptive messages
      const errorMessages = error.issues.map(issue => {
        const path = issue.path.join('.');
        return `  - ${path}: ${issue.message}`;
      }).join('\n');
      
      throw new Error(
        `Configuration validation failed:\n${errorMessages}\n\n` +
        'Please check your environment variables and ensure all required values are set correctly.'
      );
    }
    throw error;
  }
}

/**
 * Loads and validates configuration from environment variables
 * @returns Validated configuration object
 * @throws {Error} If validation fails
 */
export function loadConfig(): AppConfig {
  return validateConfig(process.env);
}

/**
 * Singleton configuration object
 * Loaded once at application startup
 */
let configInstance: AppConfig | null = null;

/**
 * Gets the singleton configuration instance
 * Loads configuration on first access
 * @returns The application configuration
 */
export function getConfig(): AppConfig {
  if (!configInstance) {
    configInstance = loadConfig();
  }
  return configInstance;
}

/**
 * Resets the configuration instance (useful for testing)
 */
export function resetConfig(): void {
  configInstance = null;
}

// Export singleton config object for convenience
export const config = getConfig();
