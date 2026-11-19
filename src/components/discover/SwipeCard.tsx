"use client";

import { motion, useIsPresent, useMotionValue, useReducedMotion, useTransform, type Variants } from "framer-motion";
import { Heart, X } from "lucide-react";
import type { PublicProfile, SwipeAction } from "@/lib/types";
import { SWIPE_DISTANCE, resolveSwipe } from "@/lib/swipe-gesture";
import { ProfileCard } from "./ProfileCard";

interface Props {
  profile: PublicProfile;
  isTop: boolean;
  onSwipe: (action: SwipeAction) => void;
}

const variants: Variants = {
  exit: (direction: 1 | -1) => ({
    x: direction * 620,
    rotate: direction * 18,
    opacity: 0,
    transition: { duration: 0.38, ease: [0.32, 0.72, 0, 1] },
  }),
  exitReduced: { opacity: 0, transition: { duration: 0.15 } },
};

/**
 * A draggable card. Rotation and the LIKE / PASS stamps follow the drag position.
 * Released past the threshold it swipes; otherwise it springs back to the centre.
 */
export function SwipeCard({ profile, isTop: isTopProp, onSwipe }: Props) {
  const reduceMotion = useReducedMotion();
  // A card that is animating out keeps its last props; treat it as inert so it can't be swiped twice.
  const isPresent = useIsPresent();
  const isTop = isTopProp && isPresent;
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-260, 260], [-14, 14]);
  const likeOpacity = useTransform(x, [24, SWIPE_DISTANCE], [0, 1]);
  const passOpacity = useTransform(x, [-SWIPE_DISTANCE, -24], [1, 0]);

  return (
    <motion.div
      data-testid={!isPresent ? "exiting-card" : isTop ? "top-card" : "next-card"}
      className={`absolute inset-0 ${isTop ? "cursor-grab active:cursor-grabbing" : "pointer-events-none"}`}
      style={{ x, rotate: reduceMotion ? 0 : rotate, zIndex: !isPresent ? 3 : isTop ? 2 : 1 }}
      drag={isTop ? "x" : false}
      dragSnapToOrigin
      dragElastic={0.85}
      dragTransition={{ bounceStiffness: 420, bounceDamping: 28 }}
      onDragEnd={(_, info) => {
        const action = resolveSwipe(info.offset.x, info.velocity.x);
        if (action) onSwipe(action);
      }}
      variants={variants}
      initial={reduceMotion ? { opacity: 0 } : { scale: 0.94, y: 18, opacity: 0 }}
      // x: 0 also resets a card that is restored (after a failed swipe) while still mid-exit.
      animate={isTopProp ? { x: 0, scale: 1, y: 0, opacity: 1 } : { x: 0, scale: 0.95, y: 14, opacity: 1 }}
      exit={reduceMotion ? "exitReduced" : "exit"}
      transition={{ type: "spring", stiffness: 320, damping: 30 }}
      aria-hidden={!isTop}
    >
      <ProfileCard profile={profile} priority={isTop} />

      {isTop && (
        <>
          <motion.div
            style={{ opacity: likeOpacity }}
            className="pointer-events-none absolute left-5 top-5 flex -rotate-[10deg] items-center gap-1.5 rounded-xl border-[2.5px] border-white bg-coral px-3.5 py-1.5 text-lg font-extrabold tracking-[0.12em] text-white shadow-[var(--shadow-float)]"
            aria-hidden
          >
            <Heart className="size-4 fill-white" strokeWidth={0} /> LIKE
          </motion.div>
          <motion.div
            style={{ opacity: passOpacity }}
            className="pointer-events-none absolute right-5 top-5 flex rotate-[10deg] items-center gap-1.5 rounded-xl border-[2.5px] border-ink bg-white px-3.5 py-1.5 text-lg font-extrabold tracking-[0.12em] text-ink shadow-[var(--shadow-float)]"
            aria-hidden
          >
            <X className="size-4" strokeWidth={3.5} /> PASS
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
