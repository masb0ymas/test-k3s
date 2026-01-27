import { describe, it, expect, beforeEach } from 'vitest';
import { validateConfig, loadConfig, resetConfig, type AppConfig } from '../../../src/config/index';

describe('Configuration Module', () => {
  beforeEach(() => {
    // Reset config instance before each test
    resetConfig();
  });

  describe('validateConfig', () => {
    it('should load valid configuration with all defaults', () => {
      const config = validateConfig({});
      
      expect(config).toEqual({
        port: 3000,
        nodeEnv: 'development',
        defaultNamespace: 'default',
        k8sTimeout: 5000,
        rateLimitWindowMs: 900000,
        rateLimitMaxRequests: 100,
        corsOrigins: ['*'],
        logLevel: 'info',
        logFormat: 'json',
        shutdownTimeoutMs: 30000,
        defaultPageSize: 100,
        maxPageSize: 1000,
      });
    });

    it('should parse and transform PORT from string to number', () => {
      const config = validateConfig({ PORT: '8080' });
      
      expect(config.port).toBe(8080);
      expect(typeof config.port).toBe('number');
    });

    it('should parse and transform K8S_TIMEOUT from string to number', () => {
      const config = validateConfig({ K8S_TIMEOUT: '10000' });
      
      expect(config.k8sTimeout).toBe(10000);
      expect(typeof config.k8sTimeout).toBe('number');
    });

    it('should parse and transform RATE_LIMIT_WINDOW_MS from string to number', () => {
      const config = validateConfig({ RATE_LIMIT_WINDOW_MS: '600000' });
      
      expect(config.rateLimitWindowMs).toBe(600000);
      expect(typeof config.rateLimitWindowMs).toBe('number');
    });

    it('should parse and transform RATE_LIMIT_MAX_REQUESTS from string to number', () => {
      const config = validateConfig({ RATE_LIMIT_MAX_REQUESTS: '200' });
      
      expect(config.rateLimitMaxRequests).toBe(200);
      expect(typeof config.rateLimitMaxRequests).toBe('number');
    });

    it('should parse and transform SHUTDOWN_TIMEOUT_MS from string to number', () => {
      const config = validateConfig({ SHUTDOWN_TIMEOUT_MS: '60000' });
      
      expect(config.shutdownTimeoutMs).toBe(60000);
      expect(typeof config.shutdownTimeoutMs).toBe('number');
    });

    it('should parse and transform DEFAULT_PAGE_SIZE from string to number', () => {
      const config = validateConfig({ DEFAULT_PAGE_SIZE: '50' });
      
      expect(config.defaultPageSize).toBe(50);
      expect(typeof config.defaultPageSize).toBe('number');
    });

    it('should parse and transform MAX_PAGE_SIZE from string to number', () => {
      const config = validateConfig({ MAX_PAGE_SIZE: '500' });
      
      expect(config.maxPageSize).toBe(500);
      expect(typeof config.maxPageSize).toBe('number');
    });

    it('should accept valid NODE_ENV values', () => {
      const devConfig = validateConfig({ NODE_ENV: 'development' });
      expect(devConfig.nodeEnv).toBe('development');

      const prodConfig = validateConfig({ NODE_ENV: 'production' });
      expect(prodConfig.nodeEnv).toBe('production');

      const testConfig = validateConfig({ NODE_ENV: 'test' });
      expect(testConfig.nodeEnv).toBe('test');
    });

    it('should accept valid LOG_LEVEL values', () => {
      const debugConfig = validateConfig({ LOG_LEVEL: 'debug' });
      expect(debugConfig.logLevel).toBe('debug');

      const infoConfig = validateConfig({ LOG_LEVEL: 'info' });
      expect(infoConfig.logLevel).toBe('info');

      const warnConfig = validateConfig({ LOG_LEVEL: 'warn' });
      expect(warnConfig.logLevel).toBe('warn');

      const errorConfig = validateConfig({ LOG_LEVEL: 'error' });
      expect(errorConfig.logLevel).toBe('error');
    });

    it('should accept valid LOG_FORMAT values', () => {
      const jsonConfig = validateConfig({ LOG_FORMAT: 'json' });
      expect(jsonConfig.logFormat).toBe('json');

      const textConfig = validateConfig({ LOG_FORMAT: 'text' });
      expect(textConfig.logFormat).toBe('text');
    });

    it('should parse CORS_ORIGINS as comma-separated list', () => {
      const config = validateConfig({ 
        CORS_ORIGINS: 'http://localhost:3000,https://example.com,https://app.example.com' 
      });
      
      expect(config.corsOrigins).toEqual([
        'http://localhost:3000',
        'https://example.com',
        'https://app.example.com'
      ]);
    });

    it('should trim whitespace from CORS_ORIGINS', () => {
      const config = validateConfig({ 
        CORS_ORIGINS: ' http://localhost:3000 , https://example.com , https://app.example.com ' 
      });
      
      expect(config.corsOrigins).toEqual([
        'http://localhost:3000',
        'https://example.com',
        'https://app.example.com'
      ]);
    });

    it('should accept custom DEFAULT_NAMESPACE', () => {
      const config = validateConfig({ DEFAULT_NAMESPACE: 'my-namespace' });
      
      expect(config.defaultNamespace).toBe('my-namespace');
    });

    it('should throw error for invalid PORT format', () => {
      expect(() => validateConfig({ PORT: 'not-a-number' }))
        .toThrow(/PORT must be a valid number/);
    });

    it('should throw error for invalid K8S_TIMEOUT format', () => {
      expect(() => validateConfig({ K8S_TIMEOUT: 'invalid' }))
        .toThrow(/K8S_TIMEOUT must be a valid number/);
    });

    it('should throw error for invalid RATE_LIMIT_WINDOW_MS format', () => {
      expect(() => validateConfig({ RATE_LIMIT_WINDOW_MS: 'abc' }))
        .toThrow(/RATE_LIMIT_WINDOW_MS must be a valid number/);
    });

    it('should throw error for invalid RATE_LIMIT_MAX_REQUESTS format', () => {
      expect(() => validateConfig({ RATE_LIMIT_MAX_REQUESTS: 'xyz' }))
        .toThrow(/RATE_LIMIT_MAX_REQUESTS must be a valid number/);
    });

    it('should throw error for invalid SHUTDOWN_TIMEOUT_MS format', () => {
      expect(() => validateConfig({ SHUTDOWN_TIMEOUT_MS: 'bad' }))
        .toThrow(/SHUTDOWN_TIMEOUT_MS must be a valid number/);
    });

    it('should throw error for invalid DEFAULT_PAGE_SIZE format', () => {
      expect(() => validateConfig({ DEFAULT_PAGE_SIZE: 'invalid' }))
        .toThrow(/DEFAULT_PAGE_SIZE must be a valid number/);
    });

    it('should throw error for invalid MAX_PAGE_SIZE format', () => {
      expect(() => validateConfig({ MAX_PAGE_SIZE: 'bad' }))
        .toThrow(/MAX_PAGE_SIZE must be a valid number/);
    });

    it('should throw error for invalid NODE_ENV', () => {
      expect(() => validateConfig({ NODE_ENV: 'staging' }))
        .toThrow(/Configuration validation failed/);
    });

    it('should throw error for invalid LOG_LEVEL', () => {
      expect(() => validateConfig({ LOG_LEVEL: 'trace' }))
        .toThrow(/Configuration validation failed/);
    });

    it('should throw error for invalid LOG_FORMAT', () => {
      expect(() => validateConfig({ LOG_FORMAT: 'xml' }))
        .toThrow(/Configuration validation failed/);
    });

    it('should throw error for empty DEFAULT_NAMESPACE', () => {
      expect(() => validateConfig({ DEFAULT_NAMESPACE: '' }))
        .toThrow(/DEFAULT_NAMESPACE cannot be empty/);
    });

    it('should throw descriptive error with multiple validation failures', () => {
      try {
        validateConfig({ 
          PORT: 'invalid',
          NODE_ENV: 'staging',
          K8S_TIMEOUT: 'bad'
        });
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        const message = (error as Error).message;
        expect(message).toContain('Configuration validation failed');
        expect(message).toContain('PORT');
        expect(message).toContain('NODE_ENV');
        expect(message).toContain('K8S_TIMEOUT');
      }
    });

    it('should include helpful message in validation errors', () => {
      try {
        validateConfig({ PORT: 'not-a-number' });
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        const message = (error as Error).message;
        expect(message).toContain('Configuration validation failed');
        expect(message).toContain('Please check your environment variables');
      }
    });

    it('should load complete custom configuration', () => {
      const customEnv = {
        PORT: '8080',
        NODE_ENV: 'production',
        DEFAULT_NAMESPACE: 'production',
        K8S_TIMEOUT: '10000',
        RATE_LIMIT_WINDOW_MS: '600000',
        RATE_LIMIT_MAX_REQUESTS: '200',
        CORS_ORIGINS: 'https://example.com',
        LOG_LEVEL: 'warn',
        LOG_FORMAT: 'text',
        SHUTDOWN_TIMEOUT_MS: '60000',
        DEFAULT_PAGE_SIZE: '50',
        MAX_PAGE_SIZE: '500',
      };

      const config = validateConfig(customEnv);

      expect(config).toEqual({
        port: 8080,
        nodeEnv: 'production',
        defaultNamespace: 'production',
        k8sTimeout: 10000,
        rateLimitWindowMs: 600000,
        rateLimitMaxRequests: 200,
        corsOrigins: ['https://example.com'],
        logLevel: 'warn',
        logFormat: 'text',
        shutdownTimeoutMs: 60000,
        defaultPageSize: 50,
        maxPageSize: 500,
      });
    });
  });

  describe('loadConfig', () => {
    it('should load configuration from process.env', () => {
      // Save original env
      const originalEnv = process.env.PORT;
      
      // Set test env
      process.env.PORT = '9000';
      
      try {
        resetConfig();
        const config = loadConfig();
        expect(config.port).toBe(9000);
      } finally {
        // Restore original env
        if (originalEnv !== undefined) {
          process.env.PORT = originalEnv;
        } else {
          delete process.env.PORT;
        }
      }
    });
  });
});
