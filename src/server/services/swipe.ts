import { prisma, type Db } from "@/server/db";
import { AppError, isPrismaError } from "@/server/errors";
import { publicProfileSelect, toPublicProfile } from "@/server/profiles";
import type { SwipeInput } from "@/server/validation";
import type { SwipeResponse } from "@/lib/types";

/** Canonical ordering so a pair maps to exactly one Match row. */
export function canonicalPair(a: string, b: string): [low: string, high: string] {
  return a < b ? [a, b] : [b, a];
}

// P2034: write conflict, P2028: transaction could not start (e.g. SQLITE_BUSY under contention).
const RETRYABLE = ["P2034", "P2028"];
const MAX_ATTEMPTS = 3;

/**
 * Records a like or pass and, if it completes a mutual like, creates the match.
 *
 * Everything runs in one transaction. The swipe INSERT is the first statement,
 * so the transaction takes the write lock immediately, and the unique (fromId, toId)
 * index decides duplicate or concurrent requests.
 *
 * Privacy: the response has the same shape whatever the other person did.
 * Their earlier action is used only to decide whether `match` is set.
 */
export async function recordSwipe(viewerId: string, input: SwipeInput, db: Db = prisma): Promise<SwipeResponse> {
  if (input.profileId === viewerId) {
    throw new AppError(400, "SELF_SWIPE", "You cannot swipe on yourself.");
  }

  for (let attempt = 1; ; attempt++) {
    try {
      return await db.$transaction(async (tx) => {
        try {
          await tx.swipe.create({
            data: { fromId: viewerId, toId: input.profileId, action: input.action },
          });
        } catch (e) {
          if (isPrismaError(e, "P2002")) {
            throw new AppError(409, "ALREADY_SWIPED", "You have already swiped on this profile.");
          }
          if (isPrismaError(e, "P2003")) {
            throw new AppError(404, "PROFILE_NOT_FOUND", "Profile not found.");
          }
          throw e;
        }

        let match: SwipeResponse["match"] = null;

        if (input.action === "LIKE") {
          const reciprocal = await tx.swipe.findUnique({
            where: { fromId_toId: { fromId: input.profileId, toId: viewerId } },
            select: { action: true },
          });

          if (reciprocal?.action === "LIKE") {
            const [userLowId, userHighId] = canonicalPair(viewerId, input.profileId);
            const row = await tx.match.upsert({
              where: { userLowId_userHighId: { userLowId, userHighId } },
              create: { userLowId, userHighId },
              update: {},
              select: { id: true, createdAt: true },
            });
            const profile = await tx.profile.findUniqueOrThrow({
              where: { id: input.profileId },
              select: publicProfileSelect,
            });
            match = { id: row.id, createdAt: row.createdAt.toISOString(), profile: toPublicProfile(profile) };
          }
        }

        return { swipe: { profileId: input.profileId, action: input.action }, match };
      });
    } catch (e) {
      if (attempt < MAX_ATTEMPTS && RETRYABLE.some((code) => isPrismaError(e, code))) continue;
      throw e;
    }
  }
}
