# EduScale — Production Scaling Roadmap

Target: **10M+ active users**, enterprise-grade reliability, $50k+/mo SaaS quality.

**Priority legend:** `[P0]` = Blocking / Critical | `[P1]` = High | `[P2]` = Medium | `[P3]` = Nice to have

---

## Phase 1 — Infrastructure & Horizontal Scaling

### 1.1 Database
- [ ] `[P0]` Add missing composite indexes:
  - `Battle(status, createdAt)`, `Battle(creatorId, status)`
  - `UserProgress(userId, topicId, isCompleted)`
  - `Enrollment(userId, courseId, status)`
  - `ForumPost(forumId, createdAt)`, `ForumComment(postId, createdAt)`
  - `BattleParticipant(battleId, userId)`, `BattleAnswer(battleId, userId)`
- [ ] `[P0]` Audit every Prisma query for N+1; add `include` batching or implement Dataloader
- [ ] `[P0]` Enable Prisma connection pooling via PgBouncer (pool_mode=transaction, pool_size=20+)
- [ ] `[P1]` Provision read replicas on Supabase/RDS; route all analytics and leaderboard reads to replica
- [ ] `[P1]` Add `createdAt` and `updatedAt` database-level defaults on all models missing them
- [ ] `[P1]` Set `statement_timeout` and `idle_in_transaction_session_timeout` on PostgreSQL to prevent runaway queries
- [ ] `[P2]` Implement soft deletes (`deletedAt`) on User, Battle, Forum models instead of hard DELETE
- [ ] `[P2]` Partition `AnalyticsLog` table by month to prevent unbounded table growth
- [ ] `[P2]` Archive completed battles older than 90 days to a cold storage table

### 1.2 Redis
- [x] `[P0]` Migrate all in-memory caches (`authCache`, `memoryCache`) to Redis — **Done 2026-03-26**
- [x] `[P0]` Replace memory-based `express-rate-limit` with `rate-limit-redis` store — **Done 2026-03-26**
- [ ] `[P1]` Configure Redis with `maxmemory-policy allkeys-lru` and set memory limits
- [ ] `[P1]` Add Redis Sentinel or Redis Cluster for HA (no single point of failure)
- [ ] `[P1]` Implement RedLock for distributed locking on battle state mutations
- [ ] `[P2]` Set explicit key namespacing convention: `eduscale:{env}:{domain}:{key}`

### 1.3 WebSocket / Real-time
- [x] `[P0]` Install and configure `@socket.io/redis-adapter` — required for multi-server deployments — **Done 2026-03-26**
- [x] `[P0]` Migrate `userSockets` and `battleRooms` Maps from local memory to Redis Sets — **Done 2026-03-26**
- [ ] `[P1]` Implement Redis-backed heartbeat for user presence (`SETEX` with 30s TTL, refreshed on ping)
- [ ] `[P1]` Add Socket.io sticky sessions at the load balancer level (AWS ALB cookie-based)
- [ ] `[P2]` Implement backpressure handling — drop events if client socket buffer exceeds threshold
- [ ] `[P2]` Add connection rate limiting per IP for socket connections (prevent socket flood attacks)

### 1.4 Application Servers
- [ ] `[P0]` Switch from single Express process to cluster mode: `node:cluster` or PM2 cluster (one worker per vCPU)
- [ ] `[P1]` Implement graceful shutdown: drain in-flight requests on SIGTERM before killing process
- [ ] `[P1]` Add `HEALTHCHECK` to Dockerfile; configure AWS ECS health check on `/api/v1/health`
- [ ] `[P1]` Set up AWS ECS auto-scaling based on CPU (>70%) and memory (>80%) CloudWatch alarms
- [ ] `[P2]` Extract the code execution service (Judge0/Piston proxy) into its own microservice to isolate blast radius

