import type { SwipeAction } from "@/lib/types";

/** Horizontal distance (px) past which a released card counts as a swipe. */
export const SWIPE_DISTANCE = 110;
/** A fast flick (px/s) counts as a swipe even if it travelled less far. */
export const SWIPE_VELOCITY = 650;
const MIN_FLICK_DISTANCE = 40;

/** Decides what a released drag means. null = snap back. */
export function resolveSwipe(offsetX: number, velocityX: number): SwipeAction | null {
  if (offsetX >= SWIPE_DISTANCE) return "LIKE";
  if (offsetX <= -SWIPE_DISTANCE) return "PASS";
  if (velocityX >= SWIPE_VELOCITY && offsetX > MIN_FLICK_DISTANCE) return "LIKE";
  if (velocityX <= -SWIPE_VELOCITY && offsetX < -MIN_FLICK_DISTANCE) return "PASS";
  return null;
}
