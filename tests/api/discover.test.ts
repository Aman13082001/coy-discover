import { PrismaClient } from "@prisma/client";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { callFeed, callMatches, callSwipe, prisma, resetDb } from "../setup/helpers";
import { recordSwipe } from "@/server/services/swipe";
import { getFeed } from "@/server/services/feed";
import { CURRENT_USER_ID as ME } from "@/server/config";
import { incomingSwipes, seedProfiles } from "../../prisma/seed-data";

const LIKED_ME = incomingSwipes.filter((s) => s.action === "LIKE").map((s) => s.fromId);
const PASSED_ME = incomingSwipes.filter((s) => s.action === "PASS").map((s) => s.fromId);
const NEUTRAL = seedProfiles.map((p) => p.id).filter((id) => !LIKED_ME.includes(id) && !PASSED_ME.includes(id));

const PUBLIC_KEYS = ["age", "bio", "id", "interests", "location", "name", "photoUrl"];

const feedIds = async () => ((await callFeed()).body.data.profiles as { id: string }[]).map((p) => p.id);

beforeEach(resetDb);
afterAll(() => prisma.$disconnect());

describe("GET /api/feed", () => {
  it("returns every other seeded profile, excluding the current user", async () => {
    const { status, body } = await callFeed();
    expect(status).toBe(200);
    const ids = body.data.profiles.map((p: { id: string }) => p.id);
    expect(ids).toHaveLength(seedProfiles.length);
    expect(ids).not.toContain(ME);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("returns only public profile fields", async () => {
    const { body } = await callFeed();
    for (const p of body.data.profiles) expect(Object.keys(p).sort()).toEqual(PUBLIC_KEYS);
  });

  it("excludes liked and passed profiles", async () => {
    await callSwipe({ profileId: NEUTRAL[0], action: "LIKE" });
    await callSwipe({ profileId: NEUTRAL[1], action: "PASS" });
    const ids = await feedIds();
    expect(ids).not.toContain(NEUTRAL[0]);
    expect(ids).not.toContain(NEUTRAL[1]);
    expect(ids).toHaveLength(seedProfiles.length - 2);
  });

  it("returns an empty list once everyone has been swiped", async () => {
    for (const p of seedProfiles) {
      expect((await callSwipe({ profileId: p.id, action: "PASS" })).status).toBe(201);
    }
    const { status, body } = await callFeed();
    expect(status).toBe(200);
    expect(body).toEqual({ data: { profiles: [] } });
  });

  it("is deterministic across calls", async () => {
    expect(await feedIds()).toEqual(await feedIds());
  });
});

describe("POST /api/swipe", () => {
  it("records a LIKE and returns 201 with no match when not reciprocated", async () => {
    const { status, body } = await callSwipe({ profileId: NEUTRAL[0], action: "LIKE" });
    expect(status).toBe(201);
    expect(body).toEqual({ data: { swipe: { profileId: NEUTRAL[0], action: "LIKE" }, match: null } });
    const row = await prisma.swipe.findUnique({ where: { fromId_toId: { fromId: ME, toId: NEUTRAL[0] } } });
    expect(row?.action).toBe("LIKE");
  });

  it("records a PASS", async () => {
    const { status, body } = await callSwipe({ profileId: NEUTRAL[0], action: "PASS" });
    expect(status).toBe(201);
    expect(body.data.match).toBeNull();
    const row = await prisma.swipe.findUnique({ where: { fromId_toId: { fromId: ME, toId: NEUTRAL[0] } } });
    expect(row?.action).toBe("PASS");
  });

  it("creates a match when the other person already liked the user", async () => {
    const target = LIKED_ME[0];
    const { status, body } = await callSwipe({ profileId: target, action: "LIKE" });
    expect(status).toBe(201);
    expect(body.data.match).toMatchObject({ id: expect.any(String), createdAt: expect.any(String) });
    expect(body.data.match.profile.id).toBe(target);
    expect(Object.keys(body.data.match.profile).sort()).toEqual(PUBLIC_KEYS);
    const [low, high] = [ME, target].sort();
    expect(await prisma.match.count({ where: { userLowId: low, userHighId: high } })).toBe(1);
  });

  it("never creates a match on PASS, even if the other person liked the user", async () => {
    const { body } = await callSwipe({ profileId: LIKED_ME[0], action: "PASS" });
    expect(body.data.match).toBeNull();
    expect(await prisma.match.count({ where: { OR: [{ userLowId: ME }, { userHighId: ME }] } })).toBe(0);
  });

  it("does not match when the other person PASSED the user", async () => {
    const { body } = await callSwipe({ profileId: PASSED_ME[0], action: "LIKE" });
    expect(body.data.match).toBeNull();
  });

  it("matches when the like arrives second from the other side", async () => {
    await callSwipe({ profileId: NEUTRAL[0], action: "LIKE" });
    const result = await recordSwipe(NEUTRAL[0], { profileId: ME, action: "LIKE" });
    expect(result.match?.profile.id).toBe(ME);
    expect((await callMatches()).body.data.matches.map((m: { profile: { id: string } }) => m.profile.id)).toContain(NEUTRAL[0]);
  });

  it("rejects a duplicate swipe with 409 and keeps the original", async () => {
    await callSwipe({ profileId: NEUTRAL[0], action: "PASS" });
    const again = await callSwipe({ profileId: NEUTRAL[0], action: "LIKE" });
    expect(again.status).toBe(409);
    expect(again.body.error.code).toBe("ALREADY_SWIPED");
    const rows = await prisma.swipe.findMany({ where: { fromId: ME, toId: NEUTRAL[0] } });
    expect(rows).toHaveLength(1);
    expect(rows[0].action).toBe("PASS");
  });

  it("returns 404 for an unknown profile and stores nothing", async () => {
    const { status, body } = await callSwipe({ profileId: "does-not-exist", action: "LIKE" });
    expect(status).toBe(404);
    expect(body.error.code).toBe("PROFILE_NOT_FOUND");
    expect(await prisma.swipe.count({ where: { fromId: ME } })).toBe(0);
  });

  it("rejects self-swipes", async () => {
    const { status, body } = await callSwipe({ profileId: ME, action: "LIKE" });
    expect(status).toBe(400);
    expect(body.error.code).toBe("SELF_SWIPE");
  });

  it.each([
    ["missing fields", {}],
    ["bad action", { profileId: "zoya", action: "SUPERLIKE" }],
    ["empty id", { profileId: "", action: "LIKE" }],
    ["unknown key", { profileId: "zoya", action: "LIKE", fromId: "zoya" }],
    ["malformed JSON", "{not json"],
  ])("rejects invalid input: %s", async (_label, body) => {
    const res = await callSwipe(body);
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("the database refuses self-swipes and non-canonical matches even if code is bypassed", async () => {
    await expect(prisma.swipe.create({ data: { fromId: ME, toId: ME, action: "LIKE" } })).rejects.toThrow();
    await expect(prisma.swipe.create({ data: { fromId: ME, toId: "zoya", action: "MAYBE" } })).rejects.toThrow();
    await expect(prisma.match.create({ data: { userLowId: "zoya", userHighId: "me" } })).rejects.toThrow();
  });
});

describe("GET /api/matches", () => {
  it("is empty for a fresh user", async () => {
    const { status, body } = await callMatches();
    expect(status).toBe(200);
    expect(body.data.matches).toEqual([]);
    expect(body.data.me.id).toBe(ME);
  });

  it("returns only mutual matches, not one-sided likes", async () => {
    await callSwipe({ profileId: LIKED_ME[0], action: "LIKE" }); // mutual
    await callSwipe({ profileId: LIKED_ME[1], action: "LIKE" }); // mutual
    await callSwipe({ profileId: NEUTRAL[0], action: "LIKE" }); // one-sided (mine)
    const { body } = await callMatches();
    const ids = body.data.matches.map((m: { profile: { id: string } }) => m.profile.id).sort();
    expect(ids).toEqual([LIKED_ME[0], LIKED_ME[1]].sort());
    for (const m of body.data.matches) {
      expect(Object.keys(m).sort()).toEqual(["createdAt", "id", "profile"]);
      expect(Object.keys(m.profile).sort()).toEqual(PUBLIC_KEYS);
    }
  });

  it("does not include matches between other people", async () => {
    // seed contains a mutual match between ananya and kabir
    expect(await prisma.match.count()).toBe(1);
    expect((await callMatches()).body.data.matches).toEqual([]);
  });
});

describe("persistence", () => {
  it("swipes and matches survive a new database client (simulated restart/reload)", async () => {
    await callSwipe({ profileId: LIKED_ME[0], action: "LIKE" });
    await callSwipe({ profileId: NEUTRAL[0], action: "PASS" });

    const fresh = new PrismaClient();
    try {
      const feed = (await getFeed(ME, fresh)).map((p) => p.id);
      expect(feed).not.toContain(LIKED_ME[0]);
      expect(feed).not.toContain(NEUTRAL[0]);
      const [low, high] = [ME, LIKED_ME[0]].sort();
      expect(await fresh.match.count({ where: { userLowId: low, userHighId: high } })).toBe(1);
    } finally {
      await fresh.$disconnect();
    }
  });
});

describe("concurrency", () => {
  it("concurrent duplicate LIKEs store one swipe and at most one match", async () => {
    const target = LIKED_ME[0];
    const results = await Promise.all(Array.from({ length: 6 }, () => callSwipe({ profileId: target, action: "LIKE" })));
    const statuses = results.map((r) => r.status).sort();
    expect(statuses.filter((s) => s === 201)).toHaveLength(1);
    expect(statuses.filter((s) => s === 409)).toHaveLength(5);
    expect(await prisma.swipe.count({ where: { fromId: ME, toId: target } })).toBe(1);
    const [low, high] = [ME, target].sort();
    expect(await prisma.match.count({ where: { userLowId: low, userHighId: high } })).toBe(1);
  });

  it("concurrent mutual likes from both sides create exactly one match", async () => {
    const target = NEUTRAL[0];
    await Promise.all([
      recordSwipe(ME, { profileId: target, action: "LIKE" }),
      recordSwipe(target, { profileId: ME, action: "LIKE" }),
    ]);
    const [low, high] = [ME, target].sort();
    expect(await prisma.match.count({ where: { userLowId: low, userHighId: high } })).toBe(1);
  });

  it("concurrent swipes on different profiles all succeed", async () => {
    const targets = NEUTRAL.slice(0, 5);
    const results = await Promise.all(targets.map((id) => callSwipe({ profileId: id, action: "LIKE" })));
    expect(results.every((r) => r.status === 201)).toBe(true);
    expect(await prisma.swipe.count({ where: { fromId: ME } })).toBe(5);
  });
});
