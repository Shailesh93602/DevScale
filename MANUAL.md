# EduScale — Manual Platform & Audit Tasks

This file tracks tasks that require manual verification in the Supabase Dashboard, Vercel, or other platform tools, as well as one-off audits that don't result in code changes.

---

## P0 — Infrastructure & Security

### Key Rotation & OAuth
- [x] Rotate Supabase JWT Secret and update all services (Backend, Frontend, GitHub Actions).
- [x] Verify Google OAuth redirect URLs are correctly whitelisted in Supabase Dashboard and Google Cloud Console.
- [x] Verify `SameSite=Strict` flag on all production cookies via Browser DevTools.

### CI/CD & Compliance
- [x] Enable branch protection on `main` branch (GitHub Settings: require PR, require status checks, restrict deletions).
- [x] Audit Sentry alerts: Ensure critical errors notify `ALERT_EMAIL`.

---

## P1 — Audits & Verification

### Code Audits
- [ ] **Leaderboard Audit**: Verify `leaderboardRepository` has no mock or hardcoded data remaining from initial development.
- [ ] **Admin Audit**: Verify `AdminAuditLog` is correctly wired to all destructive admin actions (Delete User, Delete Roadmap, Moderation).
- [ ] **Email Queue**: Verify Bull email queue processes in production; manually check Redis `bull:` keys for stalls.

### UI/UX Audits
- [ ] **Mobile Touch Audit**: Audit all interactive elements on a physical device; ensure minimum 44×44px touch targets.
- [ ] **Accessibility Audit**: Run `Lighthouse` / `axe` on critical flows (Register, Join Battle, Submit Code).

---

## How to complete these tasks
1. Perform the manual action or investigation.
2. If code changes are required, create a new item in `TODO.md` for the fix.
3. Once verified, check the item here and optionally add a note in `DONE.md`.
