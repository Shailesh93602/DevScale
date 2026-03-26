# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
**EduScale** - All-in-one SaaS learning platform for engineering students.
- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS, Shadcn UI, Redux Toolkit + Zustand
- **Backend**: Node.js, Express, TypeScript, Prisma ORM, PostgreSQL, Socket.io
- **Auth**: Supabase authentication
- **Brand**: EduScale (support@eduscale.com)

## Common Commands

```bash
# Backend
cd Backend && npm run dev                 # Dev server
cd Backend && npm test                    # Run all tests (27 tests, 2 suites)
cd Backend && npx jest --testPathPattern="<name>"  # Run single test file
cd Backend && npx tsc --noEmit            # Type check (must produce zero output)
cd Backend && npx prisma generate         # Regenerate Prisma client after schema changes
cd Backend && npx prisma db push          # Sync schema to DB (use this, NOT migrate dev — migration history is out of sync with Supabase)

# Frontend
cd Frontend && npm run dev                # Dev server
cd Frontend && npm run build              # Build check (catches TS/lint errors)
cd Frontend && npx tsc --noEmit           # Type check only
cd Frontend && npx playwright test        # E2E tests
cd Frontend && npx playwright test --grep "<name>"  # Run single E2E test

# Battle seeder (clear DB + seed 5 typed test battles)
cd Backend && npm run seed:battles        # Deletes all battles, seeds 5 fresh ones
```

> **IMPORTANT**: Always use `npx prisma db push` instead of `npx prisma migrate dev`. The migration history in the repo is out of sync with the remote Supabase DB. `db push` applies schema changes without creating migration files and is safe for development.

## Architecture

### Auth Flow
Supabase handles authentication. The frontend attaches the Supabase JWT as `Authorization: Bearer <token>` on every API request (injected automatically by the axios interceptor in [useAxios.ts](Frontend/src/hooks/useAxios.ts)). The backend `authMiddleware` ([Backend/src/middlewares/authMiddleware.ts](Backend/src/middlewares/authMiddleware.ts)) verifies this JWT against Supabase, then **auto-creates or upserts** the user in PostgreSQL via Prisma. This means there's no separate signup webhook — user DB records are lazily created on first authenticated API call.

The frontend middleware ([Frontend/src/middleware.ts](Frontend/src/middleware.ts)) uses `updateSession` from Supabase to refresh sessions on every request.

### Backend Structure
All routes are mounted under `/api/v1/` via the `AppRoutes` class ([Backend/src/routes/routes.ts](Backend/src/routes/routes.ts)). Each feature has its own route file (`battleRoutes.ts`, `roadMapRoutes.ts`, etc.) that instantiates a class extending `BaseRouter`.

