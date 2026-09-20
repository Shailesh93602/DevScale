# Pricing — ground truth, and what each cut feature would cost to bring back

**Audited 2026-09-20 against `fee73ec7`.** This file exists so the decision can
be made later without redoing the analysis. It does **not** decide the product
strategy — it records what was advertised, what actually exists, and what each
line would take to become true.

## What happened

`/pricing` advertised three tiers:

| Tier | Price | Bullets |
| --- | --- | --- |
| Free Tier | $0/mo | 5 |
| Pro Learner | **$29/mo** | 6 |
| EduScale Team | **$99/user/mo** | 6 |

Of the seventeen bullets across them, **three were true, two were true but
untiered, and twelve described things that do not exist in this repository.**

Nobody was ever charged. The Stripe price ids
(`NEXT_PUBLIC_STRIPE_PRO_PRICE_ID` / `..._TEAM_...`) are unset in production,
and the checkout call was broken three ways over (below). That makes this false
advertising behind a dead button rather than a billing incident — but the copy
was false whether or not the button worked, and that is what was fixed.

## The mechanism, in three findings

1. **Nothing in EduScale is gated on a subscription tier.** `requirePro` and
   `requireTeam` (`Backend/src/middlewares/subscriptionGating.ts:8,33`) are
   fully implemented and carry a 15-case test —
   `Backend/src/tests/middlewares/subscriptionGating.test.ts` — and are applied
   to **zero routes**. A repo-wide search finds no other reader of
   `subscription.tier` except `_getTierFromPrice`
   (`Backend/src/services/subscriptionService.ts:134`), which maps a Stripe
   price id to a string that nothing then consults.
2. **The Pro button could not have completed a checkout even with Stripe
   configured.** The old page imported bare `axios` rather than the configured
   `useAxios` (which carries `NEXT_PUBLIC_API_BASE_URL`), so it POSTed to
   `/api/v1/billing/checkout` **on the frontend origin**, where no Next route
   exists — `Frontend/src/app/api/` holds only `version`, `cron/keepalive` and
   `sentry-example-api`. The real route is `POST /billing/checkout` on the API
   host (`Backend/src/routes/routes.ts:93`). No `Authorization` header was sent
   either, and that route requires a session.
3. **The post-checkout pages do not exist.** `createCheckoutSession` returns
   users to `/subscription/success` and `/subscription/cancel`, and the billing
   portal returns to `/settings/subscription`. None of those three routes is in
   `Frontend/src/app`.

## Feature-by-feature ground truth

Legend: **YES** = shipped and reachable · **UNTIERED** = shipped, but free to
every signed-in user, so it cannot be sold · **PARTIAL** = some of it exists ·
**NO** = nothing implements it.

### Free Tier (as advertised)

| Advertised | Verdict | Evidence |
| --- | --- | --- |
| Access to 25+ Intro Courses | **NO** | No course seeder: `Backend/prisma/seed.ts:8–27` seeds roles, permissions, features, role-permissions, users, subjects, topics, challenges, battles and roadmaps — courses are not among them. `Frontend/src/components/CourseCard/index.tsx` is imported nowhere and there is no `/courses` route. `Backend/src/routes/courseRoutes.ts:14–23` serves an empty table. |
| Community Forum Access | **PARTIAL (not reachable)** | The backend exists (`Backend/src/routes/communityForumRoutes.ts:19–32`) but every frontend entry point renders `ComingSoon`: `/community`, `/discussion-forums`, `/discussions`, `/doubts`. Already recorded in [DEFERRED_FEATURES.md](DEFERRED_FEATURES.md). |
| Basic Code Editor | **YES** (but "Basic" implied a better one) | Monaco at `Frontend/src/app/coding-challenges/[id]/CodingChallenge.tsx:4`. There is exactly one editor; nothing is withheld. |
| Public Portfolio Builder | **NO** | Zero implementation. The only "portfolio" strings in the repo are prose in `/about` and a link to the author's own site. |
| 1 Concurrent Battle | **NO (no such limit)** | No concurrency cap exists anywhere in `Backend/src`. A free user may run any number of battles, so the bullet understated the product while implying a paid unlock. |

