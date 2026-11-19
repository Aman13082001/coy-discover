import Link from "next/link";
import { Heart, RefreshCw, Sparkles, WifiOff } from "lucide-react";

function StatePanel({
  icon,
  title,
  children,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center rounded-[var(--radius-card)] border border-dashed border-line bg-card/60 px-8 py-12 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-coral-soft text-coral">{icon}</div>
      <h2 className="mt-5 font-display text-2xl font-semibold tracking-tight">{title}</h2>
      <p className="mt-2 max-w-[17rem] text-[15px] leading-relaxed text-ink-soft">{children}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

const primaryButton =
  "inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-paper transition hover:bg-ink/85 active:scale-[0.98]";

export function EmptyFeedState() {
  return (
    <StatePanel
      icon={<Sparkles className="size-6" strokeWidth={2.2} />}
      title="You're all caught up"
      action={
        <Link href="/matches" className={primaryButton}>
          <Heart className="size-4" strokeWidth={2.4} /> See your matches
        </Link>
      }
    >
      You&apos;ve seen everyone for now. New people will show up here as they join.
    </StatePanel>
  );
}

export function EmptyMatchesState() {
  return (
    <StatePanel
      icon={<Heart className="size-6" strokeWidth={2.2} />}
      title="No matches yet"
      action={
        <Link href="/discover" className={primaryButton}>
          Start discovering
        </Link>
      }
    >
      When someone you like likes you back, they&apos;ll appear here. One-sided likes stay private.
    </StatePanel>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <StatePanel
      icon={<WifiOff className="size-6" strokeWidth={2.2} />}
      title="Something went wrong"
      action={
        <button type="button" onClick={onRetry} className={primaryButton}>
          <RefreshCw className="size-4" strokeWidth={2.4} /> Try again
        </button>
      }
    >
      {message}
    </StatePanel>
  );
}

export function CardSkeleton() {
  return (
    <div role="status" aria-label="Loading profiles" className="h-full w-full animate-pulse overflow-hidden rounded-[var(--radius-card)] bg-paper-deep">
      <div className="flex h-full flex-col justify-end gap-3 p-6">
        <div className="h-8 w-2/5 rounded-lg bg-line" />
        <div className="h-4 w-1/3 rounded bg-line" />
        <div className="h-4 w-4/5 rounded bg-line" />
        <div className="flex gap-2 pt-2">
          <div className="h-7 w-16 rounded-full bg-line" />
          <div className="h-7 w-20 rounded-full bg-line" />
          <div className="h-7 w-14 rounded-full bg-line" />
        </div>
      </div>
    </div>
  );
}
