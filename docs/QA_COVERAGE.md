# EduScale — QA Coverage Matrix

> **Purpose:** make "100%" mean something. A flow is **not** done until an automated test
> *performs the action and asserts the outcome against the real backend + DB* — not just that
> the page rendered. This file is the single source of truth for what is actually proven.
>
> **Status legend**
> - ✅ **VERIFIED** — automated functional test exercises it + asserts the outcome (happy + at least one edge/error).
> - 🟡 **BUILT, UNVERIFIED** — code exists and renders, but no outcome-asserting test. *Do not call this done.*
> - 🔴 **BROKEN** — looks functional but fails on use.
> - ⚪ **DEFERRED (intentional)** — "Coming Soon" placeholder; out of scope until built. Not a bug.
> - ❓ **UNKNOWN** — not yet investigated.

---

## ✅ TEST ENV — resolved (2026-06-15)

The Supabase project EduScale's `.env` points at is **STAGING / disposable** — the user is deploying a
**fresh, separate project for production**. So **destructive + edge-case QA against the current project is
authorized and expected.** The env is no longer a blocker; the find-vs-reality gap can now actually be closed.

- **Roles + role users: VERIFIED** ✅ — `seed:roles` + `seed:user` run against staging; all 4 users carry the
  correct Supabase `app_metadata.role` (admin=ADMIN, moderator=MODERATOR, both students=STUDENT), proven by
  querying the auth API (not assumed). `admin@eduscale.io` reaches `/admin`; `teststudent` reverted to STUDENT.
- **When the fresh prod project is created:** run `seed:roles` there (roles only). **Do NOT** seed the demo
  users (`admin@eduscale.io`, etc.) into prod.

---

## How we close the gap (the method)

1. **Decompose** every area into `role × operation × (happy / edge / error)` — this file.
2. **Author functional e2e** that performs each cell and asserts the real outcome (DB row created/updated/deleted, correct error code, correct UI state) — not screenshots.
3. **Run → triage → fix → re-run** until the cell is green.
4. **STATUS.md mirrors this file exactly** — no area is "ready" with 🟡/🔴/❓ cells in a shipped flow.
5. Each iteration: update the changed cells here + log what changed.

---

## Roles & test users

| Role | Seeded user | Password env var | Powers |
|---|---|---|---|
| STUDENT | `testuser@yopmail.com` (teststudent) | `E2E_STUDENT_PASSWORD` | Core learner journey |
| STUDENT #2 | `battleplayer2@yopmail.com` | `E2E_STUDENT2_PASSWORD` | 2nd participant for battles |
| ADMIN | `admin@eduscale.io` | `E2E_ADMIN_PASSWORD` | Full admin panel |
| MODERATOR | `moderator@eduscale.io` | `E2E_MODERATOR_PASSWORD` | Article/forum moderation (no UI yet — see Moderator Plan) |

> 🔐 **Passwords are never committed.** They were, in ten files across Backend and Frontend including
> the ADMIN account, in a repo mirrored to a public remote — the exposure this table used to be part
> of. They now come from the environment with no fallback, from one source per side
> (`Backend/qa/testUsers.mjs`, `Frontend/tests/utils/testUsers.ts`), and the seeder that creates the
> accounts reads the same variables. See `.env.example`.

> Seeder (`prisma/seeders/user.seeder.ts`) now sets Supabase **`app_metadata.role`** (the field the
> route middleware actually reads) on both create + re-seed. **Verified ✅** against staging on 2026-06-15.

---

## Coverage matrix by area

