# Database

Prisma ORM over SQLite (`prisma/dev.db`). Schema: [`prisma/schema.prisma`](../prisma/schema.prisma). Migration with CHECK constraints: [`prisma/migrations/`](../prisma/migrations).

## Tables

### Profile
| Column | Type | Notes |
|---|---|---|
| id | TEXT PK | Deterministic slug (`"me"`, `"zoya"`, …) |
| name | TEXT | |
| age | INTEGER | `CHECK (age >= 18)` |
| photoUrl | TEXT | `/profiles/<id>.jpg` (bundled in `public/`) |
| bio | TEXT | |
| location | TEXT | City or college |
| interests | TEXT | JSON array. SQLite has no scalar lists; parsed by `toPublicProfile()` |
| createdAt | DATETIME | |

The logged-in user is an ordinary Profile with id `"me"`.

### Swipe
| Column | Type | Notes |
|---|---|---|
| id | TEXT PK | cuid |
| fromId | TEXT FK → Profile | who swiped |
| toId | TEXT FK → Profile | who was swiped on |
| action | TEXT | `CHECK (action IN ('LIKE','PASS'))` |
| createdAt | DATETIME | |

- `UNIQUE (fromId, toId)`: one swipe per direction. This index arbitrates duplicates and races.
- `CHECK (fromId <> toId)`: no self-swipes, even if application code is bypassed.
- `INDEX (toId, action)`: for the reciprocal-like lookup.
- Incoming likes for the demo user are stored as ordinary rows (`fromId = <other>, toId = 'me'`). They are never returned by any API.

### Match
| Column | Type | Notes |
|---|---|---|
| id | TEXT PK | cuid |
| userLowId | TEXT FK → Profile | lexicographically smaller id |
| userHighId | TEXT FK → Profile | larger id |
| createdAt | DATETIME | |

- `CHECK (userLowId < userHighId)` plus `UNIQUE (userLowId, userHighId)`: each pair has exactly one row, whichever side liked second.
- `INDEX (userHighId)`: so "matches for user X" is an index lookup on either column.
- A Match row is only written inside the swipe transaction after the reciprocal LIKE is confirmed. The seed derives matches from mutual LIKEs the same way.

Why store matches at all, when they could be derived from two LIKE rows? It gives an explicit `createdAt` for "matched on", a cheap `GET /matches`, and a single place to hang future match-only data (e.g. chat). It also means `GET /matches` never has to read the Swipe table.

## Seed data (`prisma/seed-data.ts`)
- 31 profiles plus the demo user, all deterministic. Photos are bundled locally (pravatar.cc / Unsplash-licensed portraits, adults only, no public figures).
- **8 profiles have LIKED the demo user**: meera, zoya, naina, aanya, diya, kabir, mira, farhan. Liking any of these creates a match.
- 2 profiles have PASSED the demo user (tara, rohan). Liking them never matches.
- Some background swipes between other profiles, including one mutual pair (ananya ↔ kabir), so the tables look realistic. That match is not the demo user's and never appears in their Matches.
- In the demo user's feed order, Zoya (a liker) comes 6th: pooja, rohan, dev, kavya, sana, **zoya**.

## Commands
```bash
npx prisma migrate deploy   # apply migrations (creates prisma/dev.db)
npm run db:seed             # wipe + reseed demo data (safe to repeat)
npm run db:reset            # drop and recreate the dev DB (destructive, dev only)
```

Tests use separate throwaway files: `prisma/test.db` (Vitest) and `prisma/e2e.db` (Playwright).

## Switching to PostgreSQL (for hosting)
SQLite on serverless hosts (e.g. Vercel) is ephemeral, so writes would not persist. To deploy:
1. In `schema.prisma`, set `provider = "postgresql"`.
2. Delete `prisma/migrations` and run `npx prisma migrate dev --name init` against a Postgres `DATABASE_URL` (e.g. Neon). Re-add the three CHECK constraints to the generated SQL. The syntax is identical in Postgres.
3. Set `DATABASE_URL` in the host's environment, run `prisma migrate deploy` during the build, and run `npm run db:seed` once.
No application code changes are needed. The services use only portable Prisma APIs and catch the same error codes (`P2002`, `P2003`). The swipe transaction already requests `Serializable` isolation, which PostgreSQL needs so that two simultaneous mutual likes can't both miss each other. The resulting serialization failures (`P2034`) are retried. This path was reasoned through, not run: the test suite runs on SQLite.
