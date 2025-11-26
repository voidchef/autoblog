import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';
import jestPlugin from 'eslint-plugin-jest';
import prettierPlugin from 'eslint-plugin-prettier';
import promisePlugin from 'eslint-plugin-promise';
import securityPlugin from 'eslint-plugin-security';
import unusedImports from 'eslint-plugin-unused-imports';
import globals from 'globals';

// ---------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------
const prettierRule = [
  'warn',
  {
    singleQuote: true,
    trailingComma: 'es5',
    tabWidth: 2,
    semi: true,
    printWidth: 125,
  },
];

const unusedImportsRules = {
  'unused-imports/no-unused-imports': 'warn',
  'unused-imports/no-unused-vars': [
    'warn',
    {
      vars: 'all',
      varsIgnorePattern: '^_',
      args: 'after-used',
      argsIgnorePattern: '^_',
      caughtErrorsIgnorePattern: '^_|error',
    },
  ],
};

const importOrderRule = [
  'warn',
  {
    groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
    'newlines-between': 'never',
    alphabetize: { order: 'asc', caseInsensitive: true },
  },
];

const baseBestPractices = {
  'no-console': 'off',
  'no-debugger': 'error',
  'no-alert': 'error',
  'no-await-in-loop': 'warn',
  'no-return-await': 'warn',
  'no-useless-catch': 'error',
  'prefer-const': 'error',
  'prefer-arrow-callback': 'warn',
  'prefer-template': 'warn',
  'no-var': 'error',
  'object-shorthand': 'warn',
  'func-names': 'off',
  'no-underscore-dangle': 'off',
  'consistent-return': 'off',
};

// ---------------------------------------------------------
// Exported config
// ---------------------------------------------------------
export default [
  // -------------------------------------------------------
  // Global ignores
  // -------------------------------------------------------
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
      '**/*.config.cjs',
      '**/ecosystem.config.cjs',
      '**/tsconfig.json'
    ],
  },

  // Base ESLint recommended (applies to all JS/TS unless overridden)
  js.configs.recommended,

  // -------------------------------------------------------
  // TypeScript source (backend Node 24)
  // -------------------------------------------------------
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2024, // modern syntax, Node 24 is fine
      sourceType: 'module',
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.node, // Node env only
        ...globals.es2021,
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      import: importPlugin,
      promise: promisePlugin,
      security: securityPlugin,
      prettier: prettierPlugin,
      'unused-imports': unusedImports,
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
      // Turn off core rules that conflict with TS equivalents
      'no-unused-vars': 'off',
      'no-use-before-define': 'off',
      'no-shadow': 'off',

      // TypeScript recommended
      ...tsPlugin.configs.recommended.rules,

      // TypeScript-specific tuning
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-unused-vars': 'off', // handled by unused-imports
      '@typescript-eslint/no-use-before-define': ['error', { functions: false, classes: true }],
      '@typescript-eslint/no-shadow': 'warn',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-misused-promises': 'warn',
      '@typescript-eslint/await-thenable': 'warn',
      '@typescript-eslint/no-unnecessary-type-assertion': 'warn',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/prefer-optional-chain': 'warn',
      '@typescript-eslint/strict-boolean-expressions': 'off',
      '@typescript-eslint/no-this-alias': 'off',
      '@typescript-eslint/no-empty-object-type': 'warn',
      '@typescript-eslint/no-unsafe-function-type': 'warn',
      '@typescript-eslint/naming-convention': 'off',

      // Core best practices, tuned for backend
      ...baseBestPractices,

      // Security
      'security/detect-object-injection': 'off', // can be noisy in typical backend code
      'security/detect-non-literal-fs-filename': 'warn',
      'security/detect-unsafe-regex': 'warn',

      // Promise best practices
      'promise/always-return': 'off', // too strict in real-world code
      'promise/catch-or-return': 'warn',
      'promise/no-nesting': 'warn',
      'promise/param-names': 'error',

      // Import best practices
      'import/order': importOrderRule,
      'import/newline-after-import': 'warn',
      'import/no-duplicates': 'error',

      // Prettier integration
      'prettier/prettier': prettierRule,

      // Unused imports / vars (via plugin)
      ...unusedImportsRules,
    },
  },

  // -------------------------------------------------------
  // Jest test files (TS + JS)
  // -------------------------------------------------------
  {
    files: ['**/*.test.ts', '**/*.spec.ts', '**/*.test.js', '**/*.spec.js', '**/test/**', '**/tests/**'],
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

      // Tests are allowed to be a bit messy
      'no-console': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },

  // -------------------------------------------------------
  // Jest setup files
  // -------------------------------------------------------
  {
    files: ['**/setupTestDB.ts', '**/setupTests.ts', '**/jest.setup.ts'],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
    rules: {
      'no-undef': 'off',
    },
  },

  // -------------------------------------------------------
  // JS config / tooling files (lenient)
  // -------------------------------------------------------
  {
    files: ['*.config.js', '*.config.cjs', '*.config.mjs', 'ecosystem.config.json'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-var-requires': 'off',
    },
  },
];
