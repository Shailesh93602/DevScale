# EduScale Platform - Session Memory

> Quick reference for new Claude Code sessions

## Current Status (2026-03-06)

### Build Status

- **Frontend TypeScript**: ✅ Pass (0 errors)
- **Frontend Build**: ✅ Pass (prettier warnings, no errors)
- **Backend Tests**: ✅ Pass (2 suites, 6 tests)

### Project Structure

```
MrEngineer/
├── CLAUDE.md           # Agent instructions
├── todo.md             # Project status tracking
├── .claude/
│   └── session-tracker.md  # Session history
├── Frontend/           # Next.js 15 app
│   └── src/
├── Backend/            # Express + Prisma
│   └── src/
```

### Key Files

| File                                              | Purpose            |
| ------------------------------------------------- | ------------------ |
| `Frontend/src/components/ui/button.tsx`           | Button component   |
| `Frontend/src/components/Landing/HeroSection.tsx` | Landing hero       |
| `Backend/jest.config.js`                          | Test configuration |
| `Backend/src/tests/jest-setup.ts`                 | Test cleanup       |

### Quick Commands

```bash
# Frontend
cd Frontend && npm run build    # Build check
cd Frontend && npx tsc --noEmit # TypeScript check

# Backend
cd Backend && npm test          # Run tests
cd Backend && npm run dev       # Dev server
```

### Open Issues

1. Supabase auth → backend user sync (webhook not implemented)
2. Course Enrollment - needs database migration
3. Coming Soon pages - multiple features are placeholders
4. Jest Redis warning (non-blocking)

### Last Session (2026-03-06)

- Verified all builds pass
- Created jest-setup.ts for proper test cleanup
- Platform stats already use semantic tokens (was already fixed)
