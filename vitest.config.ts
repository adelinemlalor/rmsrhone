import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

// Standalone test config, kept separate from vite.config.ts so the Lovable/TanStack
// plugins don't load during tests.
export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  test: { include: ["tests/**/*.test.ts"], testTimeout: 60_000, hookTimeout: 60_000 },
});
