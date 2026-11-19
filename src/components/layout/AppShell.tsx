"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LockKeyhole } from "lucide-react";
import { NAV_ITEMS, isActive } from "./nav-items";
import { Wordmark } from "./Wordmark";

/**
 * Mobile: content + fixed bottom tab bar.
 * Desktop (lg+): a left rail with the wordmark and tabs; content is centred in the remaining space.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-dvh lg:flex">
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-line bg-paper px-6 py-8 lg:flex">
        <Wordmark />
        <nav aria-label="Primary" className="mt-10 flex flex-col gap-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-semibold transition-colors ${
                  active ? "bg-ink text-paper" : "text-ink-soft hover:bg-paper-deep hover:text-ink"
                }`}
              >
                <Icon className="size-[18px]" strokeWidth={2.2} aria-hidden />
                {label}
              </Link>
            );
          })}
        </nav>
        <p className="mt-auto flex gap-2 text-[13px] leading-relaxed text-ink-faint">
          <LockKeyhole className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          Nobody sees who liked them unless it&apos;s mutual.
        </p>
      </aside>

      <div className="flex min-h-dvh min-w-0 flex-1 flex-col pb-[calc(4.25rem+env(safe-area-inset-bottom))] lg:pb-0">
        {children}
      </div>

      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
      >
        <ul className="mx-auto grid h-[4.25rem] max-w-md grid-cols-3">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`flex h-full flex-col items-center justify-center gap-1 text-[11px] font-bold tracking-wide transition-colors ${
                    active ? "text-ink" : "text-ink-faint hover:text-ink-soft"
                  }`}
                >
                  <Icon className={`size-[22px] ${active && href === "/matches" ? "fill-coral text-coral" : ""}`} strokeWidth={active ? 2.4 : 2} aria-hidden />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
