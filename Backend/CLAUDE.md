# Backend — Change Log

All backend changes tracked here with timestamps.

---

## 2026-03-26

### [P0] Redis-backed rate limiter
- **File:** `src/main.ts`
- **What:** Wired `rate-limit-redis` store into the global `rateLimit()` call. Previously used in-memory store (resets on restart, doesn't work across multiple instances). `rate-limit-redis` was already in `package.json` — just needed to be connected.
- **Why:** In-memory rate limiting fails the moment you run >1 process/pod.

### [P0] Health check endpoint — deep check
- **File:** `src/routes/healthCheckRoutes.ts`
- **What:** Replaced the static `{ status: 'ok' }` response with live checks against PostgreSQL (`prisma.$queryRaw`), Redis (`ping`), and Bull queue instantiation. Returns HTTP 200 with all-green or HTTP 503 with the degraded component identified.
- **Why:** AWS ECS and load balancers need a health check that actually reflects system state.

### [P0] Process-level error handlers
- **File:** `src/main.ts`
- **What:** Added `process.on('unhandledRejection')` and `process.on('uncaughtException')` handlers that log the error with Winston and exit with code 1, allowing the container orchestrator to restart cleanly.
- **Why:** Without these, silent crashes leave the process running in a zombie state.

### [P0] Migrate authCache from in-memory Map to Redis
- **File:** `src/middlewares/authMiddleware.ts`
- **What:** Replaced the `Map<string, ...>()` auth cache and its `setInterval` cleanup with Redis `SET ... EX` calls using the existing `redisConnection`. The key is a SHA-256 hash of the token (never store raw JWTs as cache keys). TTL unchanged at 5 minutes.
- **Why:** In-memory cache is per-process. With cluster mode or multiple pods, cache misses hit the DB on every process that hasn't seen the token yet, defeating the purpose.

### [P0] Socket.io Redis adapter (distributed WebSocket)
- **File:** `src/services/socket.ts`, `package.json`
- **What:** Installed `@socket.io/redis-adapter` and wired it into `SocketService.initialize()`. Also migrated `userSockets` and `battleRooms` Maps to Redis Hashes (HSET/HGET/HDEL) so state is shared across all server instances.
- **Why:** Without the Redis adapter, Socket.io `io.to(room).emit()` only broadcasts to sockets connected to the *same process*. Multi-server deployments silently drop events to users on other servers.

---

## 2026-03-27

### [P0] Winston logger — full restoration
- **File:** `src/utils/logger.ts`
- **What:** Replaced the `console.*` stub with a real Winston logger. JSON format in production (machine-parseable), colorized format in dev. Uses `AsyncLocalStorage` (`node:async_hooks`) to carry `requestId` through the async request chain automatically.

### [P0] requestId middleware
- **File:** `src/middlewares/requestIdMiddleware.ts`
- **What:** Reads `X-Request-ID` header or generates a UUID. Sets `req.requestId`, echoes header back on response, and runs the request chain inside `AsyncLocalStorage` context so every logger call in scope inherits the `requestId`.

### [P0] Sentry wiring
- **File:** `src/instrument.ts` (new), `src/main.ts`, `src/app.logic.ts`
- **What:** Created a TypeScript Sentry init file that only activates when `SENTRY_DSN` env var is set. Imported at the very top of both entry points before any other imports. Trace sample rate is 10% in prod / 100% in dev.

### [P0] Replace all console.* with logger
- **Files:** `uploadMiddleware.ts`, `validateRequest.ts`, `bulkOperations.ts`, `codeController.ts`, `websocket.ts`, `app.logic.ts`
- **What:** Replaced every `console.log/error/warn` in application code with structured `logger.*` calls. Left `console.log` in `codeWrapper.ts` template literal (intentional user-code output) and seed scripts (intentional CLI output).

### [P0] JWT token blocklist
- **Files:** `src/controllers/authController.ts` (new), `src/routes/authRoutes.ts` (new), `src/middlewares/authMiddleware.ts`
- **What:** `POST /api/v1/auth/logout` stores `SHA-256(token)` in Redis `SETEX` with TTL = token's remaining lifetime. `authMiddleware` now checks blocklist before processing any request (fails open on Redis downtime). `authLimiter` applied to logout endpoint.

### [P0] HTML sanitization
- **Files:** `src/utils/sanitize.ts` (new), `src/controllers/articleController.ts`, `src/controllers/communityForumControllers.ts`
- **What:** `sanitize-html` based util with `sanitizeText` (strip all tags) and `sanitizeRichText` (safe allowlist — no scripts/iframes/event handlers, https-only schemes). Wired into article content updates and forum create/update.

### [P0] Redis connection — replace console.error with logger
- **File:** `src/services/redis.ts`
- **What:** Replaced `console.error('Redis Error:', err)` with `logger.error(...)` from the Winston logger.
- **Why:** `console.error` bypasses structured logging; errors won't appear in CloudWatch / Datadog.
