# Part A: Coy product analysis and two feature proposals

## 1. What was actually verified

Read this section first. This document keeps what I verified separate from what I assumed.

| Area | Status | Source |
|---|---|---|
| Product concept (double-blind crush matching, add by phone and/or email, match only if mutual) | **Verified** | getcoy.com home page and FAQ |
| Up to 3 free crushes; extra slots at ₹49 for 1, ₹129 for 3, ₹199 for 5 (one-time, launch prices); "invite 3 friends who join and add a crush → 1 free slot" | **Verified** (public pricing text) | getcoy.com #pricing |
| Recipient gets an anonymous heads-up by WhatsApp, SMS or email: at most 1 a week and 3 in total, never at night, each with a stop link | **Verified** (stated policy) | getcoy.com, /privacy |
| "Adding is final", so nobody can add and remove names to test who likes them. Removed entries keep their slot used for 30 days | **Verified** (stated policy) | getcoy.com, /terms |
| Numbers and emails stored as keyed hashes for matching and encrypted for messaging; "we never say who, not directly and not through counts" | **Verified** (stated policy) | getcoy.com, /privacy |
| List entries deleted after 180 days unless matched; login codes deleted within a day; sessions last 60 days | **Verified** (stated policy) | /privacy |
| An email is optional and "lets people who have it find you" | **Verified** (stated policy) | /privacy |
| /stop page says messaging has not started yet, which contradicts the present-tense copy on the home page | **Verified** (observation) | getcoy.com/stop |
| Phone OTP login screen and flow | **Not verified** | app.getcoy.com is a JS-only shell to automated fetching, and OTP needs a real phone number |
| Adding a crush (UI), email verification, invite link, extra-slots screen | **Not verified** | Requires a logged-in account |

I did not sign up, did not enter a phone number, and did not purchase anything.

### Checklist: complete after personally exploring Coy
- [ ] Phone OTP login: note how long the code takes to arrive, the resend and retry behaviour, and what errors look like.
- [ ] Adding a crush: is it by phone or email, what name/label is asked for, and what confirmation does "adding is final" get?
- [ ] Email verification: when is it asked for, how is the code or link delivered, and is it explained that it makes you findable?
- [ ] Invite link: how it is shared, what the invitee sees, and how progress toward a free slot is shown.
- [ ] Extra-slots screen: look at the price presentation, the payment hand-off, and anything confusing. **Do not buy.**
- [ ] Revisit the two proposals below and keep, adjust or replace them based on what you saw.

## 2. Feature 1: Verified Circles (add a crush without having their number)

**User problem.** Coy matches on a phone number or email you already have. Many real crushes are a classmate, someone from another team, or someone in the same hostel, people you see often but whose number you don't have. Asking for the number is the very awkwardness Coy exists to avoid.

**Why it's required.** Today the product only works for crushes you already have contact details for, which caps both matches and growth. Coy already collects an optional email "so people who have it can find you". A verified college or work email domain is a natural, privacy-preserving next step.

**Flow.**
1. In settings, a user verifies a college or work email (e.g. `@iitb.ac.in`). This joins them to the "IIT Bombay" circle.
2. They choose, off by default, to be **listed** in that circle with a first name, one photo and a department or batch.
3. When adding a crush, a new "From my circles" option shows listed members. Picking one adds them exactly like a phone add: same slot, same "adding is final", same heads-up rules.
4. A match works exactly as today.

**Privacy considerations.**
- Listing is opt-in and can be withdrawn at any time. Unlisted users remain addable only by phone or email.
- No like counts, no "popular in your circle" ordering, and no "X people from your circle added you". The order is alphabetical or random, never based on likes.
- Circle membership is never revealed to non-members, and the domain is verified by a code to the email address.
- Rate-limit browsing and add attempts to discourage scraping.

**Expected impact.** More people become addable, which means more mutual matches, and campuses and workplaces are where word-of-mouth spreads. The Discover tab built in Part B is effectively the browsing surface for a circle.

## 3. Feature 2: Timed crushes with privacy-safe slot recycling

**User problem.** Slots are scarce (3 free) and "adding is final". People hesitate to "spend" a slot, and unreturned crushes keep occupying slots for up to 180 days.

**Why it's required.** Scarcity is good for seriousness, but anxiety about wasting a slot suppresses the core action (adding). That pushes people either to churn or to a paywall before they've had a match. A built-in, predictable expiry gives back control without opening the add/remove "probe" loophole that "adding is final" exists to prevent.

**Flow.**
1. When adding a crush, choose a duration: 30, 60 or 90 days (default 90).
2. The list shows "expires in N days" for each crush.
3. On expiry the entry is deleted and the slot frees after a fixed cooldown (e.g. 14 days). The same person cannot be re-added during the cooldown.
4. Optionally, before expiry, a private "Still interested?" nudge can extend it once.

**Privacy considerations.**
- Expiry must be indistinguishable from never having been added. The crush gets no "someone stopped liking you" signal.
- The fixed cooldown and no-re-add rule stop someone using add, expire, re-add cycles to probe who likes them.
- Expiry happens on the server at scheduled times, not instantly, so timing reveals nothing.

**Expected impact.** Adding a crush feels lower-risk, so more crushes get added, and reusing slots keeps people around longer. Paid slots stay valuable for people who want more at the same time, rather than being the only way past the anxiety.

## 4. How Part B reflects these findings
The Discover prototype applies the same principle Coy states publicly ("we never say who, not directly and not through counts"). The server never returns incoming likes, feed order is a hash of ids (so it can't correlate with likes), and swipe responses have the same shape whether or not the other person liked you. See [ARCHITECTURE.md](ARCHITECTURE.md#privacy-model).
