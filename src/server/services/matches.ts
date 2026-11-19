import { prisma, type Db } from "@/server/db";
import { publicProfileSelect, toPublicProfile } from "@/server/profiles";
import type { MatchSummary } from "@/lib/types";

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
