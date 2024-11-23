import globals from 'globals'
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

import nodePlugin from 'eslint-plugin-n';
import stylistic from '@stylistic/eslint-plugin';
import jestPlugin from 'eslint-plugin-jest';

const config = tseslint.config(
  eslint.configs.recommended,
  jestPlugin.configs['flat/recommended'],
  nodePlugin.configs['flat/recommended'],
  { ignores: ['dist', 'node_modules'] },
  { files: ['src'] },
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.node },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      'jest': jestPlugin,
      '@stylistic': stylistic
    },
    rules: {
      '@stylistic/brace-style': ['error', '1tbs', { allowSingleLine: true }],
      '@stylistic/comma-dangle': [
        'error', {
          arrays: 'only-multiline',
          objects: 'only-multiline',
          imports: 'only-multiline',
          exports: 'only-multiline',
          functions: 'never'
        }
      ],
      '@stylistic/func-call-spacing': ['error', 'never'],
      '@stylistic/function-call-argument-newline': 'off',
      '@stylistic/member-delimiter-style': [
        'error',
        {
          'multiline': {
            'delimiter': 'comma',
            'requireLast': true
          },
          'singleline': {
            'delimiter': 'comma',
            'requireLast': true
          },
          'overrides': {
            'interface': {
              'multiline': {
                'delimiter': 'semi',
                'requireLast': true
              }
            }
          },
          'multilineDetection': 'brackets'
        }
      ],
      '@stylistic/object-curly-newline': ['error', { consistent: true }],
      '@stylistic/object-curly-spacing': ['error', 'always'],
      '@stylistic/prefer-for-of': ['off'],
      '@stylistic/quotes': ['error', 'single', { avoidEscape: true }],
      '@stylistic/semi': ['error', 'always'],
      '@stylistic/space-before-function-paren': [
        'error', { anonymous: 'always', named: 'never', asyncArrow: 'always' }
      ],
      '@stylistic/eol-last': ['error', 'always'],
      '@stylistic/function-paren-newline': ['error', 'consistent'],
      '@stylistic/implicit-arrow-linebreak': ['error', 'beside'],
      'consistent-return': 'off',
      '@stylistic/indent': ['error', 2, { SwitchCase: 1 }],
      '@stylistic/max-len': [
        'warn', {
          code: 120,
          ignoreComments: true,
          ignoreStrings: true,
          ignoreTrailingComments: true,
          ignoreTemplateLiterals: true,
          ignoreRegExpLiterals: true
        }
      ],
      '@stylistic/no-multi-spaces': ['error', { ignoreEOLComments: true }],
      '@stylistic/no-tabs': ['error'],
      '@stylistic/space-before-blocks': ['error', 'always'],
      '@stylistic/space-in-parens': ['error', 'never'],
      '@stylistic/no-multiple-empty-lines': ['error', { max: 1 }],
      '@stylistic/lines-between-class-members': ['error', 'always', { exceptAfterSingleLine: true }],
      '@stylistic/operator-linebreak': [
        'error', 'after', { overrides: { '=': 'after', '?': 'before', ':': 'before' } }
      ],
      '@stylistic/arrow-parens': ['error', 'always'],
      'no-nested-ternary': 'off',
      'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
      'no-restricted-syntax': ['error', "BinaryExpression[operator='of']"],
      'no-shadow': ['error', { allow: ['_function'] }],
      'no-underscore-dangle': ['warn', { allow: ['_function', '_method'] }],
      'no-use-before-define': ['error', 'nofunc'],
      'no-unused-vars': ['warn', { args: 'none' }],
      'no-param-reassign': 'error',
      'prefer-const': 'warn',
      camelcase: 'warn',
      'prefer-destructuring': ['error', { array: false, object: false }],
      'no-await-in-loop': 'warn',
      'n/no-missing-import': 'off',
      'n/hashbang': 'off'
    }
  }
);

export default config;