import { defineConfig } from "@playwright/test";
import original from "./playwright.config";
if (process.env.CENTRAL_HOMOLOGATION !== "1")
  throw new Error("Use the isolated integrated billing environment");
export default defineConfig({
  ...original,
  testMatch: "**/subscription-central.homologation.ts",
  webServer: undefined,
  fullyParallel: false,
  workers: 1,
  expect: { timeout: 60000 },
  outputDir: "test-results/central-integrated",
  use: { ...original.use, trace: "retain-on-failure" },
});
