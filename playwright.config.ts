import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  use: { baseURL: "http://localhost:3000", trace: "retain-on-failure" },
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
    command: "npm run dev:web",
    url: "http://localhost:3000/api/health/live",
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
