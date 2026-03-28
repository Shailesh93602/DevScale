# EduScale — Pending Code Work

## P0 — Must ship before production

### Features
- [ ] Stripe subscription billing (Free / Pro / Team tiers)
- [ ] Feature gating middleware based on subscription tier

### Testing
- [ ] Unit test coverage to 80% — controllers, services, repositories
- [ ] Integration tests: full auth flow (register → login → refresh → logout)
- [ ] Integration tests: battle lifecycle (create → join → answer → complete → leaderboard)
- [ ] Tests for all RBAC routes — verify 403 without correct role

---

## P1 — High priority

### Frontend
- [ ] Next.js ISR on article and roadmap pages (`revalidate: 3600`)

### Code Quality
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
| P0 — Security | ✅ Manual verification complete |
| P0 — CI/CD | ✅ Manual verification complete |
| P1 — Features / Testing | ⬜ Not started |
| P2 / P3 | ⬜ Not started |

> Manual audit and platform tasks are tracked in **MANUAL.md**.
> All remaining P1 code tasks must be green before production launch.
