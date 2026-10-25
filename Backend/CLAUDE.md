# Backend — Change Log

All backend changes tracked chronologically with file references.

---

## 2026-03-26 (commit `e2dd897`)

### [P0] Redis-backed rate limiter
- **File:** `src/main.ts`
- **Change:** Wired `RedisStore` from `rate-limit-redis` into `express-rate-limit`. Previously in-memory (resets on restart, breaks across multiple pods).

### [P0] Deep health check
- **File:** `src/routes/healthCheckRoutes.ts`
- **Change:** Replaced static `{ status: 'ok' }` with live checks — `prisma.$queryRaw`, `redis.ping()`, Bull queue `.isReady()`. Returns HTTP 503 with named failing component on degraded state.

### [P0] Process-level error handlers
- **Files:** `src/main.ts`, `src/app.logic.ts`
- **Change:** `process.on('unhandledRejection')` and `process.on('uncaughtException')` — log via Winston then `process.exit(1)` so container orchestrator restarts cleanly.

### [P0] authCache → Redis
- **File:** `src/middlewares/authMiddleware.ts`
- **Change:** Replaced `Map<string, ...>` + `setInterval` cleanup with Redis `SETEX` (5-min TTL). Cache key = `SHA-256(token)` — no raw JWTs stored as keys. Both `authMiddleware` and `optionalAuthMiddleware` updated.

### [P0] Socket.io Redis adapter
- **File:** `src/services/socket.ts`
- **Change:** Installed `@socket.io/redis-adapter`. Wired dedicated pub/sub Redis connections. `userSockets` → `eduscale:sockets:{userId}` Redis Set. `battleRooms` → `eduscale:battle:users:{battleId}` Redis Set. In-memory Maps kept as fallback on Redis error.

### [P0] Redis logger fix
- **File:** `src/services/redis.ts`
- **Change:** `console.error` → `logger.error` from Winston.

---

## 2026-03-27 (commits `52876a1` → `aa2af6f`)

### [P0] Winston logger — full restoration
- **File:** `src/utils/logger.ts`
- **Change:** Replaced the `console.*` stub (the entire Winston implementation was commented out). Now: JSON format in production (CloudWatch/Datadog ready), colorized in dev. `AsyncLocalStorage` (`node:async_hooks`) carries `requestId` automatically through the async call chain — no function signature changes needed.

### [P0] requestId middleware
- **File:** `src/middlewares/requestIdMiddleware.ts` (new)
- **Change:** Reads `X-Request-ID` header or generates `crypto.randomUUID()`. Attaches to `req.requestId`, echoes on `X-Request-ID` response header, runs the request chain inside `AsyncLocalStorage` context. Registered as first middleware in `main.ts`.

### [P0] Sentry init
- **File:** `src/instrument.ts` (new)
- **Change:** TypeScript Sentry init — only activates when `SENTRY_DSN` env var is set. `tracesSampleRate`: 10% in prod, 100% in dev. Imported at the very top of `main.ts` and `app.logic.ts` before any other imports (required for correct instrumentation).

### [P0] Replace all console.* with logger
- **Files:** `src/middlewares/uploadMiddleware.ts`, `src/middlewares/validateRequest.ts`, `src/utils/bulkOperations.ts`, `src/controllers/codeController.ts`, `src/services/websocket.ts`, `src/app.logic.ts`
- **Change:** Every `console.log/error/warn` in application code replaced with `logger.*` calls. Intentional `console.log` left in: `codeWrapper.ts` template literal (user code output), `scripts/` (CLI seed output).

### [P0] JWT token blocklist
- **Files:** `src/controllers/authController.ts` (new), `src/routes/authRoutes.ts` (new), `src/middlewares/authMiddleware.ts`
- **Change:** `POST /api/v1/auth/logout` — decodes JWT, calculates remaining TTL (`exp - now`), stores `SHA-256(token)` in Redis with that TTL. `POST /api/v1/auth/refresh-cache` — clears auth cache entry. `authMiddleware` now checks `eduscale:auth:blocklist:{hash}` before processing — fails open if Redis is down.

### [P1] Auth rate limiter wired
- **File:** `src/routes/authRoutes.ts`
- **Change:** `authLimiter` (5 req/15min/IP, existed in `rateLimiter.ts` but was never used) applied to `POST /auth/logout` to prevent blocklist-flooding.

