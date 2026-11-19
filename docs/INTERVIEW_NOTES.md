# Interview notes

Plain-language explanations of how this project works and why.

## 1. The project in one minute
It's a Tinder/Bumble-style "Discover" tab for Coy. You see one profile at a time and swipe right to like or left to pass. If the other person had already liked you, it's a match, and both of you can see it. If they hadn't, nothing happens and they never find out. The hard part is not the swiping. It's making sure **the server never leaks who liked you** unless it's mutual, and that swipes are recorded correctly even if requests arrive twice or at the same time.

## 2. Architecture
One Next.js app contains both the UI (React pages) and the backend (API route handlers).

- **Route handlers** (`src/app/api/...`) are thin. They read the request, validate it with Zod, call a service, and turn the result or error into JSON.
- **Services** (`src/server/services/...`) hold the rules: what's in the feed, what a swipe does, and what a match is.
- **Prisma** talks to **SQLite**.

This separation means the rules can be tested without HTTP, and route handlers stay small and boring.

## 3. Database design
Three tables:
- **Profile**: everyone, including the logged-in user (id `"me"`).
- **Swipe**: one row per "A swiped on B", with action LIKE or PASS. The `UNIQUE(fromId, toId)` index means you can only swipe on someone once. CHECK constraints block self-swipes and invalid actions at the database level.
- **Match**: one row per mutual pair. The two ids are stored sorted (`userLowId < userHighId`) with a unique index, so the pair (me, zoya) and (zoya, me) map to the same single row.

"Profile B already liked me" is just a Swipe row `B → me, LIKE`. It sits in the database but no API ever returns it.

## 4. Why these technologies
- **Next.js**: preferred in the brief. Frontend and backend in one project and one deploy.
- **Prisma**: typed queries, migrations, easy transactions.
- **SQLite**: real SQL with constraints and transactions, and zero setup for a reviewer. I documented how to switch to PostgreSQL for hosting.
- **Zod**: validates input and gives clear error messages.
- **Framer Motion**: drag gestures that work with mouse and touch, spring animations, and reduced-motion support.
- **Vitest / Testing Library / Playwright**: fast unit and integration tests, plus a real browser test of the whole journey.

## 5. API workflow
- `GET /api/feed`: all profiles except me and except anyone I've already swiped on, in a fixed shuffled order.
- `POST /api/swipe {profileId, action}`: records the swipe. Returns `201 { swipe, match }`, where `match` is `null` or the match details.
- `GET /api/matches`: rows from the Match table involving me, with the other person's public profile.

## 6. How swiping works in the UI
- The top card is a draggable `motion.div`. As you drag, it rotates and shows a LIKE or PASS stamp.
- When you let go, `resolveSwipe(distance, velocity)` decides: past 110 px (or a fast flick), it's a swipe. Otherwise the card springs back.
- **Optimistic update**: the card leaves immediately, then the request is sent. If the request fails, the card comes back on top with an error message, so a swipe is never silently lost. If the server says "already swiped" (409), the swipe is already saved, so the card stays gone.
- A per-profile "in-flight" set prevents sending the same swipe twice from fast double clicks.

## 7. Mutual matching logic
In one database transaction:
1. Insert my swipe (`me → B`). If it already exists, the unique index throws. If the old swipe is the *same* action, this is a retry: return 200 with the original result, including the match. If it's the *other* action, return 409.
2. If it's a LIKE, look up `B → me`.
3. If that is also a LIKE, upsert the Match row for the sorted pair and return it.

PASS never creates a match. A LIKE on someone who passed me doesn't either.

## 8. Transactions and concurrency
- The swipe and the match are written **in one transaction**, so you can never end up with a match but no swipe, or the reverse.
- **Duplicate requests** (double click, retry): the `UNIQUE(fromId, toId)` index means only one insert can succeed. The identical repeats get an idempotent 200 with the same match. A test fires 6 identical requests at once and checks for one 201, five 200s, one Swipe row, one Match row, and the same match id in every response.
- **Both people liking at the same moment**: the match is an *upsert* on a unique pair, so at most one row can exist. A test runs both likes concurrently.
- The swipe INSERT runs *first* in the transaction, so SQLite takes the write lock immediately and concurrent transactions queue instead of deadlocking. The transaction is `Serializable`. On PostgreSQL that matters: under the default READ COMMITTED, two people liking each other at the same instant could each miss the other's uncommitted row, and no match would be created. Serialization failures are retried.

