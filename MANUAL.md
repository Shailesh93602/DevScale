# EduScale — Manual Platform & Audit Tasks

This file tracks tasks that require manual verification in the Supabase Dashboard, Vercel, or other platform tools, as well as one-off audits that don't result in code changes.

---

## P0 — Infrastructure & Security

### Key Rotation & OAuth (Verified)
- [x] Rotate Supabase JWT Secret and update all services. (DONE 2026-03-28)
- [x] Verify Google OAuth redirect URLs in Supabase and Google Cloud. (DONE 2026-03-28)
- [x] Verify `SameSite=Strict` on production cookies. (DONE 2026-03-28)
- [x] Enable branch protection on `main`. (DONE 2026-03-28)
- [x] Audit Sentry alerts. (DONE 2026-03-28)

---

## P1 — Audits & Verification

### Code Audits (Verified)
- [x] **Leaderboard Audit**: No mock data remains. (DONE 2026-03-28)
- [x] **Admin Audit**: AdminAuditLog correctly wired. (DONE 2026-03-28)

### Pending Verification
- [ ] **Email Queue**: Verify Bull email queue processes in production; manually check Redis `bull:` keys for stalls.

---

## UI/UX Audits

### Mobile & Access (Pending)
- [ ] **Mobile Touch Audit**: Audit interactive elements on a physical device (44×44px).
- [ ] **Accessibility Audit**: Run `Lighthouse`/`axe` on critical flows (Register, Join Battle).

---

## How to complete these tasks
1. Perform the manual action or investigation.
2. If code changes are required, create a new item in `TODO.md` for the fix.
3. Once verified, check the item here and optionally add a note in `DONE.md`.