Key backend utilities:
- `catchAsync` ([Backend/src/utils/catchAsync.ts](Backend/src/utils/catchAsync.ts)) — wraps async controller functions to forward errors to Express error handler
- `sendResponse` ([Backend/src/utils/apiResponse.ts](Backend/src/utils/apiResponse.ts)) — all responses use a fixed `ResponseType` enum; **add new types to `apiResponse.ts` before using them**
- `paginate` — common pagination function used across list endpoints
- `validateRequest` middleware — validates req body/params against Joi schemas, uses `stripUnknown: true` (extra fields are silently dropped, not 400'd)

### Frontend API Hooks
Use `useAxiosGet`, `useAxiosPost`, `useAxiosPut`, `useAxiosPatch`, `useAxiosDelete` from [useAxios.ts](Frontend/src/hooks/useAxios.ts).

**Critical behavior of `useAxiosGet`**:
- URL templates support `{{key}}` replacements: `getBattle({}, { id: '123' })` for `/battles/{{id}}`
- The `execute()` function returns the full `BaseApiResponse<T>` object: `{ success, data, message, meta }`
- `response.data` is the **unwrapped inner data** (what the backend put inside `sendResponse`)
- `state.data` (from the hook tuple) is also the inner data
- So when calling e.g. `getBattle({}, { id })`, do `res.data` to get the Battle object directly

### Frontend Structure
- **State**: Redux Toolkit for auth/user state (`store/`); Zustand `battleStore` for real-time battle state
- **Theming**: Tailwind CSS semantic tokens (`text-foreground`, `bg-background`, `text-primary`, etc.) — **never hardcode `text-black`/`text-white`** for themed content
- **Socket.io**: Battle zone uses dedicated hooks in `useBattleWebSocket.ts`

### Frontend Conventions
1. **ALWAYS use `<Button>` from `@/components/ui/button`** — never raw `<button>` or `<motion.button>` for user-facing CTAs
2. **NEVER pass custom color classes** to `<Button variant="default">` — it handles dark/light mode via CSS variables
3. **Auth-aware UI**: Get auth state via `useSelector(state => state.user.isAuthenticated)` from Redux; hide signup CTAs when authenticated
4. **Validation**: Yup for frontend form validation
5. **Components**: Functional components only

### Backend Conventions
1. **Always** wrap controller functions with `catchAsync`
2. **Always** use `sendResponse` for API responses (never `res.json()` directly)
3. **Always** use `paginate` for list endpoints
4. **Validation**: Joi schemas in `Backend/src/validations/`
5. **Route ordering**: Register static routes (`/statistics/me`, `/my`, `/answer`) **before** parameterized routes (`/:id`) to prevent Express matching the static segment as a parameter

---

## Battle Zone System

The battle zone is the most complex feature. All battle-related code is under `Backend/src/` (repositories, controllers, routes) and `Frontend/src/app/battle-zone/`.

### Battle Status Values
Valid statuses (use ONLY these — `UPCOMING`/`PENDING` are legacy and no longer exist):
```
WAITING → LOBBY → IN_PROGRESS → COMPLETED
         ↓                    ↓
       CANCELLED           CANCELLED
```
- `WAITING` — created, waiting for players to join
- `LOBBY` — enough players joined, getting ready
- `IN_PROGRESS` — battle is live
- `COMPLETED` — battle ended
- `CANCELLED` — creator cancelled

### Battle Type Values
`QUICK | SCHEDULED | PRACTICE` (legacy: `INSTANT`/`TOURNAMENT` are normalized to `QUICK` in `battle-normalizer.ts`)

### Slug System
All five slug-capable models have a `slug String? @unique` column:

| Model | Slug Format | Why |
|-------|-------------|-----|
| `Battle` | `slugify(title) + first-8-of-uuid` | title NOT unique |
| `Topic` | `slugify(title) + first-8-of-uuid` | title NOT unique |
| `Subject` | `slugify(title)` | title `@unique` |
| `Roadmap` | `slugify(title)` | title `@unique` |
| `MainConcept` | `slugify(name)` | name `@unique` |

**Slug utilities** (`Backend/src/utils/slugify.ts`):
- `slugify(text)` — base conversion: lowercase, strip special chars, spaces→hyphens
- `generateBattleSlug(title, id)` — battle/topic pattern (with uuid suffix)
- `generateTopicSlug(title, id)` — same as battle slug
- `generateRoadmapSlug(title)` — plain slugify (roadmap/subject pattern)
- `generateMainConceptSlug(title)` — alias for `generateRoadmapSlug`
- `isUuid(value)` — tests UUID v4 format; used by repositories to route slug vs UUID lookups

**Repository pattern**: repositories that serve public detail pages accept slug OR UUID:
- Slug → 1 extra DB query to resolve to UUID → cached by UUID key
- `BattleRepository`: uses private `resolveId()`
- `RoadmapRepository`: uses private `resolveRoadmapId()`

**Frontend navigation**: always prefer slug over UUID:
- `BattleCard` → `battle.slug ?? battle.id`
- `RoadmapCard` → `roadmap.slug ?? roadmap.id`
- After detail page loads, it may redirect to canonical UUID URL (Battle does this for socket consistency)

**When adding a new slug column**:
1. Add `slug String? @unique` to the Prisma model
2. Run `npx prisma db push`
3. Add the appropriate generate function to `slugify.ts`
4. Write a one-off backfill script in `Backend/src/scripts/` (compile with `tsconfig.jest.json` + run with `NODE_PATH`)
5. Add `resolveXxxId()` private helper to the repository
6. Update frontend type to include `slug?: string | null`; update navigation to use `slug ?? id`

**`battleIdValidation`** accepts any string (2–120 chars), not just UUIDs, so slugs pass validation.

### Battle API Endpoints
All under `/api/v1/battles/`:
| Method | Path | Notes |
|--------|------|-------|
| GET | `/` | List battles (public) |
| GET | `/my` | Auth required |
| GET | `/statistics/me` | Auth required. Note: path is `/statistics/me`, NOT `/statistics` |
| GET | `/:id` | Accepts UUID or slug |
| GET | `/:id/leaderboard` | Accepts UUID or slug |
| GET | `/:id/results` | Accepts UUID or slug |
| GET | `/:id/questions` | Auth + participant required |
| POST | `/` | Create battle (accepts `question_source` for auto-seeding) |
| POST | `/answer` | Submit answer (no `/:id` prefix) |
| POST | `/:id/join` | Auth required |
| POST | `/:id/leave` | Auth required |
| POST | `/:id/ready` | Auth required |
| POST | `/:id/start` | Auth + creator only |
| POST | `/:id/questions` | Auth + creator only (manual add, fallback) |
| PATCH | `/:id/cancel` | Auth + creator only |
| GET | `/question-pool` | Auth required. Query: `type, id, difficulty?, count?, categories?`. Returns preview (no correct answers). Register BEFORE `/:id`. |

### Battle Zone Frontend Files
| What | Path |
|------|------|
| Main list page | `Frontend/src/app/battle-zone/page.tsx` |
| Battle detail (all-in-one) | `Frontend/src/app/battle-zone/[id]/page.tsx` |
| Create battle | `Frontend/src/app/battle-zone/create/page.tsx` |
| Statistics page | `Frontend/src/app/battle-zone/statistics/page.tsx` |
| BattleCard component | `Frontend/src/components/Battle/BattleCard.tsx` |
| BattleZoneLayout | `Frontend/src/components/Battle/BattleZoneLayout.tsx` |
| Question Source Selector | `Frontend/src/components/Battle/QuestionSourceSelector.tsx` |
| Question Preview List | `Frontend/src/components/Battle/QuestionPreviewList.tsx` |
| Battle types | `Frontend/src/types/battle.ts` |
| Battle normalizer | `Frontend/src/lib/battle-normalizer.ts` |
| Battle API hook | `Frontend/src/hooks/useBattleApi.ts` |
| Battle creation hook | `Frontend/src/hooks/useBattleCreation.ts` |
| Socket hooks | `Frontend/src/hooks/useBattleWebSocket.ts` |

### Battle Socket Hooks (in `useBattleWebSocket.ts`)
```ts
useBattleSocket(battleId)       // returns { isConnected, on, emit, disconnect }
useBattleChat(battleId)         // returns { messages }  (sendMessage is also exported but chat UI is disabled)
useBattleTimer(battleId)        // returns { secondsRemaining }
useBattleLeaderboard(battleId)  // returns { leaderboard, seedLeaderboard }
useBattleParticipants(battleId) // returns [{ user_id, username, avatar_url }]
```
> **Chat UI is intentionally removed** from the battle detail page — chat logic/hooks are kept for future re-enabling. Do NOT re-add the chat UI unless explicitly asked.

### BattleZoneLayout Stats
The layout header shows global stats fetched on mount:
- Calls `GET /battles?limit=100` (public) to count active/upcoming battles
- Calls `GET /battles/statistics/me` (auth-required) for user win rate
- "Upcoming" = battles with status `WAITING` or `LOBBY` (NOT `UPCOMING` — that status no longer exists)

### Battle Field Naming (snake_case throughout)
```
battle.user_id          (not userId)
battle.topic_id         (not topicId)
battle.max_participants (not maxParticipants)
battle.current_participants
battle.start_time       (not startDate)
battle.time_per_question
battle.points_per_question
battle.total_questions
battle.creator          (the joined User object, not battle.user)
participant.user_id     (not userId)
participant.correct_count, wrong_count, avg_time_per_answer_ms
```

### Battle Normalizer
`Frontend/src/lib/battle-normalizer.ts` normalizes raw API responses to the `Battle` type. It handles legacy field aliases (camelCase → snake_case, old status values → new). **Always pass raw API data through `normalizeBattle()`** before using it in components.

### Question Auto-Population System (Phase 5)

**Goal**: When creating a battle, user picks a scope (Topic/Subject/MainConcept/Roadmap/DSA), system randomly selects questions from the Quiz pool automatically. No manual question entry needed.

**Question Sourcing Hierarchy**:
```
Roadmap → MainConcept → Subject → Topic → Quiz.QuizQuestion (MCQ, with QuizAnswer options)
                                         ↓
                                    Challenge (DSA — Phase 2+)
```

**Pool resolution**:
- `type=topic`: QuizQuestions where `quiz.topic_id = id`
- `type=subject`: union of topic-level + `quiz.subject_id = id`
- `type=main_concept`: union of subject-level + `quiz.main_concept_id = id`
- `type=roadmap`: walk hierarchy via join tables, collect all quiz questions
- `type=dsa` (Phase 2): Challenge records, filtered by category + difficulty

**Anti-repeat**: Exclude `source_quiz_question_id` values used in battles for the same source in the last 30 days. Fallback: allow repeats when pool < count.

**Key service**: `Backend/src/services/questionPoolService.ts` — `getPool(type, id, opts)`

**QuizQuestion → BattleQuestion mapping**:
- `QuizQuestion.question` → `BattleQuestion.question`
- `QuizAnswer[]` → `BattleQuestion.options` (Json `string[]`, 4 items)
- `QuizAnswer.is_correct=true` index → `BattleQuestion.correct_answer` (Int 0-3)
- Set `BattleQuestion.source_quiz_question_id` for tracking + analytics

**Creation flow (Phase 5)**:
1. Step 1: Battle basics
2. Step 2: QuestionSourceSelector (Roadmap→MainConcept→Subject→Topic cascading, or DSA mode)
3. Step 3: Battle settings (participants, timing)
4. Step 4: QuestionPreviewList + confirm → CREATE (battle + questions in one transaction)

**New Battle schema fields**: `question_source_type String?`, `question_source_id String?`
**New BattleQuestion schema fields**: `source_quiz_question_id Int?`, `source_challenge_id String?`

**Hierarchy APIs** (for cascading dropdowns):
- `GET /api/v1/roadmaps/:id/main-concepts` — list MainConcepts in a Roadmap
- `GET /api/v1/main-concepts/:id/subjects` — list Subjects in a MainConcept
- `GET /api/v1/subjects/:id/topics` — already exists
- `GET /api/v1/challenges/categories` — category list with counts

---

## Key File Paths
| What | Path |
|------|------|
| Button Component | `Frontend/src/components/ui/button.tsx` |
| Axios Hooks | `Frontend/src/hooks/useAxios.ts` |
| Auth Middleware | `Backend/src/middlewares/authMiddleware.ts` |
| sendResponse + ResponseType | `Backend/src/utils/apiResponse.ts` |
| catchAsync | `Backend/src/utils/catchAsync.ts` |
| All Routes | `Backend/src/routes/routes.ts` |
| Socket Service | `Backend/src/services/socket.ts` |
| Prisma Schema | `Backend/prisma/schema.prisma` |
| Frontend Middleware | `Frontend/src/middleware.ts` |
| Slug utilities | `Backend/src/utils/slugify.ts` |
| Battle Repository | `Backend/src/repositories/battleRepository.ts` |
| Subject Repository | `Backend/src/repositories/subjectRepository.ts` |
| Question Pool Service | `Backend/src/services/questionPoolService.ts` |
| Battle Seeder | `Backend/src/scripts/seed-battles.ts` (`npm run seed:battles`) |
| Project Tracking | `todo.md` |
| Session Tracking | `.claude/session-tracker.md` |

---

## Known Issues & Open Work

### Critical
1. **Supabase auth → backend user sync** — No webhook. Profile page shows error when user exists in Supabase but not in Prisma DB. First authenticated API call auto-creates the user, but the profile page itself may hit a race condition.
2. **Battle questions** — Phase 5 auto-population is complete. New battles created via the wizard have questions seeded atomically. Run `npm run seed:battles` (Backend) to reset test battles with 5 typed battles (topic/subject/main_concept/roadmap/practice), each with 5 hardcoded questions.

### Medium
3. **Socket "Connecting..." indefinitely** — Socket.io connection works when the battle detail page loads with a valid UUID URL. If the socket can't connect (e.g. backend not running), the connection indicator shows "Connecting..." but the page is still functional for REST-only operations.
4. **Pre-existing TS errors** (not to fix unless touching those files): `LoginForm`, `RegisterForm`, `ResetPassword` (UseFormRegister type mismatch); `CommentSection` in `career-roadmap/[id]`.

### Low
5. Many "Coming Soon" placeholder pages
6. Leaderboard on landing page uses static data
7. Platform stats (10k+ users) are hardcoded

---

## Session Workflow
1. **On Start**: Read `.claude/session-tracker.md` to understand current state
2. **During Work**: Update tracker as tasks progress
3. **On End**: Update tracker with final status, kill any running terminals
4. **Always**: Reference `todo.md` for overall project status
