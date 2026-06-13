# EduScale — Deferred Features (hidden from the showcase, to build later)

These features are **intentionally hidden from navigation** for now so the
showcase only presents finished work. The routes/components still exist in the
codebase — they're just not linked. When we're ready, build them for real and
re-add the nav links. **Do not delete these; they're planned work, not dead code.**

A real backend already exists for most of this (`communityForumRoutes.ts`,
`articleRoutes.ts`, the forum/article controllers), so the work is mostly
front-end wiring + tests.

## Hidden from nav (2026-06-13)
| Feature | Route | Current state | Nav links removed from |
|---|---|---|---|
| Community | `/community` | Coming Soon | Navbar (`navItems`), footer quick links, landing CTA → now points to `/auth/register`, "Active Community" feature card → `/auth/register` |
| Discussion Forums | `/discussion-forums` | Coming Soon | footer links |
| Discussions | `/discussions` | Coming Soon | (was unlinked) |
| Doubts Corner | `/doubts` | **Was a fake form** (toast only, discarded the question) → replaced with honest Coming Soon | (was unlinked) |
| Collaboration Opportunities | `/collaboration-opportunities` | Coming Soon | (was unlinked) |
| Events | `/events` | Coming Soon | (was unlinked) |
| Member Highlights | `/member-highlights` | Coming Soon | (was unlinked) |

## What "build for real" means
- **Doubts Corner** — wire the question form to the forum/article backend
  (create a post of a "question" type), list existing questions, allow answers.
  Re-point `DoubtsContent.tsx` away from `ComingSoon`.
- **Discussions / Discussion Forums** — front-end for `communityForumRoutes`
  (list threads, create thread, comment). Backend largely exists.
- **Community / Member Highlights / Events / Collaboration** — product-define
  first (what data, what backend). These have no backend yet.

## When re-enabling
1. Build + test the feature (backend if needed, front-end, e2e).
2. Re-add the nav link(s) in:
   - `Frontend/src/components/Navbar/constants.tsx` (`navItems`)
   - `Frontend/src/constants/index.tsx` (`quickLinks`, `footerLinks`)
   - landing CTAs in `CommunitySection.tsx` / `FeaturesSection.tsx` if relevant.
3. Remove the corresponding row from this file.
