import { createHash } from "node:crypto";
import { prisma, type Db } from "@/server/db";
import { publicProfileSelect, toPublicProfile } from "@/server/profiles";
import type { PublicProfile } from "@/lib/types";

/**
 * Stable per-viewer shuffle key. It depends only on the (viewer, profile) ids, so
 * the order cannot correlate with whether a profile has liked the viewer.
 */
export function feedOrderKey(viewerId: string, profileId: string): string {
  return createHash("sha256").update(`${viewerId}:${profileId}`).digest("hex");
}

/** Profiles the viewer has not yet liked or passed, excluding the viewer. */
export async function getFeed(viewerId: string, db: Db = prisma): Promise<PublicProfile[]> {
  const rows = await db.profile.findMany({
    where: {
      id: { not: viewerId },
      // Only the viewer's OWN outgoing swipes are consulted. Incoming swipes are never read here.
      swipesReceived: { none: { fromId: viewerId } },
    },
    select: publicProfileSelect,
  });

  return rows
    .map((row) => ({ row, key: feedOrderKey(viewerId, row.id) }))
    .sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0))
    .map(({ row }) => toPublicProfile(row));
}
