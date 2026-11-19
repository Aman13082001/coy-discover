import { getCurrentUserId } from "@/server/config";
import { ok, route } from "@/server/http";
import { getFeed } from "@/server/services/feed";

export const dynamic = "force-dynamic";

export const GET = route(async () => {
  const profiles = await getFeed(getCurrentUserId());
  return ok({ profiles });
});
