module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
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
        tsconfig: 'tsconfig.json',
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
  ],
};
