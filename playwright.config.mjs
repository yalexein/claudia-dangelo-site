import { defineConfig, devices } from "@playwright/test";

const port = 4398;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "line",
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop-chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile-chromium", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: `PUBLIC_PREVIEW_HOST=127.0.0.1 PUBLIC_PREVIEW_PORT=${port} PUBLIC_PREVIEW_DATA_DIR=/tmp/claudia-playwright-runtime node scripts/public-preview-server.mjs`,
    url: `http://127.0.0.1:${port}/api/health`,
    reuseExistingServer: false,
    timeout: 15_000,
  },
});