### [P0] Hardcoded http:// URL removed
- **File:** `src/config/swagger.ts`
- **Change:** `http://localhost:3000` → reads `API_URL` env var, fallback to `http://localhost:5000` (correct dev port). Added prod/dev label based on `NODE_ENV`.

### [P0] HTML sanitization
- **File:** `src/utils/sanitize.ts` (new)
- **Change:** Two helpers using `sanitize-html`:
  - `sanitizeText`: strips all tags — for plain-text fields (titles, usernames)
  - `sanitizeRichText`: allowlist of safe tags (p, h1-h6, a, img, code, blockquote, lists) — https-only schemes, no inline events
- **Wired into:** `articleController.updateArticleContent` (title → sanitizeText, content → sanitizeRichText), `communityForumControllers.createForum` and `updateForum`.

### Type fix
- **File:** `src/types/express/index.d.ts`
- **Change:** Added `requestId?: string` to Express `Request` interface.

---

---

## 2026-03-27 (commits `a8cca110` → `3ea47e89`)

### [P0] DB composite indexes
- **File:** `prisma/schema.prisma`
- **Change:** Added 7 new composite indexes: `Battle(status, created_at)`, `Battle(user_id, status)`, `Enrollment(user_id, status)`, `ForumPost(forum_id, created_at)`, `ForumComment(post_id, created_at)`, `LeaderboardEntry(subject_id, score)`, `LeaderboardEntry(subject_id, created_at)`. All targeted at the highest-traffic query patterns (battle listing, forum pagination, leaderboard time-range queries).

### [P0] requestId in error handler
- **File:** `src/middlewares/errorHandler.ts`
- **Change:** Removed `sendError()` wrapper; now builds JSON response inline. Added `requestId: req.requestId` to every error response. Stack traces only included in dev (`isDev`). Removed unused `sendError` import.

### [P0] Helmet CSP tightened
- **File:** `src/main.ts`
- **Change:** Replaced `contentSecurityPolicy: undefined` (Helmet defaults — permissive) with explicit directives: `defaultSrc 'self'`, `scriptSrc 'self'`, `styleSrc 'self' 'unsafe-inline'`, `imgSrc 'self' data: cloudinary`, `connectSrc 'self' + API_URL + SUPABASE_URL + CORS_ORIGIN`, `fontSrc gstatic.com`, `objectSrc 'none'`, `frameAncestors 'none'`, `upgradeInsecureRequests`. Added `referrerPolicy: strict-origin-when-cross-origin`. COEP disabled in dev.

### [P0] PM2 cluster mode
- **Files:** `ecosystem.config.js` (new), `package.json`
- **Change:** `exec_mode: 'cluster'`, `instances: 'max'` (one worker per vCPU). 512MB memory restart threshold, 10s graceful shutdown, JSON log format. npm scripts: `start:cluster`, `stop:cluster`, `reload:cluster`, `logs:cluster`.

### [P0] Cache-Aside — Leaderboard (Redis, TTL 60s)
- **File:** `src/repositories/leaderboardRepository.ts`
- **Change:** `getLeaderboard()` wraps DB query in `getOrSetCache()` with 60s TTL. Added `invalidateLeaderboard(subjectId)` to bust all time-range/limit variants for a subject after score writes.

### [P0] Cache-Aside — Roadmaps (Redis, TTL 24h)
- **File:** `src/repositories/roadmapRepository.ts`
- **Change:** Migrated `getRoadmap()` and `getAllRoadmaps()` from synchronous in-memory `memoryCache` to async Redis `getCache`/`setCache`. TTL changed to 24h for public roadmap detail and guest listing (stable, rarely updated). Auth listings stay 5 min. **Critical fix:** in-memory cache was per-process — PM2 cluster workers would hold divergent cached data. Redis makes the cache shared across all workers.

### [P0] RBAC audit
- **Files:** `src/routes/rbacRoutes.ts`, `src/routes/articleRoutes.ts`, `src/routes/communityForumRoutes.ts`
- **Change:**
  - `rbacRoutes`: POST/PATCH/DELETE on roles and permissions, and POST /users/role (role assignment) — were only `authMiddleware` protected. Any logged-in user could escalate privileges. Now `authorizeRoles('ADMIN')` gated.
  - `articleRoutes`: `POST /status`, `POST /:id/moderation`, `POST /:id/update` had **no auth at all**. Added `authMiddleware + authorizeRoles('ADMIN', 'MODERATOR')`.
  - `communityForumRoutes`: `DELETE /delete/:id` lacked role check. Added `authorizeRoles('ADMIN')`.