### 1. Auth & Authorization 🟢 (core proven; OAuth still broken)
Proven by `Backend/qa/run.mjs` against staging (real Supabase login + real backend).
| Flow | Role | Type | Status | Notes |
|---|---|---|---|---|
| Email/password login (all 4 role users) | all | happy | ✅ | real Supabase signIn returns token |
| `GET /users/me` returns correct role | student/admin | happy | ✅ | STUDENT / ADMIN asserted |
| Logout invalidates token (Redis blocklist) | auth | happy | ✅ | me 200 → logout → me **401** asserted |
| No token / bad token → 401 | guest | error | ✅ | both asserted |
| Non-admin → `GET /admin/users` → 403 | student | error | ✅ | role gate asserted |
| Admin → `GET /admin/users` → 200 | admin | happy | ✅ | |
| CSRF enforced on mutations (double-submit) | auth | error | ✅ | POST without token → 403 CSRF_INVALID (confirmed) |
| **Lowercase-role authz bug** | admin | error | ✅ FIXED | `authorizeRoles('admin')` vs DB `ADMIN` → real admins got 403 on `/analytics/platform` + roadmap delete. Made `authorizeRoles` case-insensitive. admin 403→200, student stays 403. |
| Email/password register | guest | happy | 🟡 | manual only |
| Google OAuth | guest | happy | 🔴 | wrong Supabase project configured (known) |
| Forgot/reset password · Email verification | guest | happy | ❓ | |

### 2. Dashboard 🟢
| Flow | Role | Type | Status | Notes |
|---|---|---|---|---|
| `/dashboard/summary` → 200 + real aggregate shape | student | happy | ✅ | keys: stats, enrolledRoadmaps, recommendedRoadmaps, activities, achievements, streak, weeklyActivity |
| Empty state (new user, no roadmaps) | student | edge | ❓ | |

### 3. Career Roadmaps 🟢 (core proven)
| Flow | Role | Type | Status | Notes |
|---|---|---|---|---|
| `GET /roadmaps` → 200 non-empty | student | happy | ✅ | |
| Enroll persists a `UserRoadmap` row | student | happy | ✅ | asserted against DB (row created) |
| Enroll twice = idempotent (no dup, no 500) | student | edge | ✅ | row count stays 1 |
| Enroll without roadmapId → 400 | student | error | ✅ | validation asserted |
| Like roadmap → 2xx | student | happy | ✅ | |
| Bookmark (toggles + persists) | student | happy | ✅ | `social` area: bookmark → 2xx |
| Comment + like comment | student | happy | ✅ | `social` area: add comment (+id), empty→4xx, toggle like, GET comments |
| Detail view (roadmap + main-concepts) | student | happy | ✅ | `detail` area: GET /roadmaps/:id (same id) + /:id/main-concepts |

### 4. Battle Zone 🟢 (full lifecycle + gameplay scoring proven)
| Flow | Role | Type | Status | Notes |
|---|---|---|---|---|
| Create battle from real topic source → 201 + Battle row | student | happy | ✅ | now sources canonical content (see decision below) |
| Battle seeded with questions (BattleQuestion rows) | student | happy | ✅ | 5 questions snapshotted from the pool |
| Empty question pool → graceful 422 | student | error | ✅ | (not a 500) |
| GET /battles/:id · join · leaderboard | both | happy | ✅ | |
| **Anti-cheat: questions blocked (403) until IN_PROGRESS** | student | error | ✅ | confirmed correct gating |
| Ready → start → IN_PROGRESS | both | happy | ✅ | needs ≥2 participants (creator must join) |
| **Realtime: socket auth handshake** (valid connects, no/bad token rejected) | both | happy/error | ✅ | `qa/socket.mjs` — the prior Supabase-vs-HMAC auth bug stays fixed |
| **Realtime: live event delivered after start** (`battle:status_changed`) | both | happy | ✅ | 2-client socket test |
| **Realtime gameplay sync**: an answer broadcasts `score_update` to the OTHER player + `answer_result` to the submitter | both | happy | ✅ | `qa/socket.mjs` 2-client, proves live room broadcasts |
| **Submit correct option → is_correct=true + score** | student | happy | ✅ | validates the correct-answer index mapping |
| **Submit wrong option → is_correct=false** | student | error | ✅ | |
| Instant 1-v-1 matchmaking | student | happy | ⚪ | `/instant-battle` Coming Soon — no backend |

