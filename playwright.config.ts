import { defineConfig, devices } from "@playwright/test";

// End-to-end flow tests on a phone-sized screen against the production build.
export default defineConfig({
  testDir: "e2e",
  timeout: 30_000,
  fullyParallel: true,
  reporter: [["list"]],
  use: {
    ...devices["Pixel 7"],
    baseURL: "http://localhost:4180",
    trace: "off",
  },
  webServer: {
    command: "npm run build && npx vite preview --port 4180 --strictPort",
    url: "http://localhost:4180",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
