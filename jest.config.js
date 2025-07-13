module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  // Performance optimizations
  maxWorkers: '50%',
  cache: true,
  cacheDirectory: '<rootDir>/.jest-cache',
  // Parallel test execution
  maxConcurrency: 4,
  // Faster test execution
  bail: false,
  verbose: false,
  globals: {
    performance: 'readonly',
  },
  moduleNameMapper: {
    '^@site/(.*)$': '<rootDir>/src/$1',
    // Mock ESM modules that cause issues in Jest
    '^nanoid$': '<rootDir>/src/__mocks__/nanoid.js',
    '^uuid$': '<rootDir>/src/__mocks__/uuid.js',
    '^crypto$': '<rootDir>/src/__mocks__/crypto.js',
  },
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.jest.json',
        diagnostics: {
          ignoreCodes: [1343], // Ignore dynamic import warnings
        },
        // Add JSX support for coverage collection
        jsx: 'react-jsx',
      },
    ],
  },
  setupFilesAfterEnv: ['<rootDir>/src/setup-tests.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  testMatch: ['**/__tests__/**/*.(ts|tsx)', '**/*.(test|spec).(ts|tsx)'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/setup-tests.ts',
    '!src/**/*.stories.{ts,tsx}',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.spec.{ts,tsx}',
  ],
  // Coverage optimization
  coverageReporters: ['text', 'lcov', 'html'],
  coverageDirectory: 'coverage',
  // Test timeout
  testTimeout: 10_000,
  isolatedModules: true,
};
