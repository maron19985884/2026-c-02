/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src", "<rootDir>/tests"],
  testMatch: ["**/*.test.ts"],
  collectCoverageFrom: [
    "src/domain/**/*.ts",
    "src/services/**/*.ts",
    "src/routes/**/*.ts",
  ],
  // 憲法§2: カバレッジ目標 80%（主要ビジネスロジックを対象）
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
