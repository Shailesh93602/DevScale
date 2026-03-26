# Global Project Todo List & Bug Tracking

## Recently Fixed (March 19, 2026)

### 1. Critical APIs and Connections
- [x] **Cross-Origin API Failures (CORS)** — Smart origin handler: dev allows localhost + private network IPs, production uses `CORS_ORIGIN` env var. Socket.io CORS matched.
- [x] **Missing Icons causing 404s** — Fixed in previous session (lucide-react / react-icons replacements).
- [x] **WebSocket connection fallback** — Added `NEXT_PUBLIC_WS_URL` env var, removed hardcoded localhost from `useBattleWebSocket.ts`.

### 2. Code Quality & Professionalism
- [x] **Debug console.logs removed** — Cleaned 10+ `console.log` statements from `auth/actions.ts`, `dashboard/page.tsx`, `create-battle/page.tsx`.
- [x] **Dark mode theme compliance** — Fixed AchievementsCard, HeroParallax, WeeklyLeaderboard, Profile page with semantic tokens (bg-card, text-foreground, bg-primary, etc.).
- [x] **Button design system compliance** — Replaced raw `<button>` in create-battle with `<Button>` from ui/button.
- [x] **Dashboard auth skeleton fix** — Dashboard now waits for auth status before fetching, prevents infinite skeleton after login/signup.
- [x] **SUPABASE_JWT_SECRET exported** — Consistent with config pattern.

---

## Open Tasks

### 2. Data Synchronization & Fetching Updates
- [ ] **Static Landing Page Statistics** — Modify `10k+ users`, `50+ roadmaps` tags to fetch dynamic data from a public `/platform-stats` API returning formatted scale counts.
- [ ] **Static Leaderboard Data** — Wire landing page leaderboard to fetch from `/api/v1/leaderboard` backend route. Show sample data with badge if empty.
- [ ] **Dashboard Empty States** — Formulate fallback UI suggestions or "Recommended Features / Roadmaps" for empty grids.

### 3. Feature Implementations
- [ ] **Production-Ready Blogs Architecture** — Build Markdown/DB blog parsing engine, implement `/blogs` and `/blogs/[slug]` routes, add "Blogs" link to Navbar.
- [ ] **Supabase Auth → Backend User Sync** — Webhook or reliable sync mechanism for when user exists in Supabase but not Prisma DB.

### 4. Battle-Zone: Question Auto-Population (Phase 5)
- [x] **P5.1–P5.5: Backend** — Schema, QuestionPoolService, question-pool endpoint, auto-seed on creation (2026-03-20)
- [x] **P5.6–P5.8: Hierarchy APIs** — `/roadmaps/:id/main-concepts`, `/main-concepts/:id/subjects`, `/challenges/categories` (2026-03-21)
- [x] **P5.9–P5.10: QuestionSourceSelector + QuestionPreviewList** — Frontend components complete (2026-03-21)
- [x] **P5.11–P5.13: Wizard revamp** — Step 2 = source selector, Step 4 = preview+launch, no manual entry (2026-03-21)
- [ ] **P5.14: Post-battle results breakdown** — Question-by-question correct/incorrect, time, accuracy
- [ ] **P5.15: Statistics topic attribution** — From `source_quiz_question_id` → `QuizQuestion` → `Topic`
- [ ] **P5.16 (Phase 2): DSA Challenge MCQ** — Add `mcq_options`/`mcq_correct_index` to `Challenge` model

### 5. Infrastructure
- [ ] **Missing database migration** — Enrollment model needs `prisma migrate dev`.
- [ ] **1K Challenge seeding** — Continue from Milestone 3 (target: 500 challenges).

### 6. Automated Testing
- [x] **Battle Zone E2E production suite** — `battle-zone-production.spec.ts`: 15 suites, ~60 tests covering all battle phases, slug nav, creation, join, statistics, real-time resilience, accessibility, performance (2026-03-21)
- [ ] Expand Playwright E2E suites for WCAG accessibility, visual regressions, and auth stability.
- [ ] **P5.14: Post-battle results breakdown** — Question-by-question correct/incorrect, time, accuracy (carry-forward from P5)
