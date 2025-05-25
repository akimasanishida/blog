// jest.config.js
const nextJest = require('next/jest')({
  dir: './', // Path to Next.js app
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'], // or .ts
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@/types/(.*)$': '<rootDir>/src/types/$1',
    // Add other aliases from tsconfig.json if needed
  },
  // If using ts-jest directly without next/jest's swc, you might need:
  // preset: 'ts-jest', 
  // transform: {
  //   '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
  // },
};

module.exports = nextJest(customJestConfig);
