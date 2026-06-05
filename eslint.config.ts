import { defineConfig } from 'eslint/config';
import { createBaseConfig } from './eslint.base.js';

const files = ['**/*.ts'];
const ignores = ['dist/**/*', 'node_modules/**/*'];

export default defineConfig(
  createBaseConfig(import.meta, { files, ignores })
);
