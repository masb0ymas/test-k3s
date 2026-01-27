# Implementation Plan: K3s API Bug Fixes and Improvements

## Overview

This implementation plan addresses critical bugs and adds essential improvements to the K3s Backend API. Tasks are organized to fix critical bugs first, then add infrastructure improvements, and finally implement comprehensive testing. Each task builds incrementally on previous work.

## Tasks

- [x] 1. Set up testing infrastructure and dependencies
  - Install testing dependencies: vitest, @vitest/ui, supertest, @types/supertest, fast-check
  - Create test directory structure (unit/, integration/, properties/)
  - Configure vitest.config.ts with coverage settings
  - Create mock utilities for Kubernetes clients
  - _Requirements: 11.1, 11.2, 11.3, 11.4_

- [ ] 2. Create centralized configuration module
  - [x] 2.1 Implement configuration schema and validation
    - Create src/config/index.ts with Zod schema for all environment variables
    - Implement loadConfig() function that validates and returns typed config
    - Add descriptive error messages for missing/invalid variables
    - Export singleton config object
    - _Requirements: 6.1, 6.2, 6.5_
  
  - [x] 2.2 Write unit tests for configuration module
    - Test valid configuration loading
    - Test missing required variables
    - Test invalid variable formats
    - Test default values
    - _Requirements: 6.2, 6.5_
  
  - [x] 2.3 Write property test for configuration validation
    - **Property 4: Configuration Validation**
    - **Validates: Requirements 6.2, 6.5**
    - Generate random combinations of missing/invalid environment variables
    - Verify application fails to start with non-zero exit code
    - _Requirements: 6.2, 6.5_

- [ ] 3. Enhance Kubernetes configuration with connection verification
  - [x] 3.1 Implement K8s client initialization with verification
    - Refactor src/config/k8s.config.ts to export initializeK8sClients() async function
    - Implement verifyK8sConnectivity() that makes lightweight API call with timeout
    - Implement checkK8sHealth() for health endpoint usage
    - Add descriptive error messages for connection failures
    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  
  - [x] 3.2 Write unit tests for K8s initialization
    - Test successful connection
    - Test invalid kubeconfig
    - Test unreachable cluster
    - Test timeout handling
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [ ] 4. Update application startup to validate K8s connectivity
  - [x] 4.1 Refactor src/app.ts to use async initialization
    - Call loadConfig() before any other initialization
    - Call initializeK8sClients() and await connection verification
    - Only start HTTP server after successful K8s connection
    - Add try-catch with descriptive error logging and process.exit(1) on failure
    - _Requirements: 1.1, 1.2_
  
  - [~] 4.2 Write integration test for startup validation
    - Test successful startup with valid K8s connection
    - Test startup failure with invalid kubeconfig
    - Test startup failure with unreachable cluster
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [ ] 5. Implement request logging middleware
  - [~] 5.1 Create logging middleware with request ID generation
    - Create src/middleware/logging.middleware.ts
    - Generate UUID for each request and attach to req.id
    - Log request details (method, path, timestamp, IP) on entry
    - Intercept response to log status code and duration
    - Use structured JSON logging format
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_
  
  - [~] 5.2 Write unit tests for logging middleware
    - Test request ID generation
    - Test request logging
    - Test response logging
    - Test JSON format
    - _Requirements: 7.1, 7.2, 7.3, 7.5_
  
  - [~] 5.3 Write property tests for logging
    - **Property 5: Request Logging Completeness**
    - **Validates: Requirements 7.1, 7.2, 7.3, 7.4**
    - **Property 6: Structured Logging Format**
    - **Validates: Requirements 7.5**
    - Generate random HTTP requests
    - Verify all required fields are logged
    - Verify JSON format validity
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 6. Fix error middleware to properly handle ZodError
  - [~] 6.1 Update error middleware with correct ZodError handling
    - Import ZodError from 'zod'
    - Check error type using instanceof ZodError
    - Extract err.issues array and format as structured validation errors
    - Include field path and message for each issue
    - Always include request ID in error responses
    - _Requirements: 3.1, 3.2, 3.3_
  
  - [~] 6.2 Write unit tests for error middleware
    - Test ZodError formatting
    - Test Kubernetes API error handling
    - Test generic error handling
    - Test request ID inclusion
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  
  - [~] 6.3 Write property test for ZodError formatting
    - **Property 2: ZodError Formatting**
    - **Validates: Requirements 3.1, 3.2, 3.3**
    - Generate random ZodErrors with multiple issues
    - Verify 400 status code and structured response format
    - Verify all issues are included with field paths and messages
    - _Requirements: 3.1, 3.2, 3.3_

