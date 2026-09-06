# EduScale — Production Scaling Log

A scaling and production-readiness log for a solo-built platform: what was changed, when, and
why. Every number in this file is one the code or its tests produce today — there are no
targets in it. *(The opener used to name a user-count target that nothing in the repo measured;
removed 2026-09-05. `Frontend/src/lib/no-scale-claims.test.ts` fails if a figure like that
reappears here, in the README, FINDINGS, `docs/`, or `llms.txt`.)*

---

## Architecture

- **Backend:** Express.js + TypeScript, port 5000 (dev) — two entry points: `main.ts` (App class, primary) and `server.ts` + `app.logic.ts` (legacy routes)
- **Frontend:** Next.js 16 (App Router), deployed on Vercel
- **DB:** PostgreSQL via Supabase + Prisma ORM (48+ models)
- **Cache/Queue:** Redis via ioredis, Bull for background jobs
- **WebSocket:** Socket.io with `@socket.io/redis-adapter` (multi-server safe as of 2026-03-26)
- **Auth:** Supabase JWT — verified locally via `SUPABASE_JWT_SIGNING_KEY`; blocklist in Redis
- **CI/CD:** GitHub Actions (lint/typecheck/tests/build); both halves DEPLOY TO VERCEL
  (`eduscale.vercel.app` + `api-eduscale.vercel.app`). *(This line used to say "AWS ECR → ECS" —
  aspirational, never true: no Dockerfile or docker step exists anywhere in this repo, and the
  backend's health endpoint answers from Vercel. Corrected 2026-08-29.)*

## Required Env Vars

```
DATABASE_URL, DIRECT_URL         # PostgreSQL (Supabase)
REDIS_URL                        # Redis instance
SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY  # Supabase project
SUPABASE_JWT_SIGNING_KEY              # Local JWT verification
SENTRY_DSN                       # Error tracking (backend)
NEXT_PUBLIC_SENTRY_DSN           # Error tracking (frontend) — NOT YET SET
CLOUDINARY_*                     # Media CDN
CORS_ORIGIN                      # Comma-separated production origins
PORT                             # Default 5000
API_URL                          # Must be https:// in production
```

---

## Session Log

### 2026-03-26 — Session 1 (commit `e2dd897`)

| Item | Files | Status |
|------|-------|--------|
| Redis-backed rate limiter | `src/main.ts` | ✅ Done |
| Deep health check (`/api/v1/health`) | `src/routes/healthCheckRoutes.ts` | ✅ Done |
| `unhandledRejection` + `uncaughtException` process handlers | `src/main.ts`, `src/app.logic.ts` | ✅ Done |
| authCache Map → Redis SETEX (SHA-256 keyed) | `src/middlewares/authMiddleware.ts` | ✅ Done |
| Socket.io Redis adapter + Redis Sets for socket/battle state | `src/services/socket.ts`, `package.json` | ✅ Done |
| Redis connection `console.error` → Winston logger | `src/services/redis.ts` | ✅ Done |

---

### 2026-03-27 — Session 2 (commits `52876a1` → `aa2af6f`)

| Item | Files | Status |
|------|-------|--------|
| Winston logger restored — JSON in prod, colorized in dev, AsyncLocalStorage requestId | `src/utils/logger.ts` | ✅ Done |
| requestId middleware — UUID per request, echoed in response header | `src/middlewares/requestIdMiddleware.ts` | ✅ Done |
| Sentry wired — `src/instrument.ts` imported before all other code | `src/instrument.ts`, `src/main.ts`, `src/app.logic.ts` | ✅ Done |
| All `console.*` replaced with structured logger calls | 6 files across controllers/middlewares/services | ✅ Done |
| JWT blocklist — `POST /api/v1/auth/logout` + authMiddleware blocklist check | `src/controllers/authController.ts`, `src/routes/authRoutes.ts`, `src/middlewares/authMiddleware.ts` | ✅ Done |
| Auth rate limiter wired to logout endpoint | `src/routes/authRoutes.ts` | ✅ Done |
| Hardcoded `http://` URL in swagger.ts fixed | `src/config/swagger.ts` | ✅ Done |
| `sanitize-html` utility — `sanitizeText` + `sanitizeRichText` | `src/utils/sanitize.ts` | ✅ Done |
| HTML sanitization wired into article + forum controllers | `src/controllers/articleController.ts`, `src/controllers/communityForumControllers.ts` | ✅ Done |
| `req.requestId` added to Express type declaration | `src/types/express/index.d.ts` | ✅ Done |

---

### 2026-03-27 — Session 3 (commits `a8cca110` → `3ea47e89`)

| Item | Files | Status |
|------|-------|--------|
| DB composite indexes — Battle, Enrollment, ForumPost, ForumComment, LeaderboardEntry | `prisma/schema.prisma` | ✅ Done |
| requestId in error handler response body | `src/middlewares/errorHandler.ts` | ✅ Done |
| Helmet CSP tightened — explicit script-src, connect-src, img-src, frame-ancestors | `src/main.ts` | ✅ Done |
| PM2 cluster mode — `ecosystem.config.js`, npm scripts, 512MB restart threshold | `ecosystem.config.js`, `package.json` | ✅ Done |
| Cache-Aside for Leaderboard (Redis, TTL 60s) + `invalidateLeaderboard()` | `src/repositories/leaderboardRepository.ts` | ✅ Done |
| Cache-Aside for Roadmaps — migrated from in-memory to Redis (TTL 24h public, 5m auth) | `src/repositories/roadmapRepository.ts` | ✅ Done |
| RBAC audit — `authorizeRoles('ADMIN')` added to rbacRoutes, articleRoutes, communityForumRoutes | `src/routes/rbacRoutes.ts`, `articleRoutes.ts`, `communityForumRoutes.ts` | ✅ Done |

---

### 2026-09-05 — Build identity on both halves

| Item | Files | Status |
|------|-------|--------|
| `GET /api/v1/health` JSON now carries `version: { sha, shortSha, ref, env }` (+ `X-App-Commit` header) from Vercel's system env, `unknown` when unset; the postgres/redis/queue checks and `/ready` are unchanged. Exists so a checker can compare LIVE against `main` — a deploy that stops updating still answers 200 | `Backend/src/utils/appVersion.ts`, `Backend/src/routes/healthCheckRoutes.ts`, `Backend/src/tests/routes/healthCheckRoutes.test.ts` | ✅ Done |
| Frontend `GET /api/version` — public, no DB, `force-dynamic`, `no-store` + `noindex`: `{ sha, shortSha, ref, deployedAt, env }`; git fields from runtime env else baked at build by `next.config.mjs` `env`, `deployedAt` = build time only | `Frontend/src/lib/app-version.ts`, `Frontend/src/app/api/version/route.ts` (+ `route.test.ts`), `Frontend/next.config.mjs` | ✅ Done |

### 2026-09-05 — Embedding fingerprint: a model change now invalidates every vector

| Item | Files | Status |
|------|-------|--------|
| The ingest skip compared the content hash only, so changing `GEMINI_EMBEDDING_MODEL` and reindexing re-embedded nothing — unchanged texts kept the old model's vectors next to new content's, one pgvector table holding two incomparable spaces, and `reindexAll` reported `skipped` for all of it. The skip now compares (content hash, model, dimensions); `dimensions` is a new additive column (`INTEGER NOT NULL DEFAULT 768`, verified on local pg17). `reindexAll({ force })` / `POST …/admin/reindex-challenges?force=true` bypasses the fingerprint. Docs: `docs/AI-RECOMMENDATIONS.md` | `Backend/src/services/ai/contentIngestService.ts`, `Backend/src/repositories/contentEmbeddingRepository.ts`, `Backend/src/services/ai/challengeIngestService.ts`, `Backend/src/controllers/recommendationController.ts`, `Backend/prisma/migrations/20260905120000_content_embedding_dimensions/`, tests under `Backend/src/tests/{ai,services,controllers}/` | ✅ Done |

### 2026-09-06 — Migration idempotency: audited against production, guarded going forward

| Item | Files | Status |
|------|-------|--------|
| `prisma migrate deploy` runs on every production deploy, so one migration that hits an object the database already has is recorded failed and **every later deploy** dies on `P3009` before compiling — the outage that cost the sibling repo seven days. Audited read-only against production: exactly the 15 repo migrations, none unfinished or rolled back, all 15 checksums matching the files, and a pg17 replay of the chain produced an object set identical to production's `public` schema (356 indexes / 126 tables / 1001 columns / 285 constraints, empty diff both directions). **EduScale is not at risk today.** Two migrations were nonetheless `resolve --applied` with zero steps, so DDL does reach this database out of band. New guard test: index/table/extension/column need `IF NOT EXISTS`; type/constraint need `DROP … IF EXISTS` or a `DO $$ … duplicate_object` block; `CONCURRENTLY` exempt. The 11 applied migrations are ratcheted by offender count, and every migration's sha256 is pinned to the checksum production recorded (`P3006` guard). No migration SQL was edited — production has applied all 15. Recovery procedure, rehearsed end to end on a scratch database: `docs/MIGRATIONS.md`; write-up: `FINDINGS.md` #12 | `Backend/src/tests/migrations/migrationIdempotency.test.ts`, `docs/MIGRATIONS.md`, `FINDINGS.md` | ✅ Done |

### 2026-09-06 — Slow dependencies: every recovery path needed a rejection to arrive

| Item | Files | Status |
|------|-------|--------|
| Three circuit breakers, fail-open cache reads and a swallow-wrapped rate limiter all fire on a **rejection**; none fires when a dependency is slow. `opossum`'s `timeout` frees the caller without cancelling the request (no `AbortSignal` is threaded into anything it wraps), and `maxRetriesPerRequest: null` with no `commandTimeout` meant a slow-but-connected Redis produced awaits that never settled — making `getCache`, `getAuthCache`, `isTokenBlocklisted` and the rate limiter's swallow-wrapper unreachable in the one case they exist for (measured: `STILL PENDING` vs `rejected in 2001ms`). New rule, asserted as inequalities so a breaker cannot be moved without failing a test: **a call inside a breaker gets a transport timeout at or below the breaker's.** Bounded: the cache client (`commandTimeout`), `supabase.auth.getUser` (was unbounded and reached precisely when JWKS was slow), Judge0 submit/poll, Gemini generate, the embedding call (the only Gemini path with no breaker), and SMTP (holds a Bull worker slot). JWKS was **dismissed as already bounded** — `jose` defaults `timeoutDuration` to 5000 ms — but its key set was being rebuilt per call, discarding a 10-minute cache; now hoisted. Written up rather than half-fixed: the shared `judge0Breaker` behind an unbounded per-user `Promise.all`, `getWithLock`'s unbounded recursion, `transactionManager`'s race-without-rollback, and the frontend's edge-middleware `getUser` — `docs/SLOW-DEPENDENCIES.md`, `FINDINGS.md` #13 | `Backend/src/utils/deadlines.ts` (new), `Backend/src/services/cacheService.ts`, `Backend/src/utils/verifySupabaseToken.ts`, `Backend/src/utils/codeExecutor.ts`, `Backend/src/services/ai/llmConfig.ts`, `Backend/src/services/ai/embeddingProvider.ts`, `Backend/src/utils/emailService.ts`, `Backend/src/tests/services/slowDependency.test.ts` (new), `docs/SLOW-DEPENDENCIES.md` (new), `FINDINGS.md` | ✅ Done |

### 2026-09-06 — Runtime mode: production is the union of the signals, not `NODE_ENV` alone

| Item | Files | Status |
|------|-------|--------|
| The same commit (`953fab9`) was serving on two production hosts and only one was hardened. `api.eduscale.exaveltech.com` has a `NODE_ENV` that is not `production`, and all thirteen `process.env.NODE_ENV === 'production'` reads resolved the wrong way at once: `/metrics` publicly readable (200, full registry — 404 on the other host), `/api/v1/debug-sentry` answering 500 with a filesystem stack trace, `XSRF-TOKEN` and the refresh cookie without `Secure`, no CSP, no COEP, and a 10,000/window rate limit instead of 100. All six verified live against both hosts. Vercel sets `VERCEL_ENV`, not `NODE_ENV`, so nothing failed — the build was green and the deploy said Ready. New `config/runtimeMode.ts` is the single source of truth: production when **either** signal says so, `useSecureCookies` true on any hosted deployment, `isDevelopment` true only off-platform; the mismatch is written to stderr at startup, logged when the server binds, and reported as `nodeEnvMismatch` in `/api/v1/health`. Ratchet test walks every non-test source file and fails on a raw `NODE_ENV` read outside a three-entry justified allow-list (verified by planting one). 🔴 **Still his:** set `NODE_ENV=production` on the `edu-scale-backend` Vercel project, and fix that project's `REDIS_URL` — its health has been `degraded` with `redis: error`. Write-up: `FINDINGS.md` #14 | `Backend/src/config/runtimeMode.ts` (new), `Backend/src/tests/security/runtimeMode.test.ts` (new), `Backend/src/main.ts`, `config/env.ts`, `config/swagger.ts`, `routes/{routes,healthCheckRoutes}.ts`, `middlewares/{csrfMiddleware,battleRateLimiter,errorHandler,errorMiddleware,metricsEndpoint}.ts`, `controllers/authController.ts`, `services/socket.ts`, `utils/logger.ts`, `FINDINGS.md` | ✅ Done |

---

## Remaining P0 Blockers (as of end of Session 3)

### Phase 1 — Infrastructure
- [ ] N+1 query audit on top 5 heaviest endpoints
- [ ] PgBouncer connection pooling (pool_mode=transaction, pool_size=20+)

### Phase 2 — Reliability
- [ ] Wire Sentry in frontend (`NEXT_PUBLIC_SENTRY_DSN` + `sentry.client.config.ts`)

### Phase 3 — Security
- [ ] Fix Google OAuth (wrong Supabase project configured)
- [ ] Resource ownership validation on write operations (`req.user.id === resource.userId`)
- [ ] Secrets scan + rotation (`git log -S` + `gitleaks`)
- [ ] JWT refresh token rotation (short-lived access 15m + long-lived refresh 7d httpOnly)

### Phase 5 — CI/CD
- [ ] Branch protection on `main` (require PR review + passing CI)
- [ ] `npm audit --audit-level=high` in CI pipeline
- [ ] Staging environment

---

## Key Decisions Made

| Decision | Reason |
|----------|--------|
| Fail-open on Redis blocklist check | Don't lock users out if Redis is down |
| SHA-256 hash tokens as cache/blocklist keys | Never store raw JWTs as Redis keys |
| `sanitize-html` over `dompurify` | Node-native, no jsdom dependency |
| AsyncLocalStorage for requestId propagation | No function signature changes needed |
| Socket.io in-memory Map fallback | Degrade gracefully if Redis pub/sub fails |
| PM2 cluster `instances: 'max'` | One worker per vCPU, zero-downtime reload with `pm2 reload` |
| Roadmap cache TTL 24h for guests, 5m for auth | Guest lists are stable; auth lists include personalized data |
| `authorizeRoles` over `requirePermission` | RBAC permission system not fully implemented; role check is immediate protection |
