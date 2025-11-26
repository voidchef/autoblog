module.exports = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',

  // Recognize .ts and .js files
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],

  // Test discovery pattern
  testMatch: ['**/__tests__/**/*.test.[tj]s?(x)', '**/__tests__/**/*.spec.[tj]s?(x)', '**/?(*.)+(spec|test).[tj]s?(x)'],

  // Exclude dist and node_modules from test discovery
  testPathIgnorePatterns: ['/node_modules/', '/dist/', 'tts\\.test\\.ts$'],

  clearMocks: true,
  restoreMocks: true,
  verbose: true,
  forceExit: true,
  testTimeout: 30000,

  // Coverage setup
  collectCoverage: false,
  collectCoverageFrom: ['src/**/*.{ts,js}', '!src/**/*.d.ts', '!src/**/__tests__/**'],
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: ['/node_modules/', '/dist/'],
  coverageReporters: ['text', 'lcov', 'clover', 'html'],

  // Match your TS path aliases
  moduleNameMapper: {
    '^@src/(.*)$': '<rootDir>/src/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1',
  },

  // Transform ES modules from node_modules
  transformIgnorePatterns: ['node_modules/(?!(@faker-js)/)'],

  // ESM support
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: 'tsconfig.json',
        diagnostics: true,
      },
    ],
  },
};