- [ ] 7. Implement namespace validator
  - [~] 7.1 Create namespace validator with Zod schema
    - Create src/validators/namespace.validator.ts
    - Define createNamespaceSchema with name and labels validation
    - Add Kubernetes naming convention regex
    - Add input sanitization (trim, normalize Unicode)
    - Export CreateNamespaceInput type
    - _Requirements: 4.1, 4.2, 4.3_
  
  - [~] 7.2 Write unit tests for namespace validator
    - Test valid namespace names
    - Test invalid names (uppercase, special chars, too long)
    - Test required field validation
    - Test label validation
    - _Requirements: 4.1, 4.2, 4.3_
  
  - [~] 7.3 Write property test for namespace validation
    - **Property 3: Namespace Validation**
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4**
    - Generate random valid and invalid namespace names
    - Verify validation passes for valid names
    - Verify validation fails with 400 for invalid names
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 8. Enhance validators with input sanitization and security checks
  - [~] 8.1 Update all validators with sanitization
    - Add .transform(s => s.trim()) to all string fields
    - Add Unicode normalization
    - Add control character rejection for labels
    - Add shell metacharacter validation for environment variables
    - Update pod, service, and ingress validators
    - _Requirements: 16.1, 16.2, 16.3, 16.5_
  
  - [~] 8.2 Write property tests for input sanitization
    - **Property 16: Input Sanitization**
    - **Validates: Requirements 16.1**
    - **Property 17: Malicious Input Rejection**
    - **Validates: Requirements 16.2, 16.3, 16.5**
    - Generate random strings with whitespace, Unicode, control chars
    - Verify sanitization is applied
    - Verify malicious input is rejected with security warnings
    - _Requirements: 16.1, 16.2, 16.3, 16.5_

- [ ] 9. Implement enhanced health check endpoint
  - [~] 9.1 Create enhanced health check with K8s connectivity
    - Update health endpoint in src/app.ts or create src/routes/health.ts
    - Call checkK8sHealth() with 5-second timeout
    - Return 200 with "healthy" status if both checks pass
    - Return 503 with "unhealthy" status and error details if K8s check fails
    - Include both server and kubernetes status in response
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  
  - [~] 9.2 Write unit tests for health endpoint
    - Test healthy state (K8s connected)
    - Test unhealthy state (K8s disconnected)
    - Test timeout handling
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  
  - [~] 9.3 Write property test for health check completeness
    - **Property 1: Health Check Completeness**
    - **Validates: Requirements 2.1, 2.2, 2.3**
    - Generate random K8s health states
    - Verify response includes both server and K8s status
    - Verify correct HTTP status codes
    - _Requirements: 2.1, 2.2, 2.3_

- [~] 10. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 11. Implement rate limiting middleware
  - [~] 11.1 Create rate limiting middleware
    - Install express-rate-limit package
    - Create src/middleware/rateLimit.middleware.ts
    - Configure rate limiter with values from config
    - Skip health and metrics endpoints
    - Include Retry-After header in 429 responses
    - Include rate limit headers (X-RateLimit-Limit, X-RateLimit-Remaining)
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_
  
  - [~] 11.2 Write unit tests for rate limiting
    - Test requests below limit
    - Test requests exceeding limit
    - Test Retry-After header
    - Test health endpoint exemption
    - _Requirements: 8.1, 8.2, 8.3, 8.5_
  
  - [~] 11.3 Write property test for rate limit headers
    - **Property 7: Rate Limit Headers**
    - **Validates: Requirements 8.3**
    - Generate random sequences of requests exceeding limit
    - Verify 429 responses include Retry-After header
    - _Requirements: 8.3_

