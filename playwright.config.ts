import { defineConfig, devices } from "@playwright/test";
import { testDatabaseUrl } from "./tests/database";
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  workers: 2,
  timeout: 60000,
  use: { baseURL: "http://localhost:3100", trace: "retain-on-failure" },
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], channel: "msedge" },
    },
    {
      name: "mobile",
      use: {
        ...devices["Pixel 7"],
        defaultBrowserType: "chromium",
        channel: "msedge",
      },
    },
  ],
  webServer: {
    command:
      "node scripts/web.mjs start apps/web --hostname 127.0.0.1 --port 3100",
    url: "http://localhost:3100/api/health/ready",
    env: {
      DATABASE_URL: testDatabaseUrl(),
      APP_URL: "http://localhost:3100",
      SMTP_URL: "smtp://127.0.0.1:1025",
      MAIL_FROM: "ct-rpg@example.test",
    },
    reuseExistingServer: false,
    timeout: 120000,
  },
});
