/**
 * Coy's core promise: nobody learns who liked them unless the like is mutual.
 * These tests compare full API responses with and without incoming likes in the
 * database. If any response differs, information about incoming likes is leaking.
 */
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { callFeed, callMatches, callSwipe, prisma, resetDb } from "../setup/helpers";
import { CURRENT_USER_ID as ME } from "@/server/config";
import { feedOrderKey } from "@/server/services/feed";
import { incomingSwipes, seedProfiles } from "../../prisma/seed-data";

const LIKED_ME = incomingSwipes.filter((s) => s.action === "LIKE").map((s) => s.fromId);
const NEUTRAL = seedProfiles.map((p) => p.id).filter((id) => !incomingSwipes.some((s) => s.fromId === id));

const removeIncomingLikes = () => prisma.swipe.deleteMany({ where: { toId: ME } });

/** Recursively collects every key in a JSON value. */
function allKeys(value: unknown, out = new Set<string>()): Set<string> {
  if (Array.isArray(value)) value.forEach((v) => allKeys(v, out));
  else if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value)) {
      out.add(k);
      allKeys(v, out);
    }
  }
  return out;
}

beforeEach(resetDb);
afterAll(() => prisma.$disconnect());

describe("privacy: incoming likes are never exposed", () => {
  it("Scenario A: the feed is byte-for-byte identical with or without incoming likes", async () => {
    const withLikes = JSON.stringify((await callFeed()).body);
    await removeIncomingLikes();
    const withoutLikes = JSON.stringify((await callFeed()).body);
    expect(withLikes).toBe(withoutLikes);
  });

  it("Scenario A: matches are identical with or without incoming (unreciprocated) likes", async () => {
    const withLikes = (await callMatches()).body;
    await removeIncomingLikes();
    expect((await callMatches()).body).toEqual(withLikes);
  });

  it("no response contains like-related fields anywhere", async () => {
    const forbidden = /liked|likes|incoming|admirer|interested|count|swipedBy|action/i;
    const responses = [
      (await callFeed()).body,
      (await callMatches()).body,
      (await callSwipe({ profileId: NEUTRAL[0], action: "PASS" })).body.data.match,
    ];
    for (const r of responses) {
      for (const key of allKeys(r)) expect(key).not.toMatch(forbidden);
    }
  });

  it("feed ordering does not depend on who liked the user", async () => {
    const before = (await callFeed()).body.data.profiles.map((p: { id: string }) => p.id);
    // Flip incoming likes: everyone who liked me now hasn't, and three neutral profiles now have.
    await removeIncomingLikes();
    for (const id of NEUTRAL.slice(0, 3)) await prisma.swipe.create({ data: { fromId: id, toId: ME, action: "LIKE" } });
    const after = (await callFeed()).body.data.profiles.map((p: { id: string }) => p.id);
    expect(after).toEqual(before);
  });

  it("feed order is exactly the id-hash order, a function of ids alone", async () => {
    const ids: string[] = (await callFeed()).body.data.profiles.map((p: { id: string }) => p.id);
    const expected = seedProfiles
      .map((p) => p.id)
      .sort((a, b) => feedOrderKey(ME, a).localeCompare(feedOrderKey(ME, b)));
    expect(ids).toEqual(expected);
  });

  it("Scenario B/C: PASS and unreciprocated LIKE responses look the same whether or not the other person liked you", async () => {
    // PASS on someone who liked me vs. PASS on someone who did not.
    const passLiker = await callSwipe({ profileId: LIKED_ME[0], action: "PASS" });
    const passNeutral = await callSwipe({ profileId: NEUTRAL[0], action: "PASS" });
    expect(passLiker.status).toBe(passNeutral.status);
    expect(passLiker.body).toEqual({ data: { swipe: { profileId: LIKED_ME[0], action: "PASS" }, match: null } });
    expect(passNeutral.body).toEqual({ data: { swipe: { profileId: NEUTRAL[0], action: "PASS" }, match: null } });
  });

  it("Scenario C: a one-sided like by the user does not appear in matches", async () => {
    await callSwipe({ profileId: NEUTRAL[0], action: "LIKE" });
    expect((await callMatches()).body.data.matches).toEqual([]);
  });

  it("Scenario D: LIKE responses have identical keys whether or not they create a match", async () => {
    const matched = await callSwipe({ profileId: LIKED_ME[0], action: "LIKE" });
    const unmatched = await callSwipe({ profileId: NEUTRAL[0], action: "LIKE" });
    expect(matched.status).toBe(201);
    expect(unmatched.status).toBe(201);
    expect(Object.keys(matched.body.data).sort()).toEqual(Object.keys(unmatched.body.data).sort());
    expect(matched.body.data.match).not.toBeNull();
    expect(unmatched.body.data.match).toBeNull();
  });

  it("a profile that passed the user is indistinguishable from one that did nothing", async () => {
    const passer = incomingSwipes.find((s) => s.action === "PASS")!.fromId;
    const a = await callSwipe({ profileId: passer, action: "LIKE" });
    const b = await callSwipe({ profileId: NEUTRAL[0], action: "LIKE" });
    expect(a.status).toBe(b.status);
    expect(a.body.data.match).toBeNull();
    expect(b.body.data.match).toBeNull();
  });

  it("there is no API route that lists incoming likes", async () => {
    const { readdirSync } = await import("node:fs");
    const routes = readdirSync("src/app/api", { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort();
    expect(routes).toEqual(["feed", "health", "matches", "swipe"]);
  });
});