> **✅ RESOLVED — architectural decision (the question-table duplication):** EduScale had **two parallel question systems** — `Quiz.questions → Question/Option` (3773 rows, used by the real topic-quiz feature) and `Quiz.quiz_questions → QuizQuestion/QuizOption` (4 rows, used only by the battle pool + two unused admin endpoints). The battle pool read the near-empty duplicate, so battles couldn't find questions. **Decision: unify on `Question`/`Option` as the single source of truth.** The pool now reads `Question`, deriving the correct answer exactly as quiz scoring does (`Option.text === Question.correct_answer`, since `Option.is_correct` is unreliable in the data). Verified: battles now source real content from any topic/subject/roadmap, and gameplay scores correctly. **System B removed (DONE):** deleted the frontend-unused `/questions` + `/quiz/create` endpoints, their controllers/repos, and the dead seeder; dropped the `QuizQuestion`/`QuizOption`/`QuizAnswer`/`QuizSubmissionAnswer` models + relations; migration `20260615000000_drop_quizquestion_system_b` drops the tables. `QuizSubmission` (the real topic-quiz submission) kept. Build clean + full QA 39/39 green against the cleaned schema. **There is now ONE question model.**
>
> **✅ FIXED — nested-transaction connection deadlock:** `submitAnswer` ran `buildLeaderboard` as a separate query (global `prisma`) inside its `$transaction`+lock, needing a 2nd pooled connection → deadlock/500 on a 1-connection pool. `buildLeaderboard` now accepts the active client and `submitAnswer` passes its `tx`. **Verified: battle answer-scoring passes at `connection_limit=1`** (15/15), where it previously 500'd.

### 5. Coding Challenges 🟢 (list/detail proven)
| Flow | Role | Type | Status | Notes |
|---|---|---|---|---|
| `GET /challenges` (paginated) → 200 | student | happy | ✅ | |
| `GET /challenges/:id` → 200 | student | happy | ✅ | |
| Open challenge + run code | student | happy | ✅ | `code` area: POST /run-code responds gracefully (not 5xx) |
| Save + restore draft | student | happy | ✅ | `code` area: save draft → restore returns same code; missing-language graceful |
| Submit solution | student | happy | ✅ | `more` area: POST /challenges/:id/submit responds gracefully (Judge0 may be offline) |

### 6. Quiz 🟢 (submit + real score proven; one real bug fixed)
| Flow | Role | Type | Status | Notes |
|---|---|---|---|---|
| Standalone `/quiz/[topicId]` page | student | happy | ⚪ | **dead stub** — renders only a title + button, hardcoded `score=0`, no questions/answers; POSTs `{topicId, score}` to `/quizzes/submit` which **doesn't exist** (404). **Not linked anywhere** (unreachable). Cut-or-finish decision; real quiz UI lives in the resource page. |
| Topic quiz submit + real computed score | student | happy | ✅ | `quiz` area: submit correct answers → score 50 (>0), is_passed boolean, **persisted to DB** with matching score |
| **`/quiz/submit` enforces auth** | guest | error | ✅ FIXED | **bug found+fixed**: route had no `authMiddleware`, so the controller's `req.user.id` was always undefined → **every** submit 401'd (broke the resource-page quiz). Added the guard (matches `/topics/quiz/submit`); now no-token→401, logged-in→200. |

### 7. Articles 🟢 (reads + moderation writes proven)
| Flow | Role | Type | Status | Notes |
|---|---|---|---|---|
| `GET /articles/all` (public) → 200 | public | happy | ✅ | |
| `GET /articles/my-articles` → 200 | student | happy | ✅ FIXED | was 404 (shadowed by `/:id`); reordered |
| Set status (APPROVED) → persists | admin | happy | ✅ FIXED | 3 bugs: controller read `req.query` not body (always 404); Joi enum mismatch (PUBLISHED/PENDING_REVIEW vs real DRAFT/PENDING/APPROVED/REJECTED); `updateArticle` hardcoded status=PENDING |
| Non-admin set status → 403 | student | error | ✅ | role gate |
| Moderation action (APPROVE/notes) | moderator | happy | ✅ | |
| **HTML sanitization — `<script>` + `onerror` stripped, safe markup kept** | admin | error | ✅ | XSS payload neutralized; verified in DB |
| Article detail + comments | public | happy | ✅ | `detail` area: GET /articles/:id + /:id/comments (public) → 200 on an APPROVED article |
| **Submit article (author flow) → PENDING** | student | happy | ✅ NEW | added `POST /articles` (auth, any user); content XSS-sanitized; validation 400; no-auth 401 |
| **Full submission→moderation loop** | student+mod | happy | ✅ NEW | submit → appears in `/moderate` queue → moderator approves → APPROVED. The moderation queue now has a real content source. |

