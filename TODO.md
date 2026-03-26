# EduScale — Production Scaling Roadmap

Target: **10M+ active users**, enterprise-grade reliability, $50k+/mo SaaS quality.

**Priority legend:** `[P0]` = Blocking / Critical | `[P1]` = High | `[P2]` = Medium | `[P3]` = Nice to have
**Status legend:** `[x]` = Done | `[-]` = Partial / needs more work | `[ ]` = Not started

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
- [ ] `[P1]` Provision read replicas on Supabase/RDS; route analytics and leaderboard reads to replica
- [ ] `[P1]` Set `statement_timeout` and `idle_in_transaction_session_timeout` on PostgreSQL
- [ ] `[P2]` Implement soft deletes (`deletedAt`) on User, Battle, Forum models
- [ ] `[P2]` Partition `AnalyticsLog` table by month to prevent unbounded growth
- [ ] `[P2]` Archive completed battles older than 90 days to a cold storage table

### 1.2 Redis
- [x] `[P0]` Migrate all in-memory caches (`authCache`) to Redis — **Done 2026-03-26**
- [x] `[P0]` Replace memory-based `express-rate-limit` with `rate-limit-redis` store — **Done 2026-03-26**
- [ ] `[P1]` Configure Redis with `maxmemory-policy allkeys-lru` and set memory limits
- [ ] `[P1]` Add Redis Sentinel or Redis Cluster for HA (no single point of failure)
- [ ] `[P1]` Implement RedLock for distributed locking on battle state mutations
- [ ] `[P2]` Enforce key namespacing convention: `eduscale:{env}:{domain}:{key}` across all services

### 1.3 WebSocket / Real-time
- [x] `[P0]` Install and configure `@socket.io/redis-adapter` — **Done 2026-03-26**
- [x] `[P0]` Migrate `userSockets` and `battleRooms` from in-memory Maps to Redis Sets — **Done 2026-03-26**
- [ ] `[P1]` Implement Redis-backed heartbeat for user presence (SETEX 30s TTL, refreshed on ping)
- [ ] `[P1]` Add Socket.io sticky sessions at AWS ALB (cookie-based)
- [ ] `[P2]` Add connection rate limiting per IP on WebSocket upgrade

### 1.4 Application Servers
- [ ] `[P0]` Switch to PM2 cluster mode (one worker per vCPU) — currently single process
- [ ] `[P1]` Add `HEALTHCHECK` to Dockerfile; configure ECS health check on `/api/v1/health`
- [ ] `[P1]` Set up ECS auto-scaling on CPU >70% / memory >80% CloudWatch alarms
- [ ] `[P2]` Extract code execution (Judge0/Piston proxy) into its own microservice

### 1.5 Caching Architecture
- [ ] `[P0]` Implement Cache-Aside for: Roadmaps (TTL 24h), Subject metadata (TTL 24h), Leaderboards (TTL 60s)
- [ ] `[P1]` Cache `/api/v1/stats/summary` for 5 minutes in Redis
- [ ] `[P1]` Add ETag / `Cache-Control: max-age` headers on static API responses
- [ ] `[P2]` Implement stale-while-revalidate for leaderboard endpoints

### 1.6 CDN & Frontend
- [ ] `[P0]` Verify all Cloudinary uploads use `f_auto,q_auto` transformation params
- [ ] `[P1]` Enable Next.js ISR on article and roadmap pages
- [ ] `[P1]` Add `<link rel="preconnect">` and font subsetting to eliminate render-blocking
- [ ] `[P2]` Code-split Monaco Editor behind dynamic import; run `@next/bundle-analyzer`

---

## Phase 2 — Reliability & Observability

