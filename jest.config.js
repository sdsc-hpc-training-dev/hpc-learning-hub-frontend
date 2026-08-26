// Jest config for the Next.js frontend.
// Install: npm i -D jest jest-environment-jsdom @testing-library/react ts-node
// If you prefer Vitest instead, mirror the `coverage` block into vitest.config.ts
// (test.coverage.provider: 'v8', reporter: ['text','html','json','lcov'], thresholds: {...}).
const nextJest = require("next/jest");

const createJestConfig = nextJest({ dir: "./" });

/** @type {import('jest').Config} */
const customJestConfig = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: [],
  collectCoverage: true,
  collectCoverageFrom: [
    "app/**/*.{ts,tsx}",
    "components/**/*.{ts,tsx}",
    "lib/**/*.{ts,tsx}",
    "!**/*.d.ts",
    "!**/*.stories.{ts,tsx}",
    "!**/node_modules/**",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["html", "json", "json-summary", "lcov", "text"],
  coverageThreshold: {
    global: {
      lines: 80,
      statements: 80,
      functions: 80,
      branches: 70,
    },
  },
};

module.exports = createJestConfig(customJestConfig);
