import type { PrismaClient } from "@prisma/client";
import { demoUser, incomingSwipes, otherSwipes, seedProfiles, type SeedProfile } from "./seed-data";

const toRow = (p: SeedProfile) => ({
  id: p.id,
  name: p.name,
  age: p.age,
  photoUrl: `/profiles/${p.id}.jpg`,
  bio: p.bio,
  location: p.location,
  interests: JSON.stringify(p.interests),
});

/**
 * Wipes and re-creates the demo dataset. Deterministic: same input, same rows.
 * Matches are derived from mutual LIKE swipes, never inserted independently.
 */
export async function seedDatabase(db: PrismaClient): Promise<void> {
  await db.$transaction(async (tx) => {
    await tx.match.deleteMany();
    await tx.swipe.deleteMany();
    await tx.profile.deleteMany();

    for (const p of [demoUser, ...seedProfiles]) {
      await tx.profile.create({ data: toRow(p) });
    }

    const swipes = [
      ...incomingSwipes.map((s) => ({ fromId: s.fromId, toId: demoUser.id, action: s.action })),
      ...otherSwipes,
    ];
    for (const s of swipes) await tx.swipe.create({ data: s });

    const likes = new Set(swipes.filter((s) => s.action === "LIKE").map((s) => `${s.fromId}>${s.toId}`));
    for (const s of swipes) {
      if (s.action !== "LIKE" || !likes.has(`${s.toId}>${s.fromId}`)) continue;
      const [userLowId, userHighId] = s.fromId < s.toId ? [s.fromId, s.toId] : [s.toId, s.fromId];
      if (s.fromId !== userLowId) continue; // create each mutual pair once
      await tx.match.create({ data: { userLowId, userHighId } });
    }
  });
}
