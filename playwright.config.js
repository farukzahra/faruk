const { defineConfig } = require("@playwright/test");

const apiPort = process.env.FARUK_E2E_API_PORT || "3099";
const webPort = process.env.FARUK_E2E_WEB_PORT || "5174";

module.exports = defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: `http://localhost:${webPort}`,
    trace: "on-first-retry",
  },
  webServer: [
    {
      command: "node server.js",
      port: Number(apiPort),
      reuseExistingServer: !process.env.CI,
      env: {
        ...process.env,
        PORT: apiPort,
      },
    },
    {
      command: "npm run dev --prefix frontend",
      port: Number(webPort),
      reuseExistingServer: !process.env.CI,
      env: {
        ...process.env,
        FARUK_API_PORT: apiPort,
      },
    },
  ],
});
