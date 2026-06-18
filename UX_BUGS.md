# EduScale — UX / Visual Bug Log (real-user-experience audit)

Found by rendering every user-facing page at desktop (1440) + mobile (390),
capturing full-page screenshots, and reviewing each by eye + the console/network
log per page. This catches what functional tests miss: layout breaks, overflow,
misalignment, ugly empty states, broken images, contrast, spacing, responsiveness.

**Method:** `tests/ux-capture.spec.ts` → screenshots in `/tmp/eduscale-ux/` + `manifest.json`.
**Loop:** find → log here → fix → re-capture → validate → mark Fixed.

Severity: 🔴 high (broken/embarrassing) · 🟠 medium (noticeable) · 🟡 low (polish)

| # | Page | Viewport | Sev | Issue | Status |
|---|------|----------|-----|-------|--------|
| 1 | /instant-battle | both | 🔴 | **Instant Battle navigated to `/battles/undefined` → 404** (undefined id + wrong prefix). Unlinked page, no `waiting-room` backend. | ✅ **Fixed** — replaced with an honest "Instant Battle Coming Soon" page. |
| 2 | /dashboard, /admin | desktop | 🟠 | Dashboard "See All" linked to `/activity` (no such route) → **404** on Next prefetch every load. | ✅ **Fixed** — removed the dead link (no activity page exists). |
| 3 | all battle-zone pages | both | 🟠 | Outdated amber banner "live-battle features may be unavailable… redis-battle-demo" undersold the now-working realtime + pointed to another demo. | ✅ **Fixed** — banner removed (WS realtime works now). |
| 4 | /battle-zone/create | both | 🟡 | Description labeled "(optional)" but step-1 validation required it ("Fill in both…"). | ✅ **Fixed** — description is now truly optional; gate message → "Add a battle title to continue." |
| 5 | /resources, /career-roadmap | public | 🟡 | Visiting unauthenticated renders the login form inline with the URL unchanged. | Open (low — by-design auth gating; valid route, no 404. Could redirect to `/auth/login?callback=` later). |
| 6 | /achievements | both | 🟠 | **Hardcoded/fake** Day-1–7 progress charts not tied to real data; unlinked page. Fabricated metrics = interview risk. | ✅ **Fixed** — replaced with honest "Progress Analytics Coming Soon"; deleted the fake-data component. |
| 7 | /pricing | both | 🟠 | Pricing section hardcoded **dark** (black bg) clashing with the light site; gradient H1 rendered transparent (invisible). | ✅ **Fixed** — converted to theme tokens (light + dark-mode aware); H1 now visible. |
| 8 | /about | both | 🟡 | ~~Bottom CTA "Visit Student Channel"~~ | ❌ **Invalid** — misread; button actually says "Visit Shailesh Chaudhari" (correct). |
| 9 | /blogs | both | 🟡 | Only 3 placeholder posts — thin for a showcase. | Open (low — content, not a defect). |
| 10 | landing + leaderboard | desktop | 🟡 | Landing advertises "Community" (hidden feature); leaderboard "Active 0" vs "Upcoming 5". | Open (low — Community CTAs verified routing to /auth/register, not the hidden /community). |
| 11 | / (landing) | both | 🟠 | Stats showcase auto-generated "Learn more" hrefs from tab names (`/${name}`) → **`/learning-paths` 404** (+ `/community`, `/career-growth` would 404 too). | ✅ **Fixed** — mapped tabs to real routes (career-roadmap, coding-challenges), default `/auth/register`. |
| 12 | several | both | 🟡 | `GET /monitoring` → 429/500 (Sentry telemetry tunnel) on a few pages. | Open (env-only — Sentry tunnel fails locally without a DSN; works in prod). |

---

## Console / network errors per page
_(from manifest.json — real runtime errors a user's browser hits)_
- `GET http://localhost:3000/activity` → 404 — on **/dashboard** and **/admin** (see #2).
- `GET http://localhost:3000/battles/undefined` → 404 — on **/instant-battle** (see #1).

---

## Dark-mode pass (2026-06-14)
Captured the key pages (home, about, pricing, faq, contact, blogs, login, dashboard,
battle-zone, create, statistics, profile, leaderboard) in **dark theme** (forced via
`localStorage.theme=dark`). Result: dark mode is **well-implemented via design tokens** —
no contrast/visibility bugs found. The one dark issue (the pricing page) was already
fixed by the token conversion (#7), and now renders correctly in **both** themes.

## Details / notes
- Screenshots reviewed at desktop (1440) + mobile (390), scroll-triggered so `whileInView` animations + lazy images render (an instant full-page shot otherwise shows false "empty section" gaps).
- Pages that look clean so far: home (desktop+mobile), dashboard, battle-zone list, create wizard, profile, statistics, login — all have honest empty states and responsive layouts.
- Landing advertises "Community" / "Active Community", which is a **deferred/hidden** feature — verify those CTAs route to `/auth/register` (per DEFERRED_FEATURES.md) and never to the hidden `/community`.
