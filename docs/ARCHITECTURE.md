# Architecture

## Overview

```
Browser (React client components)
  │  fetch /api/*  (src/lib/api.ts, typed, envelope-aware)
  ▼
Next.js Route Handlers  (src/app/api/*/route.ts)   ← thin: parse, validate, call service, map errors
  ▼
Services  (src/server/services/*.ts)               ← business rules: feed, swipe+match, matches
  ▼
Prisma Client  (src/server/db.ts)
  ▼
SQLite (prisma/dev.db)  ← schema + CHECK constraints in prisma/migrations
```

One Next.js app serves both the UI and the API, which satisfies "Next.js API routes" and keeps a single deployable unit.

## Folder layout

| Path | Responsibility |
|---|---|
| `src/app/` | Routes. `/` (Home placeholder), `/discover`, `/matches`, `api/{feed,swipe,matches,health}` |
| `src/server/config.ts` | `getCurrentUserId()`. The single logged-in user (`"me"`), the one place to swap in real auth |
| `src/server/services/` | `feed.ts`, `swipe.ts`, `matches.ts`: all business logic |
| `src/server/profiles.ts` | `publicProfileSelect` + `toPublicProfile()`: the only way a profile leaves the server |
| `src/server/validation.ts` | Zod schema for `POST /swipe` |
| `src/server/http.ts` | Response envelope (`{data}` / `{error}`), central error mapping, `route()` wrapper |
| `src/server/errors.ts` | `AppError` (status + stable code) |
| `src/lib/` | Code shared with the client: types, API client, swipe-gesture thresholds |
| `src/hooks/` | `useFeed`, `useSwipe` (optimistic + rollback), `useMatches` |
| `src/components/` | `layout/` (AppShell, nav, header), `discover/` (SwipeCard, ProfileCard, actions, match modal), `matches/`, `states/`, `profile/` |
| `prisma/` | Schema, migration (with hand-added CHECK constraints), deterministic seed |
| `tests/` | Vitest: `unit/`, `api/` (route handlers against a real SQLite test DB), `components/` (jsdom) |
| `e2e/` | Playwright journey tests against a production build |

## Key decisions

| Decision | Why |
|---|---|
| Next.js App Router + Route Handlers | Preferred by the brief; one codebase and one deploy |
| Prisma + SQLite | Real relational constraints and transactions with zero setup. Swap to PostgreSQL for hosting (see DATABASE.md) |
| Service layer that takes an optional `db` | Route handlers stay trivial; tests can inject a fresh client to prove persistence |
| Zod `.strict()` input | Rejects unknown keys such as a spoofed `fromId` |
| Framer Motion for drag | Pointer-based drag works with mouse and touch, springs back, and supports `useReducedMotion` |
| Optimistic swipes | Card advances instantly; on failure the card is restored to the top with an error, so a swipe is never silently lost |
| Local bundled photos | No runtime dependency on a third-party image host. Failed images fall back to an initial tile |
| `/api/*` paths | Next.js convention, and it avoids a clash with the `/matches` page. Endpoints otherwise match the brief exactly |

## Privacy model

Coy's promise is: **nobody learns who liked them unless it's mutual.** The server enforces this, not the UI.

1. **No endpoint reads incoming swipes for output.** `getFeed` filters only on the viewer's *own* outgoing swipes. `getMatches` reads only the `Match` table. There is no "likes you" endpoint, and a test asserts the route list.
2. **Field allow-list.** Every profile is serialised by `toPublicProfile()`, which copies seven named fields. Adding a column to `Profile` cannot leak it.
3. **Order doesn't depend on likes.** The feed is sorted by `sha256(viewerId:profileId)`, a deterministic per-viewer shuffle that is a function of ids alone. A test flips every incoming like and asserts the feed is byte-for-byte identical.
4. **Uniform swipe responses.** Every successful swipe returns `201 {swipe, match}`. `match` is `null` unless this swipe completed a mutual like. A PASS on someone who liked you looks exactly like a PASS on someone who didn't. A LIKE on someone who passed you looks exactly like a LIKE on someone who hasn't swiped.
5. **Errors don't depend on the other person.** 404 depends only on whether the profile exists, 200 (idempotent repeat) and 409 (conflicting repeat) only on the viewer's *own* previous swipe, and 400 only on the input. A test compares these responses for a liker and a non-liker byte for byte.
6. **Atomic swipe and match.** The swipe insert and the match creation happen in one **serializable** transaction. The `(fromId, toId)` unique index and the `(userLowId, userHighId)` unique index make duplicate and concurrent requests safe.

**Known limits.** A LIKE that creates a match does a little more work (a match upsert and a profile read) than one that doesn't. In this case the response reveals the match anyway, so there is nothing extra to learn. A LIKE on someone who *passed* you takes the same code path as a LIKE on someone who hasn't swiped (one indexed lookup either way). The tests check response content and shape, not wall-clock timing; I don't claim resistance to every timing side channel.

## Swipe flow

```
POST /api/swipe {profileId, action}
  → zod parse (400 VALIDATION_ERROR)
  → profileId == me ? 400 SELF_SWIPE
  → BEGIN (SERIALIZABLE)
       INSERT Swipe(me → profileId, action)     -- first statement takes the SQLite write lock
         FK violation     → 404 PROFILE_NOT_FOUND
         unique violation → (after rollback) existing swipe has the same action?
                              yes → 200 replay {swipe, match from Match table}
                              no  → 409 ALREADY_SWIPED
       if action == LIKE:
         SELECT Swipe(profileId → me)
         if LIKE: UPSERT Match(low, high); SELECT match + profile
     COMMIT
  → 201 {data: {swipe: {profileId, action}, match: null | {id, createdAt, profile}}}
```

Retries: write conflicts and serialization failures (`P2034`) and transactions that could not start (`P2028`) are retried up to 3 times. On SQLite the single writer lock already serialises swipes. On PostgreSQL, serializable isolation is what makes two *simultaneous* mutual likes conflict, so the retry then sees the other side's committed like and creates the match. Under READ COMMITTED, each side could miss the other's uncommitted row and no match would ever be created.

## Frontend state

- `useFeed` loads the feed once and holds the remaining profiles.
- `useSwipe` removes the card first, then POSTs. On a network or server error it puts the card back on top and sets an error message. Retrying the same swipe gets the idempotent 200 replay, so a match whose response was lost still shows. A 409 (conflicting earlier swipe) or 404 (profile gone) keeps the card removed. A per-profile in-flight `Set` prevents double submission. Matches are **queued**, so two quick matches each get an overlay.
- The deck renders the top two cards inside `AnimatePresence`. The exit direction comes from the last action. Exiting cards are made inert with `useIsPresent`.
- Keyboard: ← pass, → like (desktop). Auto-repeat is ignored, so holding a key swipes once. While the match dialog is open the deck is `inert`, focus is trapped in the dialog, and Escape closes it.

## Moving to production
- Replace `getCurrentUserId()` with a session lookup.
- Switch the datasource to PostgreSQL (DATABASE.md), and add rate limiting on `POST /swipe`.
- Paginate `GET /feed` (cursor on the hash key) once the profile count grows.
