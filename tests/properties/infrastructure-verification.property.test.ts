/**
 * Property-based test to verify fast-check is working correctly
 * This ensures property-based testing infrastructure is properly set up
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

describe('Property-Based Testing Infrastructure', () => {
  it('should run property tests with fast-check', () => {
    fc.assert(
      fc.property(
        fc.string(),
        (str) => {
          // Property: string length is always non-negative
          return str.length >= 0;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should generate random integers', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 100 }),
        (num) => {
          // Property: generated number is within range
          return num >= 1 && num <= 100;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should generate random arrays', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string()),
        (arr) => {
          // Property: array length is non-negative
          return arr.length >= 0;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should generate random objects', () => {
    fc.assert(
      fc.property(
        fc.record({
          name: fc.string(),
          age: fc.integer({ min: 0, max: 120 }),
        }),
        (obj) => {
          // Property: object has required properties
          return (
            typeof obj.name === 'string' &&
            typeof obj.age === 'number' &&
            obj.age >= 0 &&
            obj.age <= 120
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should support custom arbitraries', () => {
    // Custom arbitrary for Kubernetes-style names
    const k8sNameArbitrary = fc
      .stringMatching(/^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/)
      .filter((s) => s.length >= 1 && s.length <= 253);

    fc.assert(
      fc.property(k8sNameArbitrary, (name) => {
        // Property: generated name follows K8s naming conventions
        return (
          name.length >= 1 &&
          name.length <= 253 &&
          /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/.test(name)
        );
      }),
      { numRuns: 100 }
    );
  });

  it('should detect counterexamples', () => {
    // This test demonstrates that fast-check can find counterexamples
    // We intentionally create a property that will fail
    let foundCounterexample = false;

    try {
      fc.assert(
        fc.property(
          fc.integer(),
          (num) => {
            // Property: all integers are positive (this is false!)
            return num > 0;
          }
        ),
        { numRuns: 100 }
      );
    } catch (error) {
      foundCounterexample = true;
      expect(error).toBeDefined();
    }

    expect(foundCounterexample).toBe(true);
  });

  it('should support async properties', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string(),
        async (str) => {
          // Property: async operation preserves string length
          const result = await Promise.resolve(str);
          return result.length === str.length;
        }
      ),
      { numRuns: 100 }
    );
  });
});
