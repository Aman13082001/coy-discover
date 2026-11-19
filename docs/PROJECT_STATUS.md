# Project status

_Last updated: 2026-11-19_

## Overall
Part B (Discover app) is **complete and verified locally**. Part A: the candidate has logged in and the home screen is documented from their screenshots; adding a crush, email verification, the invite link and the extra-slots screen are still to be written up. See the checklist in [COY_PRODUCT_ANALYSIS.md](COY_PRODUCT_ANALYSIS.md).

| Phase | Status |
|---|---|
| 1–3 Inspection, architecture, scaffolding | Done |
| 4 Schema, migration (CHECK constraints), deterministic seed | Done |
| 5 Services + APIs (feed, swipe, matches, health) | Done |
| 6 Backend, privacy and concurrency tests | Done |
| 7–9 Layout, Discover deck + gestures, match overlay, Matches screen | Done |
| 10–11 Component tests, E2E user journey | Done |
| 12 Responsive and visual refinement (360 px, tablet, desktop screenshots reviewed) | Done |
| 13 Independent security/privacy review: no leaks found; 5 bugs found and fixed (see log) | Done |
| 14 Part A analysis | Done (public pages only) |
| 15 Documentation | Done |
| 16 GitHub | Done: https://github.com/Aman13082001/coy-discover (public, branch `master`). A fresh clone was verified: `npm ci` → `npm run setup` → 80 tests pass |
| 17 Deployment | **Not done**: no hosting credentials (no Vercel CLI/login, no hosted Postgres) |

## Working (verified)
Tab bar (Home blank, Discover, Matches); one card at a time; mouse drag, touch drag, buttons and arrow keys; rotate and stamps while dragging; snap back below the threshold; exit animations; swipe feedback toast; match overlay (queued, focus-trapped); Matches list with dates; empty, loading and error states; optimistic rollback; idempotent retries; persistence across reloads; no horizontal overflow at 360/412/768/1440 px.

## Broken
Nothing known.

## Test results (latest run)
- Vitest: **80 passed** / 6 files
- Playwright: **10 passed, 2 skipped** (project-specific tests), desktop + Pixel 7, against a production build
- `tsc --noEmit`: clean · `eslint .`: clean · `next build`: success

## Known limitations
- Single hard-coded user (`"me"`), as the brief allows.
- SQLite only. The PostgreSQL path is documented but not exercised.
- Feed isn't paginated (31 profiles).
- The original assignment PDF isn't in the repo (it was a chat attachment). Copy it to `docs/assignment.pdf`.
- Timing side channels aren't measured (content and shape are tested).
- `npm audit` still reports two high-severity advisories that only major upgrades fix, and that don't touch runtime request data: `postcss` inside Next 15 (build-time processing of our own CSS; fixed in Next 16) and `deepmerge-ts` in the Prisma 6 CLI config loader (dev tooling; fixed in Prisma 7). The `zod` advisory was fixed by upgrading to Zod 4.

## Immediate next action
1. Explore Coy yourself and complete the Part A checklist.
2. Optionally deploy: create a Neon Postgres DB, switch the provider, and import into Vercel (README → Deployment).