### 8. Profile & Streak 🟢
| Flow | Role | Type | Status | Notes |
|---|---|---|---|---|
| View profile (`/users/me`) | student | happy | ✅ | |
| Edit profile persists (`PUT /users/me`) | moderator | happy | ✅ | first_name change reflected |
| Edit profile does NOT reset role | admin/mod | edge | ✅ FIXED | privileged role survives a save |
| Streak stats + weekly activity → 200 | student | happy | ✅ | both endpoints |

### 9. Resources 🟢 (reads + writes proven)
| Flow | Role | Type | Status | Notes |
|---|---|---|---|---|
| `GET /resources` (paginated) → 200 | student | happy | ✅ | |
| Create resource → 201 + owned by user | student | happy | ✅ | now validated (createResourceValidation); no-title → 400 |
| `POST /resources/save/:topicId` → PENDING article | student | happy | ✅ | ⚠️ **mislabeled** — creates an Article under a topic (redundant with `POST /articles`); 500s on a non-topic id. Candidate to merge/rename. |
| Detail | student | happy | ✅ | `detail` area: GET /resources/:id → 200. ⚠️ **naming finding:** the `/resources/*` routes actually operate on **Subjects** (`getResource` → `prisma.subject.findUnique`); the separate `Resource` rows from `POST /resources/create` are NOT fetched here. The frontend `/resources/[id]` is a subject detail (subject → topics → quiz). Confusing but not a bug. |

### 10. Admin Panel ✅ (validated this session, prod read + 1 write)
| Flow | Role | Type | Status | Notes |
|---|---|---|---|---|
| Overview metrics | admin | happy | ✅ | real data |
| User search + list | admin | happy | ✅ | |
| Change user role (persists + audited) | admin | happy | ✅ | PATCH 200, audit shows UPDATE_USER_ROLE |
| Delete user (confirm dialog) | admin | happy | 🟡 | wired; not exercised (destructive on prod) |
| Moderation queue + approve/reject | admin/mod | happy | ✅ | `mod`+`submit` areas: queue includes a seeded PENDING article; moderator approve → APPROVED (loop closed); public `/articles/all?status=PENDING` cannot leak PENDING |
| Audit log lists actions | admin | happy | ✅ | |
| Non-admin denied | student | error | ✅ | `auth`: student→/admin/users 403; `mod`: student→moderation queue 403 |

### 11. Community / Discussions / Misc ⚪ (deferred)
| Flow | Status | Notes |
|---|---|---|
| `/community`, `/discussion-forums`, `/discussions`, `/collaboration-opportunities`, `/member-highlights`, `/events` | ⚪ | "Coming Soon" placeholders. Forums backend CRUD exists but no UI. |
| `/achievements` standalone | ✅ | **Wired 2026-09-05 (ED-8).** Reads `GET /dashboard/achievements`; list / honest empty state / error+retry / skeleton, each asserted in `src/app/achievements/AchievementsContent.test.tsx` (4 tests). Populated state proven against the local DB: one inserted row rendered with title, description and "1 achievement" at 390px. Auth-required, so robots.txt already disallows it — no noindex (Disallow + noindex cancel, see robots.ts). |
| Chat, Courses, Jobs, Billing, Support, Placement, RBAC UI | ⚪ | backend endpoints exist, no frontend |

---

## 2026-08-15 — E2E suite session (QA2-EDU)

**The harness now runs against a throwaway LOCAL database, not the shared Supabase.** Every
destructive assertion in `qa/run.mjs` used to mutate the real project. `qa/seed-e2e.mjs` builds the
whole fixture graph (roadmap → main concept → subject → topic → quiz → questions/options, two coding
challenges, an XSS probe challenge, an approved article, a resource) into a local Postgres, and
refuses to run unless `DATABASE_URL` points at localhost.

