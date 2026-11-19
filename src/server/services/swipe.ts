import { Prisma } from "@prisma/client";
import { prisma, type Db } from "@/server/db";
import { AppError, isPrismaError } from "@/server/errors";
import { publicProfileSelect, toPublicProfile } from "@/server/profiles";
import type { SwipeInput } from "@/server/validation";
import type { MatchSummary, SwipeResponse } from "@/lib/types";

/** Canonical ordering so a pair maps to exactly one Match row. */
export function canonicalPair(a: string, b: string): [low: string, high: string] {
  return a < b ? [a, b] : [b, a];
}

export interface SwipeOutcome {
  result: SwipeResponse;
  /** false when this exact swipe already existed (an idempotent retry). */
  created: boolean;
}

// P2034: write conflict / serialization failure. P2028: transaction could not start (e.g. SQLITE_BUSY).
const RETRYABLE = ["P2034", "P2028"];
const MAX_ATTEMPTS = 3;

/** Internal signal: the (viewer, target) swipe already exists. */
class DuplicateSwipe extends Error {}

/** The viewer's match with `otherId`, if one exists. Reads only the Match table. */
async function findMatch(db: Db | Prisma.TransactionClient, viewerId: string, otherId: string): Promise<MatchSummary | null> {
  const [userLowId, userHighId] = canonicalPair(viewerId, otherId);
  const row = await db.match.findUnique({
    where: { userLowId_userHighId: { userLowId, userHighId } },
    select: { id: true, createdAt: true, userLow: { select: publicProfileSelect }, userHigh: { select: publicProfileSelect } },
  });
  if (!row) return null;
  const other = userLowId === viewerId ? row.userHigh : row.userLow;
  return { id: row.id, createdAt: row.createdAt.toISOString(), profile: toPublicProfile(other) };
}

/**
 * Records a like or pass and, if it completes a mutual like, creates the match.
 *
 * - One SERIALIZABLE transaction: the swipe INSERT comes first (on SQLite this takes the
 *   write lock immediately); on PostgreSQL, serializable isolation makes two simultaneous
 *   mutual likes conflict, and the retry then sees the other side's committed like.
 * - The unique (fromId, toId) index arbitrates duplicates. Repeating the *same* swipe is
 *   idempotent (returns the original outcome, including the match if there is one), so a
 *   client retrying after a lost response never loses its "It's a match!" moment.
 *   A *different* action on an already-swiped profile is a 409.
 *
 * Privacy: the response has the same shape whatever the other person did. Their earlier
 * action is used only to decide whether `match` is set, and a Match row exists only when
 * the like is mutual.
 */
export async function recordSwipe(viewerId: string, input: SwipeInput, db: Db = prisma): Promise<SwipeOutcome> {
  if (input.profileId === viewerId) {
    throw new AppError(400, "SELF_SWIPE", "You cannot swipe on yourself.");
  }
  const swipe = { profileId: input.profileId, action: input.action };

  for (let attempt = 1; ; attempt++) {
    try {
      const match = await db.$transaction(
        async (tx) => {
          try {
            await tx.swipe.create({ data: { fromId: viewerId, toId: input.profileId, action: input.action } });
          } catch (e) {
            if (isPrismaError(e, "P2002")) throw new DuplicateSwipe();
            if (isPrismaError(e, "P2003")) throw new AppError(404, "PROFILE_NOT_FOUND", "Profile not found.");
            throw e;
          }

          if (input.action !== "LIKE") return null;

          const reciprocal = await tx.swipe.findUnique({
            where: { fromId_toId: { fromId: input.profileId, toId: viewerId } },
            select: { action: true },
          });
          if (reciprocal?.action !== "LIKE") return null;

          const [userLowId, userHighId] = canonicalPair(viewerId, input.profileId);
          await tx.match.upsert({
            where: { userLowId_userHighId: { userLowId, userHighId } },
            create: { userLowId, userHighId },
            update: {},
          });
          return findMatch(tx, viewerId, input.profileId);
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
      return { result: { swipe, match }, created: true };
    } catch (e) {
      if (e instanceof DuplicateSwipe) return resolveDuplicate(viewerId, input, db);
      if (attempt < MAX_ATTEMPTS && RETRYABLE.some((code) => isPrismaError(e, code))) continue;
      throw e;
    }
  }
}

/** Same action again → idempotent replay of the original outcome. Different action → 409. */
async function resolveDuplicate(viewerId: string, input: SwipeInput, db: Db): Promise<SwipeOutcome> {
  const existing = await db.swipe.findUnique({
    where: { fromId_toId: { fromId: viewerId, toId: input.profileId } },
    select: { action: true },
  });
  if (existing?.action !== input.action) {
    throw new AppError(409, "ALREADY_SWIPED", "You have already swiped on this profile.");
  }
  const match = input.action === "LIKE" ? await findMatch(db, viewerId, input.profileId) : null;
  return { result: { swipe: { profileId: input.profileId, action: input.action }, match }, created: false };
}
