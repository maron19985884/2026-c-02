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
    // Pin React to the app's own node_modules to avoid duplicate-React issues
    // (jest runs with NODE_PATH=/tmp/frontend-test-deps/node_modules, so without
    // these mappings React could be resolved twice causing "Invalid hook call").
    '^react$': '<rootDir>/node_modules/react',
    '^react-dom$': '<rootDir>/node_modules/react-dom',
    '^react-dom/(.*)$': '<rootDir>/node_modules/react-dom/$1',
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