```bash
# 1. throwaway DB
createdb eduscale_e2e
cd Backend
DATABASE_URL=postgresql://localhost:5432/eduscale_e2e DIRECT_URL=postgresql://localhost:5432/eduscale_e2e \
  npx prisma migrate deploy && npm run seed:all && npm run qa:seed

# 2. COMPILED server on 4010 (tsx mis-transpiles redlock — always run dist)
npm run build
DATABASE_URL=... DIRECT_URL=... REDIS_URL=redis://localhost:6379/5 PORT=4010 \
  node -r module-alias/register dist/main.js

# 3. suites
npm run qa                       # Backend: 176 HTTP+DB assertions, 10 realtime
cd ../Frontend && npm run test:e2e:journeys   # Playwright journeys on :3220
```

> **2026-09-05:** the `eduscale_e2e`-on-5432 half of this recipe predates the pgvector migration
> (`20260622010000_add_content_embedding`), which needs Postgres 17 — the brew `postgresql@16` service on
> 5432 cannot `CREATE EXTENSION vector`. Use the pg17-on-5434 recipe in
> [Running the default Playwright suite safely](#2026-09-05--running-the-default-playwright-suite-safely).

### New coverage

| Area | Where | What it proves |
|---|---|---|
| Role-enforcement matrix | `qa/run.mjs` area `rbac` (67 assertions) | Every admin/moderator route asserted for **no-token → 401**, **STUDENT → 403**, **MODERATOR → 403** (admin-only), plus the admin happy path so the gate can't be a blanket deny. Includes a self-escalation attempt that must leave the DB role untouched. |
| Ownership / IDOR | `qa/run.mjs` area `idor` | Cross-user analytics read, foreign roadmap edit, non-participant reading a live battle's questions, non-participant submitting an answer. |
| Concurrency | `qa/run.mjs` area `concurrency` | Concurrent duplicate joins → exactly 2 participant rows; two clients starting the same battle → one winner, no 5xx, questions not dealt twice; triple-fired `submitAnswer` → 1 `BattleAnswer` row and one score; 12 parallel leaderboard builds; auto-completion + ranked final leaderboard. |
| Rate limiting | `qa/run.mjs` area `ratelimit` | The 10/min streak limiter actually bites (429, never 5xx) and each limiter owns its own Redis bucket. |
| Stored XSS | `qa/run.mjs` area `xss` + `Frontend/tests/e2e/xss.spec.ts` | Every write path that reaches `Article.content` / `Resource.content` is sanitised server-side, and the rendered page executes nothing. |
| Code execution | `qa/run.mjs` area `exec` | `/run-code` requires auth, rejects unknown languages before they reach the metered executor, and answers inside the breaker's ceiling. |
| Realtime | `qa/socket.mjs` (10 assertions) | Handshake auth (valid/none/bad), `battle:started` broadcast, score sync between two live clients, **reconnect mid-battle**, and **room isolation** — a non-participant is refused and receives nothing. |
| Browser journeys | `Frontend/tests/e2e/` | Student (land → sign in → challenge → run code → result), moderator (submit → queue → approve → public), admin (every admin route 200 for admin / 403 for student, admin UI unreachable for a student), and a **two-browser-context battle** played to completion. |
| Page health | `Frontend/tests/e2e/page-health.spec.ts` | Per public page × {1440, 390}: 0 console errors, 0 uncaught errors, 0 failed requests, every image loads, axe WCAG 2 A/AA, no horizontal overflow. |
| Honesty | `Frontend/tests/e2e/honesty.spec.ts` | No invented people/institutions, no third-party stock avatars, no placeholder posts presented as published content, no unsourced metrics. |

### Bugs found + fixed this session

1. **Stored XSS — `POST /resources/save/:topicId` wrote `Article.content` with no sanitisation** while
   `POST /articles` sanitised. Article bodies render through `dangerouslySetInnerHTML`. *(fixed:
   `sanitizeRichText`; regression test in area `xss`)*
2. **`POST /resources/create` stored title/description/content raw.** *(fixed + tested)*
3. **`/articles/[id]` and `/resources/[id]` threw during SSR** — `DOMPurify.sanitize is not a
   function` with no DOM, so Next silently fell back to client-only rendering on every article view
   (no SSR HTML, no SEO, an error logged per request). *(fixed; asserted in `xss.spec.ts`)*
4. **IDOR: `GET /analytics/user/:userId`** returned any user's analytics to any logged-in user.
   *(fixed: self-or-admin)*
5. **Duplicate `POST /battles/:id/join` under a race → 500** leaking a raw Prisma unique-constraint
   error. *(fixed: P2002 → 409)*
6. **Duplicate `POST /battles/answer` → 500**, same leak. *(fixed: pre-check + P2002 → 409)*
7. **Concurrent `POST /battles/:id/start` → 500** `"unable to achieve a quorum"` straight from
   redlock. *(fixed: lock contention → 409)*
8. **Realtime room isolation: `battle:join` had no participant check** — any authenticated socket
   could subscribe to any battle and watch its questions, timers and full score leaderboard.
   *(fixed: participants + creator always, strangers only while the lobby is open)*
9. **`POST /run-code` was unauthenticated** — an open, metered Judge0 faucet. *(fixed: authMiddleware)*
10. **An unknown `language` reached the circuit breaker** and counted as a Judge0 failure, so three
    junk requests could open the breaker and disable code execution for everyone for 30s.
    *(fixed: validated at the edge)*
11. **Every rate limiter shared one Redis key** (`rate-limit:<ip>`), so unrelated traffic spent each
    other's budget and each call rewrote the TTL with its own window — an api call reset the
    15-minute auth window to 60 seconds. *(fixed: per-limiter keyPrefix)*
12. **`POST /streak/update` 500'd under concurrency** — every request opened an interactive
    transaction on the same row and Prisma's 2s/5s defaults expired the queue. *(fixed: real
    timeouts + contention → 409)*
