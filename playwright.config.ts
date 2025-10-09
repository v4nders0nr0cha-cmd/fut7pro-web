import type { PlaywrightTestConfig } from "@playwright/test";

const PORT = 3000;
const HOST = "127.0.0.1";
const baseURL = `http://${HOST}:${PORT}`;

const config: PlaywrightTestConfig = {
  testDir: "./tests",
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  // Agora o Playwright apenas inicia o servidor (o build roda antes, no script test:e2e)
  webServer: {
    command: "npm run e2e:start",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000, // só para o start (sem build no meio)
    stdout: "pipe",
    stderr: "pipe",
  },
  projects: [
    { name: "chromium", use: { browserName: "chromium" } },
    { name: "firefox", use: { browserName: "firefox" } },
    { name: "webkit", use: { browserName: "webkit" } },
  ],
};

export default config;
