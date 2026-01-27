/**
 * Example test to verify test infrastructure is working
 * This file can be removed once real tests are implemented
 */

import { describe, it, expect } from 'vitest';

describe('Test Infrastructure', () => {
  it('should run basic tests', () => {
    expect(true).toBe(true);
  });

  it('should support async tests', async () => {
    const result = await Promise.resolve(42);
    expect(result).toBe(42);
  });

  it('should support test assertions', () => {
    const obj = { name: 'test', value: 123 };
    expect(obj).toHaveProperty('name');
    expect(obj.name).toBe('test');
    expect(obj.value).toBeGreaterThan(100);
  });
});
