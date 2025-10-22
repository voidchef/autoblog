/**
 * ESLint v9 Flat Configuration
 * 
 * Comprehensive ESLint setup with best practices for Node.js/TypeScript projects.
 * 
 * Plugins included:
 * - @eslint/js - Core ESLint recommended rules
 * - @typescript-eslint - TypeScript-specific linting
 * - eslint-plugin-import - Import/export best practices and sorting
 * - eslint-plugin-jest - Jest testing best practices
 * - eslint-plugin-node - Node.js best practices
 * - eslint-plugin-promise - Promise handling best practices
 * - eslint-plugin-security - Security vulnerability detection
 * - eslint-plugin-prettier - Prettier integration for consistent formatting
 * 
 * Features:
 * - Separate configs for JS, TS, and test files
 * - Async/await and promise handling rules
 * - Code complexity warnings
 * - Security vulnerability detection
 * - Import statement organization
 * - Prettier integration
 */

import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';
import jestPlugin from 'eslint-plugin-jest';
import nodePlugin from 'eslint-plugin-node';
import prettierPlugin from 'eslint-plugin-prettier';
import promisePlugin from 'eslint-plugin-promise';
import securityPlugin from 'eslint-plugin-security';
import globals from 'globals';

export default [
  // Global ignores (replaces .eslintignore)
  {
    ignores: [
      '**/node_modules/**',
      '**/bin/**',
      '**/data/**',
      '**/dist/**',
      '**/build/**',
      '**/coverage/**',
      '**/front/**',
      '**/.git/**',
      '**/*.min.js',
      '**/pnpm-lock.yaml',
      '**/package-lock.json',
      '**/yarn.lock',
      '**/*.config.json',
      '**/ecosystem.config.json',
    ],
  },

  // Base ESLint recommended rules
  js.configs.recommended,

  // Base config for all JavaScript files
  {
    files: ['**/*.js', '**/*.cjs', '**/*.mjs'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.es2021,
      },
    },
    plugins: {
      import: importPlugin,
      node: nodePlugin,
      promise: promisePlugin,
      security: securityPlugin,
      prettier: prettierPlugin,
    },
    rules: {
      // Best Practices
      'no-console': 'error',
      'no-debugger': 'error',
      'no-alert': 'error',
      'no-await-in-loop': 'warn',
      'no-return-await': 'error',
      'no-useless-catch': 'error',
      'no-shadow': 'warn',
      'no-use-before-define': ['error', { functions: false, classes: true }],
      'prefer-const': 'error',
      'prefer-arrow-callback': 'warn',
      'prefer-template': 'warn',
      'no-var': 'error',
      'object-shorthand': 'warn',

      // Code Style (overridable)
      'func-names': 'off',
      'no-underscore-dangle': 'off',
      'consistent-return': 'off',

      // Security
      'security/detect-object-injection': 'off',
      'security/detect-non-literal-fs-filename': 'warn',
      'security/detect-unsafe-regex': 'warn', // Can be overly sensitive

      // Promise best practices
      'promise/always-return': 'warn',
      'promise/catch-or-return': 'error',
      'promise/no-nesting': 'warn',
      'promise/param-names': 'error',

      // Import best practices
      'import/order': [
        'warn',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'never',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'import/newline-after-import': 'warn',
      'import/no-duplicates': 'error',

      // Prettier integration
      'prettier/prettier': [
        'warn',
        {
          singleQuote: true,
          trailingComma: 'es5',
          tabWidth: 2,
          semi: true,
          printWidth: 120,
        },
      ],
    },
  },

  // Jest test files config
  {
    files: ['**/*.test.js', '**/*.test.ts', '**/*.spec.js', '**/*.spec.ts', '**/test/**', '**/tests/**'],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
    plugins: {
      jest: jestPlugin,
    },
    rules: {
      ...jestPlugin.configs.recommended.rules,
      'jest/expect-expect': 'off',
      'jest/no-disabled-tests': 'warn',
      'jest/no-focused-tests': 'error',
      'jest/valid-expect': 'error',
      'jest/no-conditional-expect': 'warn',
      'no-console': 'off', // Allow console in tests
      '@typescript-eslint/no-explicit-any': 'off', // More lenient in tests
    },
  },

  // Jest setup files
  {
    files: ['**/setupTestDB.ts', '**/setupTests.ts', '**/jest.setup.ts'],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
    rules: {
      'no-undef': 'off', // Jest globals are defined
    },
  },

  // TypeScript-specific config
  {
    files: ['src/**/*.ts', '**/*.ts'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.node,
        ...globals.es2021,
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
      import: importPlugin,
      promise: promisePlugin,
      security: securityPlugin,
      prettier: prettierPlugin,
    },
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
        node: true,
      },
    },
    rules: {
      // Disable base rules that conflict with TypeScript
      'no-unused-vars': 'off',
      'no-use-before-define': 'off',
      'no-shadow': 'off',

      // TypeScript ESLint recommended rules
      ...typescript.configs.recommended.rules,

      // TypeScript-specific best practices
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_|error',
          destructuredArrayIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-use-before-define': ['error', { functions: false, classes: true }],
      '@typescript-eslint/no-shadow': 'warn',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-misused-promises': 'warn',
      '@typescript-eslint/await-thenable': 'warn',
      '@typescript-eslint/no-unnecessary-type-assertion': 'warn',
      '@typescript-eslint/prefer-nullish-coalescing': 'off', // Too opinionated
      '@typescript-eslint/prefer-optional-chain': 'warn',
      '@typescript-eslint/strict-boolean-expressions': 'off',
      '@typescript-eslint/no-this-alias': 'off', // Common pattern in Mongoose
      '@typescript-eslint/no-empty-object-type': 'warn',
      '@typescript-eslint/no-unsafe-function-type': 'warn',
      '@typescript-eslint/naming-convention': 'off', // Too restrictive for existing code

      // Best Practices
      'no-console': 'error',
      'func-names': 'off',
      'no-underscore-dangle': 'off',
      'consistent-return': 'off',

      // Security
      'security/detect-object-injection': 'off',
      'security/detect-non-literal-fs-filename': 'warn',
      'security/detect-unsafe-regex': 'warn', // Can be overly sensitive

      // Promise best practices
      'promise/always-return': 'off', // Too strict
      'promise/catch-or-return': 'warn',

      // Import best practices
      'import/order': [
        'warn',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'never',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'import/newline-after-import': 'warn',
      'import/no-duplicates': 'error',

      // Prettier integration
      'prettier/prettier': [
        'warn',
        {
          singleQuote: true,
          trailingComma: 'es5',
          tabWidth: 2,
          semi: true,
          printWidth: 120,
        },
      ],
    },
  },

  // Config files (more lenient)
  {
    files: ['*.config.js', '*.config.cjs', '*.config.mjs', 'ecosystem.config.json'],
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-var-requires': 'off',
    },
  },
];
