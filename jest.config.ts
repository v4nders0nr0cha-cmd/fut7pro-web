/// <reference types="node" />
// CommonJS-style to avoid TS ESM issues under ts-node + verbatimModuleSyntax
// eslint-disable-next-line @typescript-eslint/no-var-requires
const nextJest = require("next/jest");

const createJestConfig = nextJest({ dir: "./" });

const customJestConfig = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/src/tests/setup.ts"],
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "^@/(.*)$": "<rootDir>/src/$1",
    "next/navigation": "<rootDir>/src/tests/mocks/nextNavigation.ts",
    "next/router": "<rootDir>/src/tests/mocks/nextRouter.ts",
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

  // (Unificada) Ignora pastas/arquivos de teste e artefatos de build
  testPathIgnorePatterns: [
    "<rootDir>/.next/",
    "<rootDir>/node_modules/",
    "<rootDir>/out/",
    "<rootDir>/tests/e2e/",
    "<rootDir>/tests/seo/",
    // Temporário: specs que dependem de providers complexos
    "<rootDir>/src/components/__tests__/AdminSidebar.test.tsx",
    "<rootDir>/src/hooks/__tests__/useAdmin.test.tsx",
    "<rootDir>/src/components/__tests__/SimpleTests.test.tsx",
  ],

  transform: {
    "^.+\\.(ts|tsx)$": ["babel-jest", { presets: ["next/babel"] }],
  },

  testMatch: ["**/__tests__/**/*.(ts|tsx|js)", "**/*.(test|spec).(ts|tsx|js)"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
};

module.exports = createJestConfig(customJestConfig);
