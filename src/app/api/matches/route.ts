import { getCurrentUserId } from "@/server/config";
import { ok, route } from "@/server/http";
import { getMatches } from "@/server/services/matches";

export const dynamic = "force-dynamic";

export const GET = route(async () => {
  const matches = await getMatches(getCurrentUserId());
  return ok({ matches });
});
