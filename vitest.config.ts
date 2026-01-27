import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    // Test environment
    environment: 'node',
    
    // Test file patterns
    include: [
      'tests/unit/**/*.test.ts',
      'tests/integration/**/*.test.ts',
      'tests/properties/**/*.property.test.ts'
    ],
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      
      // Coverage thresholds (80% minimum as per requirements)
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80
      },
      
      // Include source files
      include: ['src/**/*.ts'],
      
      // Exclude files from coverage
      exclude: [
        'src/**/*.test.ts',
        'src/**/*.spec.ts',
        'src/types/**',
        'node_modules/**',
        'dist/**',
        'coverage/**',
        'tests/**'
      ]
    },
    
    // Global test timeout (30 seconds)
    testTimeout: 30000,
    
    // Hook timeout
    hookTimeout: 30000,
    
    // Globals
    globals: true,
    
    // Setup files
    setupFiles: ['./tests/setup.ts'],
    
    // Reporters
    reporters: ['verbose'],
    
    // Parallel execution
    pool: 'threads',
    poolMatchGlobs: [
      ['**/*.property.test.ts', 'threads']
    ],
    singleThread: false
  },
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@tests': path.resolve(__dirname, './tests')
    }
  }
});