- [ ] 12. Implement CORS middleware
  - [~] 12.1 Create CORS configuration
    - Install cors package
    - Create src/middleware/cors.middleware.ts
    - Configure allowed origins from config.corsOrigins
    - Default to '*' in development, restrictive in production
    - Allow standard HTTP methods (GET, POST, PUT, DELETE, PATCH)
    - Enable credentials support
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_
  
  - [~] 12.2 Write unit tests for CORS
    - Test allowed origins
    - Test default behavior by environment
    - Test allowed methods
    - Test credentials support
    - _Requirements: 9.1, 9.2, 9.3, 9.5_
  
  - [~] 12.3 Write property test for CORS method support
    - **Property 8: CORS Method Support**
    - **Validates: Requirements 9.4**
    - Generate random HTTP methods from allowed list
    - Verify CORS allows each method
    - _Requirements: 9.4_

- [ ] 13. Implement security headers middleware
  - [~] 13.1 Create security middleware with helmet
    - Install helmet package
    - Create src/middleware/security.middleware.ts
    - Configure helmet with appropriate settings for API
    - Disable X-Powered-By header
    - Set Content-Security-Policy, X-Frame-Options, X-Content-Type-Options, Strict-Transport-Security
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_
  
  - [~] 13.2 Write unit tests for security headers
    - Test helmet configuration
    - Test X-Powered-By removal
    - Test presence of security headers
    - _Requirements: 10.1, 10.2, 10.3, 10.4_
  
  - [~] 13.3 Write property test for security headers presence
    - **Property 9: Security Headers Presence**
    - **Validates: Requirements 10.2, 10.3, 10.4**
    - Generate random HTTP requests
    - Verify all required security headers are present
    - Verify X-Powered-By is absent
    - _Requirements: 10.2, 10.3, 10.4_

- [ ] 14. Implement graceful shutdown handling
  - [~] 14.1 Create graceful shutdown utility
    - Create src/utils/shutdown.ts
    - Implement setupGracefulShutdown() function
    - Register SIGTERM and SIGINT handlers
    - Call server.close() to stop accepting connections
    - Wait for in-flight requests with configurable timeout
    - Support optional cleanup callback
    - Log shutdown progress and exit with code 0
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  
  - [~] 14.2 Integrate graceful shutdown in app.ts
    - Call setupGracefulShutdown() after server.listen()
    - Pass shutdown timeout from config
    - _Requirements: 5.1_
  
  - [~] 14.3 Write unit tests for graceful shutdown
    - Test SIGTERM handling
    - Test SIGINT handling
    - Test in-flight request completion
    - Test timeout handling
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 15. Implement Prometheus metrics
  - [~] 15.1 Create metrics middleware and endpoint
    - Install prom-client package
    - Create src/middleware/metrics.middleware.ts
    - Define metrics: http_requests_total, http_request_duration_seconds, k8s_api_calls_total, k8s_api_call_duration_seconds, active_connections, errors_total
    - Implement metricsMiddleware to track HTTP requests
    - Implement getMetricsHandler to expose /metrics endpoint
    - Register default metrics (memory, CPU)
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_
  
  - [~] 15.2 Instrument service layer with K8s metrics
    - Add metrics tracking to all K8s API calls in service classes
    - Track call count and duration
    - Track errors
    - _Requirements: 15.3_
  
  - [~] 15.3 Write unit tests for metrics
    - Test HTTP metrics collection
    - Test K8s metrics collection
    - Test metrics endpoint
    - Test metric naming conventions
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_
  
  - [~] 15.4 Write property test for metrics collection
    - **Property 15: Metrics Collection Completeness**
    - **Validates: Requirements 15.2, 15.3, 15.4**
    - Generate random HTTP requests and K8s API calls
    - Verify all metrics are updated appropriately
    - _Requirements: 15.2, 15.3, 15.4_