### 1.5 Caching Architecture
- [ ] `[P0]` Implement Cache-Aside pattern for: Roadmaps (TTL 24h), Subject metadata (TTL 24h), Leaderboards (TTL 60s)
- [ ] `[P1]` Cache `/api/v1/stats/summary` response for 5 minutes in Redis
- [ ] `[P1]` Cache user profile and role lookups for 5 minutes (avoid repeated DB auth queries)
- [ ] `[P1]` Add ETag / `Cache-Control: max-age` headers on static API responses (roadmaps, articles)
- [ ] `[P2]` Implement stale-while-revalidate pattern for leaderboard endpoints

### 1.6 CDN & Frontend
- [ ] `[P0]` Verify all Cloudinary uploads use auto-quality and format (`f_auto,q_auto`)
- [ ] `[P1]` Enable Next.js ISR (Incremental Static Regeneration) on article pages and roadmap pages
- [ ] `[P1]` Configure Vercel Edge Config for feature flags (avoid redeploys to toggle features)
- [ ] `[P1]` Add `<link rel="preconnect">` and font subsetting to eliminate render-blocking
- [ ] `[P2]` Implement bundle analysis (`@next/bundle-analyzer`) and code-split Monaco Editor behind dynamic import
- [ ] `[P2]` Add a global Vercel Edge middleware to block known-bad IPs and enforce geo-restrictions if needed

---

## Phase 2 — Reliability & Observability

### 2.1 Structured Logging
- [ ] `[P0]` Remove all 30+ `console.log` statements from `src/`; replace with Winston logger calls
- [ ] `[P0]` Output logs as JSON in production (machine-parseable for Datadog/CloudWatch)
- [ ] `[P1]` Add `requestId` (UUID) to every log line via middleware for distributed tracing
- [ ] `[P1]` Log all auth events (login, logout, failed attempt, token refresh) at INFO level
- [ ] `[P1]` Ship logs to CloudWatch Logs or Datadog via log driver in ECS task definition
- [ ] `[P2]` Implement log rotation and 30-day retention policy

### 2.2 Metrics & Alerting
- [ ] `[P0]` Wire Sentry DSN in both backend and frontend env vars (currently installed but unconfigured)
- [ ] `[P0]` Set up Sentry alerts for error rate spikes (>1% of requests erroring = PagerDuty/Slack alert)
- [ ] `[P1]` Expose Prometheus metrics endpoint with: request rate, p50/p95/p99 latency, DB query duration, Redis hit/miss ratio, active WebSocket connections, Bull queue depth
- [ ] `[P1]` Set up Grafana dashboard connected to Prometheus for real-time SLO visibility
- [ ] `[P1]` Define SLOs: API p95 latency < 500ms, uptime > 99.9%, error rate < 0.1%
- [ ] `[P2]` Add custom metric: `battle_completions_per_minute` to detect anomalies in game traffic

### 2.3 Health Checks
- [x] `[P0]` Expand `/api/v1/health` to check PostgreSQL, Redis, and Bull queue connectivity — return degraded status if any component is down — **Done 2026-03-26**
- [ ] `[P1]` Add a `/api/v1/ready` liveness probe separate from the health check (ECS uses both)
- [ ] `[P1]` Set up UptimeRobot or Better Uptime for external monitoring with 1-min check interval

### 2.4 Error Handling
- [ ] `[P0]` Add a global Express error handler that catches unhandled errors and returns consistent `{ error, message, requestId }` JSON
- [x] `[P0]` Handle `unhandledRejection` and `uncaughtException` process events — log and gracefully exit — **Done 2026-03-26**
- [ ] `[P1]` Wrap all async controller functions in a `asyncHandler` wrapper to eliminate missing `next(err)` calls
- [ ] `[P1]` Return structured error responses with HTTP status codes — no raw stack traces in production

### 2.5 Circuit Breakers & Resilience
- [ ] `[P1]` Add circuit breaker (`opossum` or `cockatiel`) around Judge0/Piston code execution API calls
- [ ] `[P1]` Add circuit breaker around Cloudinary upload calls
- [ ] `[P2]` Implement retry-with-jitter for failed Redis operations (max 3 retries, exponential backoff)
- [ ] `[P2]` Add timeout enforcement on all outbound HTTP calls (Axios default timeout = 10s max)

