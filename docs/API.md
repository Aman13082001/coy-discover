# API

Base path: `/api`. All responses are JSON with `Cache-Control: no-store`. The current user is always the seeded profile `"me"` (no auth, per the brief).

**Envelope**
```jsonc
// success
{ "data": { ... } }
// failure
{ "error": { "code": "VALIDATION_ERROR", "message": "action must be LIKE or PASS" } }
```

**PublicProfile**, the only profile shape the API ever returns:
```json
{ "id": "zoya", "name": "Zoya", "age": 24, "photoUrl": "/profiles/zoya.jpg",
  "bio": "UX researcher…", "location": "Hyderabad", "interests": ["Design", "Running"] }
```
It never includes whether this person liked you, passed you, or any counts.

---

## GET /api/feed
Profiles the user has not liked or passed, excluding the user. The order is a deterministic per-user shuffle that does not depend on incoming likes.

`200`
```json
{ "data": { "profiles": [ PublicProfile, ... ] } }
```
When everyone has been swiped: `{ "data": { "profiles": [] } }`.

## POST /api/swipe
Body:
```json
{ "profileId": "zoya", "action": "LIKE" }
```
`action` is `"LIKE"` or `"PASS"`. Unknown keys are rejected.

`201`: swipe recorded. `match` is `null` unless this swipe completed a mutual like.

`200`: the *identical* swipe already existed (e.g. a client retry after a lost response). Nothing new is stored, and the original outcome is returned, including the match if there is one. This makes retries idempotent, so a lost response never loses a match.
```json
{ "data": { "swipe": { "profileId": "zoya", "action": "LIKE" },
            "match": { "id": "cm…", "createdAt": "2026-11-19T17:02:11.000Z", "profile": PublicProfile } } }
```
```json
{ "data": { "swipe": { "profileId": "pooja", "action": "LIKE" }, "match": null } }
```

| Status | code | When |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Malformed JSON, missing or invalid fields, unknown keys |
| 400 | `SELF_SWIPE` | `profileId` is the current user |
| 404 | `PROFILE_NOT_FOUND` | No such profile |
| 409 | `ALREADY_SWIPED` | The user already swiped on this profile with the *other* action (the original swipe is kept) |
| 500 | `INTERNAL_ERROR` | Unexpected failure (details are logged server-side only) |

None of these depend on what the *other* person did.

## GET /api/matches
Mutual matches only, newest first.

`200`
```json
{ "data": { "matches": [ { "id": "cm…", "createdAt": "2026-11-19T17:02:11.000Z", "profile": PublicProfile } ] } }
```

## GET /api/health
`200 { "data": { "status": "ok", "database": "up", "time": "…" } }`, or `503` if the database is unreachable.

## Examples
```bash
curl localhost:3000/api/feed
curl -X POST localhost:3000/api/swipe -H 'content-type: application/json' -d '{"profileId":"zoya","action":"LIKE"}'
curl localhost:3000/api/matches
```

> The brief names the endpoints `/feed`, `/swipe`, `/matches`. They live under `/api` (the Next.js convention), which also keeps `/matches` free for the Matches page.
