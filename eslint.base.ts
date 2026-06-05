/* eslint-disable @typescript-eslint/naming-convention */
import stylistic from '@stylistic/eslint-plugin';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import type { ConfigWithExtendsArray } from '@eslint/config-helpers';

export interface EslintBaseOptions {
  ignores: string[];
  files: string[];
}

export function createBaseConfig(
  importMeta: ImportMeta,
  options: EslintBaseOptions = { ignores: [], files: [] }
): ConfigWithExtendsArray {
  const { ignores = [], files = [] } = options;

  return [
    {
      files,
      extends: [
        { ignores },
        tseslint.configs.recommended,
        {
          languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: globals.node,
            parserOptions: {
              projectService: true,
              tsconfigRootDir: importMeta.dirname,
              defaultProject: 'tsconfig.json',
            },
          },
          plugins: {
            '@stylistic': stylistic,
          },
          rules: {
            '@stylistic/arrow-parens': ['error', 'always'],
            '@stylistic/brace-style': ['error', '1tbs', { allowSingleLine: true }],
            '@stylistic/comma-dangle': [
              'error',
              {
                arrays: 'only-multiline',
                objects: 'only-multiline',
                imports: 'only-multiline',
                exports: 'only-multiline',
                functions: 'only-multiline',
              },
            ],
            '@stylistic/eol-last': ['error', 'always'],
            '@stylistic/function-call-argument-newline': 'off',
            '@stylistic/function-call-spacing': ['error', 'never'],
            '@stylistic/function-paren-newline': ['error', 'consistent'],
            '@stylistic/implicit-arrow-linebreak': ['error', 'beside'],
            '@stylistic/indent': ['error', 2, { SwitchCase: 1 }],
            '@stylistic/lines-between-class-members': [
              'error',
              'always',
              { exceptAfterSingleLine: true },
            ],
            '@stylistic/max-len': [
              'warn',
              {
                code: 120,
                ignoreComments: true,
                ignoreStrings: true,
                ignoreTrailingComments: true,
                ignoreTemplateLiterals: true,
                ignoreRegExpLiterals: true,
              },
            ],
            '@stylistic/no-multi-spaces': ['error', { ignoreEOLComments: true }],
            '@stylistic/no-multiple-empty-lines': ['error', { max: 1 }],
            '@stylistic/no-tabs': ['error'],
            '@stylistic/object-curly-newline': ['error', { consistent: true }],
            '@stylistic/object-curly-spacing': ['error', 'always'],
            '@stylistic/operator-linebreak': [
              'error',
              'after',
              { overrides: { '=': 'after', '?': 'before', ':': 'before' } },
            ],
            '@stylistic/prefer-for-of': 'off',
            '@stylistic/quotes': ['error', 'single', { avoidEscape: true }],
            '@stylistic/semi': ['error', 'always'],
            '@stylistic/space-before-blocks': ['error', 'always'],
            '@stylistic/space-before-function-paren': [
              'error',
              { anonymous: 'always', named: 'never', asyncArrow: 'always' },
            ],
            '@stylistic/space-in-parens': ['error', 'never'],
            '@typescript-eslint/consistent-type-imports': ['error', {
              prefer: 'type-imports',
              disallowTypeAnnotations: false,
            }],
            '@typescript-eslint/naming-convention': [
              'warn',
              { selector: 'default', format: ['camelCase', 'UPPER_CASE'] },
              { selector: 'import', format: null },
              { selector: 'variable', format: ['camelCase', 'UPPER_CASE'], leadingUnderscore: 'allowDouble' },
              { selector: 'variable', filter: { regex: '(Schema|Query|Params|Body|Response|Contract|Dto|Input|Payload|Config|Options)$', match: true }, format: ['PascalCase'] },
              { selector: 'parameter', format: ['camelCase'], leadingUnderscore: 'allow' },
              { selector: 'function', format: ['camelCase', 'PascalCase'] },
              { selector: 'objectLiteralProperty', filter: { regex: '^[0-9]+$', match: true }, format: null },
              { selector: 'objectLiteralProperty', filter: { regex: '^[0-9]+$', match: false }, format: ['camelCase', 'PascalCase', 'UPPER_CASE', 'snake_case'], leadingUnderscore: 'allowDouble' },
              { selector: 'typeLike', format: ['PascalCase'] },
              { selector: 'enumMember', format: ['UPPER_CASE', 'camelCase'] },
            ],
            '@typescript-eslint/no-floating-promises': 'error',
            '@typescript-eslint/no-shadow': 'error',
            '@typescript-eslint/no-unused-vars': ['error', { args: 'none' }],
            '@typescript-eslint/only-throw-error': 'error',
            'consistent-return': 'off',
            'no-await-in-loop': 'warn',
            'no-nested-ternary': 'off',
            'no-param-reassign': 'error',
            'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
            'no-shadow': 'off',
            'no-underscore-dangle': ['warn', { allow: ['__filename', '__dirname'] }],
            'no-use-before-define': ['error', 'nofunc'],
            'prefer-const': 'error',
            'prefer-destructuring': ['error', { array: false, object: false }],
          },
        },
      ],
    },
  ];
}
