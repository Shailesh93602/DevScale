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

## Outstanding P0s (as of end of session 2)

See `../CLAUDE.md` for full list. Quick reference:

| Item | File to change |
|------|---------------|
| DB composite indexes | `prisma/schema.prisma` → migration |
| N+1 audit | `src/repositories/*.ts` |
| PM2 cluster mode | `ecosystem.config.js` (new) + `package.json` |
| Cache-Aside for roadmaps/leaderboard | `src/services/cacheService.ts` + relevant controllers |
| requestId in error response | `src/middlewares/errorHandler.ts` |
| Sentry in frontend | `Frontend/sentry.client.config.ts` |
| Google OAuth fix | Supabase dashboard + env vars |
| RBAC audit | `src/routes/*.ts` |
| Resource ownership guards | `src/controllers/*.ts` |
| Helmet CSP tighten | `src/main.ts` |
| Secrets scan | `git log -S` + `gitleaks` |
| Branch protection | GitHub repo settings + CI workflow |
| Staging env | AWS / Supabase provisioning |
