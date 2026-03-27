# EduScale — Environment Setup Guide

Step-by-step instructions to obtain every key in `.env` (Backend) and `.env.local` (Frontend).

**Time estimate:** ~45 minutes for a fresh setup on all platforms.

---

## 1. Supabase (Database + Auth)

Supabase provides PostgreSQL, authentication (JWT), and storage.

### Steps

1. Go to [supabase.com](https://supabase.com) → **New project**
2. Choose a name (e.g. `eduscale-dev`), strong database password, region closest to you
3. Wait ~2 min for provisioning

### Where to find each key

| Key | Location in Supabase Dashboard |
|-----|-------------------------------|
| `SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_URL` | **Project Settings → API → Project URL** |
| `SUPABASE_ANON_KEY` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Project Settings → API → Project API keys → anon public** |
| `SUPABASE_JWT_SECRET` | **Project Settings → API → JWT Settings → JWT Secret** |
| `DATABASE_URL` | **Project Settings → Database → Connection string → URI** — append `?pgbouncer=true` and use port `6543` for pooled |
| `DIRECT_URL` | Same page, use port `5432` (direct, no pgbouncer) |

### Google OAuth (fixes the broken social login)

1. **Google Cloud Console** ([console.cloud.google.com](https://console.cloud.google.com)):
   - Create / select a project
   - **APIs & Services → Credentials → Create credentials → OAuth 2.0 Client IDs**
   - Application type: **Web application**
   - Authorised redirect URIs: `https://[PROJECT_REF].supabase.co/auth/v1/callback`
   - Copy **Client ID** and **Client Secret**

2. **Supabase Dashboard:**
   - **Authentication → Providers → Google**
   - Toggle **Enable Google provider** ON
   - Paste the Client ID and Client Secret from above
   - Save

> Make sure the Supabase project you configure this on is the **same project** whose `SUPABASE_URL` / `SUPABASE_ANON_KEY` are in your `.env`.

---

## 2. Redis

Redis is used for rate limiting, auth cache, JWT blocklist, Socket.io pub/sub, and all Cache-Aside caches.

### Local development

```bash
# macOS
brew install redis && brew services start redis
# REDIS_URL=redis://localhost:6379
```

### Production — Upstash (recommended, free tier available)

1. Go to [upstash.com](https://upstash.com) → **Create Database**
2. Choose **Regional** (pick the same AWS region as your ECS deployment)
3. After creation: **Database → Connect → Node.js (ioredis)**
4. Copy the `rediss://` URL — this is your `REDIS_URL`

> Upstash free tier: 10,000 commands/day. For production upgrade to the **Pay as you go** plan (~$0.2 per 100k commands).

---

## 3. Cloudinary (Media CDN)

All image/video uploads go through Cloudinary.

1. Go to [cloudinary.com](https://cloudinary.com) → **Sign up free**
2. Dashboard → **Settings → API Keys** → **Generate new API key**

| Key | Location |
|-----|----------|
| `CLOUDINARY_CLOUD_NAME` | Dashboard top-left (e.g. `dxyz123abc`) |
| `CLOUDINARY_API_KEY` | Settings → API Keys |
| `CLOUDINARY_API_SECRET` | Settings → API Keys (click eye icon) |

> Make sure to use `f_auto,q_auto` in your upload presets for automatic format and quality optimization.

---

## 4. Sentry (Error Tracking)

Sentry captures backend exceptions and frontend errors with stack traces.

### Backend (`SENTRY_DSN`)

1. Go to [sentry.io](https://sentry.io) → **New Project → Node.js**
2. Project name: `eduscale-backend`
3. **Settings → Client Keys (DSN)** → copy the DSN

### Frontend (`NEXT_PUBLIC_SENTRY_DSN`)

1. **New Project → Next.js**
2. Project name: `eduscale-frontend`
3. **Settings → Client Keys (DSN)** → copy the DSN

> Use separate Sentry projects for backend and frontend so alerts and error grouping are isolated.

---

## 5. Email / SMTP

The app sends transactional emails (password reset, notifications, etc.).

### Development — Mailtrap (free, no real delivery)

1. Go to [mailtrap.io](https://mailtrap.io) → **Sign up free**
2. **Email Testing → Inboxes** → your sandbox inbox → **SMTP Settings**
3. Copy `Host`, `Port`, `Username`, `Password`

```
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_SECURE=false
SMTP_USER=<your mailtrap username>
SMTP_PASS=<your mailtrap password>
SMTP_FROM="EduScale <no-reply@eduscale.io>"
```

### Production — Resend (recommended)

1. Go to [resend.com](https://resend.com) → **Sign up**
2. **API Keys → Create API Key**
3. Use SMTP settings from their dashboard:
   - Host: `smtp.resend.com`, Port: `587`, Secure: `false`
   - User: `resend`, Password: your API key

> Alternative: **SendGrid** (generous free tier, 100 emails/day) or **AWS SES** (cheapest at scale, ~$0.10 per 1000 emails).

---

## 6. Code Execution — Judge0 via RapidAPI

Powers the in-browser code runner (challenges and battles).

1. Go to [rapidapi.com](https://rapidapi.com) → **Sign up**
2. Search for **Judge0 CE** → **Subscribe** (free tier: 50 requests/day, Unlimited plan available)
3. **Apps → Add New App** → copy **Client ID** and your RapidAPI **Key**

| Key | Value |
|-----|-------|
| `COMPILER_CLIENT_ID` | Your RapidAPI Application Client ID |
| `COMPILER_CLIENT_SECRET` | Your RapidAPI Key (the long string under "X-RapidAPI-Key") |

> The backend currently uses the Judge0 CE endpoint at `judge029.p.rapidapi.com`. Verify this host in `src/utils/codeExecutor.ts` matches the endpoint shown on RapidAPI.

---

## 7. Auth Token Secrets

These are used by the legacy parts of the codebase for signing JWTs locally. Generate with:

```bash
# Run once for each secret
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

| Key | Purpose |
|-----|---------|
| `ACCESS_TOKEN_SECRET` | Signs access tokens |
| `RESET_TOKEN_SECRET` | Signs password reset tokens |
| `JWT_SECRET` | Legacy JWT signing |
| `JWT_EXPIRES_IN` | Token lifetime — use `15m` |

---

## 8. Frontend-only (`Frontend/.env.local`)

These three are sufficient for local development:

```env
NEXT_PUBLIC_SUPABASE_URL=      # same as backend SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY= # same as backend SUPABASE_ANON_KEY
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_WS_URL=http://localhost:5000
NEXT_PUBLIC_SENTRY_DSN=        # leave blank in dev
```

---

## Quick-start checklist

- [ ] Supabase project created, DB password saved
- [ ] `DATABASE_URL` (pooled, port 6543) and `DIRECT_URL` (direct, port 5432) copied
- [ ] `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_JWT_SECRET` copied
- [ ] Redis running locally (dev) or Upstash URL copied (prod)
- [ ] Cloudinary account created, `CLOUD_NAME`, `API_KEY`, `API_SECRET` copied
- [ ] Sentry backend DSN set (`SENTRY_DSN`)
- [ ] Sentry frontend DSN set (`NEXT_PUBLIC_SENTRY_DSN`)
- [ ] SMTP credentials set (Mailtrap for dev, Resend/SES for prod)
- [ ] Judge0 RapidAPI key set (`COMPILER_CLIENT_SECRET`)
- [ ] Three token secrets generated (`ACCESS_TOKEN_SECRET`, `RESET_TOKEN_SECRET`, `JWT_SECRET`)
- [ ] Google OAuth credentials added to Supabase Auth provider
- [ ] `Backend/.env` created from `Backend/.env.example`
- [ ] `Frontend/.env.local` created from `Frontend/.env.example`

---

## Running migrations

After filling in `DATABASE_URL` and `DIRECT_URL`:

```bash
cd Backend
npx prisma migrate dev     # applies all migrations + generates client
npx prisma db seed         # optional: seed roles, permissions
```

---

## Verifying the setup

```bash
# Start Redis (if local)
brew services start redis

# Start backend
cd Backend && npm run dev

# In a second terminal — deep health check
curl http://localhost:5000/api/v1/health
# Expected: { "status": "ok", "components": { "database": "ok", "redis": "ok", "queue": "ok" } }

# Start frontend
cd Frontend && npm run dev
# Open http://localhost:3000
```

If the health check returns a 503, the failing component name will be in the response — check the corresponding `.env` values.
