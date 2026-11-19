import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

const alias = { "@": fileURLToPath(new URL("./src", import.meta.url)) };

export default defineConfig({
  test: {
    projects: [
      {
        resolve: { alias },
        test: {
          name: "server",
          environment: "node",
          include: ["tests/unit/**/*.test.ts", "tests/api/**/*.test.ts"],
          globalSetup: ["tests/setup/global-db.ts"],
          // Separate database so tests never touch dev data. Path is relative to prisma/schema.prisma.
          env: { DATABASE_URL: "file:./test.db" },
          // Tests share one SQLite file, so files run one at a time.
          fileParallelism: false,
          testTimeout: 20000,
          hookTimeout: 60000,
        },
      },
      {
        plugins: [react()],
        resolve: { alias },
        test: {
          name: "ui",
          environment: "jsdom",
          include: ["tests/components/**/*.test.tsx"],
          setupFiles: ["tests/setup/dom.ts"],
        },
      },
    ],
  },
});
