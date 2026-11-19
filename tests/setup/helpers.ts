import { seedDatabase } from "../../prisma/seed-lib";
import { prisma } from "@/server/db";
import { GET as feedGET } from "@/app/api/feed/route";
import { POST as swipePOST } from "@/app/api/swipe/route";
import { GET as matchesGET } from "@/app/api/matches/route";

export { prisma };

export const resetDb = () => seedDatabase(prisma);

export async function callFeed() {
  const res = await feedGET();
  return { status: res.status, body: await res.json() };
}

export async function callSwipe(body: unknown) {
  const res = await swipePOST(
    new Request("http://test.local/api/swipe", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
  );
  return { status: res.status, body: await res.json() };
}

export async function callMatches() {
  const res = await matchesGET();
  return { status: res.status, body: await res.json() };
}
