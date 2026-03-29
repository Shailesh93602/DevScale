# EduScale — Pending Code Work

## P0 — Must ship before production

### Features
- [ ] Feature-complete Stripe integration tests

### Testing
- [ ] Unit test coverage to 80% — controllers, services, repositories
- [ ] Integration tests: full auth flow (register → login → refresh → logout)
- [ ] Integration tests: battle lifecycle (create → join → answer → complete → leaderboard)
- [ ] Tests for all RBAC routes — verify 403 without correct role

---

## P1 — Audits & Verification

### Audits
- [ ] **Mobile Touch Audit**: Audit interactive elements on a physical device (44×44px).
- [ ] **Accessibility Audit**: Run `Lighthouse`/`axe` on critical flows (Register, Join Battle).

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
- [ ] TOTP-based 2FA with `otplib` + recovery codes (backend + frontend)
- [ ] GDPR data deletion endpoint
- [ ] Cookie consent banner for EU users (frontend)
- [ ] Data export endpoint (JSON/CSV)

---

## Progress

| Phase | Status |
|:------|:-------|
| P0 — Infrastructure | ✅ Complete |
| P0 — Security | ✅ Complete |
| P0 — CI/CD | ✅ Complete |
| P1 — Features / Testing | 🔶 In Progress (Billing UI remains) |
| P2 / P3 | ⬜ Not started |

> Manual audit and platform tasks are tracked in **MANUAL.md**.
> All remaining P1 code tasks must be green before production launch.
