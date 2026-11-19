import { prisma, type Db } from "@/server/db";
import { AppError } from "@/server/errors";
import { publicProfileSelect, toPublicProfile } from "@/server/profiles";
import type { MatchSummary, PublicProfile } from "@/lib/types";

/** Mutual matches only. Reads the Match table, never the Swipe table. */
export async function getMatches(viewerId: string, db: Db = prisma): Promise<MatchSummary[]> {
  const rows = await db.match.findMany({
    where: { OR: [{ userLowId: viewerId }, { userHighId: viewerId }] },
    orderBy: [{ createdAt: "desc" }, { id: "asc" }],
    select: {
      id: true,
      createdAt: true,
      userLowId: true,
      userLow: { select: publicProfileSelect },
      userHigh: { select: publicProfileSelect },
    },
  });

  return rows.map((m) => ({
    id: m.id,
    createdAt: m.createdAt.toISOString(),
    profile: toPublicProfile(m.userLowId === viewerId ? m.userHigh : m.userLow),
  }));
}

export async function getProfile(id: string, db: Db = prisma): Promise<PublicProfile> {
  const row = await db.profile.findUnique({ where: { id }, select: publicProfileSelect });
  if (!row) throw new AppError(404, "PROFILE_NOT_FOUND", "Profile not found.");
  return toPublicProfile(row);
}
