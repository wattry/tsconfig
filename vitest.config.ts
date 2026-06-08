import { defineConfig } from 'vitest/config';
import { getConfig } from '@wattry/tsconfig/vitest/base';

export default defineConfig({
  test: getConfig(),
});