### Pro Learner — $29/mo

| Advertised | Verdict | Evidence |
| --- | --- | --- |
| Full Course Library (500+) | **NO** | Same as above: zero course rows. The only ~500 figure in the repo is **524 topic directories** under `Backend/resources/roadmapContent`, and those are seeded `is_public: true` (`masterRoadmap.seeder.ts:346`) — free to everyone. |
| Advanced Learning Paths | **UNTIERED** | All 5 seeded roadmaps are public. `Roadmap.difficulty` exists (`schema.prisma:404`) but no code branches on it, and there is no "advanced" tier of content. |
| 1-on-1 Mentor Sessions (2/mo) | **NO** | `Mentorship` / `MentorshipSession` are Prisma models with a repository (`Backend/src/repositories/mentorshipRepository.ts`) and **no controller, no route, no UI**. `/mastermind-forge` renders `ComingSoon` naming mentorship as "on the way". |
| Private Code Reviews | **UNTIERED, and AI not human** | `POST /code-review/challenge/:submissionId` (`Backend/src/routes/codeReviewRoutes.ts:18`) is auth-gated only; UI at `Frontend/src/app/coding-challenges/components/AICodeReviewPanel.tsx`. Every signed-in user already has it, and it reviews your own submission — there is no reviewer. |
| Verified Certifications | **NO** | The `Certificate` model (`schema.prisma:838`) has **zero references** in `Backend/src` or `Frontend/src`. Nothing issues, stores or verifies a certificate. |
| Priority Support | **NO** | `SupportTicket.priority` is a field the reporter sets (`Backend/src/repositories/supportRepository.ts:35`). Nothing routes, escalates or measures by tier, and there is no response-time commitment. |

### EduScale Team — $99/user/mo

| Advertised | Verdict | Evidence |
| --- | --- | --- |
| Organization Dashboard | **NO** | There is no `Organization` or tenant model in `schema.prisma`. The only "Organization" matches in the repo are schema.org JSON-LD in `Frontend/src/app/layout.tsx`. |
| Team Management Tools | **NO** | `TeamProject` and `TeamProjectMember` (`schema.prisma:728,743`) have **zero code references**. There is no seat, invite or membership flow. |
| Dedicated Account Manager | **NO** | A staffing promise on a solo-built project. |
| Tailored Training Paths | **NO as sold** | Per-user challenge recommendations exist (`Backend/src/routes/recommendationRoutes.ts:21`) for every signed-in user. Nothing is org-scoped or bespoke. |
| SLA & API Access | **NO** | The `ApiKey` model (`schema.prisma:1379`) has zero code references: no issuance, no verification, no external API surface, no documented or measured service level. |
| Enterprise Integrations | **NO** | The only webhook in the repo is Stripe's inbound one. There are no outbound integrations. |

## What the page says now

One tier, `$0`, listing only what a signed-in user can do today; and a second
card, **"Paid plans — not available yet"**, whose bullets name the absent
features while saying they are not built, with a disabled button. The Stripe
backend (`Backend/src/routes/subscriptionRoutes.ts`) is untouched — only the
frontend checkout **call** is gone, because there is nothing to sell.

The FAQ's cost answer was corrected in the same commit; it had been updated
once already, in the opposite direction, to match the plans that turned out to
be the fiction.

## What it would take to bring each line back

Read this as a cost sheet, not a recommendation. **Everything below is gated on
one prerequisite:** wire `requirePro` / `requireTeam` onto real routes. Until a
tier gates something, no paid bullet can be true no matter what is built — and
`Frontend/src/lib/no-scale-claims.test.ts` now fails the build if a paid price
appears while that wiring is still absent.

### Shared prerequisites (needed before any paid tier, ~2–3 days)

