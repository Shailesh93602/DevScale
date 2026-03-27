# EduScale — Pending Work

Target: **10M+ active users**, enterprise-grade reliability, $50k+/mo SaaS quality.
Completed items → [DONE.md](DONE.md)

**Priority:** `[P0]` Blocking | `[P1]` High | `[P2]` Medium | `[P3]` Nice to have

---

## P0 — Must ship before production

### Security
- [ ] **URGENT:** Rotate Supabase anon key + JWT secret (were in git history — see SETUP.md §1)
- [ ] Fix Google OAuth — wrong Supabase OAuth project configured (see SETUP.md §1)

### CI/CD
- [ ] Branch protection on `main` — require PR review + passing CI before merge (GitHub settings)

### Infrastructure
- [ ] Staging environment — separate Supabase project + Redis instance
- [ ] Prisma connection pooling via PgBouncer (pool_mode=transaction, pool_size=20+)
- [ ] N+1 query audit on top 5 heaviest endpoints (battle list, dashboard, leaderboard)

### Reliability
- [ ] Sentry alerts — error rate >1% → Slack/PagerDuty notification

### CDN / Frontend
- [ ] Verify Cloudinary uploads use `f_auto,q_auto` transformation params

---

## P1 — High priority (post-P0)

### Database
- [ ] Provision read replicas; route analytics + leaderboard reads to replica
- [ ] Set `statement_timeout` and `idle_in_transaction_session_timeout` on PostgreSQL

### Redis
- [ ] `maxmemory-policy allkeys-lru` + memory limit configured
- [ ] Redis Sentinel / Redis Cluster for HA
- [ ] RedLock for distributed locking on battle state mutations

### WebSocket
- [ ] Redis-backed heartbeat for user presence (SETEX 30s TTL, refresh on ping)
- [ ] Socket.io sticky sessions at AWS ALB (cookie-based)

### Application
- [ ] `HEALTHCHECK` in Dockerfile; ECS health check on `/api/v1/health`
- [ ] ECS auto-scaling on CPU >70% / memory >80% CloudWatch alarms
- [ ] `/api/v1/ready` liveness probe (separate from `/health`)
- [ ] UptimeRobot or Better Uptime external monitoring (1-min interval)

### Caching
- [ ] Cache `/api/v1/stats/summary` for 5 min in Redis
- [ ] ETag / `Cache-Control: max-age` headers on stable API responses

### Logging
- [ ] Log all auth events (login, logout, failed attempt) at INFO with userId
- [ ] Ship logs to CloudWatch via ECS `awslogs` log driver

### Error handling
- [ ] Audit async controllers missing `catchAsync` wrapper
- [ ] Circuit breaker around Cloudinary upload calls

### Security
- [ ] UUID / parseInt validation on all route params
- [ ] File upload validation: type whitelist (jpeg/png/webp), 5MB max
- [ ] `Referrer-Policy` and `Permissions-Policy` headers
- [ ] CSRF protection verified on all cookie-based state-changing endpoints
- [ ] AWS Secrets Manager or Doppler for ECS secret injection
- [ ] Move authorization checks to repository layer, not just controllers

### CI/CD
- [ ] Separate Supabase + Redis per environment (dev / staging / prod)

### Frontend
- [ ] Next.js ISR on article and roadmap pages
- [ ] `<link rel="preconnect">` + font subsetting (eliminate render-blocking)

### Features
- [ ] Wire leaderboard to real DB — confirm no mock data remains (check current impl)
- [ ] Verify Bull email queue processes in production; add dead-letter queue
- [ ] Stripe subscription billing (Free / Pro / Team tiers)
- [ ] Feature gating middleware based on subscription tier
- [ ] PostHog or Mixpanel product analytics

### Testing
- [ ] Unit test coverage to 80% — controllers, services, repositories
- [ ] Integration tests: full auth flow (register → login → refresh → logout)
- [ ] Integration tests: battle lifecycle (create → join → answer → complete → leaderboard)
- [ ] Tests for all RBAC routes — verify 403 without correct role
- [ ] Playwright E2E: Register → Login → Battle → Submit → Leaderboard

### UX / Mobile
- [ ] Fix hamburger menu Z-index overlap on mobile
- [ ] Touch targets minimum 44×44px
- [ ] Fix text overflow on 375px viewport
- [ ] `aria-label` on all icon-only buttons and theme toggle
- [ ] "Skip to Main Content" link as first focusable element
- [ ] Skeleton loaders for async sections (roadmaps, battles, leaderboard)

### Code Quality
- [ ] Eliminate all `: any` in backend codebase (48 instances)
- [ ] Enable `strict: true` + `noImplicitAny: true` in both tsconfigs

---

## P2 — Medium priority

- [ ] Soft deletes (`deletedAt`) on User, Battle, Forum models
- [ ] Partition `AnalyticsLog` table by month
- [ ] Archive battles older than 90 days to cold storage
- [ ] Stale-while-revalidate for leaderboard endpoints
- [ ] Code-split Monaco Editor; run `@next/bundle-analyzer`
- [ ] Blue/green deployment on ECS
- [ ] Terraform for ECS, RDS, ElastiCache, ALB, ECR, CloudWatch
- [ ] `eslint-plugin-security` + `husky` pre-commit hooks
- [ ] Stripe webhook handler for subscription lifecycle events
- [ ] TOTP-based 2FA with `otplib` + recovery codes
- [ ] GDPR data deletion endpoint
- [ ] Cookie consent banner for EU users
- [ ] Data export endpoint (JSON/CSV)
- [ ] Verify `AdminAuditLog` wired to all admin actions

---

## P3 — Nice to have

- [ ] AWS WAF in front of ALB with OWASP managed rules
- [ ] Extract code execution into its own microservice
- [ ] Log rotation and 30-day retention policy

---

## Progress

| Phase | P0s Done / Total | Status |
|:------|:-----------------|:-------|
| Phase 1 — Infrastructure | 7 / 7 | ✅ All P0s done |
| Phase 2 — Reliability | 6 / 6 | ✅ All P0s done |
| Phase 3 — Security | 9 / 10 | 🔶 1 P0 remains (key rotation) |
| Phase 4 — Testing | 0 / 2 | ⬜ Not started |
| Phase 5 — CI/CD | 2 / 3 | 🔶 1 P0 remains (branch protection) |
| Phase 6 — Features | 0 / 2 | ⬜ Not started |
| Phase 7 — UX | 0 / 0 | — |
| Phase 8 — Compliance | 0 / 1 | ⬜ Not started |

> P0 items gate production launch. No new features until all P0s are green.
