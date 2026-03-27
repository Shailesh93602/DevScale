# EduScale — Completed Work Log

All shipped items, grouped by session. Newest first.

---

## Session 5 — 2026-03-27

### Phase 3 — Security
| Item | File(s) |
|------|---------|
| JWT refresh token rotation — `POST /auth/refresh` exchanges httpOnly `sb-refresh-token` cookie via `supabase.auth.refreshSession()`; rotates cookie on every call; `POST /auth/set-refresh-cookie` stores initial refresh token after Supabase login | `src/controllers/authController.ts`, `src/routes/authRoutes.ts`, `src/validations/authValidations.ts` |
| Account lockout — `checkAccountLockout` middleware blocks IP after 10 failed refresh attempts (30-min lock, Redis-backed); `recordAuthFailure` / `clearAuthFailures` helpers; fail-open on Redis downtime | `src/middlewares/accountLockout.ts`, `src/controllers/authController.ts`, `src/routes/authRoutes.ts` |
| Joi validation on previously unvalidated routes — forum create/update, article status/moderation/content, user roadmap insert, auth set-refresh-cookie | `src/validations/forumValidations.ts`, `src/validations/articleValidations.ts`, `src/validations/authValidations.ts`, `src/routes/communityForumRoutes.ts`, `src/routes/articleRoutes.ts`, `src/routes/userRoutes.ts`, `src/routes/authRoutes.ts` |

### Phase 2 — Reliability
| Item | File(s) |
|------|---------|
| Circuit breaker (`opossum`) around Judge0 code execution — opens after 3 failures, 30s reset, 15s timeout; logs state transitions; returns 503 when open | `src/utils/codeExecutor.ts`, `package.json` |

### Phase 1 — Infrastructure
| Item | File(s) |
|------|---------|
| `/api/v1/health/ready` liveness probe — instant 200 with no DB/Redis checks; separate from `/health` deep check | `src/routes/healthCheckRoutes.ts` |
| `GET /api/v1/stats/summary` — public landing-page counts (users, battles, roadmaps, topics); single `$queryRaw`, Redis 5-min cache | `src/routes/statsRoutes.ts`, `src/routes/routes.ts` |

---

## Session 4 — 2026-03-27 (commits `e0ceb20f` → `ae5e8e1b`)

### Tracking
| Item | File(s) | Commit |
|------|---------|--------|
| Split TODO.md → TODO.md (pending) + DONE.md (completed, with commit refs) | `TODO.md`, `DONE.md` | `e0ceb20f` |

### Phase 3 — Security
| Item | File(s) | Commit |
|------|---------|--------|
| Resource ownership guards — `assertOwnership()` utility; wired into `updateRoadMap`, `deleteRoadMap`, `updateForum` | `src/utils/assertOwnership.ts`, `roadMapControllers.ts`, `communityForumControllers.ts` | `e0ceb20f` |
| Secrets scan — `Frontend/.env` untracked; contained live Supabase URL + anon key + JWT secret | `Frontend/.env` (removed) | `ae5e8e1b` |

### Phase 2 — Reliability
| Item | File(s) | Commit |
|------|---------|--------|
| Sentry wired in frontend — `sentry.client.config.ts` (replay, PII masking, auth header strip), `sentry.server.config.ts`, `sentry.edge.config.ts`; `next.config.mjs` wrapped with `withSentryConfig` | `Frontend/sentry.*.config.ts`, `Frontend/next.config.mjs` | `15701730` |

### Phase 1 — Infrastructure
| Item | File(s) | Commit |
|------|---------|--------|
| Startup env validation with Zod — crashes on missing required vars before any DB/Redis connection | `Backend/src/config/env.ts`, `main.ts`, `app.logic.ts` | `afe0abdc` |

### Phase 5 — CI/CD
| Item | File(s) | Commit |
|------|---------|--------|
| GitHub Actions CI — 6 parallel jobs: backend-audit, backend-lint, backend-typecheck, backend-build, frontend-audit, frontend-build | `.github/workflows/ci.yml` | `cecfefb6` |

---

## Session 3 — 2026-03-27 (commits `a8cca110` → `0b3bbd80`)

### Phase 1 — Infrastructure