## 9. Privacy guarantees (the core promise)
- **No "likes you" endpoint.** The feed only looks at *my* swipes, and matches only read the Match table.
- **An allow-list serializer** (`toPublicProfile`) copies exactly seven fields, so a new database column can't leak by accident.
- **The feed order doesn't depend on likes.** It's sorted by a hash of (my id, their id). If likers came first, the order itself would leak who liked me. A test removes and flips all incoming likes and checks the feed is byte-for-byte identical.
- **Same response shape.** A PASS on someone who liked me looks identical to a PASS on someone who didn't. Status codes depend only on my input and my own history.
- **What I don't claim**: tests check content and shape, not precise timing, so I don't claim to be immune to every timing side channel.

## 10. Testing strategy
- **Unit**: pure functions (pair ordering, hash order, validation, serializer, swipe thresholds).
- **API integration**: the real route handlers against a real SQLite test database, reset before each test. These cover the feed, the swipe cases, matches, the error codes, persistence with a fresh DB client, concurrency, and dedicated privacy tests.
- **Component**: React Testing Library with a mocked `fetch`. These cover the like and pass buttons, the keyboard, the match overlay, the empty, loading and error states, rollback, and the double-submit guard.
- **End-to-end**: Playwright against a production build. It runs the full journey with a real mouse drag (desktop) and a real touch drag (mobile), reloads to prove persistence, scans every API response for leaked fields, and checks the layout at 360 px.

## 11. Trade-offs
- **Single fixed user** (`"me"`), as the brief allows. Real auth would replace one function, `getCurrentUserId()`.
- **SQLite** is simple and correct locally but not persistent on serverless hosts, so Postgres is needed for a hosted demo.
- **The feed returns everything** (31 profiles). Pagination would be needed at scale. A cursor on the hash key works without breaking the ordering guarantee.
- **Duplicate swipes**: an identical repeat returns 200 (idempotent), and a conflicting one returns 409. Both reveal only *my own* history.
- **Optimistic UI** feels instant, but needs careful rollback. It's covered by tests.

## 12. Likely interview questions

1. **How do you guarantee a match is created only once?**
   The pair is stored in sorted order with a unique index, and created with an upsert inside the swipe transaction. Two concurrent likes can't create two rows.

2. **What happens if the user double-clicks Like?**
   The client ignores the second click (in-flight guard). If two requests still arrive, the unique index lets one insert succeed. The repeat gets 200 with the same result, so the client still shows the match if there is one.

3. **How could the feed leak who liked me, and how did you prevent it?**
   If likers were sorted first, or filtered differently, or carried a flag. The feed reads only my own swipes, returns an allow-listed shape, and sorts by a hash of ids. A test proves the feed is identical with or without incoming likes.

4. **Why store a Match table if you can compute matches from swipes?**
   It gives an explicit match date, a fast `GET /matches`, and a place for future match-only features. Also, the matches endpoint never touches the Swipe table, which keeps the privacy reasoning simple.

5. **Why is the swipe INSERT the first statement in the transaction?**
   In SQLite it grabs the write lock right away, so concurrent swipes wait their turn instead of failing. It also lets the unique index and foreign key decide 409 vs 404 atomically.

6. **What status codes does POST /swipe return, and why 201?**
   201 when a swipe resource is created, 400 for bad input or a self-swipe, 404 for an unknown profile, 200 for an identical repeat (idempotent), 409 for a conflicting repeat, and 500 for unexpected errors. None depend on the other person's actions.

7. **How does optimistic UI work here, and what if the server fails?**
   The card is removed immediately. On error it's re-inserted on top and an error is shown. Retrying gets the idempotent 200, so a match whose response was lost still appears. A 409 or 404 keeps it removed.

8. **How would you move this to production?**
   Real auth, Postgres, rate limiting on swipes, feed pagination, and monitoring. The service layer and constraints stay the same.

9. **How did you test drag gestures?**
   The drag decision is a pure function with unit tests. Playwright performs a real mouse drag on desktop and a real touch drag on mobile (via the Chrome DevTools Protocol), including a short drag that must snap back without sending a request.

10. **What's one limitation you'd fix next?**
    Pagination of the feed, and making response timing more uniform, for example by always doing the same amount of work on a LIKE, if timing side channels became a concern.
