# EduScale — Pending Code Work

Target: **10M+ active users**, enterprise-grade reliability, $50k+/mo SaaS quality.

Completed items → [DONE.md](DONE.md)
Manual / platform tasks → [MANUAL.md](MANUAL.md)

**Priority:** `[P0]` Blocking | `[P1]` High | `[P2]` Medium | `[P3]` Nice to have

---

## P0 — Must ship before production

### Infrastructure
- [x] Prisma connection pooling via PgBouncer (add `&connection_limit=1` to `DATABASE_URL`)

### N+1 Audit
- [x] N+1 audit: confirm `getBattles` list has no per-row queries (looks clean, verify with `DEBUG=prisma:query`)

---

## P1 — High priority

### Security
- [x] CSRF protection — verify `SameSite=Strict` covers all cookie-based state changes; add double-submit token for non-Strict contexts

### Locking
- [x] RedLock (`redlock` npm) for distributed locking on battle state mutations (`startBattle`, `submitAnswer`, `completeBattle`) — prevents race conditions across PM2 workers

### Features
- [x] Verify Bull email queue processes in production; add dead-letter queue handling
- [ ] Stripe subscription billing (Free / Pro / Team tiers)
- [ ] Feature gating middleware based on subscription tier

### Testing
- [ ] Unit test coverage to 80% — controllers, services, repositories
- [ ] Integration tests: full auth flow (register → login → refresh → logout)
- [ ] Integration tests: battle lifecycle (create → join → answer → complete → leaderboard)
- [ ] Tests for all RBAC routes — verify 403 without correct role

### Frontend
- [ ] Next.js ISR on article and roadmap pages (`revalidate: 3600`)
- [x] `<link rel="preconnect">` to API + font origins; subset fonts
- [ ] Skeleton loaders for async sections (roadmaps, battles, leaderboard)
- [ ] Fix hamburger menu Z-index overlap on mobile
- [ ] Fix text overflow on 375px viewport
- [ ] `aria-label` on all icon-only buttons and theme toggle
- [ ] "Skip to Main Content" link as first focusable element

### Code Quality
- [ ] Eliminate all `: any` in backend codebase (48 instances remain)
- [ ] Enable `strict: true` + `noImplicitAny: true` in both tsconfigs

---

## P2 — Medium priority

- [ ] Soft deletes (`deletedAt`) on User, Battle, Forum models
- [ ] Partition `AnalyticsLog` table by month (Prisma migration)
- [ ] Archive battles older than 90 days to cold storage (cron job)
- [ ] Stale-while-revalidate pattern for leaderboard endpoints
- [ ] Code-split Monaco Editor; run `@next/bundle-analyzer`
- [ ] `eslint-plugin-security` + `husky` pre-commit hooks
- [ ] Stripe webhook handler for subscription lifecycle events
- [ ] TOTP-based 2FA with `otplib` + recovery codes (backend + frontend)
- [ ] GDPR data deletion endpoint
- [ ] Cookie consent banner for EU users (frontend)
- [ ] Data export endpoint (JSON/CSV)

---

## Progress

| Phase | Status |
|:------|:-------|
| P0 — Infrastructure | 🔶 1 item remains (PgBouncer) |
| P0 — Security | 🔶 manual only (see MANUAL.md) |
| P0 — CI/CD | 🔶 manual only (see MANUAL.md) |
| P1 — Security | ⬜ In progress |
| P1 — Reliability | ⬜ In progress |
| P1 — Features / Testing | ⬜ Not started |
| P2 / P3 | ⬜ Not started |

> Manual P0s (key rotation, OAuth, branch protection) are in **MANUAL.md**.
> All remaining P0 code blockers must be green before production launch.
