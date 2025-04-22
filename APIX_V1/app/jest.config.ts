import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/client/src/$1',
    '^@shared/(.*)$': '<rootDir>/shared/$1',
    '^@server/(.*)$': '<rootDir>/server/$1',
    '^@assets/(.*)$': '<rootDir>/client/src/assets/$1',
    '^.+\\.(jpg|jpeg|png|gif|svg|webp)$': 'jest-transform-stub',
    '^.+\\.(css|less|scss)$': 'jest-transform-stub',
  },
  moduleFileExtensions: ['js', 'ts', 'tsx', 'json'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testMatch: [
    '<rootDir>/**/__tests__/**/*.{js,ts,tsx}',
    '<rootDir>/**/*.{spec,test}.{js,ts,tsx}',
  ],
  transformIgnorePatterns: [
    '/node_modules/(?!(@react-hook|nanoid|node-fetch|data-uri-to-buffer|fetch-blob|formdata-polyfill)/)',
  ],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { useESM: true }],
  },
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  collectCoverageFrom: [
    'client/src/**/*.{js,ts,tsx}',
    'server/**/*.{js,ts}',
    'shared/**/*.{js,ts}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: './',
      outputName: 'junit.xml',
      classNameTemplate: '{classname}',
      titleTemplate: '{title}',
      ancestorSeparator: ' › ',
      suiteNameTemplate: '{filename}',
    }]
  ],
  coverageReporters: ['text', 'lcov', 'cobertura'],
  testResultsProcessor: 'jest-junit',
};

export default config;