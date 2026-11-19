import { z } from "zod";

export const swipeInputSchema = z
  .object({
    profileId: z.string().trim().min(1, "profileId is required").max(64),
    action: z.enum(["LIKE", "PASS"], {
      errorMap: () => ({ message: "action must be LIKE or PASS" }),
    }),
  })
  .strict();

export type SwipeInput = z.infer<typeof swipeInputSchema>;
