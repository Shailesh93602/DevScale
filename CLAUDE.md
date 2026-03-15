# CLAUDE.md - EduScale Platform Agent Instructions

## Project Overview
**EduScale** - All-in-one SaaS learning platform for engineering students.
- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS, Shadcn UI, Redux Toolkit + Zustand
- **Backend**: Node.js, Express, TypeScript, Prisma ORM, PostgreSQL, Socket.io
- **Auth**: Supabase authentication
- **Brand**: EduScale (shailesh93602@gmail.com)

## Critical Rules

### Frontend Rules
1. **ALWAYS use `<Button>` from `@/components/ui/button`** - NEVER use raw `<button>` or `<motion.button>` for user-facing CTAs
2. **NEVER pass custom color classes** to the `<Button>` component when using `variant="default"` (primary) - it already handles dark/light mode via CSS variables
3. **Auth-aware UI**: Hide "Get Started" / signup CTAs when user is authenticated (`isAuthenticated` from Redux)
4. Use `useAxiosGet`, `useAxiosPut`, etc. hooks for API calls
5. Use Yup for frontend validation
6. Use functional components only
7. Use Tailwind CSS semantic tokens (text-foreground, bg-background, text-primary, etc.) - NEVER hardcode colors like `text-black`, `text-white` for themed content

### Backend Rules
1. Use `catchAsync` wrapper for all controller functions
2. Use `sendResponse` utility for API responses
3. Use `paginate` common function for pagination
4. Use Joi for backend validation
5. Jest for testing (`Backend/jest.config.js`)

### Testing Rules
1. Every page should be loadable without runtime errors
2. Profile page (`/profile`) is critical - must always work
3. Backend tests: `cd Backend && npm test`
4. Frontend E2E: Playwright (`Frontend/playwright.config.ts`)

## Key File Paths
| What | Path |
|------|------|
| Button Component | `Frontend/src/components/ui/button.tsx` |
| Navbar | `Frontend/src/components/Navbar/index.tsx` |
| Profile Page | `Frontend/src/app/profile/page.tsx` |
| Hero Section | `Frontend/src/components/Landing/HeroSection.tsx` |
| Platform Stats | `Frontend/src/components/ui/platform-stats-showcase.tsx` |
| Constants/CTA | `Frontend/src/constants/index.tsx` |
| Backend Jest Config | `Backend/jest.config.js` |
| Backend Jest TS Config | `Backend/tsconfig.jest.json` |
| Project Tracking | `todo.md` |
| Session Tracking | `.claude/session-tracker.md` |

## Session Workflow
1. **On Start**: Read `.claude/session-tracker.md` to understand current state
2. **During Work**: Update tracker as tasks progress
3. **On End**: Update tracker with final status, kill any running terminals
4. **Always**: Reference `todo.md` for overall project status

## Common Commands
```bash
# Backend
cd Backend && npm test                    # Run tests
cd Backend && npm run dev                 # Dev server
cd Backend && npx prisma generate         # Generate Prisma client
cd Backend && npx tsc --noEmit            # Type check

# Frontend
cd Frontend && npm run dev                # Dev server
cd Frontend && npm run build              # Build check
cd Frontend && npx playwright test        # E2E tests
```
