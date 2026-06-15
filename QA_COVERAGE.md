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

### 1. Auth & Authorization 🔴 (OAuth broken; rest unverified)
| Flow | Role | Type | Status | Notes |
|---|---|---|---|---|
| Email/password login | guest | happy | 🟡 | works in manual use; no asserting test |
| Email/password register | guest | happy | 🟡 | |
| Logout invalidates token (Redis blocklist) | auth | happy | 🟡 | backend built; assert token rejected after |
| Google OAuth | guest | happy | 🔴 | wrong Supabase project configured (known) |
| Forgot/reset password | guest | happy | ❓ | |
| Email verification | guest | happy | ❓ | |
| Non-admin hitting `/admin` → denied | student | error | 🟡 | RoleGuard built; assert redirect/403 |
| Expired/invalid JWT → 401 | auth | error | ❓ | |

### 2. Dashboard 🟡
| Flow | Role | Type | Status | Notes |
|---|---|---|---|---|
| `/dashboard/summary` renders real aggregates | student | happy | 🟡 | |
| Empty state (new user, no roadmaps) | student | edge | ❓ | |

### 3. Career Roadmaps 🟡
| Flow | Role | Type | Status | Notes |
|---|---|---|---|---|
| Browse + filter + search | student | happy | 🟡 | |
| Enroll in roadmap (persists) | student | happy | 🟡 | assert UserRoadmap row created |
| Like / bookmark (toggles + persists) | student | happy | 🟡 | |
| Comment + like comment | student | happy | 🟡 | |
| Detail view (subjects/topics/progress) | student | happy | 🟡 | |
| Enroll twice (idempotent) | student | edge | ❓ | |

### 4. Battle Zone 🟡 (real-time — highest risk)
| Flow | Role | Type | Status | Notes |
|---|---|---|---|---|
| Create battle | student | happy | 🟡 | assert Battle row |
| Join battle | student#2 | happy | 🟡 | |
| Ready → start → answer → results | both | happy | 🟡 | WebSocket; needs 2-client test |
| Leaderboard updates after answers | both | happy | 🟡 | |
| Anti-cheat / rate limit on submit | student | error | ❓ | |
| Instant 1-v-1 matchmaking | student | happy | ⚪ | `/instant-battle` Coming Soon — no backend |

### 5. Coding Challenges 🟡
| Flow | Role | Type | Status | Notes |
|---|---|---|---|---|
| List + paginate + search | student | happy | 🟡 | |
| Open challenge + run code | student | happy | 🟡 | assert execution result |
| Save + restore draft | student | happy | 🟡 | |
| Submit solution | student | happy | ❓ | |

### 6. Quiz 🔴 / 🟡
| Flow | Role | Type | Status | Notes |
|---|---|---|---|---|
| Standalone `/quiz` page | student | happy | 🔴 | hardcoded demo questions, no backend wiring |
| Topic quiz (in roadmap) submit + score | student | happy | 🟡 | real path via `/topics/:id/quiz` |

### 7. Articles 🟡
| Flow | Role | Type | Status | Notes |
|---|---|---|---|---|
| Public article list + detail + comments | public | happy | 🟡 | |
| My articles | student | happy | 🟡 | |
| Create / edit article | student | happy | ❓ | confirm write endpoint exists |
| Moderate (status/notes) | admin/mod | happy | 🟡 | endpoint built; no mod UI |
| HTML sanitization (XSS payload rejected) | student | error | ❓ | sanitizer built; assert it strips |

### 8. Profile & Streak 🟡
| Flow | Role | Type | Status | Notes |
|---|---|---|---|---|
| View profile | student | happy | 🟡 | |
| Edit profile (persists) | student | happy | ❓ | |
| Streak stats + weekly activity | student | happy | 🟡 | |

### 9. Resources 🟡
| Flow | Role | Type | Status | Notes |
|---|---|---|---|---|
| List + detail | student | happy | 🟡 | |
| Create resource / subject | student | happy | ❓ | |
| Save/bookmark resource | student | happy | ❓ | |

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
| ✅ Verified | 4 (all admin) |
| 🟡 Built, unverified | ~30 |
| 🔴 Broken | 3 (OAuth, standalone quiz, …) |
| ⚪ Deferred (intentional) | ~12 pages / 7 backend-only |
| ❓ Unknown | ~12 |

**EduScale is NOT production-ready or "100%".** Only the admin panel is verified. Everything else is
built-but-unproven, deferred, or broken. This will be worked down area-by-area once a safe test env exists.

---

## Moderator role & panel — plan (item 6)

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
