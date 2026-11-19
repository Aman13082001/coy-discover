import { describe, expect, it } from "vitest";
import { canonicalPair } from "@/server/services/swipe";
import { feedOrderKey } from "@/server/services/feed";
import { swipeInputSchema } from "@/server/validation";
import { toPublicProfile } from "@/server/profiles";

describe("canonicalPair", () => {
  it("orders ids so the same pair always maps to the same row", () => {
    expect(canonicalPair("me", "ananya")).toEqual(["ananya", "me"]);
    expect(canonicalPair("ananya", "me")).toEqual(["ananya", "me"]);
  });
});

describe("feedOrderKey", () => {
  it("is deterministic and viewer-specific", () => {
    expect(feedOrderKey("me", "zoya")).toBe(feedOrderKey("me", "zoya"));
    expect(feedOrderKey("me", "zoya")).not.toBe(feedOrderKey("other", "zoya"));
  });
});

describe("swipeInputSchema", () => {
  it("accepts LIKE and PASS", () => {
    expect(swipeInputSchema.parse({ profileId: "zoya", action: "LIKE" })).toEqual({ profileId: "zoya", action: "LIKE" });
    expect(swipeInputSchema.parse({ profileId: " zoya ", action: "PASS" }).profileId).toBe("zoya");
  });

  it.each([
    [{}],
    [{ profileId: "zoya" }],
    [{ profileId: "", action: "LIKE" }],
    [{ profileId: "zoya", action: "SUPERLIKE" }],
    [{ profileId: "zoya", action: "like" }],
    [{ profileId: 42, action: "LIKE" }],
    [{ profileId: "zoya", action: "LIKE", fromId: "someone-else" }],
  ])("rejects %j", (input) => {
    expect(swipeInputSchema.safeParse(input).success).toBe(false);
  });
});

describe("toPublicProfile", () => {
  it("copies only public fields and parses interests", () => {
    const row = {
      id: "x", name: "X", age: 22, photoUrl: "/p.jpg", bio: "b", location: "l",
      interests: '["A","B"]', secret: "should not appear",
    };
    const out = toPublicProfile(row);
    expect(Object.keys(out).sort()).toEqual(["age", "bio", "id", "interests", "location", "name", "photoUrl"]);
    expect(out.interests).toEqual(["A", "B"]);
  });

  it("tolerates malformed interests", () => {
    const out = toPublicProfile({ id: "x", name: "X", age: 22, photoUrl: "", bio: "", location: "", interests: "nope" });
    expect(out.interests).toEqual([]);
  });
});
