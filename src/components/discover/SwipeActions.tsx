import { Heart, X } from "lucide-react";
import type { PublicProfile, SwipeAction } from "@/lib/types";

interface Props {
  profile: PublicProfile | undefined;
  onSwipe: (action: SwipeAction) => void;
}

export function SwipeActions({ profile, onSwipe }: Props) {
  const disabled = !profile;
  return (
    <div className="flex flex-col items-center gap-3 pt-4 [@media(min-height:760px)]:pt-5">
      <div className="flex items-center justify-center gap-6">
        <button
          type="button"
          onClick={() => onSwipe("PASS")}
          disabled={disabled}
          aria-label={profile ? `Pass on ${profile.name}` : "Pass"}
          className="group flex size-16 items-center justify-center rounded-full border border-line bg-card text-ink shadow-[var(--shadow-float)] transition hover:-translate-y-0.5 hover:border-ink/30 active:scale-95 disabled:pointer-events-none disabled:opacity-40"
        >
          <X className="size-7 transition group-hover:scale-110" strokeWidth={2.6} aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => onSwipe("LIKE")}
          disabled={disabled}
          aria-label={profile ? `Like ${profile.name}` : "Like"}
          className="group flex size-[4.5rem] items-center justify-center rounded-full bg-coral text-white shadow-[0_10px_24px_-8px_rgb(229_72_77/0.65)] transition hover:-translate-y-0.5 hover:bg-coral-deep active:scale-95 disabled:pointer-events-none disabled:opacity-40"
        >
          <Heart className="size-8 fill-white transition group-hover:scale-110" strokeWidth={0} aria-hidden />
        </button>
      </div>
      <p className="hidden text-xs font-medium text-ink-faint lg:block" aria-hidden>
        <kbd className="rounded border border-line bg-card px-1.5 py-0.5 font-sans">←</kbd> pass
        <span className="mx-2">·</span>
        like <kbd className="rounded border border-line bg-card px-1.5 py-0.5 font-sans">→</kbd>
      </p>
    </div>
  );
}