---

## Phase 3 — Security Hardening

### 3.1 Authentication
- [ ] `[P0]` Fix Google OAuth configuration (currently pointing to wrong Supabase instance)
- [ ] `[P0]` Implement JWT refresh token rotation: issue short-lived access tokens (15m) + long-lived refresh tokens (7d) stored in httpOnly cookie
- [x] `[P0]` Maintain a JWT token blocklist in Redis (invalidated on logout) — **Done 2026-03-27** — `POST /api/v1/auth/logout` blocklists token with TTL = remaining lifetime; authMiddleware rejects blocklisted tokens
- [x] `[P1]` Add rate limiting on auth endpoints — **Done 2026-03-27** — `authLimiter` (5 req/15min/IP) wired to `POST /auth/logout`; Supabase handles login/register rate limiting on their end
- [ ] `[P1]` Lock account after 10 consecutive failed login attempts (temporary 30-min lockout)
- [ ] `[P1]` Send email notification on login from a new device/IP
- [ ] `[P2]` Add TOTP-based 2FA (use `otplib`) with recovery codes

### 3.2 Authorization
- [ ] `[P0]` Audit every route: confirm RBAC middleware is applied on all admin and sensitive endpoints
- [ ] `[P0]` Ensure users cannot access other users' resources — validate `userId === req.user.id` on all write operations
- [ ] `[P1]` Add resource-level authorization checks in repositories, not just controllers
- [ ] `[P1]` Enforce principle of least privilege — no endpoint should accept more permissions than needed

### 3.3 Input Validation & Sanitization
- [ ] `[P0]` Enforce strict Zod/Joi schema validation at every controller entry point — zero raw `req.body` access
- [x] `[P0]` Sanitize all user-generated HTML/Markdown (articles, forum posts) with `sanitize-html` before storing — **Done 2026-03-27** — `sanitize.ts` util with `sanitizeText` (strip all tags) and `sanitizeRichText` (safe allowlist); wired into articleController and communityForumControllers
- [ ] `[P1]` Validate and sanitize all query params and route params (parseInt, UUID format checks)
- [ ] `[P1]` Add max-length limits to all text fields matching Prisma schema constraints
- [ ] `[P1]` Validate file uploads: type whitelist (image/jpeg, image/png, image/webp), max size 5MB

### 3.4 API & Transport Security
- [x] `[P0]` Remove all hardcoded `http://` URLs — **Done 2026-03-27** — only occurrence was swagger.ts dev fallback; updated to correct port 5000 with production label guard
- [ ] `[P0]` Tighten Helmet.js CSP: specify explicit `script-src`, `connect-src`, `img-src` directives
- [ ] `[P1]` Set `Referrer-Policy: strict-origin-when-cross-origin` and `Permissions-Policy` headers
- [ ] `[P1]` Enforce CORS whitelist from environment variable, not hardcoded array
- [ ] `[P1]` Verify CSRF protection is active on all cookie-based state-changing endpoints
- [ ] `[P2]` Implement API key authentication (with SHA-256 hashing) for any third-party integrations

### 3.5 Secrets Management
- [ ] `[P0]` Audit codebase for any hardcoded credentials, API keys, or secrets — move all to env vars
- [ ] `[P0]` Rotate all secrets that may have been committed to git history (check with `git log -S <secret>`)
- [ ] `[P1]` Use AWS Secrets Manager or Doppler for secret injection in ECS — no `.env` files in containers
- [ ] `[P1]` Add `.env*` to `.gitignore` and verify no env files are tracked in git
- [ ] `[P2]` Implement secret rotation schedule for DB credentials and JWT secrets (quarterly)

---

## Phase 4 — Testing & Quality

