import { getCurrentUserId } from "@/server/config";
import { fail, ok, route } from "@/server/http";
import { recordSwipe } from "@/server/services/swipe";
import { swipeInputSchema } from "@/server/validation";

export const dynamic = "force-dynamic";

export const POST = route(async (request: Request) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail(400, "VALIDATION_ERROR", "Request body must be valid JSON.");
  }
  const input = swipeInputSchema.parse(body);
  const { result, created } = await recordSwipe(getCurrentUserId(), input);
  // 201 for a new swipe; 200 when the identical swipe already existed (idempotent retry).
  return ok(result, created ? 201 : 200);
});
