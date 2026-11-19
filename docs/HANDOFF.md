# Handoff / continuation prompt

Paste this into a new session to continue. Always check what it says against the real code and `git log`.

---

You are continuing the **Coy SDE intern assignment**. The repo is `coy-discover/` (inside `c:\Aman\SDE coy\`).

**Assignment**: see `docs/assignment.md` (a transcription; the original PDF should be copied to `docs/assignment.pdf`). Part A is a product analysis of getcoy.com with two feature proposals. Part B is a swipe-based "Discover" tab: 30+ seeded profiles, some of which have already liked the user; drag or buttons to like/pass; never show a swiped profile again; an "It's a match!" screen on mutual likes; a Matches view; never reveal who liked the user unless it's mutual; APIs for feed, swipe and matches; persistence.

**State**: Part B is complete and verified. Part A is complete: all five flows are documented from the candidate's screenshots (no personal data such as phone, name or invite code in the repo). Not deployed.

**Stack**: Next.js 15 App Router + Route Handlers, React 19, TS, Tailwind 4, Framer Motion, Prisma 6 + SQLite, Zod 4, Vitest 5 + RTL, Playwright. GitHub: https://github.com/Aman13082001/coy-discover (public, `master`).

**Important files**
- `prisma/schema.prisma`, `prisma/migrations/*/migration.sql` (hand-added CHECK constraints), `prisma/seed-data.ts`, `prisma/seed-lib.ts`
- `src/server/services/{feed,swipe,matches,profile}.ts`: business logic (swipe = serializable transaction, idempotent repeat → 200, conflict → 409)
- `src/server/{http,errors,profiles,validation,config}.ts`
- `src/app/api/{feed,swipe,matches,health}/route.ts`
- `src/hooks/useSwipe.ts` (optimistic + rollback + match queue), `src/components/discover/*`
- Tests: `tests/{unit,api,components}`, `e2e/journey.spec.ts`

**Commands**
```
npm install && cp .env.example .env && npm run setup && npm run dev
npx vitest run          # expect 80 passed
npx playwright test     # expect 10 passed, 2 skipped (builds + serves on :3200, prisma/e2e.db)
npx tsc --noEmit && npx eslint . && npx next build
npm run db:seed         # reset demo data
```
Note: Prisma blocks `prisma migrate reset` when run by an AI agent. Don't bypass it. Tests don't need it.

**Remaining**
1. (Optional) Document the email verification step (Settings → Email → Add).
2. (Optional) Deploy: Neon Postgres + Vercel (README → Deployment, DATABASE.md → Switching to PostgreSQL). Verify the live URL before claiming it.
3. Copy the original PDF to `docs/assignment.pdf`.

**Known bugs**: none. **Failing tests**: none.

**Pre-deployment checklist**: provider switched to postgresql · migrations regenerated with CHECK constraints · `DATABASE_URL` set on the host · build runs `prisma migrate deploy` · seeded once · `/api/health` returns ok · journey verified on the live URL.