### 2.1 Structured Logging
- [x] `[P0]` Remove all `console.*` from `src/` — replaced with Winston logger — **Done 2026-03-27**
- [x] `[P0]` JSON log format in production (machine-parseable for CloudWatch/Datadog) — **Done 2026-03-27**
- [x] `[P1]` `requestId` UUID middleware — every log line in a request carries the ID — **Done 2026-03-27**
- [ ] `[P1]` Log all auth events (login, logout, failed attempt) at INFO level with userId
- [ ] `[P1]` Ship logs to CloudWatch Logs via ECS log driver (`awslogs`)
- [ ] `[P2]` Log rotation and 30-day retention policy

### 2.2 Metrics & Alerting
- [x] `[P0]` Wire Sentry DSN in backend — `src/instrument.ts` imported before any other code — **Done 2026-03-27**
- [ ] `[P0]` Wire Sentry DSN in frontend (`NEXT_PUBLIC_SENTRY_DSN` + `sentry.client.config.ts`)
- [ ] `[P0]` Set up Sentry alerts: error rate >1% → PagerDuty/Slack notification
- [ ] `[P1]` Prometheus metrics endpoint: request rate, p95 latency, DB query time, Redis hit/miss, WS connections, Bull queue depth
- [ ] `[P1]` Grafana dashboard + SLO definitions (p95 < 500ms, uptime > 99.9%, error < 0.1%)

### 2.3 Health Checks
- [x] `[P0]` Deep health check on `/api/v1/health` (PostgreSQL + Redis + Bull) — **Done 2026-03-26**
- [ ] `[P1]` Add `/api/v1/ready` liveness probe (ECS uses both `/health` and `/ready`)
- [ ] `[P1]` Set up UptimeRobot or Better Uptime (external 1-min check interval)

### 2.4 Error Handling
- [-] `[P0]` Global Express error handler — exists (`errorHandler.ts`) but missing `requestId` in response body — **Needs requestId added**
- [x] `[P0]` `unhandledRejection` + `uncaughtException` process handlers — **Done 2026-03-26**
- [ ] `[P1]` Audit async controllers without `catchAsync` wrapper — add where missing
- [ ] `[P1]` No raw stack traces in production error responses — verify current handler

### 2.5 Circuit Breakers & Resilience
- [ ] `[P1]` Circuit breaker (`opossum`) around Judge0/Piston code execution API
- [ ] `[P1]` Circuit breaker around Cloudinary upload calls
- [ ] `[P2]` Axios default timeout = 10s on all outbound HTTP calls

---

## Phase 3 — Security Hardening

### 3.1 Authentication
- [ ] `[P0]` Fix Google OAuth — misconfigured Supabase OAuth provider (wrong project)
- [ ] `[P0]` JWT refresh token rotation — short-lived access (15m) + long-lived refresh (7d in httpOnly cookie)
- [x] `[P0]` JWT blocklist in Redis — `POST /api/v1/auth/logout` invalidates token for remaining TTL — **Done 2026-03-27**
- [x] `[P1]` Auth endpoint rate limiting — `authLimiter` (5 req/15min/IP) on logout — **Done 2026-03-27**
- [ ] `[P1]` Account lockout after 10 failed login attempts (30-min temporary lock)
- [ ] `[P2]` TOTP-based 2FA with `otplib` + recovery codes

### 3.2 Authorization
- [ ] `[P0]` RBAC audit — confirm `authorizeRoles()` is on every admin and sensitive route
- [ ] `[P0]` Resource ownership — validate `req.user.id === resource.userId` on all write operations
- [ ] `[P1]` Move authorization checks to repository layer, not just controllers

### 3.3 Input Validation & Sanitization
- [ ] `[P0]` Enforce Zod/Joi schema validation at every controller entry point — 66 raw `req.body` accesses remain
- [x] `[P0]` Sanitize user-generated HTML with `sanitize-html` — `sanitizeText` + `sanitizeRichText` utils wired into article and forum controllers — **Done 2026-03-27**
- [ ] `[P1]` UUID / parseInt validation on all route params and query strings
- [ ] `[P1]` File upload validation: type whitelist (jpeg/png/webp), 5MB max

