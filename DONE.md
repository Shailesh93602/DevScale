# EduScale — Completed Work Log

All shipped items, grouped by session. Newest first.

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
