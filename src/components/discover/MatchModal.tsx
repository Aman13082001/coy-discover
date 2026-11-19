"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Heart } from "lucide-react";
import { useEffect, useRef } from "react";
import type { MatchSummary, PublicProfile } from "@/lib/types";
import { ProfilePhoto } from "@/components/profile/ProfilePhoto";

interface Props {
  me: PublicProfile;
  match: MatchSummary;
  onKeepSwiping: () => void;
  onViewMatches: () => void;
}

// Fixed positions so server and client render identically.
const HEARTS = [
  { left: "8%", delay: "0s", size: 14 },
  { left: "20%", delay: "0.5s", size: 10 },
  { left: "33%", delay: "0.2s", size: 18 },
  { left: "47%", delay: "0.9s", size: 12 },
  { left: "60%", delay: "0.35s", size: 16 },
  { left: "72%", delay: "0.75s", size: 10 },
  { left: "85%", delay: "0.1s", size: 14 },
  { left: "93%", delay: "1.1s", size: 11 },
];

export function MatchModal({ me, match, onKeepSwiping, onViewMatches }: Props) {
  const reduceMotion = useReducedMotion();
  const primaryRef = useRef<HTMLButtonElement>(null);
  const { profile } = match;

  useEffect(() => {
    primaryRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onKeepSwiping();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onKeepSwiping]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-[#1f1a17]/75 p-4 backdrop-blur-[3px]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {!reduceMotion && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-full" aria-hidden>
          {HEARTS.map((h, i) => (
            <Heart
              key={i}
              className="absolute bottom-[-24px] animate-rise fill-coral text-coral opacity-0"
              style={{ left: h.left, animationDelay: h.delay, width: h.size, height: h.size }}
              strokeWidth={0}
            />
          ))}
        </div>
      )}

      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="match-title"
        aria-describedby="match-desc"
        className="relative w-full max-w-sm rounded-[2rem] bg-paper px-7 pb-7 pt-9 text-center shadow-2xl"
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
      >
        <div className="relative mx-auto flex h-32 w-60 items-center justify-center">
          <motion.div
            className="relative size-28 -rotate-6 overflow-hidden rounded-full border-4 border-paper shadow-[var(--shadow-float)]"
            initial={reduceMotion ? false : { x: -40, opacity: 0 }}
            animate={{ x: 10, opacity: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 260, damping: 20 }}
          >
            <ProfilePhoto src={me.photoUrl} name={me.name} sizes="112px" />
          </motion.div>
          <motion.div
            className="relative size-28 rotate-6 overflow-hidden rounded-full border-4 border-paper shadow-[var(--shadow-float)]"
            initial={reduceMotion ? false : { x: 40, opacity: 0 }}
            animate={{ x: -10, opacity: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 260, damping: 20 }}
          >
            <ProfilePhoto src={profile.photoUrl} name={profile.name} sizes="112px" />
          </motion.div>
          <motion.div
            className="absolute bottom-0 left-1/2 flex size-11 -translate-x-1/2 items-center justify-center rounded-full border-4 border-paper bg-coral"
            initial={reduceMotion ? false : { scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.35, type: "spring", stiffness: 400, damping: 14 }}
            aria-hidden
          >
            <Heart className="size-4.5 fill-white text-white" strokeWidth={0} />
          </motion.div>
        </div>

        <h2 id="match-title" className="mt-6 font-display text-[40px] font-semibold leading-none tracking-tight">
          It&apos;s a match!
        </h2>
        <p id="match-desc" className="mx-auto mt-3 max-w-[16rem] text-[15px] leading-relaxed text-ink-soft">
          You and <span className="font-bold text-ink">{profile.name}</span> liked each other. Now you both know.
        </p>

        <div className="mt-7 flex flex-col gap-2.5">
          <button
            ref={primaryRef}
            type="button"
            onClick={onViewMatches}
            className="rounded-full bg-ink px-5 py-3.5 text-[15px] font-bold text-paper transition hover:bg-ink/85 active:scale-[0.98]"
          >
            See your matches
          </button>
          <button
            type="button"
            onClick={onKeepSwiping}
            className="rounded-full px-5 py-3 text-[15px] font-bold text-ink-soft transition hover:bg-paper-deep hover:text-ink"
          >
            Keep discovering
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