- [ ] 16. Implement pagination support
  - [~] 16.1 Create pagination utility
    - Create src/utils/pagination.ts
    - Implement parsePaginationParams() to validate limit and continue
    - Implement applyPagination() to slice results and generate continue token
    - Use base64 encoding for continue tokens
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_
  
  - [~] 16.2 Update list endpoints with pagination
    - Update pod, service, ingress, and namespace list controllers
    - Parse pagination params from query
    - Apply pagination to results
    - Include metadata with continue token in responses
    - _Requirements: 14.1, 14.2, 14.3, 14.4_
  
  - [~] 16.3 Write unit tests for pagination
    - Test pagination parameter parsing
    - Test limit enforcement
    - Test continue token generation
    - Test continue token usage
    - Test default page size
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_
  
  - [~] 16.4 Write property tests for pagination
    - **Property 12: Pagination Parameter Acceptance**
    - **Validates: Requirements 14.1**
    - **Property 13: Pagination Limit Enforcement**
    - **Validates: Requirements 14.2**
    - **Property 14: Pagination Continuation**
    - **Validates: Requirements 14.3, 14.4**
    - Generate random result sets and pagination parameters
    - Verify limit enforcement
    - Verify continue token generation and usage
    - _Requirements: 14.1, 14.2, 14.3, 14.4_

- [ ] 17. Improve type safety in service layer
  - [~] 17.1 Update service.service.ts with type-safe port parsing
    - Replace type assertion with Zod schema validation for targetPort
    - Add runtime validation for type assertions
    - Add explicit return types to all methods
    - _Requirements: 13.1, 13.4, 13.5_
  
  - [~] 17.2 Update TypeScript configuration
    - Enable strict mode in tsconfig.json
    - Enable noImplicitAny
    - Fix any type errors that arise
    - _Requirements: 13.2, 13.3_
  
  - [~] 17.3 Write property test for type-safe port parsing
    - **Property 10: Type-Safe Port Parsing**
    - **Validates: Requirements 13.1**
    - **Property 11: Runtime Type Validation**
    - **Validates: Requirements 13.4**
    - Generate random port values (numbers and numeric strings)
    - Verify correct parsing without errors
    - Verify invalid values are handled gracefully
    - _Requirements: 13.1, 13.4_

- [ ] 18. Replace hardcoded namespace references
  - [~] 18.1 Update all services to use config.defaultNamespace
    - Replace all "default" string literals with config.defaultNamespace
    - Update pod.service.ts, service.service.ts, ingress.service.ts
    - _Requirements: 6.4_

- [ ] 19. Implement API documentation
  - [~] 19.1 Set up OpenAPI documentation
    - Install swagger-jsdoc and swagger-ui-express packages
    - Create src/docs/swagger.ts with OpenAPI configuration
    - Add JSDoc comments to all route handlers with OpenAPI annotations
    - Serve documentation at /api-docs endpoint
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_
  
  - [~] 19.2 Write integration test for API documentation
    - Test /api-docs endpoint accessibility
    - Verify OpenAPI spec is valid
    - Verify all endpoints are documented
    - _Requirements: 12.1, 12.2, 12.3, 12.4_

- [ ] 20. Wire all middleware into application
  - [~] 20.1 Update app.ts with all middleware
    - Add logging middleware (first)
    - Add metrics middleware
    - Add security middleware (helmet)
    - Add CORS middleware
    - Add rate limiting middleware
    - Ensure error middleware is last
    - Add /metrics endpoint
    - _Requirements: 7.1, 8.1, 9.1, 10.1, 15.1_
  
  - [~] 20.2 Write integration tests for complete middleware stack
    - Test request flows through all middleware
    - Test error handling through middleware stack
    - Test metrics collection
    - Test rate limiting
    - Test CORS
    - Test security headers
    - _Requirements: 7.1, 8.1, 9.1, 10.1, 15.1_

- [~] 21. Final checkpoint - Ensure all tests pass
  - Run full test suite with coverage report
  - Verify minimum 80% code coverage
  - Ensure all property tests run with 100+ iterations
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- All tasks are required for comprehensive bug fixes and improvements
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties with minimum 100 iterations
- Unit tests validate specific examples and edge cases
- Integration tests validate end-to-end API behavior
- All middleware should be added in the correct order for proper functionality
- Configuration must be loaded before any other initialization
- Kubernetes connectivity must be verified before starting HTTP server