| Item | File(s) | Commit |
|------|---------|--------|
| DB composite indexes — `Battle(status,created_at)`, `Battle(user_id,status)`, `Enrollment(user_id,status)`, `ForumPost(forum_id,created_at)`, `ForumComment(post_id,created_at)`, `LeaderboardEntry(subject_id,score/created_at)` | `prisma/schema.prisma` | `a8cca110` |
| PM2 cluster mode — `instances:'max'`, 512MB restart, 10s graceful shutdown | `ecosystem.config.js`, `package.json` | `6f7b3c19` |
| Cache-Aside — Leaderboard (Redis 60s TTL) + `invalidateLeaderboard()` | `src/repositories/leaderboardRepository.ts` | `27f00f7f` |
| Cache-Aside — Roadmaps migrated from in-memory to Redis (24h public / 5m auth) | `src/repositories/roadmapRepository.ts` | `27f00f7f` |

### Phase 2 — Reliability

| Item | File(s) | Commit |
|------|---------|--------|
| `requestId` added to every error JSON response body | `src/middlewares/errorHandler.ts` | `a514f123` |
| Helmet CSP — explicit `script-src`, `connect-src`, `img-src`, `frame-ancestors 'none'` | `src/main.ts` | `a514f123` |

### Phase 3 — Security

| Item | File(s) | Commit |
|------|---------|--------|
| RBAC audit — `authorizeRoles('ADMIN')` added to rbacRoutes (role/permission management), articleRoutes (status/moderation/content update had no auth), communityForumRoutes (delete) | `src/routes/rbacRoutes.ts`, `articleRoutes.ts`, `communityForumRoutes.ts` | `3ea47e89` |

### Docs

| Item | File(s) | Commit |
|------|---------|--------|
| `Backend/.env.example` — all 25 vars with inline docs | `Backend/.env.example` | `0b3bbd80` |
| `Frontend/.env.example` — updated with WS_URL + Sentry | `Frontend/.env.example` | `0b3bbd80` |
| `SETUP.md` — platform-by-platform key acquisition guide | `SETUP.md` | `0b3bbd80` |

---

## Session 2 — 2026-03-27 (commits `52876a1` → `aa2af6f`)

### Phase 2 — Reliability

| Item | File(s) |
|------|---------|
| Winston logger — JSON in prod, colorized dev, `AsyncLocalStorage` requestId propagation | `src/utils/logger.ts` |
| `requestId` middleware — UUID per request, `X-Request-ID` response header | `src/middlewares/requestIdMiddleware.ts` |
| Sentry init — `src/instrument.ts` imported before all other code in both entry points | `src/instrument.ts`, `src/main.ts`, `src/app.logic.ts` |
| All `console.*` replaced with structured `logger.*` calls | `uploadMiddleware.ts`, `validateRequest.ts`, `bulkOperations.ts`, `codeController.ts`, `websocket.ts`, `app.logic.ts` |

### Phase 3 — Security

| Item | File(s) |
|------|---------|
| JWT token blocklist — `POST /api/v1/auth/logout` invalidates token for remaining TTL via Redis SETEX | `src/controllers/authController.ts`, `src/routes/authRoutes.ts`, `src/middlewares/authMiddleware.ts` |
| Auth rate limiter — `authLimiter` (5 req/15min/IP) wired to logout endpoint | `src/routes/authRoutes.ts` |
| Hardcoded `http://localhost:3000` removed from Swagger config | `src/config/swagger.ts` |
| HTML sanitization — `sanitizeText` + `sanitizeRichText` (`sanitize-html`) wired into article + forum controllers | `src/utils/sanitize.ts`, `articleController.ts`, `communityForumControllers.ts` |
| `req.requestId` added to Express `Request` type declaration | `src/types/express/index.d.ts` |

---

## Session 1 — 2026-03-26 (commit `e2dd897`)

### Phase 1 — Infrastructure

| Item | File(s) |
|------|---------|
| Redis-backed rate limiter — `RedisStore` from `rate-limit-redis` wired into `express-rate-limit` | `src/main.ts` |
| `authCache` Map → Redis `SETEX` (5-min TTL, `SHA-256(token)` as key, never raw JWTs) | `src/middlewares/authMiddleware.ts` |
| Socket.io Redis adapter (`@socket.io/redis-adapter`) + Redis Sets for `userSockets` + `battleRooms` | `src/services/socket.ts` |

### Phase 2 — Reliability

| Item | File(s) |
|------|---------|
| Deep health check on `/api/v1/health` — live PostgreSQL, Redis, Bull checks; HTTP 503 on degraded | `src/routes/healthCheckRoutes.ts` |
| `unhandledRejection` + `uncaughtException` process handlers → `logger.error` + `process.exit(1)` | `src/main.ts`, `src/app.logic.ts` |
| Redis logger — `console.error` → `logger.error` | `src/services/redis.ts` |
