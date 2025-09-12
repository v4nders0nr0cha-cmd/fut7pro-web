const nextJest = require("next/jest");
const createJestConfig = nextJest({ dir: "./" });

const customJestConfig = {
  testEnvironment: "jsdom",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  setupFilesAfterEnv: ["<rootDir>/test/setup.ts"],
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
  ],
  coverageThreshold: {
    global: {
      statements: 70,
      branches: 60,
      functions: 70,
      lines: 70,
    },
  },
  testMatch: ["**/__tests__/**/*.(ts|tsx|js)", "**/*.(test|spec).(ts|tsx|js)"],
  testPathIgnorePatterns: ["<rootDir>/.next/", "<rootDir>/node_modules/", "<rootDir>/out/"],
  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.json",
      },
    ],
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
};

module.exports = createJestConfig(customJestConfig);