### 4.1 Backend Tests
- [ ] `[P0]` Increase unit test coverage from ~10% to 80% on: controllers, services, repositories
- [ ] `[P0]` Add integration tests for the full auth flow (register → login → refresh → logout)
- [ ] `[P1]` Add integration tests for the battle lifecycle (create → join → answer → complete → leaderboard)
- [ ] `[P1]` Add tests for all RBAC-protected routes — verify 403 is returned without correct role
- [ ] `[P1]` Set up test database (`DATABASE_TEST_URL`) with isolated Prisma instance for integration tests
- [ ] `[P2]` Add property-based tests for scoring algorithms and ELO/ranking calculations

### 4.2 Frontend Tests
- [ ] `[P1]` Write Playwright E2E tests for the critical path: Register → Login → Start Battle → Submit Answer → View Leaderboard
- [ ] `[P1]` Add Playwright accessibility audit on all primary pages (uses axe-core already installed)
- [ ] `[P2]` Add visual regression tests via Playwright screenshots for key UI components

### 4.3 Load Testing
- [ ] `[P1]` Set up k6 load test scripts simulating: 10k concurrent users on dashboard, 1k concurrent battles, 500 simultaneous code submissions
- [ ] `[P1]` Run load tests against staging environment before every major release
- [ ] `[P2]` Define and document breaking points — know the ceiling before users hit it

### 4.4 Code Quality
- [ ] `[P1]` Eliminate all 48 instances of `: any` in the backend codebase
- [ ] `[P1]` Enable `strict: true` and `noImplicitAny: true` in both `tsconfig.json` files
- [ ] `[P2]` Add `eslint-plugin-security` to ESLint config to catch common security anti-patterns
- [ ] `[P2]` Add `husky` pre-commit hooks running lint + type-check (block commits that break types)
- [ ] `[P3]` Add `depcheck` to CI to flag unused dependencies

---

## Phase 5 — CI/CD & DevOps

### 5.1 Pipeline
- [ ] `[P0]` Add branch protection on `main`: require PR review + passing CI before merge
- [ ] `[P0]` Add `npm audit --audit-level=high` to CI pipeline — fail build on high/critical CVEs
- [ ] `[P1]` Add Docker layer caching in GitHub Actions to cut build times
- [ ] `[P1]` Separate CI into jobs: `lint`, `typecheck`, `test`, `build` — run lint/typecheck in parallel
- [ ] `[P1]` Add automatic Prisma schema validation step to CI (`prisma validate`)
- [ ] `[P2]` Implement blue/green deployment on ECS to achieve zero-downtime releases
- [ ] `[P2]` Add rollback step in GitHub Actions triggered on failed health check post-deploy

### 5.2 Environments
- [ ] `[P0]` Create a dedicated staging environment (mirrors prod) — all releases go through staging first
- [ ] `[P1]` Create separate Supabase projects and Redis instances for dev / staging / prod
- [ ] `[P1]` Add environment variable validation on startup (`envalid` or `zod` env schema) — crash fast if misconfigured
- [ ] `[P2]` Implement database seeding scripts that work in staging with realistic but anonymized data

### 5.3 Infrastructure as Code
- [ ] `[P2]` Write Terraform (or AWS CDK) for ECS cluster, RDS, ElastiCache Redis, ALB, ECR, CloudWatch
- [ ] `[P2]` Store Terraform state in S3 with DynamoDB locking
- [ ] `[P3]` Add AWS WAF in front of ALB with managed rules for OWASP top 10

---

## Phase 6 — Product & Feature Completeness

### 6.1 Broken / Incomplete Features
- [ ] `[P0]` Fix Google Social Login end-to-end (misconfigured Supabase OAuth provider)
- [ ] `[P0]` Verify code execution pipeline (Judge0/Piston) works in production with correct API keys and sandbox isolation
- [ ] `[P1]` Implement `/api/v1/stats/summary` endpoint (total users, active roadmaps, challenges completed, community posts) — used on landing page
- [ ] `[P1]` Wire leaderboard to real DB data — replace any remaining static/mock data
- [ ] `[P1]` Complete email notification system: verify Bull email queue is processing in production, add retry/dead-letter queue
- [ ] `[P2]` Implement certificate generation on curriculum completion (PDF or verifiable credential)

