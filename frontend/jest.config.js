/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: '/tmp/frontend-test-deps/node_modules/jest-environment-jsdom',
  roots: ['<rootDir>/src/__tests__'],
  testMatch: ['**/*.test.ts', '**/*.test.tsx'],
  transform: {
    '^.+\\.tsx?$': [
      '/tmp/frontend-test-deps/node_modules/ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.test.json',
      },
    ],
  },
  moduleNameMapper: {
    // Resolve Next.js @/* path alias to src/*
    '^@/(.*)$': '<rootDir>/src/$1',
    // Resolve @testing-library packages from tmp deps
    '^@testing-library/react$': '/tmp/frontend-test-deps/node_modules/@testing-library/react',
    '^@testing-library/jest-dom$': '/tmp/frontend-test-deps/node_modules/@testing-library/jest-dom',
  },
  moduleDirectories: [
    'node_modules',
    '/tmp/frontend-test-deps/node_modules',
  ],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  collectCoverageFrom: [
    'src/lib/**/*.ts',
    'src/hooks/**/*.ts',
  ],
};
