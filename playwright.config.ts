import { defineConfig, devices } from "@playwright/test";

const PORT = 3200;
// Separate database for end-to-end runs (path relative to prisma/schema.prisma).
const env = { DATABASE_URL: "file:./e2e.db" };

export default defineConfig({
  testDir: "e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"]],
  globalSetup: "./e2e/global-setup.ts",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: `npx next build && npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}/api/health`,
    env,
    reuseExistingServer: false,
    timeout: 300_000,
  },
});