- Apply the tier middleware to the routes the tier is meant to unlock, and add
  an outcome-asserting test per route (403 for free, 200 for pro) — not a unit
  test of the middleware, which already exists and passed the whole time.
- Set `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRO_PRICE_ID`,
  `STRIPE_TEAM_PRICE_ID` and the two `NEXT_PUBLIC_*` ids on both Vercel
  projects.
- Point the checkout call at the API host (use `useAxios`, which already
  carries the base URL and the session) instead of bare `axios`.
- Build the three missing routes: `/subscription/success`,
  `/subscription/cancel`, `/settings/subscription`.
- Decide and document what happens on downgrade and on a failed payment — the
  webhook sets `tier: 'free'` on delete, and nothing reconciles the content a
  user had access to.

### Pro tier

| Cut line | What would have to exist | Rough size |
| --- | --- | --- |
| A course library of any size | A `Course` authoring or import path, a seeder, a `/courses` listing and detail UI, enrolment already modelled (`Enrollment`). **Then a real count** taken from the database, not a marketing number. | Large — this is a content problem before it is a code problem |
| Advanced learning paths | A content axis that distinguishes advanced from basic (`Roadmap.difficulty` is already there and unused), plus gating on it and enough advanced content to be worth $29 | Medium code, large content |
| Mentor sessions | Controller + routes over the existing `Mentorship`/`MentorshipSession` models, scheduling, availability, a session surface, and **people willing to mentor**. The last one is not an engineering task. | Large, and partly non-technical |
| Private code reviews (as a paid line) | Already shipped and free. To sell it: a free/paid quota split (e.g. N reviews/month free), which means a usage counter and a reset window — neither exists. | Small–medium |
| Verified certifications | Issue + store + a public verification URL over the unused `Certificate` model, plus a completion rule that says what earns one | Medium |
| Priority support | A response-time commitment someone intends to honour, tier-aware ticket ordering, and measurement of whether it was met | Small code, ongoing human cost |

### Team tier

| Cut line | What would have to exist | Rough size |
| --- | --- | --- |
| Organisation accounts / dashboard | An `Organization` model, membership and roles, tenant scoping on **every** query that currently scopes by user, seats and per-seat billing. This is the largest item on the page by a distance, and it touches the data model everywhere. | Very large |
| Team management tools | Invites, seat assignment, removal, and an admin surface, on top of the above. `TeamProject`/`TeamProjectMember` are a starting point only. | Large (after the above) |
| Tailored training paths | Org-scoped roadmap assignment and progress rollup — i.e. the org model again, plus assignment | Large (after the above) |
| Public API + service level | Issuance, hashing and rotation over the unused `ApiKey` model, per-key rate limiting, versioned public endpoints, docs, and an availability figure that is actually measured before it is promised | Large |
| Outbound integrations | Pick the target (Slack? GitHub?), then outbound webhooks with retries and a dead-letter path | Medium per integration |
| Dedicated account manager | A person | — |

## The guard

`Frontend/src/lib/no-scale-claims.test.ts` used to scan prose only — the
README, `CLAUDE.md`, `FINDINGS.md`, `llms.txt` and `docs/` — which left the
rendered pages a visitor reads outside the scope of the test written to protect
them. It now also scans the marketing UI (`/pricing`, the landing page and its
sections, the FAQ, `/about`, the stats showcase) for named features nothing
implements, and asserts the structural invariant that caught this:

> **A paid tier must gate something.** If `/pricing` charges money, at least
> one non-test file under `Backend/src` must apply `requirePro` or
> `requireTeam`.

That invariant reads the backend for call sites rather than re-stating any
string on the pricing page, so it cannot pass against a stale copy of the value
it guards. A rendered page may still **name** an unbuilt feature — but only on
a line that also says it is not built; delete the denial and the test fails.

Prose files are deliberately left out of the feature scan: documents have to be
free to discuss what does not exist, which is exactly what this one does.
