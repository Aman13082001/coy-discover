"use client";

import { ErrorState } from "@/components/states/States";

export default function RouteError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto flex w-full max-w-[420px] flex-1 flex-col px-4 py-10">
      <div className="h-[420px]">
        <ErrorState message="This page couldn't load. Make sure the database is set up, then try again." onRetry={reset} />
      </div>
    </main>
  );
}
