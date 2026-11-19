import { prisma } from "@/server/db";
import { fail, ok } from "@/server/http";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return ok({ status: "ok", database: "up", time: new Date().toISOString() });
  } catch {
    return fail(503, "INTERNAL_ERROR", "Database unavailable.");
  }
}
