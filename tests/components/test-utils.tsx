import { vi } from "vitest";
import type { MatchSummary, PublicProfile } from "@/lib/types";

export const makeProfile = (id: string, name: string, extra: Partial<PublicProfile> = {}): PublicProfile => ({
  id,
  name,
  age: 24,
  photoUrl: `/profiles/${id}.jpg`,
  bio: `${name}'s bio`,
  location: "Bengaluru",
  interests: ["Coffee", "Hiking"],
  ...extra,
});

export const ME = makeProfile("me", "Arjun");
export const POOJA = makeProfile("pooja", "Pooja", { location: "Jaipur", interests: ["Textiles", "Pottery"] });
export const ROHAN = makeProfile("rohan", "Rohan");
export const ZOYA = makeProfile("zoya", "Zoya");

export const makeMatch = (profile: PublicProfile, createdAt = "2026-11-19T10:00:00.000Z"): MatchSummary => ({
  id: `m-${profile.id}`,
  createdAt,
  profile,
});

export const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

type Handler = (url: string, init?: RequestInit) => Response | Promise<Response>;

/** Replaces global fetch with a router over path → handler. Returns the mock for call assertions. */
export function mockFetch(routes: Record<string, Handler>) {
  const fn = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input.toString();
    const handler = routes[url];
    if (!handler) throw new Error(`Unmocked fetch: ${url}`);
    return handler(url, init);
  });
  vi.stubGlobal("fetch", fn);
  return fn;
}

export const swipeCalls = (fn: ReturnType<typeof mockFetch>) =>
  fn.mock.calls
    .filter(([url]) => url === "/api/swipe")
    .map(([, init]) => JSON.parse(String((init as RequestInit).body)));
