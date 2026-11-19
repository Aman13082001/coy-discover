# CV points

Only what was actually built and tested in this repository. No traffic, user counts or performance numbers are claimed.

- Built a swipe-based discovery feature ("Discover" tab) for a privacy-first crush-matching app using **Next.js 15, React 19, TypeScript, Tailwind CSS and Framer Motion**, with drag gestures for mouse and touch, keyboard shortcuts, and reduced-motion support.
- Designed a **relational schema in Prisma/SQLite** (Profile, Swipe, Match) with unique indexes, foreign keys and CHECK constraints, including canonical pair ordering so each mutual match is stored exactly once.
- Implemented **transactional swipe-and-match logic** in a service layer behind REST endpoints (`GET /feed`, `POST /swipe`, `GET /matches`) with Zod validation and a consistent error envelope, and made swipes idempotent and safe under duplicate and concurrent requests (serializable transactions with retry).
- Enforced the product's core privacy promise **on the server**: the field allow-list serializer, a feed order that doesn't depend on likes (per-user hash shuffle), and uniform swipe responses, so the API never reveals who liked the user unless it's mutual.
- Wrote **80 Vitest tests plus 6 Playwright scenarios** (run on desktop and mobile viewports): Vitest unit, API integration (against a real SQLite DB, including privacy-leak, ordering-independence and concurrency tests), React Testing Library component tests (optimistic rollback, double-submit guard), and **Playwright end-to-end tests** of the full journey on desktop and mobile viewports.
- Implemented **optimistic UI updates with rollback**, so a failed swipe restores the card and shows an error instead of silently losing the action.