### 3.4 API & Transport Security
- [x] `[P0]` Remove hardcoded `http://` URLs — swagger.ts was the only occurrence, fixed — **Done 2026-03-27**
- [ ] `[P0]` Tighten Helmet.js CSP: explicit `script-src`, `connect-src`, `img-src` directives
- [ ] `[P1]` Add `Referrer-Policy` and `Permissions-Policy` headers
- [ ] `[P1]` Verify CSRF protection active on all cookie-based state-changing endpoints

### 3.5 Secrets Management
- [ ] `[P0]` Scan codebase + git history for hardcoded credentials (`git log -S <pattern>`)
- [ ] `[P0]` Rotate any secrets potentially exposed in git history
- [ ] `[P1]` Use AWS Secrets Manager or Doppler for ECS secret injection — no `.env` in containers
- [ ] `[P1]` Verify `.env*` is in `.gitignore` and no env files are tracked

---

## Phase 4 — Testing & Quality

### 4.1 Backend Tests
- [ ] `[P0]` Increase unit test coverage: controllers, services, repositories → target 80%
- [ ] `[P0]` Integration tests: full auth flow (register → login → refresh → logout)
- [ ] `[P1]` Integration tests: battle lifecycle (create → join → answer → complete → leaderboard)
- [ ] `[P1]` Tests for all RBAC routes — verify 403 without correct role
- [ ] `[P1]` Isolated test DB (`DATABASE_TEST_URL`) with separate Prisma instance

### 4.2 Frontend Tests
- [ ] `[P1]` Playwright E2E: Register → Login → Battle → Submit → Leaderboard critical path
- [ ] `[P1]` Playwright accessibility audit on all primary pages (axe-core already installed)

### 4.3 Load Testing
- [ ] `[P1]` k6 scripts: 10k concurrent users on dashboard, 1k concurrent battles, 500 code submissions
- [ ] `[P1]` Run load tests against staging before every major release

### 4.4 Code Quality
- [ ] `[P1]` Eliminate all `: any` in backend codebase (48 instances)
- [ ] `[P1]` Enable `strict: true` and `noImplicitAny: true` in both `tsconfig.json` files
- [ ] `[P2]` Add `eslint-plugin-security` to ESLint config
- [ ] `[P2]` Add `husky` pre-commit hooks: lint + type-check

---

## Phase 5 — CI/CD & DevOps

### 5.1 Pipeline
- [ ] `[P0]` Branch protection on `main`: require PR review + passing CI before merge
- [ ] `[P0]` `npm audit --audit-level=high` in CI — fail on high/critical CVEs
- [ ] `[P1]` Parallel CI jobs: `lint`, `typecheck`, `test`, `build`
- [ ] `[P1]` Prisma schema validation step in CI (`prisma validate`)
- [ ] `[P2]` Blue/green deployment on ECS — zero-downtime releases
- [ ] `[P2]` Auto-rollback on failed health check post-deploy

### 5.2 Environments
- [ ] `[P0]` Dedicated staging environment — all releases go through staging first
- [ ] `[P1]` Separate Supabase projects and Redis instances per environment (dev/staging/prod)
- [ ] `[P1]` Startup env validation (`zod` schema) — crash fast on misconfiguration

### 5.3 Infrastructure as Code
- [ ] `[P2]` Terraform for ECS, RDS, ElastiCache, ALB, ECR, CloudWatch
- [ ] `[P3]` AWS WAF in front of ALB with OWASP managed rules

---

## Phase 6 — Product & Feature Completeness

### 6.1 Broken / Incomplete Features
- [ ] `[P0]` Fix Google Social Login end-to-end (misconfigured Supabase OAuth provider)
- [ ] `[P0]` Verify code execution pipeline (Judge0/Piston) in production with correct API keys
- [ ] `[P1]` Implement `GET /api/v1/stats/summary` endpoint (used on landing page)
- [ ] `[P1]` Wire leaderboard to real DB — replace any remaining static/mock data
- [ ] `[P1]` Verify Bull email queue processes in production; add dead-letter queue