13. **Every handled 4xx was logged as `error` "Unexpected Error" with `status: 500`** — the
    `instanceof AppError` check compared against a different class from the one `createAppError`
    builds, so it was always false. Real 500s were unfindable in Sentry. *(fixed: branch on status,
    4xx at `warn`)*
14. **ED-5 fabricated social proof** — the landing leaderboard carried five invented students at real
    institutions with `i.pravatar.cc` portraits; `/blogs` carried three invented posts.
    *(fixed: anonymous placeholders, real empty state, unknown blog id → 404 not a permanent
    "Loading...")*
15. **ED-7 coding-challenge layout** was a fixed horizontal split at every width. *(fixed: stacks
    below the `md` breakpoint)* **Second half fixed 2026-09-05:** both tab strips still CLIPPED on a
    phone — the four problem tabs are 434px, eight console case-tabs ~480px, and their wrappers were
    `overflow: visible` inside an `overflow: hidden` panel, so "Submissions" and "Case 6+" were
    unreachable by touch at 360/390px. Measured against a production build in Chromium (last tab
    right edge 426/490px in a 360px viewport). Now the wrappers scroll sideways; the page itself
    never gains a horizontal scrollbar (`scrollWidth == innerWidth` before and after running code).
    Pinned by the 360px test in `tests/e2e/responsive-journeys.spec.ts` (mobile project), which
    fails against the pre-fix component with "Description strip has no scroll container".

### Verdicts on pre-QA findings

- **ED-1 (ReactMarkdown XSS) — PARTLY FALSE POSITIVE.** `react-markdown` v10 does not render raw HTML
  without `rehype-raw` (not installed) and its default `urlTransform` drops `javascript:` hrefs, so
  the challenge fields are safe — proven with a live payload fixture. The **real** stored-XSS exposure
  was the `dangerouslySetInnerHTML` + client-only DOMPurify path, and it was reachable through the two
  unsanitised write paths above (items 1–2).
- **ED-5 — CONFIRMED, fixed.**
- **ED-7 — CONFIRMED, fixed.**

---

## Tally (honest)

