import { getCurrentUserId } from "@/server/config";
import { ok, route } from "@/server/http";
import { getMatches, getProfile } from "@/server/services/matches";

export const dynamic = "force-dynamic";

export const GET = route(async () => {
  const userId = getCurrentUserId();
  const [me, matches] = await Promise.all([getProfile(userId), getMatches(userId)]);
  return ok({ me, matches });
});
