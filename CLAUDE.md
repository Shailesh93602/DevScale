# EduScale — Production Scaling Log

Tracking all changes made toward 10M+ user scalability and production readiness.

---

## Session Log

### 2026-03-26

**Goal:** Work through TODO.md P0 items in priority order.

#### Completed

| Time | Item | File(s) Changed |
|------|------|----------------|
| Session start | Created `TODO.md` with 8-phase scaling roadmap | `TODO.md` |
| Session start | Created `CLAUDE.md` + `Backend/CLAUDE.md` tracking files | `CLAUDE.md`, `Backend/CLAUDE.md` |

#### In Progress

See `Backend/CLAUDE.md` for backend-specific change log.

---

## Architecture Notes

- **Backend:** Express.js + TypeScript, port 5000 (dev)
- **Frontend:** Next.js 15, Vercel
- **DB:** PostgreSQL via Supabase + Prisma ORM
- **Cache:** Redis via ioredis (`REDIS_URL` env var)
- **Queue:** Bull (Redis-backed)
- **WebSocket:** Socket.io (single-server in-memory currently → migrating to Redis adapter)
- **Auth:** Supabase JWT, verified locally via `SUPABASE_JWT_SECRET`
- **CI/CD:** GitHub Actions → AWS ECR

## Key Env Vars Required

```
DATABASE_URL, DIRECT_URL         # PostgreSQL
REDIS_URL                        # Redis instance
SUPABASE_URL, SUPABASE_ANON_KEY  # Supabase
SUPABASE_JWT_SECRET              # For local JWT verification
SENTRY_DSN                       # Error tracking
CLOUDINARY_*                     # Media CDN
CORS_ORIGIN                      # Production comma-separated origins
PORT                             # Default 5000
```
