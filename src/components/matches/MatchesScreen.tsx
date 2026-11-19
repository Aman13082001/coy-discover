"use client";

import { LockKeyhole } from "lucide-react";
import { useMatches } from "@/hooks/useMatches";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyMatchesState, ErrorState } from "@/components/states/States";
import { MatchCard } from "./MatchCard";

export function MatchesScreen() {
  const { status, matches, reload } = useMatches();

  const subtitle =
    status === "ready"
      ? matches.length === 0
        ? "Mutual likes only"
        : `${matches.length} mutual ${matches.length === 1 ? "match" : "matches"}`
      : undefined;

  return (
    <main className="flex flex-1 flex-col">
      <PageHeader title="Matches" subtitle={subtitle} />

      <div className="mx-auto w-full max-w-5xl flex-1 px-4 pb-8 lg:px-10">
        <p className="mb-5 flex items-center gap-2 rounded-xl bg-paper-deep px-3.5 py-2.5 text-[13px] font-medium text-ink-soft">
          <LockKeyhole className="size-3.5 shrink-0" strokeWidth={2.4} aria-hidden />
          Only mutual likes show up here. Nobody sees who liked them unless it&apos;s mutual.
        </p>

        {status === "loading" && (
          <ul role="status" aria-label="Loading matches" className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, i) => (
              <li key={i} className="aspect-[4/6] animate-pulse rounded-2xl bg-paper-deep" />
            ))}
          </ul>
        )}

        {status === "error" && (
          <div className="mx-auto h-[420px] max-w-[420px]">
            <ErrorState message="We couldn't load your matches. Check your connection and try again." onRetry={reload} />
          </div>
        )}

        {status === "ready" && matches.length === 0 && (
          <div className="mx-auto h-[420px] max-w-[420px]">
            <EmptyMatchesState />
          </div>
        )}

        {status === "ready" && matches.length > 0 && (
          <ul aria-label="Your matches" className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-4">
            {matches.map((m) => (
              <MatchCard key={m.id} match={m} />
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
