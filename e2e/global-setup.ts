import { execSync } from "node:child_process";

/** Applies migrations to the e2e database. Each test reseeds via reseed() below. */
export default function globalSetup() {
  execSync("npx prisma migrate deploy", { stdio: "pipe", env: { ...process.env, DATABASE_URL: "file:./e2e.db" } });
}
