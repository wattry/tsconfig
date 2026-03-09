import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    exclude: [],
    include: ['__test__/**/*.{test,spec}.{ts,js}', 'test/**/*.{test,spec}.{ts,js}']
  },
})