---

## 2026-09-05 — Embedding fingerprint

### [P1] Ingest skip compares (hash, model, dimensions), not the hash alone
- **Files:** `src/services/ai/contentIngestService.ts`, `src/repositories/contentEmbeddingRepository.ts` (`getStoredHash` → `getStoredFingerprint`; upsert writes `dimensions`), `src/services/ai/challengeIngestService.ts` (`reindexAll({ force })`), `src/controllers/recommendationController.ts` (`?force=true` / body `{ force: true }`, `parseForce`), `prisma/migrations/20260905120000_content_embedding_dimensions/migration.sql` (additive: `"dimensions" INTEGER NOT NULL DEFAULT 768`).
- **Change:** An embedding is a function of the text AND the model. The hash-only skip meant a change of `GEMINI_EMBEDDING_MODEL` left every unchanged row on the old model's vector while new rows got the new one — mixed spaces in one table, reported as success. Now a model or dimension change makes every row stale on the next ordinary reindex; `force` re-embeds regardless. Verified against local pg17 `eduscale_test` (:5434), never Supabase. Reference: `../docs/AI-RECOMMENDATIONS.md`.
- **Tests:** `src/tests/ai/contentIngestService.test.ts`, `src/tests/ai/contentEmbeddingRepository.test.ts`, `src/tests/services/reindexBounds.test.ts`, `src/tests/controllers/recommendationController.test.ts` (new).

---

## 2026-09-06 — Migration idempotency guard

