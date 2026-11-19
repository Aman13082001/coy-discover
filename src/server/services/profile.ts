import { prisma, type Db } from "@/server/db";
import { AppError } from "@/server/errors";
import { publicProfileSelect, toPublicProfile } from "@/server/profiles";
import type { PublicProfile } from "@/lib/types";

export async function getProfile(id: string, db: Db = prisma): Promise<PublicProfile> {
  const row = await db.profile.findUnique({ where: { id }, select: publicProfileSelect });
  if (!row) throw new AppError(404, "PROFILE_NOT_FOUND", "Profile not found.");
  return toPublicProfile(row);
}
