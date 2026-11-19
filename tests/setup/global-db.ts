import { execSync } from "node:child_process";
import { rmSync } from "node:fs";

const TEST_DB = "prisma/test.db";

/**
 * Builds a fresh, throwaway test database from the migrations once per run.
 * Only this test-only file is removed; the dev database is never touched.
 */
export default function setup() {
  for (const suffix of ["", "-journal", "-wal", "-shm"]) rmSync(TEST_DB + suffix, { force: true });
  execSync("npx prisma migrate deploy", {
    stdio: "pipe",
    env: { ...process.env, DATABASE_URL: "file:./test.db" },
  });
}
