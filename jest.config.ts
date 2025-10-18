import type { Config } from "jest";
import nextJest from "next/jest";

const createJestConfig = nextJest({ dir: "./" });

const customJestConfig: Config = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/src/tests/setup.ts"],
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "^@/(.*)$": "<rootDir>/src/$1",
    "next/navigation": "<rootDir>/src/tests/mocks/nextNavigation.ts",
    "next/image": "<rootDir>/src/tests/mocks/nextImage.tsx",
  },
  collectCoverage: true,
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/_app.tsx",
    "!src/**/_document.tsx",
    "!src/**/layout.tsx",
    "!src/**/page.tsx",
    "!src/**/*.d.ts",
    "!src/**/*.config.*",
    "!src/**/types/**",
    "!src/**/interfaces/**",
    "!src/**/__tests__/**",
  ],
  coverageThreshold: {
    global: {
      statements: 0,
      branches: 0,
      functions: 0,
      lines: 0,
    },
  },
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "<rootDir>/src/pages/api/",
    "<rootDir>/src/server/legacy/",
  ],
  transform: {
    "^.+\\.(ts|tsx)$": ["babel-jest", { presets: ["next/babel"] }],
  },
  testMatch: ["**/__tests__/**/*.(ts|tsx|js)", "**/*.(test|spec).(ts|tsx|js)"],
  testPathIgnorePatterns: ["<rootDir>/.next/", "<rootDir>/node_modules/", "<rootDir>/out/"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
};

export default createJestConfig(customJestConfig);