### 6.2 Monetization
- [ ] `[P1]` Stripe subscription billing (Free / Pro / Team tiers)
- [ ] `[P1]` Feature gating middleware based on subscription tier
- [ ] `[P2]` Stripe webhook handler for subscription lifecycle events
- [ ] `[P2]` Admin billing dashboard: MRR, churn, trial conversions

### 6.3 Analytics & Growth
- [ ] `[P1]` PostHog or Mixpanel for product analytics (funnels, feature adoption)
- [ ] `[P2]` Event tracking: signup, first battle, first challenge completed, subscription upgraded

---

## Phase 7 — UX / Accessibility

### 7.1 Mobile
- [ ] `[P1]` Fix hamburger menu Z-index overlap on mobile
- [ ] `[P1]` Touch targets minimum 44×44px on all nav and interactive elements
- [ ] `[P1]` Fix text overflow on 375px viewport (hero section, card grids)

### 7.2 Accessibility (WCAG 2.1 AA)
- [ ] `[P1]` `aria-label` on all icon-only buttons and theme toggle
- [ ] `[P1]` "Skip to Main Content" link as first focusable element
- [ ] `[P1]` Fix heading hierarchy (H1 → H2 → H3) across all pages

### 7.3 Polish
- [ ] `[P1]` Skeleton loaders for all async-data sections (roadmaps, battles, leaderboard)
- [ ] `[P1]` Toast/feedback on guest redirect to protected routes
- [ ] `[P2]` Empty state illustrations for no-battles, no-posts, no-progress

---

## Phase 8 — Compliance & Legal

- [ ] `[P0]` Publish Privacy Policy and Terms of Service (required before paying users)
- [ ] `[P1]` GDPR data deletion endpoint — full account + data wipe on request
- [ ] `[P1]` Cookie consent banner for EU users
- [ ] `[P1]` Confirm personal data encrypted at rest (Supabase/RDS encryption enabled)
- [ ] `[P2]` Data export endpoint — user downloads all their data as JSON/CSV
- [ ] `[P2]` Verify `AdminAuditLog` is wired to all admin actions

---

## Progress Tracker

| Phase | Focus | P0s Done / Total P0s | Overall % |
|:------|:------|:---------------------|:----------|
| Phase 1 | Infrastructure & Scaling | 4 / 7 | 30% |
| Phase 2 | Reliability & Observability | 5 / 6 | 65% |
| Phase 3 | Security Hardening | 4 / 10 | 35% |
| Phase 4 | Testing & Quality | 0 / 2 | 0% |
| Phase 5 | CI/CD & DevOps | 0 / 3 | 0% |
| Phase 6 | Feature Completeness | 0 / 2 | 5% |
| Phase 7 | UX / Accessibility | 0 / 0 | 0% |
| Phase 8 | Compliance & Legal | 0 / 1 | 0% |

---

## Next Session — Planned P0 Work

Priority order for the next coding session:

### Batch A — Database (highest ROI, unblocks scale)
1. `[P0]` Add missing Prisma composite indexes → `prisma/schema.prisma` + migration
2. `[P0]` N+1 audit on top 5 heaviest queries (battle list, dashboard, leaderboard)
3. `[P0]` PM2 cluster mode — `ecosystem.config.js` + update start scripts

### Batch B — Security (remaining P0 gates)
4. `[P0]` RBAC audit — scan all routes, add `authorizeRoles()` where missing
5. `[P0]` Resource ownership guards — `req.user.id` check on write operations
6. `[P0]` Tighten Helmet.js CSP directives
7. `[P0]` Secrets scan (`git log -S` + `gitleaks`)

### Batch C — Reliability (close out Phase 2)
8. `[P0]` Add `requestId` to error handler response body
9. `[P0]` Wire Sentry in frontend (`sentry.client.config.ts`)
10. `[P0]` CI branch protection + `npm audit` gate

---

> P0 items gate production readiness. No new features until all P0s across Phases 1–3 and 5 are green.
