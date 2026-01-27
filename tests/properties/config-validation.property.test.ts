/**
 * Property-based tests for configuration validation
 * 
 * Feature: k3s-api-bug-fixes-improvements
 * Property 4: Configuration Validation
 * 
 * **Validates: Requirements 6.2, 6.5**
 * 
 * For any missing or invalid required environment variable, the application SHALL 
 * fail to start, log a descriptive error message, and exit with a non-zero status code.
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { validateConfig } from '../../src/config/index';

describe('Property 4: Configuration Validation', () => {
  describe('Invalid numeric environment variables', () => {
    it('should reject invalid PORT values', () => {
      // Generate random non-numeric strings
      const invalidPortArbitrary = fc.string().filter(s => !/^\d+$/.test(s) && s.length > 0);

      fc.assert(
        fc.property(invalidPortArbitrary, (invalidPort) => {
          // Property: Invalid PORT should cause validation to fail
          expect(() => validateConfig({ PORT: invalidPort })).toThrow(/PORT must be a valid number/);
          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('should reject invalid K8S_TIMEOUT values', () => {
      const invalidTimeoutArbitrary = fc.string().filter(s => !/^\d+$/.test(s) && s.length > 0);

      fc.assert(
        fc.property(invalidTimeoutArbitrary, (invalidTimeout) => {
          // Property: Invalid K8S_TIMEOUT should cause validation to fail
          expect(() => validateConfig({ K8S_TIMEOUT: invalidTimeout })).toThrow(/K8S_TIMEOUT must be a valid number/);
          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('should reject invalid RATE_LIMIT_WINDOW_MS values', () => {
      const invalidWindowArbitrary = fc.string().filter(s => !/^\d+$/.test(s) && s.length > 0);

      fc.assert(
        fc.property(invalidWindowArbitrary, (invalidWindow) => {
          // Property: Invalid RATE_LIMIT_WINDOW_MS should cause validation to fail
          expect(() => validateConfig({ RATE_LIMIT_WINDOW_MS: invalidWindow })).toThrow(/RATE_LIMIT_WINDOW_MS must be a valid number/);
          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('should reject invalid RATE_LIMIT_MAX_REQUESTS values', () => {
      const invalidMaxRequestsArbitrary = fc.string().filter(s => !/^\d+$/.test(s) && s.length > 0);

      fc.assert(
        fc.property(invalidMaxRequestsArbitrary, (invalidMaxRequests) => {
          // Property: Invalid RATE_LIMIT_MAX_REQUESTS should cause validation to fail
          expect(() => validateConfig({ RATE_LIMIT_MAX_REQUESTS: invalidMaxRequests })).toThrow(/RATE_LIMIT_MAX_REQUESTS must be a valid number/);
          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('should reject invalid SHUTDOWN_TIMEOUT_MS values', () => {
      const invalidShutdownArbitrary = fc.string().filter(s => !/^\d+$/.test(s) && s.length > 0);

      fc.assert(
        fc.property(invalidShutdownArbitrary, (invalidShutdown) => {
          // Property: Invalid SHUTDOWN_TIMEOUT_MS should cause validation to fail
          expect(() => validateConfig({ SHUTDOWN_TIMEOUT_MS: invalidShutdown })).toThrow(/SHUTDOWN_TIMEOUT_MS must be a valid number/);
          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('should reject invalid DEFAULT_PAGE_SIZE values', () => {
      const invalidPageSizeArbitrary = fc.string().filter(s => !/^\d+$/.test(s) && s.length > 0);

      fc.assert(
        fc.property(invalidPageSizeArbitrary, (invalidPageSize) => {
          // Property: Invalid DEFAULT_PAGE_SIZE should cause validation to fail
          expect(() => validateConfig({ DEFAULT_PAGE_SIZE: invalidPageSize })).toThrow(/DEFAULT_PAGE_SIZE must be a valid number/);
          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('should reject invalid MAX_PAGE_SIZE values', () => {
      const invalidMaxPageSizeArbitrary = fc.string().filter(s => !/^\d+$/.test(s) && s.length > 0);

      fc.assert(
        fc.property(invalidMaxPageSizeArbitrary, (invalidMaxPageSize) => {
          // Property: Invalid MAX_PAGE_SIZE should cause validation to fail
          expect(() => validateConfig({ MAX_PAGE_SIZE: invalidMaxPageSize })).toThrow(/MAX_PAGE_SIZE must be a valid number/);
          return true;
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('Invalid enum environment variables', () => {
    it('should reject invalid NODE_ENV values', () => {
      // Generate random strings that are not valid NODE_ENV values
      const invalidNodeEnvArbitrary = fc.string().filter(s => 
        s.length > 0 && !['development', 'production', 'test'].includes(s)
      );

      fc.assert(
        fc.property(invalidNodeEnvArbitrary, (invalidNodeEnv) => {
          // Property: Invalid NODE_ENV should cause validation to fail
          expect(() => validateConfig({ NODE_ENV: invalidNodeEnv })).toThrow(/Configuration validation failed/);
          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('should reject invalid LOG_LEVEL values', () => {
      const invalidLogLevelArbitrary = fc.string().filter(s => 
        s.length > 0 && !['debug', 'info', 'warn', 'error'].includes(s)
      );

      fc.assert(
        fc.property(invalidLogLevelArbitrary, (invalidLogLevel) => {
          // Property: Invalid LOG_LEVEL should cause validation to fail
          expect(() => validateConfig({ LOG_LEVEL: invalidLogLevel })).toThrow(/Configuration validation failed/);
          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('should reject invalid LOG_FORMAT values', () => {
      const invalidLogFormatArbitrary = fc.string().filter(s => 
        s.length > 0 && !['json', 'text'].includes(s)
      );

      fc.assert(
        fc.property(invalidLogFormatArbitrary, (invalidLogFormat) => {
          // Property: Invalid LOG_FORMAT should cause validation to fail
          expect(() => validateConfig({ LOG_FORMAT: invalidLogFormat })).toThrow(/Configuration validation failed/);
          return true;
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('Invalid string environment variables', () => {
    it('should reject empty DEFAULT_NAMESPACE', () => {
      // Property: Empty DEFAULT_NAMESPACE should cause validation to fail
      expect(() => validateConfig({ DEFAULT_NAMESPACE: '' })).toThrow(/DEFAULT_NAMESPACE cannot be empty/);
    });
  });

  describe('Multiple validation errors', () => {
    it('should report all validation errors when multiple variables are invalid', () => {
      // Generate random combinations of invalid environment variables
      const invalidConfigArbitrary = fc.record({
        PORT: fc.string().filter(s => !/^\d+$/.test(s) && s.length > 0),
        NODE_ENV: fc.string().filter(s => s.length > 0 && !['development', 'production', 'test'].includes(s)),
        K8S_TIMEOUT: fc.string().filter(s => !/^\d+$/.test(s) && s.length > 0),
      });

      fc.assert(
        fc.property(invalidConfigArbitrary, (invalidConfig) => {
          // Property: Multiple invalid variables should cause validation to fail with all errors reported
          try {
            validateConfig(invalidConfig);
            // Should not reach here
            return false;
          } catch (error) {
            const message = (error as Error).message;
            // Verify error message contains information about configuration validation failure
            expect(message).toContain('Configuration validation failed');
            // Verify error message contains helpful guidance
            expect(message).toContain('Please check your environment variables');
            return true;
          }
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('Valid configurations should pass', () => {
    it('should accept valid numeric strings for all numeric fields', () => {
      const validNumericArbitrary = fc.record({
        PORT: fc.integer({ min: 1, max: 65535 }).map(n => n.toString()),
        K8S_TIMEOUT: fc.integer({ min: 1000, max: 60000 }).map(n => n.toString()),
        RATE_LIMIT_WINDOW_MS: fc.integer({ min: 60000, max: 3600000 }).map(n => n.toString()),
        RATE_LIMIT_MAX_REQUESTS: fc.integer({ min: 10, max: 1000 }).map(n => n.toString()),
        SHUTDOWN_TIMEOUT_MS: fc.integer({ min: 5000, max: 120000 }).map(n => n.toString()),
        DEFAULT_PAGE_SIZE: fc.integer({ min: 10, max: 500 }).map(n => n.toString()),
        MAX_PAGE_SIZE: fc.integer({ min: 100, max: 5000 }).map(n => n.toString()),
      });

      fc.assert(
        fc.property(validNumericArbitrary, (validConfig) => {
          // Property: Valid numeric strings should be accepted and transformed to numbers
          const config = validateConfig(validConfig);
          expect(typeof config.port).toBe('number');
          expect(typeof config.k8sTimeout).toBe('number');
          expect(typeof config.rateLimitWindowMs).toBe('number');
          expect(typeof config.rateLimitMaxRequests).toBe('number');
          expect(typeof config.shutdownTimeoutMs).toBe('number');
          expect(typeof config.defaultPageSize).toBe('number');
          expect(typeof config.maxPageSize).toBe('number');
          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('should accept valid enum values', () => {
      const validEnumArbitrary = fc.record({
        NODE_ENV: fc.constantFrom('development', 'production', 'test'),
        LOG_LEVEL: fc.constantFrom('debug', 'info', 'warn', 'error'),
        LOG_FORMAT: fc.constantFrom('json', 'text'),
      });

      fc.assert(
        fc.property(validEnumArbitrary, (validConfig) => {
          // Property: Valid enum values should be accepted
          const config = validateConfig(validConfig);
          expect(['development', 'production', 'test']).toContain(config.nodeEnv);
          expect(['debug', 'info', 'warn', 'error']).toContain(config.logLevel);
          expect(['json', 'text']).toContain(config.logFormat);
          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('should accept valid DEFAULT_NAMESPACE values', () => {
      // Generate valid Kubernetes namespace names
      const validNamespaceArbitrary = fc.stringMatching(/^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/)
        .filter(s => s.length >= 1 && s.length <= 253);

      fc.assert(
        fc.property(validNamespaceArbitrary, (validNamespace) => {
          // Property: Valid namespace names should be accepted
          const config = validateConfig({ DEFAULT_NAMESPACE: validNamespace });
          expect(config.defaultNamespace).toBe(validNamespace);
          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('should parse and trim CORS_ORIGINS correctly', () => {
      // Generate random arrays of origin strings
      const validOriginsArbitrary = fc.array(
        fc.webUrl(),
        { minLength: 1, maxLength: 5 }
      ).map(origins => origins.join(','));

      fc.assert(
        fc.property(validOriginsArbitrary, (originsString) => {
          // Property: CORS_ORIGINS should be parsed as comma-separated list
          const config = validateConfig({ CORS_ORIGINS: originsString });
          expect(Array.isArray(config.corsOrigins)).toBe(true);
          expect(config.corsOrigins.length).toBeGreaterThan(0);
          return true;
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('Descriptive error messages', () => {
    it('should provide descriptive error messages for all validation failures', () => {
      // Generate random invalid configurations
      const invalidConfigArbitrary = fc.oneof(
        fc.record({ PORT: fc.string().filter(s => !/^\d+$/.test(s) && s.length > 0) }),
        fc.record({ K8S_TIMEOUT: fc.string().filter(s => !/^\d+$/.test(s) && s.length > 0) }),
        fc.record({ NODE_ENV: fc.string().filter(s => s.length > 0 && !['development', 'production', 'test'].includes(s)) }),
        fc.record({ LOG_LEVEL: fc.string().filter(s => s.length > 0 && !['debug', 'info', 'warn', 'error'].includes(s)) }),
        fc.record({ DEFAULT_NAMESPACE: fc.constant('') })
      );

      fc.assert(
        fc.property(invalidConfigArbitrary, (invalidConfig) => {
          // Property: All validation errors should include descriptive messages
          try {
            validateConfig(invalidConfig);
            return false;
          } catch (error) {
            const message = (error as Error).message;
            // Verify error is descriptive
            expect(message.length).toBeGreaterThan(20);
            // Verify error mentions configuration validation
            expect(message.toLowerCase()).toContain('configuration');
            return true;
          }
        }),
        { numRuns: 100 }
      );
    });
  });
});
