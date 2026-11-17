import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Logic tests only; e2e/ is run by Playwright (npm run test:e2e).
  test: { include: ["src/**/*.test.ts"] },
});