| Status | Count (approx flows) |
|---|---|
| ✅ Verified | ~120 (Admin + Auth + Dashboard + Roadmaps + bookmark/comments + Profile/Streak + Articles reads/writes + moderation + XSS + **submit→moderate→publish loop** + Resources + Challenges + run-code + drafts + submit + leaderboard + streak-update + **full Battle lifecycle incl. gameplay scoring** + **realtime WebSocket**) + **role-enforcement matrix** + **IDOR guards** + **battle concurrency** + **rate limiting** + **code-execution surface**) — `qa/run.mjs` **176/176** + `qa/socket.mjs` **10/10** + Playwright journeys |
| 🟡 Built, unverified | ~1 (article create/author path — confirm intended endpoint) |
| 🔴 Broken | 2 (OAuth, standalone quiz) |
| ⚪ Deferred (intentional) | ~12 pages / 7 backend-only |
| ❓ Unknown | ~4 |

✅ **Architectural decision made + implemented:** unified the battle question pool onto the canonical `Question`/`Option` table (was reading the near-empty `QuizQuestion` duplicate). Battles now source real content + gameplay scoring verified. Follow-up: drop the redundant `QuizQuestion` System B tables via migration.

**Bugs found + fixed via this matrix (without prompting):**
1. Seeder never set Supabase `app_metadata.role` → seeded admin couldn't reach `/admin`. *(fixed + verified)*
2. `authorizeRoles` case-sensitive vs uppercase DB roles → real admins 403'd on `/analytics/platform` + roadmap delete. *(fixed + verified)*
3. **Profile edit demoted privileged users:** `PUT /users/me` forced `role: connect STUDENT` on update, so any admin/moderator who saved their profile silently became a STUDENT. *(fixed + verified)*
4. **`GET /articles/my-articles` was unreachable (404):** registered after `GET /:id`. Reordered. *(fixed + verified)*
5. **Battle pool read the wrong (near-empty) question table** → battles couldn't find questions. Unified onto canonical `Question/Option`; removed the duplicate System B. *(fixed + verified, incl. gameplay scoring)*
6. **Article status endpoint was fully broken** (3 bugs): read `req.query` not body (always 404); Joi status enum didn't match the DB `Status` enum; `updateArticle` hardcoded status=PENDING ignoring the input. *(all fixed + verified)*
7. **`getDraft` 500'd on a missing `language` query param** (raw Prisma composite-key error) → now returns null gracefully. *(fixed + verified)*
8. **Admin Overview "Cache: error" was always wrong** — health check read a key named `'test'` that nothing ever wrote, so it reported `error` even when Redis was healthy. Now a real write-then-read probe → reports `healthy`. *(fixed + verified)*
9. **Streak update 500 on first use** — `userDailyActivity.create` ran before the `UserStreak` FK parent existed → foreign-key violation for any user without a prior streak. Now ensures the streak row first. *(fixed + verified)*
10. **Challenge submit 500** — controller read `req.params.challenge_id` but the route param is `:challengeId` → `findUnique({id: undefined})`. Fixed the param name. *(fixed + verified)*
11. **`buildLeaderboard` nested-transaction deadlock** — see Battle Zone note (fixed; verified at connection_limit=1).
8. (earlier) admin API entirely dead — routes never registered, searchUsers 500, audit wrong table. *(fixed + verified)*

**Security checks passing:** XSS sanitization on article content (`<script>`/`onerror` stripped, safe markup kept); role gates (student denied admin/moderator writes); CSRF on mutations; logout token blocklist; battle anti-cheat (questions hidden until start).

**EduScale is NOT "100%"** — but it's now honestly tracked and moving: Auth, Dashboard, Roadmaps (core),
and the Admin panel are outcome-verified. Remaining areas (Battles, Challenges/Quiz, Articles, Profile,
Resources) are next, worked area-by-area with `Backend/qa/run.mjs`.

---

## Moderator panel — ✅ BUILT + VERIFIED (2026-06-15)
The MODERATOR role existed + was enforced on article routes but had no UI. Now shipped:
- **Backend:** `GET /articles/moderation/queue` (ADMIN+MODERATOR) lists pending articles; closed a leak where public `/articles/all?status=PENDING` exposed unpublished content (now forces APPROVED). Verified `qa/run.mjs mod` 3/3 (moderator sees queue, student 403, no public leak).
- **Frontend:** `/moderate` page — `RoleGuard roles={['ADMIN','MODERATOR']}`, review queue, approve (→status APPROVED) / reject (optional note → status REJECTED). Mirrors the admin console.
- **Real-UI validated (Playwright, 3/3):** moderator reaches `/moderate` + sees the panel; **student is redirected to /dashboard** (RoleGuard blocks). Typecheck 0, eslint clean.
- 3-tier model now live: STUDENT → MODERATOR (`/moderate`) → ADMIN (`/admin`). Future: INSTRUCTOR/AUTHOR, SUPPORT.

