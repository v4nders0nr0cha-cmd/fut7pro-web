const nextJest = require("next/jest");

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: "./",
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  moduleFileExtensions: ["js", "json", "ts", "tsx"],
  rootDir: ".",

  collectCoverageFrom: [
    "src/**/*.(t|j)s",
    "src/**/*.(t|j)sx",
    "!src/**/*.d.ts",
    "!src/**/*.stories.tsx",
    "!src/**/*.test.ts",
    "!src/**/*.test.tsx",
    "!src/**/*.spec.ts",
    "!src/**/*.spec.tsx",
    "!src/**/index.ts",
    "!src/**/index.tsx",
    "!src/**/main.ts",
    "!src/**/main.tsx",
    "!src/**/app.tsx",
    "!src/**/layout.tsx",
    "!src/**/page.tsx",
    "!src/**/loading.tsx",
    "!src/**/error.tsx",
    "!src/**/not-found.tsx",
    "!src/**/global-error.tsx",
    "!src/**/template.tsx",
    "!src/**/default.tsx",
    "!src/**/loading.ts",
    "!src/**/error.ts",
    "!src/**/not-found.ts",
    "!src/**/layout.ts",
    "!src/**/page.ts",
    "!src/**/route.ts",
    "!src/**/middleware.ts",
    "!src/**/config.ts",
    "!src/**/setup.ts",
    "!src/**/jest.config.js",
    "!src/**/tsconfig.json",
    "!src/**/package.json",
    "!src/**/README.md",
    "!src/**/.env*",
    "!src/**/next.config.js",
    "!src/**/tailwind.config.js",
    "!src/**/postcss.config.js",
    "!src/**/.eslintrc.js",
    "!src/**/.prettierrc",
  ],
  coverageDirectory: "./coverage",
  coverageReporters: ["text", "lcov", "html"],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  testEnvironment: "jsdom",
  roots: ["<rootDir>/src/"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "\\.(css|less|scss|sass)$": "<rootDir>/test/__mocks__/styleMock.js",
    "^next/image$": "<rootDir>/test/__mocks__/nextImageMock.js",
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testTimeout: 30000,
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  collectCoverage: true,
  coverageProvider: "v8",
  testRunner: "jest-circus/runner",
  reporters: ["default"],
  testPathIgnorePatterns: [
    "/node_modules/",
    "/dist/",
    "/coverage/",
    "/.next/",
    "/.git/",
    "/.husky/",
    "/.vscode/",
    "/logs/",
    "/uploads/",
    "/temp/",
    "/tmp/",
  ],
  modulePathIgnorePatterns: [
    "<rootDir>/dist/",
    "<rootDir>/coverage/",
    "<rootDir>/node_modules/",
    "<rootDir>/.next/",
  ],
  transformIgnorePatterns: [
    "node_modules/(?!(@nestjs|@prisma|bcrypt|class-transformer|class-validator|passport|winston|@next|react|@types)/)",
  ],

  testMatch: [
    "<rootDir>/src/**/__tests__/**/*.ts",
    "<rootDir>/src/**/__tests__/**/*.tsx",
    "<rootDir>/src/**/*.spec.ts",
    "<rootDir>/src/**/*.spec.tsx",
    "<rootDir>/src/**/*.test.ts",
    "<rootDir>/src/**/*.test.tsx",
  ],
  testEnvironmentOptions: {
    NODE_ENV: "test",
  },
  
  maxWorkers: "50%",
  maxConcurrency: 1,
  bail: 1,
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
