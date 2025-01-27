import { defineConfig } from 'vitest/config';

export default defineConfig({
  base: './',
  test: {
    environment: 'node',
    include: ['__tests__/**/*.ts'],
    coverage: {
      exclude: ['node_modules/**/*'],
      include: ['src/**/*.ts'],
      provider: 'v8',
      reporter: ['text', 'json', 'html']
    }
  },
});
