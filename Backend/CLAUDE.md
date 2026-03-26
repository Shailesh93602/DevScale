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

### [P0] Redis connection — replace console.error with logger
- **File:** `src/services/redis.ts`
- **What:** Replaced `console.error('Redis Error:', err)` with `logger.error(...)` from the Winston logger.
- **Why:** `console.error` bypasses structured logging; errors won't appear in CloudWatch / Datadog.
