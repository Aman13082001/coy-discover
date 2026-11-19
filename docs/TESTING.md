# Testing

## Commands
```bash
npm test               # Vitest: unit + API integration + component (two projects: server, ui)
npm run test:e2e       # Playwright: builds the app, serves it on :3200 with prisma/e2e.db
npm run typecheck      # tsc --noEmit
npm run lint           # eslint .
npm run build          # production build
```
First-time E2E setup: `npx playwright install chromium`.

Test databases are throwaway files built from the migrations. They never touch `prisma/dev.db`:
- Vitest `server` project → `prisma/test.db`, recreated once per run (`tests/setup/global-db.ts`) and reseeded before every test.
- Playwright → `prisma/e2e.db`, migrated in `e2e/global-setup.ts` and reseeded before every test.

## Suites

### Unit (`tests/unit/`)
- `canonicalPair`, `feedOrderKey` determinism, Zod swipe schema (valid and invalid inputs, unknown keys), `toPublicProfile` allow-list and malformed-interests handling.
- `resolveSwipe`: drag above the threshold → like/pass, below → snap back, fast flick, and flicks against the drag direction.

### API integration (`tests/api/`), using the real route handlers and real SQLite
`discover.test.ts`
- Feed: returns all other profiles and excludes the user; public fields only; excludes liked and passed profiles; empty list after swiping everyone; deterministic.
- Swipe: LIKE and PASS persisted (201); a mutual like creates exactly one Match; PASS never matches, even if they liked you; a LIKE on someone who passed you doesn't match; a match also forms when the like arrives second from the other side; identical repeat → idempotent 200 with the same body; a retried LIKE after a lost response still returns the match; conflicting repeat → 409 with the original kept; unknown profile → 404 with nothing stored; self-swipe → 400; invalid inputs (missing, bad action, empty id, unknown key, malformed JSON) → 400; DB CHECK constraints reject self-swipes, bad actions and non-canonical matches even when code is bypassed.
- Matches: empty for a fresh user; only mutual (not one-sided) matches; other people's matches never included.
- Persistence: a fresh `PrismaClient` (simulated restart) sees the same swipes and matches.
- Concurrency: 6 identical concurrent LIKEs → one 201, five 200s (same match id in all), one Swipe row, one Match row. Concurrent mutual likes from both sides → one Match. Concurrent swipes on different profiles all succeed.

`privacy.test.ts`
- **Scenario A**: feed JSON is byte-for-byte identical with and without incoming likes; matches are identical too.
- Recursive key scan of every response (feed, matches, PASS and LIKE on likers and non-likers) against an **allow-list** of keys.
- Identical-repeat (200) and conflicting-repeat (409) responses are byte-identical for a liker and a non-liker.
- Feed order is unchanged when incoming likes are flipped to different profiles, and it equals the pure id-hash order.
- **Scenario B/C**: PASS responses are identical for likers and non-likers; one-sided likes don't appear in matches.
- **Scenario D**: matched and unmatched LIKE responses have the same keys and status.
- A profile that passed you is indistinguishable from one that did nothing.
- No route exists other than feed, swipe, matches and health.

### Component (`tests/components/`), with jsdom, React Testing Library and mocked `fetch`
- ProfileCard rendering, plus the photo-failure fallback.
- Discover: loading → one card; Like/Pass buttons send the right action and advance; arrow keys; match overlay with both photos and focus on the primary action; "Keep discovering" and "See your matches" (navigates); empty state, including after the last swipe; feed error + retry; **rollback** on a 500 and when offline; 409 treated as already recorded.
- Review regressions: two quick matches are queued (both overlays shown in turn); a held arrow key (auto-repeat) swipes only once; after a lost response, retrying the like shows the match; focus is trapped in the dialog and the deck is `inert`.
- `useSwipe`: three rapid swipes on the same profile → a single request (double-submit guard).
- Matches: list with photo, name, age, location and date; loading; empty; error + retry.

### End-to-end (`e2e/journey.spec.ts`), Playwright against a production build, desktop 1440×900 and Pixel 7
- The full journey from the brief: Home → Discover → **drag-like** Pooja (mouse on desktop, real **touch** via CDP on mobile) → no match → short drag snaps back and sends no request → Pass button → drag-pass → like Zoya → **"It's a match!"** → Matches lists only Zoya → **reload** keeps the match → Discover resumes at the 7th profile, with all swiped profiles absent from `/api/feed` → every captured API response scanned for leaked keys → no console errors.
- Arrow-key swiping (desktop).
- Swipe all 31 → empty state, which persists after a reload.
- No horizontal overflow on Home, Discover or Matches.
- At 360×640, both action buttons sit fully above the tab bar.
- A failed swipe (intercepted 500) brings the card back to its exact on-screen position with real animations on, and it can then be swiped successfully. Verified to fail (off by 271 px) without the fix.

## Latest results (2026-11-19, local Windows 11, Node 24)
| Check | Result |
|---|---|
| `npx vitest run` | **80 passed** (6 files: 2 unit, 2 API, 2 component) |
| `npx playwright test` | **10 passed, 2 skipped** (keyboard is desktop-only; the 360 px check runs in the mobile project only) |
| `npx tsc --noEmit` | no errors |
| `npx eslint .` | no warnings or errors |
| `npx next build` | success |

## What the tests do not prove
- Resistance to precise timing side channels: response content and shape are tested, wall-clock timing is not.
- Behaviour on PostgreSQL. Tests run on SQLite, where the single writer lock serialises swipes. The PostgreSQL concurrency path (serializable + retry) is reasoned through, not tested.
- Real-device touch on iOS Safari. Touch is exercised in Chromium via CDP touch events.
