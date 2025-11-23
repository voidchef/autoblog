module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',

  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.json',
        diagnostics: true,
      },
    ],
  },

  // Recognize .ts and .js files
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],

  // Test discovery pattern
  testMatch: ['**/__tests__/**/*.(spec|test).[tj]s', '**/?(*.)+(spec|test).[tj]s'],

  // Exclude dist and node_modules from test discovery
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],

  clearMocks: true,
  verbose: true,
  forceExit: true,
  testTimeout: 30000,

  // Coverage setup
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.{ts,js}', '!src/**/*.d.ts', '!src/**/__tests__/**'],
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: ['node_modules', 'dist/config', 'dist/app.js'],
  coverageReporters: ['text', 'lcov', 'clover', 'html'],

  // Match your TS path aliases
  moduleNameMapper: {
    '^@src/(.*)$': '<rootDir>/src/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1',
  },
};