### 6.2 Monetization & Business
- [ ] `[P1]` Integrate Stripe for subscription billing (Free / Pro / Team tiers)
- [ ] `[P1]` Implement feature gating middleware based on subscription tier
- [ ] `[P2]` Add Stripe webhook handler for subscription lifecycle events (created, updated, cancelled, past_due)
- [ ] `[P2]` Build admin billing dashboard showing MRR, churn, trial conversions
- [ ] `[P3]` Add usage-based limits per tier (battles per month, code executions per day)

### 6.3 Analytics & Growth
- [ ] `[P1]` Implement PostHog or Mixpanel for product analytics (activation funnels, feature adoption)
- [ ] `[P2]` Add `analytics` event tracking on: signup, first battle started, first challenge completed, subscription upgraded
- [ ] `[P2]` Build internal admin analytics dashboard: DAU/MAU, retention cohorts, revenue metrics

---

## Phase 7 — UX / Accessibility

### 7.1 Mobile
- [ ] `[P1]` Fix hamburger menu Z-index overlap on mobile
- [ ] `[P1]` Increase touch targets to minimum 44×44px on all nav and interactive elements
- [ ] `[P1]` Fix text overflow and wrapping on 375px viewport (hero section, card grids)
- [ ] `[P2]` Add responsive battle layout — Monaco editor degrades gracefully on small screens

### 7.2 Accessibility (WCAG 2.1 AA)
- [ ] `[P1]` Add `aria-label` to all icon-only buttons and the theme toggle
- [ ] `[P1]` Add "Skip to Main Content" link as first focusable element on every page
- [ ] `[P1]` Fix heading hierarchy violations (H1 → H2 → H3) across all pages
- [ ] `[P2]` Ensure all form inputs have associated `<label>` elements
- [ ] `[P2]` Test full keyboard navigation flow through the battle UI

### 7.3 Polish
- [ ] `[P1]` Add Skeleton loaders for all async-data sections (roadmaps, battles, leaderboard)
- [ ] `[P1]` Show toast/feedback on guest redirect when accessing protected routes (Battle Zone, Roadmaps)
- [ ] `[P2]` Replace placeholder partner logos with real logos or remove section
- [ ] `[P2]` Add empty state illustrations for: no battles found, no forum posts, no progress yet

---

## Phase 8 — Compliance & Legal

- [ ] `[P0]` Publish Privacy Policy and Terms of Service pages (required before acquiring paying users)
- [ ] `[P1]` Implement GDPR data deletion endpoint: user can request full account + data deletion
- [ ] `[P1]` Add cookie consent banner (required for EU users under GDPR/ePrivacy)
- [ ] `[P1]` Ensure personal data is encrypted at rest (enable Supabase/RDS encryption)
- [ ] `[P2]` Implement data export endpoint: user can download all their data as JSON/CSV
- [ ] `[P2]` Add audit log for all admin actions (`AdminAuditLog` model exists — ensure it's wired)
- [ ] `[P3]` Achieve SOC 2 Type I readiness checklist

---

## Progress Tracker

| Phase | Focus | Priority | Status |
|:------|:------|:---------|:-------|
| Phase 1 | Infrastructure & Scaling | Critical | 40% |
| Phase 2 | Reliability & Observability | Critical | 60% |
| Phase 3 | Security Hardening | Critical | 55% |
| Phase 4 | Testing & Quality | High | 10% |
| Phase 5 | CI/CD & DevOps | High | 20% |
| Phase 6 | Feature Completeness | High | 25% |
| Phase 7 | UX / Accessibility | Medium | 0% |
| Phase 8 | Compliance & Legal | High | 0% |

---

> Work P0 items before any new feature development. A platform with security holes or missing rate limiting cannot scale safely to 10M users regardless of infrastructure.
