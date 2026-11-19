"use client";

import { AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";
import { useFeed } from "@/hooks/useFeed";
import { useSwipe } from "@/hooks/useSwipe";
import type { PublicProfile, SwipeAction } from "@/lib/types";
import { PageHeader } from "@/components/layout/PageHeader";
import { CardSkeleton, EmptyFeedState, ErrorState } from "@/components/states/States";
import { MatchModal } from "./MatchModal";
import { SwipeActions } from "./SwipeActions";
import { SwipeCard } from "./SwipeCard";
import { SwipeFeedbackToast } from "./SwipeFeedbackToast";

export function DiscoverScreen({ me }: { me: PublicProfile }) {
  const router = useRouter();
  const { status, profiles, setProfiles, reload } = useFeed();
  const { swipe, match, dismissMatch, error, dismissError, feedback, exitDirection } = useSwipe(setProfiles);

  const top = profiles[0];
  const visible = profiles.slice(0, 2);

  const swipeTop = useCallback(
    (action: SwipeAction) => {
      if (top) void swipe(top, action);
    },
    [top, swipe],
  );

  // Keyboard: ← pass, → like (ignored while the match dialog is open).
  useEffect(() => {
    if (match || status !== "ready") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "ArrowRight") swipeTop("LIKE");
      else if (e.key === "ArrowLeft") swipeTop("PASS");
      else return;
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [match, status, swipeTop]);

  return (
    <main className="flex flex-1 flex-col">
      <PageHeader title="Discover" subtitle="Like or pass. They only find out if it's mutual." width="narrow" />

      <div className="mx-auto flex w-full max-w-[420px] flex-1 flex-col px-4 pb-5 lg:flex-none lg:pb-10 lg:pt-2">
        <div className="relative min-h-[300px] flex-1 lg:h-[600px] lg:flex-none">
          <SwipeFeedbackToast feedback={feedback} />

          {status === "loading" && <CardSkeleton />}
          {status === "error" && (
            <ErrorState message="We couldn't load profiles. Check your connection and try again." onRetry={reload} />
          )}
          {status === "ready" && profiles.length === 0 && <EmptyFeedState />}
          {status === "ready" && (
            <AnimatePresence custom={exitDirection} initial={false}>
              {visible
                .slice()
                .reverse()
                .map((profile) => (
                  <SwipeCard
                    key={profile.id}
                    profile={profile}
                    isTop={profile.id === top?.id}
                    onSwipe={(action) => void swipe(profile, action)}
                  />
                ))}
            </AnimatePresence>
          )}
        </div>

        {error && (
          <div role="alert" className="mt-4 flex items-start gap-3 rounded-2xl border border-coral/25 bg-coral-soft px-4 py-3 text-sm font-medium text-coral-deep">
            <span className="flex-1">{error}</span>
            <button type="button" onClick={dismissError} aria-label="Dismiss error" className="-m-1 rounded-full p-1 hover:bg-coral/10">
              <X className="size-4" strokeWidth={2.5} />
            </button>
          </div>
        )}

        {status === "ready" && profiles.length > 0 && <SwipeActions profile={top} onSwipe={swipeTop} />}
      </div>

      <AnimatePresence>
        {match && (
          <MatchModal
            me={me}
            match={match}
            onKeepSwiping={dismissMatch}
            onViewMatches={() => {
              dismissMatch();
              router.push("/matches");
            }}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
