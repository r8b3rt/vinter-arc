import { defineConfig } from "@playwright/test";
export default defineConfig({
  use: { channel: process.env.GITHUB_ACTIONS ? "chrome" : undefined },
  testMatch: "**/browser.spec.ts",
  webServer: {
    command: "npm run preview -- --host 127.0.0.1",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: true,
  },
});
