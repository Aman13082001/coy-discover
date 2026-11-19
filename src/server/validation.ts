import { z } from "zod";

/** POST /swipe body. Strict: unknown keys (e.g. a spoofed fromId) are rejected. */
export const swipeInputSchema = z.strictObject({
  profileId: z
    .string({ error: "profileId is required" })
    .trim()
    .min(1, { error: "profileId is required" })
    .max(64, { error: "profileId is too long" }),
  action: z.enum(["LIKE", "PASS"], { error: "action must be LIKE or PASS" }),
});

export type SwipeInput = z.infer<typeof swipeInputSchema>;
