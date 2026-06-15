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

| Role | Seeded user | Password | Powers |
|---|---|---|---|
| STUDENT | `testuser@yopmail.com` (teststudent) | `Test@123` | Core learner journey |
| STUDENT #2 | `battleplayer2@yopmail.com` | `Test@1234` | 2nd participant for battles |
| ADMIN | `admin@eduscale.io` | `Admin@123` | Full admin panel |
| MODERATOR | `moderator@eduscale.io` | `Mod@123` | Article/forum moderation (no UI yet — see Moderator Plan) |

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
| Bookmark (toggles + persists) | student | happy | 🟡 | not yet asserted |
| Comment + like comment | student | happy | 🟡 | |
| Detail view (subjects/topics/progress) | student | happy | 🟡 | |

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
| **Submit correct option → is_correct=true + score** | student | happy | ✅ | validates the correct-answer index mapping |
| **Submit wrong option → is_correct=false** | student | error | ✅ | |
| Instant 1-v-1 matchmaking | student | happy | ⚪ | `/instant-battle` Coming Soon — no backend |

> **✅ RESOLVED — architectural decision (the question-table duplication):** EduScale had **two parallel question systems** — `Quiz.questions → Question/Option` (3773 rows, used by the real topic-quiz feature) and `Quiz.quiz_questions → QuizQuestion/QuizOption` (4 rows, used only by the battle pool + two unused admin endpoints). The battle pool read the near-empty duplicate, so battles couldn't find questions. **Decision: unify on `Question`/`Option` as the single source of truth.** The pool now reads `Question`, deriving the correct answer exactly as quiz scoring does (`Option.text === Question.correct_answer`, since `Option.is_correct` is unreliable in the data). Verified: battles now source real content from any topic/subject/roadmap, and gameplay scores correctly. **System B removed (DONE):** deleted the frontend-unused `/questions` + `/quiz/create` endpoints, their controllers/repos, and the dead seeder; dropped the `QuizQuestion`/`QuizOption`/`QuizAnswer`/`QuizSubmissionAnswer` models + relations; migration `20260615000000_drop_quizquestion_system_b` drops the tables. `QuizSubmission` (the real topic-quiz submission) kept. Build clean + full QA 39/39 green against the cleaned schema. **There is now ONE question model.**
>
> **⚠️ Note (latent, low-prod-risk):** `submitAnswer` runs `buildLeaderboard` as a separate query inside its `$transaction`+lock; with a 1-connection pool (the `DIRECT_URL` has `connection_limit=1`) it deadlocks → 500. Fine with a normal pool (verified at 10), but the runtime should use a pooled `DATABASE_URL`, and ideally `buildLeaderboard` should use the transaction client.

### 5. Coding Challenges 🟢 (list/detail proven)
| Flow | Role | Type | Status | Notes |
|---|---|---|---|---|
| `GET /challenges` (paginated) → 200 | student | happy | ✅ | |
| `GET /challenges/:id` → 200 | student | happy | ✅ | |
| Open challenge + run code | student | happy | 🟡 | assert execution result (next) |
| Save + restore draft | student | happy | 🟡 | |
| Submit solution | student | happy | ❓ | |

### 6. Quiz 🔴 / 🟡
| Flow | Role | Type | Status | Notes |
|---|---|---|---|---|
| Standalone `/quiz` page | student | happy | 🔴 | hardcoded demo questions, no backend wiring |
| Topic quiz (in roadmap) submit + score | student | happy | 🟡 | real path via `/topics/:id/quiz` |

### 7. Articles 🟢 (reads + moderation writes proven)
| Flow | Role | Type | Status | Notes |
|---|---|---|---|---|
| `GET /articles/all` (public) → 200 | public | happy | ✅ | |
| `GET /articles/my-articles` → 200 | student | happy | ✅ FIXED | was 404 (shadowed by `/:id`); reordered |
| Set status (APPROVED) → persists | admin | happy | ✅ FIXED | 3 bugs: controller read `req.query` not body (always 404); Joi enum mismatch (PUBLISHED/PENDING_REVIEW vs real DRAFT/PENDING/APPROVED/REJECTED); `updateArticle` hardcoded status=PENDING |
| Non-admin set status → 403 | student | error | ✅ | role gate |
| Moderation action (APPROVE/notes) | moderator | happy | ✅ | |
| **HTML sanitization — `<script>` + `onerror` stripped, safe markup kept** | admin | error | ✅ | XSS payload neutralized; verified in DB |
| Article detail + comments | public | happy | 🟡 | |
| **Submit article (author flow) → PENDING** | student | happy | ✅ NEW | added `POST /articles` (auth, any user); content XSS-sanitized; validation 400; no-auth 401 |
| **Full submission→moderation loop** | student+mod | happy | ✅ NEW | submit → appears in `/moderate` queue → moderator approves → APPROVED. The moderation queue now has a real content source. |

### 8. Profile & Streak 🟢
| Flow | Role | Type | Status | Notes |
|---|---|---|---|---|
| View profile (`/users/me`) | student | happy | ✅ | |
| Edit profile persists (`PUT /users/me`) | moderator | happy | ✅ | first_name change reflected |
| Edit profile does NOT reset role | admin/mod | edge | ✅ FIXED | privileged role survives a save |
| Streak stats + weekly activity → 200 | student | happy | ✅ | both endpoints |

### 9. Resources 🟢 (read proven)
| Flow | Role | Type | Status | Notes |
|---|---|---|---|---|
| `GET /resources` (paginated) → 200 | student | happy | ✅ | |
| Detail | student | happy | 🟡 | |
| Create resource / subject · Save | student | happy | ❓ | |

### 10. Admin Panel ✅ (validated this session, prod read + 1 write)
| Flow | Role | Type | Status | Notes |
|---|---|---|---|---|
| Overview metrics | admin | happy | ✅ | real data |
| User search + list | admin | happy | ✅ | |
| Change user role (persists + audited) | admin | happy | ✅ | PATCH 200, audit shows UPDATE_USER_ROLE |
| Delete user (confirm dialog) | admin | happy | 🟡 | wired; not exercised (destructive on prod) |
| Moderation queue + approve/reject | admin | happy | 🟡 | queue empty; approve/reject not exercised |
| Audit log lists actions | admin | happy | ✅ | |
| Non-admin denied | student | error | 🟡 | |

### 11. Community / Discussions / Misc ⚪ (deferred)
| Flow | Status | Notes |
|---|---|---|
| `/community`, `/discussion-forums`, `/discussions`, `/collaboration-opportunities`, `/member-highlights`, `/events` | ⚪ | "Coming Soon" placeholders. Forums backend CRUD exists but no UI. |
| `/achievements` standalone | ⚪ | real data lives on dashboard/profile |
| Chat, Courses, Jobs, Billing, Support, Placement, RBAC UI | ⚪ | backend endpoints exist, no frontend |

---

## Tally (honest)

| Status | Count (approx flows) |
|---|---|
| ✅ Verified | ~57 (Admin + Auth + Dashboard + Roadmaps + bookmark/comments + Profile/Streak + Articles reads + moderation writes + XSS + Resources + Challenges + run-code + drafts + **full Battle lifecycle incl. gameplay scoring** + **realtime WebSocket auth + live events**) — `qa/run.mjs` **53/53** + `qa/socket.mjs` **4/4** |
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

*Last updated: 2026-06-15.*