## Moderator role & panel — original plan (item 6, now implemented above)

The `MODERATOR` role already exists in the schema + is enforced on `articleRoutes` (status/moderation/update)
and `forums DELETE`. **It has no UI** — a moderator literally cannot do their job in the app today.

**Proposal:** a `/moderate` panel (subset of admin, gated `authorizeRoles('ADMIN','MODERATOR')`):
- **Content queue** — pending articles + flagged forum posts → approve / reject / request-changes (reuses the admin moderation endpoints).
- **Article review** — view content, set status (publish/unpublish), add moderation notes.
- **No** user-management / system-config / audit (admin-only).

This gives a clean 3-tier model: **STUDENT** (learn) → **MODERATOR** (curate content) → **ADMIN** (run platform).
Future roles to consider: **INSTRUCTOR/AUTHOR** (create roadmaps/challenges — currently anyone can POST), **SUPPORT** (tickets).

**Recommended next build order:** (1) stand up local Supabase so QA is real → (2) work the matrix 🟡→✅ area
by area (auth → dashboard → roadmaps → battles) → (3) build the moderator panel → (4) decide which ⚪ deferred
pages to build vs cut.

## 2026-09-05 — Running the default Playwright suite safely

`npx playwright test` (the default `playwright.config.ts`) has a `globalSetup` that runs `npm run seed:battles`
in `Backend/`. That seed **deletes every battle row, then writes five**, and it resolves its database from
`Backend/.env` — the shared Supabase project — unless `DATABASE_URL` is exported. The seeder refuses anything
that is not a local throwaway (host `localhost`/`127.0.0.1` **and** a database named `*_test`/`*_e2e`, confirmed
by asking the open connection `current_database()` — the same guard `battle.test.ts` uses, no override), and
`global-setup.ts` now **aborts the run** on a refused or failed seed instead of printing a warning and
continuing. The frontend talks to the backend at `NEXT_PUBLIC_API_BASE_URL` (`localhost:4000` in
`Frontend/.env`), so the seed and the backend must read the **same** local database or the seeded battles are
invisible to the specs. Runs that need no battles (the public/anonymous specs) set `PLAYWRIGHT_SKIP_SEED=1`,
which is logged; CI's WCAG job does exactly that.

```bash
# 1. Postgres 17 on a spare port (pgvector is built for 17/18 only; the brew 16 service stays on 5432)
/opt/homebrew/opt/postgresql@17/bin/pg_ctl -D /opt/homebrew/var/postgresql@17 -o "-p 5434" -l /tmp/pg17.log start
/opt/homebrew/opt/postgresql@17/bin/createdb -p 5434 eduscale_test   # once; the name must end in _test or _e2e
export DATABASE_URL="postgresql://$(whoami)@localhost:5434/eduscale_test"
export DIRECT_URL="$DATABASE_URL"

# 2. Schema + rows the seed needs (it wants at least one User row; seed:roles/features/permissions are DB-only)
cd Backend && npx prisma migrate deploy && npm run seed:all
npm run seed:battles            # refuses, exit 1, unless DATABASE_URL is a local throwaway

# 3. Backend on 4000 against the SAME database, then the suite — the exported DATABASE_URL reaches the seed
PORT=4000 npm run dev
cd ../Frontend && npx playwright test

# No battles needed?  PLAYWRIGHT_SKIP_SEED=1 npx playwright test tests/accessibility.spec.ts -g "Public"
```

`seed:user` and `qa:seed` create accounts through Supabase Auth in the project `Backend/.env` names — they are
not part of "local-only". The authenticated specs still log in against that Supabase project
(`tests/auth.setup.ts`); what this section keeps local is every row the seed deletes and writes.

*Last updated: 2026-09-05.*
