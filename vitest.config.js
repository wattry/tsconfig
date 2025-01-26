import { defineConfig } from 'vitest/config'

export default defineConfig({
  base: './',
  test: {
    environment: 'node',
    include: ['__tests__/**/*.ts'],
    coverage: {
      exclude: ['node_modules/**/*'],
      include: ['__tests__/**/*.ts'],
      provider: 'v8',
      reporter: ['text', 'json', 'html']
    }
  },
})
