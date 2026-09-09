// Jest config for the Next.js frontend.

/** @type {import('jest').Config} */
const customJestConfig = {
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.json",
      },
    ],
  },
  collectCoverage: true,
  collectCoverageFrom: [
    "app/**/*.{ts,tsx}",
    "components/**/*.{ts,tsx}",
    "lib/**/*.{ts,tsx}",
    "!app/layout.tsx",
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

module.exports = customJestConfig;
