import eslint from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import nodePlugin from 'eslint-plugin-n';

const files = ['src/**/*.ts', 'types/**/*.ts', '__tests__/**/*.ts', '__mocks__/**/*.ts'];
const ignores = ['dist/**/*', 'node_modules/**/*'];

const config = tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  nodePlugin.configs["flat/recommended-script"],
  { files, ignores },
  {
    files,
    ignores,
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
      '@stylistic': stylistic,
    },
    rules: {
      '@stylistic/arrow-parens': ['error', 'always'],
      '@stylistic/brace-style': ['error', '1tbs', { allowSingleLine: true }],
      '@stylistic/comma-dangle': ['error', { arrays: 'only-multiline', objects: 'only-multiline', imports: 'only-multiline', exports: 'only-multiline', functions: 'only-multiline' } ],
      '@stylistic/eol-last': ['error', 'always'],
      '@stylistic/func-call-spacing': ['error', 'never'],
      '@stylistic/function-call-argument-newline': 'off',
      '@stylistic/function-paren-newline': ['error', 'consistent'],
      '@stylistic/implicit-arrow-linebreak': ['error', 'beside'],
      '@stylistic/indent': ['error', 2, { SwitchCase: 1 }],
      '@stylistic/lines-between-class-members': ['error', 'always', { exceptAfterSingleLine: true }],
      '@stylistic/max-len': ['warn', { code: 120, ignoreComments: true, ignoreStrings: true, ignoreTrailingComments: true, ignoreTemplateLiterals: true, ignoreRegExpLiterals: true} ],
      '@stylistic/no-multi-spaces': ['error', { ignoreEOLComments: true }],
      '@stylistic/no-multiple-empty-lines': ['error', { max: 1 }],
      '@stylistic/no-tabs': ['error'],
      '@stylistic/object-curly-newline': ['error', { consistent: true }],
      '@stylistic/object-curly-spacing': ['error', 'always'],
      '@stylistic/operator-linebreak': ['error', 'after', { overrides: { '=': 'after', '?': 'before', ':': 'before' } },],
      '@stylistic/prefer-for-of': 'off',
      '@stylistic/quotes': ['error', 'single', { avoidEscape: true }],
      '@stylistic/semi': ['error', 'always'],
      '@stylistic/space-before-blocks': ['error', 'always'],
      '@stylistic/space-before-function-paren': ['error', { anonymous: 'always', named: 'never', asyncArrow: 'always' } ],
      '@stylistic/space-in-parens': ['error', 'never'],
      'camelcase': 'warn',
      'consistent-return': 'off',
      'no-await-in-loop': 'warn',
      'no-nested-ternary': 'off',
      'no-param-reassign': 'error',
      'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
      'no-restricted-syntax': ['error', "BinaryExpression[operator='of']"],
      'no-shadow': 'error',
      'no-underscore-dangle': 'warn',
      'no-unused-vars': ['warn', { args: 'none' }],
      'no-use-before-define': ['error', 'nofunc'],
      'prefer-const': 'warn',
      'prefer-destructuring': ['error', { array: false, object: false }],
    },
  },
);

export default config;
