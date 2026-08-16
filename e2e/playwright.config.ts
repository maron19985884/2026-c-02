import { defineConfig, devices } from "@playwright/test";

// 前提: docker compose up -d でfrontend(3000)/backend(4000)/mysqlが起動していること
// （quickstart.md参照）。このconfigはdocker-composeのライフサイクルを管理しない。
export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
