import { describe, expect, it } from "vitest";
import { SWIPE_DISTANCE, SWIPE_VELOCITY, resolveSwipe } from "@/lib/swipe-gesture";

describe("resolveSwipe (drag release decision)", () => {
  it("likes when dragged right past the threshold", () => {
    expect(resolveSwipe(SWIPE_DISTANCE, 0)).toBe("LIKE");
    expect(resolveSwipe(300, -100)).toBe("LIKE");
  });

  it("passes when dragged left past the threshold", () => {
    expect(resolveSwipe(-SWIPE_DISTANCE, 0)).toBe("PASS");
  });

  it("snaps back below the threshold", () => {
    expect(resolveSwipe(SWIPE_DISTANCE - 1, 0)).toBeNull();
    expect(resolveSwipe(-60, 100)).toBeNull();
    expect(resolveSwipe(0, 0)).toBeNull();
  });

  it("accepts a fast flick over a short distance", () => {
    expect(resolveSwipe(60, SWIPE_VELOCITY)).toBe("LIKE");
    expect(resolveSwipe(-60, -SWIPE_VELOCITY)).toBe("PASS");
  });

  it("ignores a fast flick that barely moved, or moved against its velocity", () => {
    expect(resolveSwipe(10, 2000)).toBeNull();
    expect(resolveSwipe(-60, 2000)).toBeNull();
  });
});
