import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
    testTimeout: 20000,
    reporters: 'default',
  },
  resolve: {
    alias: {
      '@presentation-studio/schema': new URL('./packages/schema/src/index.ts', import.meta.url).pathname,
      '@presentation-studio/templates': new URL('./packages/templates/src/index.ts', import.meta.url).pathname,
      '@presentation-studio/core': new URL('./packages/core/src/index.ts', import.meta.url).pathname,
      '@presentation-studio/renderer': new URL('./apps/renderer/src/index.ts', import.meta.url).pathname,
    },
  },
});
