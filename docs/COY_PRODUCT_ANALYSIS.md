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
| Phone OTP login (number entry screen) | **Verified** | Candidate's screenshots, 2026-11-19 |
| Logged-in home screen | **Verified** | Candidate's screenshots, 2026-11-19 |
| Adding a crush (form) | **Verified** (viewed; nothing submitted) | Candidate's screenshots, 2026-11-19 |
| Invite link ("Get a slot free") | **Verified** | Candidate's screenshots, 2026-11-19 |
| Email verification, extra-slots screen | **Not yet verified** | Needs the settings and "Get more slots" screens |

The automated part of this analysis read public pages only: no sign-up, no phone number, no purchase. The logged-in observations come from the candidate's own account.

### Logged-in home screen (verified from screenshots)
- **Header**: the `coy.` wordmark and a settings gear (top right). Settings is the likely home of email verification.
- **Hero card**: "Find out if your crush likes you back", with three steps: *Add someone you like, by number or email* → *We tell them someone likes them, not who* → *If they add you back, it's a match*. A primary **Add your crushes** button.
- **Your crushes 0/3**: one highlighted **Add a crush** row and two greyed **Free slot** rows. The slot limit is visible from the first screen.
- **Get more slots**: "Add more people to your list" (yellow). This is the paid route, and it sits directly under the free slots.
- Helper text: *"They get an anonymous heads-up right away. Never who."*
- **How Coy works**: "Follow one crush from add to match, in 6 quick taps", a short interactive walkthrough.
- **Get a slot free**: a collapsible card showing "0 of 3 joined" with three empty circles. This is the invite-3-friends route.

**Observations**
1. **The slot economy is front and centre.** "0/3", two empty slots, and "Get more slots" all appear before you've added anyone. Fine for clarity, but it puts the paywall before the user has had any value.
2. **The paid option is shown above the free one.** "Get more slots" (paid) appears before "Get a slot free" (invite), and the free route is collapsed by default.
3. **Copy is inconsistent about timing.** The app says the heads-up goes out "right away". The public site says at most one message a week, never at night, and the /stop page says messaging hasn't started. Users may not know what the crush actually receives, or when.
4. **Two labels for the same thing.** The first empty row says "Add a crush" and the others say "Free slot". It's a minor wording inconsistency.

Both observations 1 and 2 support Feature 2 below (reducing anxiety about "spending" a slot).

### Login screen (verified)
- URL `app.getcoy.com/login?next=/app`. Heading **"What's your number?"**, with the line *"We'll text you a code. It's also how your crushes find you."*
- A country-code picker that defaults to **+91** and a phone field.
- A **"Have an invite code?"** link. This is where an invited friend redeems the code from "Get a slot free".
- A required checkbox: *"I'm 18 or older and agree to the Terms and Privacy Policy"*, then **Send code**.
- **Observation**: the login copy openly says your number is how crushes find you, which sets privacy expectations well. Age is self-declared with a checkbox, and there's no other check.

### Add a crush (verified; nothing submitted)
- A modal with a **Name** field (placeholder "Riya from 3rd floor"), captioned *"Only you see this."*
- A **Phone number** field (+91 default), captioned *"It takes one slot."*, and an **"Add by email"** link that switches the field to email.
- **Add crush** stays disabled until the input is valid.
- Footer: *"They get an anonymous heads-up right away. Adding is final: you can't remove someone once they're on your list."*

**Observations**
5. **The app and the Terms disagree about removing someone.** The app says "you can't remove someone once they're on your list". The Terms describe removed entries keeping their slot used for 30 days, which implies removal exists. One of them is out of date.
6. **One identifier per crush in the form.** You add by phone *or* switch to email. The website says "by phone number, email or both". If someone signed up with an email you don't have, adding them by phone won't match. Being able to enter both would improve match rates.
7. **The "final" warning comes late.** "Adding is final" is in small grey text under the button. Since it can't be undone and it messages a real person, it deserves to be more prominent (a confirm step or bolder copy).
8. **You must already have their contact details.** The form only accepts a phone number or email, which confirms the core limitation Feature 1 addresses.

### Invite link: "Get a slot free" (verified)
- Expanded, the card reads: *"Invite 3 friends. When they join and add a crush, you get a free slot."*
- It shows a personal invite code with a copy button, a **Copy link** action, and a primary **Share link** button. Progress shows as three circles: "0 of 3 joined".
- **Observation**: the reward needs friends to *join and add a crush*, not just sign up. That rewards real activity rather than empty sign-ups, which is a sound incentive. Progress shows a count but not *which* friends joined, which is consistent with Coy's privacy stance.

### Checklist: complete after personally exploring Coy
- [x] Phone OTP login: completed (logged in). Optional: note the code delivery time and the resend behaviour.
- [x] Adding a crush (viewed, not submitted): is it by phone or email, what name/label is asked for, and what confirmation does "adding is final" get?
- [ ] Email verification: when is it asked for, how is the code or link delivered, and is it explained that it makes you findable?
- [x] Invite link: how it is shared, what the invitee sees, and how progress toward a free slot is shown.
- [ ] Extra-slots screen: look at the price presentation, the payment hand-off, and anything confusing. **Do not buy.**
- [ ] Revisit the two proposals below and keep, adjust or replace them based on what you saw.

## 2. Feature 1: Verified Circles (add a crush without having their number)

**User problem.** Coy matches on a phone number or email you already have. Many real crushes are a classmate, someone from another team, or someone in the same hostel, people you see often but whose number you don't have. Asking for the number is the very awkwardness Coy exists to avoid.

**Why it's required.** Today the product only works for crushes you already have contact details for, which caps both matches and growth. Coy already collects an optional email "so people who have it can find you". A verified college or work email domain is a natural, privacy-preserving next step.

**Evidence from the app.** The Add a crush form accepts only a phone number or an email (observation 8), and the login screen says your number is "how your crushes find you". If you don't have someone's contact details, there is no way to add them.

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

**Evidence from the app.** The home screen leads with "0/3", empty slots and a paid "Get more slots" card (observations 1 and 2), and the add form warns "Adding is final: you can't remove someone" (observation 7). Every slot feels high-stakes.

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