### [P1] Migrations must tolerate an object that already exists; applied files are frozen
- **Files:** `src/tests/migrations/migrationIdempotency.test.ts` (new), `../docs/MIGRATIONS.md` (new), `../FINDINGS.md` (#12).
- **Why:** `scripts/vercel-build.sh` runs `prisma migrate deploy` on every production deploy, so a
  migration that raises `42P07`/`42710` is recorded failed and **every later deploy** dies on `P3009`
  before compiling. KhataGO lost seven days to exactly that. Audited read-only against production
  2026-09-06: 15 migrations, none unfinished, none rolled back, all 15 checksums matching, and a
  PostgreSQL 17 replay of the chain produced an object set identical to production's `public` schema
  (356 indexes / 126 tables / 1001 columns / 285 constraints, empty diff both ways). **No hazard
  today** — but two migrations (`20260615000000_*`, `20260615010000_*`) were `resolve --applied` with
  zero steps, i.e. DDL reaches this database out of band.
- **Change:** the test fails any migration creating an index/table/extension/column without
  `IF NOT EXISTS`, or a type/constraint without a `DROP … IF EXISTS` or
  `DO $$ … EXCEPTION WHEN duplicate_object` guard; `CONCURRENTLY` is exempt (25001 inside Prisma's
  transaction). The 11 already-applied migrations are **ratcheted** by offender count, not exempted.
  A second test pins each migration's sha256 to the checksum production recorded — editing an applied
  file is the `P3006` half of the same outage.
- **No migration SQL was edited:** production has applied all 15.

---

## 2026-09-06 — Slow-dependency deadlines

### [P0] Every outbound call is bounded; a call inside a breaker is bounded UNDER it
- **Files:** `src/utils/deadlines.ts` (new — every budget, in one place), `src/services/cacheService.ts`
  (`commandTimeout`), `src/utils/verifySupabaseToken.ts` (module-scope JWKS + bounded HTTP fallback),
  `src/utils/codeExecutor.ts` (axios timeouts under the breaker), `src/services/ai/llmConfig.ts`
  (SDK `requestOptions.timeout`), `src/services/ai/embeddingProvider.ts`, `src/utils/emailService.ts`
  (SMTP connection/greeting/socket), `src/tests/services/slowDependency.test.ts` (new),
  `../docs/SLOW-DEPENDENCIES.md` (new), `../FINDINGS.md` (#13).
- **Why:** the breakers, the fail-open cache `catch` blocks and the rate limiter's swallow-wrapper are
  all entered by a **rejection**. `opossum` frees the caller at its `timeout` but cannot cancel the
  request (no `AbortSignal` reaches anything it wraps), and `maxRetriesPerRequest: null` without a
  `commandTimeout` means a slow-but-connected Redis never settles at all. Measured against a server
  that completes the Redis handshake and then goes silent: `STILL PENDING` before, `rejected in
  2001ms: Command timed out` after. That one option makes four existing fail-open handlers reachable.
- **🔴 The rule:** a call inside a circuit breaker gets a transport timeout **at or below** the
  breaker's, so the transport aborts before the breaker abandons a request that is still running.
  Asserted as inequalities in `slowDependency.test.ts`, so moving a breaker fails a test rather than
  silently leaving a call unbounded.
- **🔴 Do NOT add `commandTimeout` to the Socket.io pub/sub clients or Bull's connections.** Both use
  long-lived blocking commands by design; they are constructed separately from the cache client, which
  is exactly what makes bounding the cache client safe. Bull does **not** use `cacheService`'s
  client — it builds its own from `REDIS_URL`, so the old "Required for Redlock and Bull" comment was
  wrong about Bull. Only Redlock needs `maxRetriesPerRequest: null`.
- **Dismissed with evidence:** the JWKS fetch looked unbounded but is not — `jose` defaults
  `timeoutDuration` to 5000 ms (read from its source). The real defect there was that
  `createRemoteJWKSet` was constructed *inside* the function, discarding a 10-minute key-set cache on
  every call.
- **Written up, not half-fixed** (each is a design change): the shared `judge0Breaker` behind an
  unbounded per-user `Promise.all`; `getWithLock`'s unbounded recursion under a 5 s lock with an
  unbounded callback; `transactionManager`'s `Promise.race` that rejects the caller without rolling
  back and then retries on top of transactions still holding locks. `../docs/SLOW-DEPENDENCIES.md`.

## 2026-09-06 — Runtime mode

### [P0] Production hardening no longer depends on `NODE_ENV` being set correctly
- **Files:** `src/config/runtimeMode.ts` (new — the only place that may read `process.env.NODE_ENV`
  for a mode decision), `src/tests/security/runtimeMode.test.ts` (new), `src/main.ts` (CORS branch,
  helmet `isProd`, rate-limit max, `/metrics` arg, startup log), `src/config/env.ts` (production
  warnings + the mismatch line), `src/config/swagger.ts`, `src/routes/routes.ts` (`/debug-sentry`),
  `src/routes/healthCheckRoutes.ts` (reports the EFFECTIVE mode + `nodeEnvMismatch`),
  `src/middlewares/{csrfMiddleware,battleRateLimiter,errorHandler,errorMiddleware,metricsEndpoint}.ts`,
  `src/controllers/authController.ts`, `src/services/socket.ts`, `src/utils/logger.ts`,
  `../FINDINGS.md` (#14).
- **Why:** commit `953fab9` was live on two production hosts. `api.eduscale.exaveltech.com` has a
  `NODE_ENV` that is not `production` — Vercel sets `VERCEL_ENV`, not `NODE_ENV` — so the identical
  build served `/metrics` to anyone (200, the whole registry), answered `/api/v1/debug-sentry` with a
  500 carrying a filesystem stack trace, set `XSRF-TOKEN` and the refresh cookie without `Secure`,
  sent no CSP and no COEP, and ran the limiter at 10,000/window instead of 100. Verified live against
  both hosts, probe by probe.
- **🔴 The rule:** production is `NODE_ENV === 'production' || VERCEL_ENV === 'production'`. A
  variable nobody set may make the logs noisier; it may never widen what the server allows.
  `useSecureCookies` is true on **any** hosted deployment (every Vercel URL is HTTPS), and
  `isDevelopment` — stack traces in responses, an ungated `/metrics` — is true only off-platform, so
  an internet-reachable preview is no longer treated as a laptop.
- **Not silent:** the mismatch goes to stderr at startup, to `logger.error` when the server binds,
  and into `/api/v1/health` as `nodeEnvMismatch: { nodeEnv, platformEnv }`.
- **Ratcheted:** the test walks every non-test source file, skips comment lines, and fails on any
  `process.env.NODE_ENV` outside a three-entry allow-list (`prisma.ts`, `lib/prisma.ts` — globalThis
  client caching; `utils/securityUtils.ts` — a genuine "am I under jest"). A second case fails if an
  allow-list entry no longer contains a raw read. Verified by planting one in `utils/logger.ts`.
- **🔴 Still needs the dashboard:** set `NODE_ENV=production` on the `edu-scale-backend` Vercel
  project (the code is correct without it; the log level is not), and fix that project's `REDIS_URL`
  — its `/api/v1/health` reports `redis: error`.

---

## 2026-10-13 — Large-file split (no behaviour change)

### [P2] Oversized modules split by concern; dead code removed
- **Repositories:** `battleRepository.ts` is now a thin facade over `repositories/battle/{battleShapes,scoring,lock,browse,questions,lifecycle,gameplay,results,userStats}.ts` (public class + `calculatePoints` export unchanged; tests still mock it by prototype). `roadmapRepository.ts` keeps only its 5 called methods, helpers in `repositories/roadmap/`. `adminDashboardRepository.ts` → `repositories/adminDashboard/{reportMetrics,healthMetrics}.ts`. `articleRepository.ts` keeps its 4 called methods.
- **Other:** `utils/apiResponse.ts` message table → `utils/responseMessages/*` (`ResponseType` derived from the table; 30 never-sent keys dropped). `services/socket.ts` → `services/realtime/{socketContract,socketHandshake}.ts`. Roadmap controller inputs/likes → `controllers/roadmap/`. Seed data → `scripts/battleSeedData.ts`. `qa/run.mjs` → `qa/lib.mjs` + `qa/areas/*.mjs` (same areas, same order).
- **Tests:** migration scanner → `tests/migrations/migrationSql.ts` + `migrationAnalyzer.test.ts` (hash pins stay in `migrationIdempotency.test.ts`); `calculatePoints` cases moved out of the DB-only `battle.test.ts` into `tests/repositories/battleScoring.test.ts`, so they now run without a database.
- **Deleted (zero callers):** `types/response.ts`, `utils/contentFilter.ts`, 17 roadmap / 15 article repository methods (incl. private helpers), 6 legacy socket emit helpers. Recoverable from git if a caller appears.

---

## 2026-10-17 — Code-review mediums (security / data-safety / correctness / honesty)

### [P1] CODE_REVIEW_FINDINGS.md `eduscale-backend` 🤖 mediums, each with a test that fails on revert
- **Seeding:** every seeder exports its function and runs only as the entry script (`prisma/seeders/runSeeder.ts`); `prisma/seed.ts` awaits them in order, fails non-zero, and **refuses any non-local DATABASE_URL with no override**. A single seeder accepts `SEED_ALLOW_REMOTE=1` (e.g. roles on a fresh prod DB). Prisma "enum" imports (undefined at runtime) replaced by `src/constants/enums`. Seeded article HTML goes through `sanitizeRichText` (allow-list now includes table tags). Placeholder "X Developer Masterclass" roadmaps no longer seeded — **any already in production must be removed by hand.**
- **`scripts/push-env-to-vercel.sh`:** reads `.env.production` (never the dev `.env`), only keys in `scripts/vercel-env-keys.txt`, validates everything first (NODE_ENV must be production, no localhost values), overwrites with `vercel env add --force`.
- **Battles:** join claims a seat with a conditional `updateMany`; leave refused after COMPLETED/CANCELLED; answers re-check IN_PROGRESS + participant inside the lock; scheduled lobby/start timers are compare-and-set; `start_time` bound evaluated per request.
- **Challenges:** points only for the first accepted submission (advisory xact lock per user+challenge, verified on local pg), no-test-case and non-ACTIVE challenges refused, Submit runs the same wrapped program as Run; harness now reports a solution's exception (stderr, exit 1).
- **Caches:** `cacheResponse` caches only 2xx, keys are `http:`-prefixed and built from the validated query; route-level roadmap detail cache dropped; update/delete/like/bookmark invalidate `roadmap:detail:<id>:*` via SCAN (no KEYS). Embedding cache keyed on model+dims; ingest `force` bypasses it.
- **Other:** analytics `/user/me` route order; RolePermission join rows in create/updateRole; streak counts calendar days (tz + minutes validated); topic-only quiz progress, errors no longer swallowed; Stripe redirects use one origin (`FRONTEND_URL` or first `CORS_ORIGIN`); matchmaking evicts waiters not seen for 30 s; admin DAU/WAU/MAU from real activity tables, DB health probed; dead `codeRunnerController` (host `exec`) and unrouted resource handlers deleted.
- **Open (design calls):** server-side answer timing (#22-14/#23-06/#26-07), Supabase identity on admin delete (#22-15), bookmark vs enrolment sharing `UserRoadmap` (#22-09), subject/concept progress schema (#19-04), backlog article rewrites (#20-03/#20-04).

---

## 2026-10-24 — Audit leftovers: dashboard cache and the roadmap list

### [P1] Dashboard summary cache moved to Redis
- **Files:** `src/repositories/dashboard/summaryCache.ts` (new: key, 300 s TTL, `invalidateDashboardSummary`), `src/repositories/dashboardRepository.ts`, writers in `controllers/roadMapControllers.ts` (enrol), `controllers/roadmap/roadmapEngagement.ts` (bookmark, like via `invalidateViewerCaches`), `controllers/userProgressController.ts`, `repositories/{quizRepository,streakRepository,userRepository}.ts`.
- **Change:** the 5-minute summary was in per-instance memory, so an enrolment on one Vercel instance left another stale for up to 5 min. It is now in Redis under `dashboard:summary:<userId>`; every write it reads deletes that key. Redis down → `getCache`/`setCache` fail open and the summary is built live. Enrol/bookmark/like also drop the viewer's Redis list pages (`roadmaps:list:<userId>:*`); the old in-memory deletes for those keys hit nothing.
- **Not covered:** `markTopicComplete`, `resetStreak`, `trackProgress` (no callers); a roadmap edit by its author leaves other users' summaries up to 5 min stale.
- **Tests:** `tests/repositories/dashboardSummaryCache.test.ts` (two module registries as two instances), `dashboardSummaryRedisDown.test.ts`, `tests/controllers/roadmapCacheInvalidation.test.ts`.

### [P1] `GET /roadmaps` has optional auth; the shared cache is anonymous-only
- **Files:** `src/routes/roadMapRoutes.ts`, `tests/routes/roadmapListPersonalisation.test.ts` (new), `tests/security/anonymousReadContract.test.ts`.
- **Change:** without `optionalAuthMiddleware`, list cards had `isEnrolled`/`isLiked` false for everyone and `type=enrolled` / `my-roadmaps` returned every public roadmap. The route-level `cacheResponse` now has `condition: !req.user`, so a signed-in request neither reads nor writes the shared `http:` key; the repository cache was already keyed per user (`guest` for anonymous). Frontend: every list call goes through `httpClient`, which sends the bearer token; the Enrolled/Bookmarked tabs filter client-side on these flags and nothing sends `type=enrolled` or `my-roadmaps`.

---

## 2026-10-25 — Battle flow flags (branch `feat/battle-flow-options`, OFF by default)

### [P2] Early advance and matchmaking auto-start, each behind its own env flag
- **Files:** `src/config/featureFlags.ts` (new), `src/services/battleSocket.ts` (`claimAdvance`, `advanceIfAllAnswered`, `scheduleAutoStart`), `src/repositories/battle/gameplay.ts` (`allActivePlayersAnswered`), `src/repositories/battle/lifecycle.ts` (`autoReadyMatchedBattle`), `src/services/matchmaking/matchmakingService.ts`, `.env.example`, `docs/REALTIME_HOSTING.md` ("Battle flow flags").
- **Flags:** `BATTLE_EARLY_ADVANCE`, `MATCHMAKING_AUTO_START`; only `1/true/yes/on` enable them.
- **Tests:** `tests/services/battleEarlyAdvance.test.ts`, `tests/repositories/battleAutoStart.test.ts`, `tests/matchmaking/matchmakingAutoStart.test.ts`; the claim guard was mutation-checked. Local proof with both flags on: `RT_FLOW_OPTIONS=1 qa/realtime/run-local-proof.sh` (4/4), default still 6/6.

---

## Outstanding P0s (as of end of session 3)

See `../CLAUDE.md` for full list. Quick reference:

| Item | File to change |
|------|---------------|
| Resource ownership guards | `src/controllers/*.ts` |
| Secrets scan + rotation | `git log -S <pattern>` + `gitleaks` |
| Google OAuth fix | Supabase dashboard + env vars |
| JWT refresh token rotation | `src/controllers/authController.ts` |
| Sentry in frontend | `Frontend/sentry.client.config.ts` |
| Branch protection | GitHub repo settings + CI workflow |
| `npm audit` in CI | `.github/workflows/*.yml` |
| Staging env | AWS / Supabase provisioning |
