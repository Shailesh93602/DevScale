# EduScale — Production Scaling Log

Tracking all changes made toward 10M+ user scalability and production readiness.

---

## Architecture

- **Backend:** Express.js + TypeScript, port 5000 (dev) — two entry points: `main.ts` (App class, primary) and `server.ts` + `app.logic.ts` (legacy routes)
- **Frontend:** Next.js 15, deployed on Vercel
- **DB:** PostgreSQL via Supabase + Prisma ORM (48+ models)
- **Cache/Queue:** Redis via ioredis, Bull for background jobs
- **WebSocket:** Socket.io with `@socket.io/redis-adapter` (multi-server safe as of 2026-03-26)
- **Auth:** Supabase JWT — verified locally via `SUPABASE_JWT_SECRET`; blocklist in Redis
- **CI/CD:** GitHub Actions → AWS ECR → ECS

## Required Env Vars

```
DATABASE_URL, DIRECT_URL         # PostgreSQL (Supabase)
REDIS_URL                        # Redis instance
SUPABASE_URL, SUPABASE_ANON_KEY  # Supabase project
SUPABASE_JWT_SECRET              # Local JWT verification
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

## Remaining P0 Blockers (as of 2026-03-27)

### Phase 1 — Infrastructure
- [ ] DB composite indexes (Prisma schema migration)
- [ ] N+1 query audit on top 5 heaviest endpoints
- [ ] PM2 cluster mode (currently single process)
- [ ] Cache-Aside for Roadmaps + Leaderboards

### Phase 2 — Reliability
- [ ] Add `requestId` to error handler response body
- [ ] Wire Sentry in frontend

### Phase 3 — Security
- [ ] Fix Google OAuth (wrong Supabase project configured)
- [ ] RBAC audit — all admin/sensitive routes
- [ ] Resource ownership validation on write operations
- [ ] Tighten Helmet CSP (currently disabled in dev, undefined in prod)
- [ ] Secrets scan + rotation

### Phase 5 — CI/CD
- [ ] Branch protection on `main`
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
