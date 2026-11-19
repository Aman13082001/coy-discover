"use client";

import { useCallback, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { ApiError, api } from "@/lib/api";
import type { MatchSummary, PublicProfile, SwipeAction } from "@/lib/types";

export interface SwipeFeedback {
  key: number;
  action: SwipeAction;
  name: string;
}

/**
 * Optimistic swiping:
 *  1. the card leaves the stack immediately,
 *  2. the request is sent,
 *  3. on failure the card is put back on top and an error is shown, so a swipe is never silently lost.
 * A per-profile in-flight guard stops double submissions from fast clicks or drag + click.
 */
export function useSwipe(setProfiles: Dispatch<SetStateAction<PublicProfile[]>>) {
  const inFlight = useRef(new Set<string>());
  const feedbackSeq = useRef(0);
  // Queue, so two matches in quick succession each get their own "It's a match!" screen.
  const [matchQueue, setMatchQueue] = useState<MatchSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<SwipeFeedback | null>(null);
  const [exitDirection, setExitDirection] = useState<1 | -1>(1);

  const swipe = useCallback(
    async (profile: PublicProfile, action: SwipeAction) => {
      if (inFlight.current.has(profile.id)) return;
      inFlight.current.add(profile.id);

      setError(null);
      setExitDirection(action === "LIKE" ? 1 : -1);
      setFeedback({ key: ++feedbackSeq.current, action, name: profile.name });
      setProfiles((prev) => prev.filter((p) => p.id !== profile.id));

      try {
        const result = await api.swipe(profile.id, action);
        const match = result.match;
        if (match) setMatchQueue((q) => (q.some((m) => m.id === match.id) ? q : [...q, match]));
      } catch (e) {
        // A conflicting earlier swipe exists, or the profile no longer exists: nothing to restore.
        // (An identical retry is answered with 200 and its original result, handled above.)
        if (e instanceof ApiError && (e.code === "ALREADY_SWIPED" || e.code === "PROFILE_NOT_FOUND")) return;
        setProfiles((prev) => (prev.some((p) => p.id === profile.id) ? prev : [profile, ...prev]));
        setFeedback(null);
        setError(
          e instanceof ApiError && e.code === "NETWORK_ERROR"
            ? `You're offline, so ${profile.name} is back on top. Try again.`
            : `Couldn't save that swipe, so ${profile.name} is back on top. Try again.`,
        );
      } finally {
        inFlight.current.delete(profile.id);
      }
    },
    [setProfiles],
  );

  return {
    swipe,
    match: matchQueue[0] ?? null,
    dismissMatch: useCallback(() => setMatchQueue((q) => q.slice(1)), []),
    error,
    dismissError: useCallback(() => setError(null), []),
    feedback,
    exitDirection,
  };
}
