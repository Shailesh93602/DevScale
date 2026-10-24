# Realtime hosting — free option for Socket.io and battle timers

**Status (2026-10-24):** prepared on branch `feat/realtime-host`, not deployed. Nothing below has
been created on any provider.

## The problem

The production API runs on Vercel serverless. `api/index.ts` exports the Express app and never
calls `App.start()`, so no HTTP server is bound, `socketService.initialize()` never runs, and
`/socket.io` answers 404. Three things depend on a long-lived process:

1. **Socket.io**: battle rooms, chat, `matchmaking:matched`.
2. **In-process battle timers** in `src/services/battleSocket.ts`: the scheduled-battle lobby
   timer, the lobby countdown, per-question ticks and auto-advance. They are armed by **REST calls**
   (`POST /battles`, `/ready`, `/start`, `/answer`, …), so those REST calls must run in the same
   process. On a serverless function they are armed and then frozen with it.
3. **Matchmaking**: the waiting queue is in Redis and `emitToUser` looks up socket ids there, so
   matchmaking REST and the sockets must share one Redis.

A separate managed realtime service (Ably, Pusher, Supabase Realtime) fixes (1) only. The timers
would still need a long-lived process or a job runner, so it adds a vendor without removing the host.

## The design: split by path, keep Vercel

- **Vercel stays the REST host for everything, unchanged.** Battle **reads** stay there too, because
  they come from Postgres.
- **A free long-lived host runs the same image**, started with `node dist/main.js`, which calls
  `App.start()`: it binds the port, starts Socket.io with the Redis adapter, and runs the timers.
  - The frontend sends **battle writes** (any non-GET under `/battles`) and **all of
    `/matchmaking`** there. The rule is in `Frontend/src/lib/realtime-host.ts`, and the switch is in
    the `httpClient` request interceptor.
  - Sockets connect there too.
- **Cold start is contained.** Only battle pages wait for the free host to wake. The first battle
  request on a page (a read included) sends one fire-and-forget `GET /api/v1/health/ready` to wake
  the host. Requests routed there get a 75 s timeout instead of 20 s.
- With `NEXT_PUBLIC_REALTIME_API_BASE_URL` unset, nothing changes.

## Free options compared (researched 2026-10-24)

Labels: **V** = verified on the provider's own page (linked), **I** = inferred, **U** = unverified /
third-party only.

| Option | WebSockets | Idle sleep / cold start | Free allowance | Card? | Near India | Bull/Redis on it |
| --- | --- | --- | --- | --- | --- | --- |
| **Render free web service** | Yes, no max duration (V, [ws](https://render.com/docs/websocket)) | Spins down after 15 min with no inbound traffic; WebSocket messages count as traffic; wake ≈ 1 min (V, [free](https://render.com/docs/free)) | 750 instance-h/workspace/month, enough for one service 24/7; 512 MB / 0.1 CPU (V on pricing page, per search) | Usually none; a $1 verification hold is sometimes asked (U, community threads) | **Singapore** (V, [regions](https://render.com/docs/regions)); free in every region (I) | In-process workers run in the web service (no free background-worker type, V). Free Key Value: one per workspace, no persistence, may restart any time (V) |
| Koyeb free | Yes (I) | Scales to zero after 1 h idle, wakes "within seconds" (U, docs + staff post) | One web service, 512 MB, 0.1 vCPU (V, [FAQ](https://www.koyeb.com/docs/faqs/pricing)) | **Yes** — "We require a credit card"; $29 pre-auth, cancelled; "never charged when using the free web Service" (V) | Frankfurt or Washington only (V) | Workers not free (U) |
| Fly.io | Yes | n/a | **None for new orgs**: "New organizations don't have a free tier"; trial = 2 machine-hours or 7 days (V, [pricing](https://docs.fly.io/about/pricing)) | Yes after trial (V) | Mumbai exists (I) | n/a |
| Railway | Yes | Optional app sleeping (I) | $5 one-off trial for 30 days, then **$1 credit/month**; 0.5 GB RAM, 1 vCPU (V, [trial](https://docs.railway.com/reference/pricing/free-trial), [plans](https://docs.railway.com/reference/pricing/plans)). $1 buys about 6 days of a 0.5 GB service (I) | Unclear (U) | Singapore (I) | Yes, but credit runs out (I) |
| Google Cloud Run | Yes; request timeout up to 60 min, then the client is dropped (V, [ws](https://docs.cloud.google.com/run/docs/triggering/websockets)) | min-instances 0 → cold start of a few seconds (I) | Instance-based (any open WebSocket makes it so): 240k vCPU-s + 450k GiB-s/month (U, pricing via search) ≈ 130 h of "someone connected" at 0.5 vCPU (I) | **Billing account required** for the Free Tier (V, [free tier](https://docs.cloud.google.com/free/docs/free-cloud-features)); there is no hard spend cap, overage is billed (I) | **Mumbai asia-south1** in the free-tier list (U) | Timers only run while a request/socket is open (I); Redis must be external |
| Oracle Cloud Always Free | Yes (it is a VM) | Never sleeps, but **idle VMs are reclaimed** (<20 % CPU/net/mem at p95 over 7 days) (V, [always free](https://docs.oracle.com/en-us/iaas/Content/FreeTier/freetier_topic-Always_Free_Resources.htm)) | A1: 2 OCPU / 12 GB; or 2× E2.1.Micro 1 GB (V) | **Yes**, verification hold; no prepaid/virtual cards (U, Oracle dev page via search) | Mumbai/Hyderabad exist (I); A1 capacity often "out of capacity" (U) | Everything, but you run the OS, TLS and the reverse proxy yourself |
| Northflank Sandbox | Yes (I) | "Always on, no sleeping" (V, [pricing](https://northflank.com/pricing)) | 2 services, 2 jobs, 1 addon (V); compute "Limited", plan size not stated (smallest plan is 0.1 vCPU / 256 MB) (U) | **Yes** — "all users must add a payment method … regardless of plan" (V, billing docs) | Not stated (U) | One addon could be Redis (U) |
| Hugging Face Spaces | — | — | **Docker Spaces now need a paid plan** (V, [spaces](https://huggingface.co/docs/hub/spaces-overview)) | — | — | Out |
| Deno Deploy | — | — | Isolates, not a Node/Express + Bull process (I) | — | — | Out |
| Ably free (realtime only) | Managed | None | 6M msgs/month, 200 concurrent connections (V, [pricing](https://ably.com/pricing)) | Not stated | Global edge | **Timers still need a host** |
| Pusher Channels Sandbox | Managed | None | 200k msgs/day, 100 connections (V, [pricing](https://pusher.com/channels/pricing/)) | Not stated | Global | **Timers still need a host** |
| Supabase Realtime (free) | Managed | None | 200 concurrent, 100 msg/s (V, [limits](https://supabase.com/docs/guides/realtime/limits)) | No | Already the DB vendor | **Timers still need a host**, and the client protocol changes |

## Recommendation: Render free web service + Render free Key Value, both in Singapore

**Why Render:**

- It is the only option that is all four of these: free indefinitely, card-free in the normal case,
  near India (Singapore), and running this exact Docker image with no code change.
- **Koyeb** and **Northflank** need a card. Koyeb is Frankfurt/Washington only.
- **Cloud Run** needs a billing account and has no hard spend cap.
- **Oracle** needs a card, reclaims an idle demo VM, and turns hosting into server administration.
- **Fly.io** and **Railway** are no longer free in any useful sense.

**The honest cost, a cold start of about a minute:**

- After 15 quiet minutes the host sleeps (V). The first battle page a recruiter opens wakes it.
- The page itself loads fast from Vercel, and battle reads stay on Vercel. The first battle
  **action** (create, join, matchmaking) waits up to ~60 s, and the routed timeout of 75 s covers it.
- The battle socket gives up after 10 reconnect attempts with delays up to 5 s, so it can stop
  retrying before the host is up. A page refresh fixes it, and the wake-up ping usually lands first.
- Do **not** expect a warm demo without the optional keep-warm step below.

**Why a separate Redis on Render, not the Vercel project's Upstash:**

- Bull's idle worker blocks on `BRPOPLPUSH` with a 5 s `drainDelay`. That is ~17k commands/day for
  each processing queue (`email-queue` and `audit-retention` both process in-process), ≈1M/month
  for the two if the host is awake 24/7 (I, from Bull's defaults).
- Upstash free is 500K commands/month (V, [pricing](https://upstash.com/pricing/redis)). A
  long-lived process on Upstash free would exhaust the quota the Vercel API also depends on.
- `../CLAUDE.md` records that the Vercel project's Upstash host no longer resolves anyway.
- Render Key Value has no per-command quota. All battle and matchmaking state is ephemeral, so
  losing it on a restart is acceptable.
- **Consequence to know:** the realtime host and Vercel no longer share a Redis.
  - That is fine for what the split routes: battles, matchmaking and sockets all live on the
    realtime host.
  - Each side keeps its own auth cache (5 min) and rate-limit counters.
  - Battle-list caches are already per-process (`memoryCache`, 30 s).

**Health check:**

- The platform probe is `/api/v1/health/ready` (liveness, no DB/Redis).
- `/api/v1/health` returns 503 on any Redis or Postgres blip. As Render's health check it would get
  the instance restarted mid-battle, and a restart kills every in-process timer.
- Use `/api/v1/health` for a human or an uptime monitor. On Render it now reports the deployed
  commit from `RENDER_GIT_COMMIT`.

## Owner steps

Everything below needs your accounts. No values are written here, only names.

### 1. Create the Render services (≈10 min)

1. Sign up at render.com with GitHub. If it asks for a card, it is a verification hold, not a
   charge: free services are suspended at the limit rather than billed when no card is on file.
2. **New → Blueprint**, pick the **EduScale** repo (the private `origin2`; DevScale also works) and
   the branch that holds `render.yaml` (`main` once this branch is merged).
3. Render reads `render.yaml` and creates:
   - `eduscale-realtime`: Docker web service, free plan, Singapore, root `Backend/`.
   - `eduscale-realtime-redis`: free Key Value, Singapore, `noeviction`, no public access. Its
     internal URL is wired into `REDIS_URL` automatically.
4. It prompts once for these variables. Copy each from the Vercel **backend** project
   (`edu-scale-backend` → Settings → Environment Variables):

   | Name | Note |
   | --- | --- |
   | `DATABASE_URL` | the same Supabase pooler URL Vercel uses |
   | `DIRECT_URL` | same as Vercel |
   | `SUPABASE_URL` | same as Vercel |
   | `SUPABASE_PUBLISHABLE_KEY` | same as Vercel |
   | `SUPABASE_JWT_SIGNING_KEY` | same as Vercel (local JWT verification) |
   | `CORS_ORIGIN` | the frontend origin(s), e.g. the production frontend plus `https://*.vercel.app` if previews need battles; same rules as REST, and now also applied to the socket handshake |
   | `API_URL` | **the new Render URL**, `https://eduscale-realtime.onrender.com` (or what Render assigns) |
   | `SENTRY_DSN` | optional |
   | `GEMINI_API_KEY` | optional; only if AI question generation is used in battles |
   | `SECRET_ENCRYPTION_KEY` | optional; same value as Vercel if users' saved AI keys must decrypt here |
   | `METRICS_TOKEN` | optional; unset means `/metrics` is 404 in production |

   `NODE_ENV=production` and `REDIS_URL` come from the Blueprint, so do not add them.
5. Wait for the first deploy, then check (all should answer once it is awake):
   - `GET https://<render-host>/api/v1/health/ready` → 200
   - `GET https://<render-host>/api/v1/health` → `postgres/redis/queue: ok` and the commit sha
   - `GET https://<render-host>/socket.io/?EIO=4&transport=polling` → 200 starting with `0{"sid"`
     (it was 404 on Vercel)

Migrations stay owned by the Vercel production deploy (`scripts/vercel-build.sh` migrates only
when `VERCEL_ENV=production`). The Render build never touches the database. **Deploy Vercel first**
whenever a commit carries a migration.

If the web service cannot reach the Key Value over the internal URL (free web services cannot
*receive* private traffic, V; *sending* to Key Value is expected to work, I), enable external
access on the Key Value with an IP allow-list and use its external URL instead.

### 2. Point the frontend at it (≈3 min)

In the Vercel **frontend** project (`eduscale`) → Settings → Environment Variables, Production:

| Name | Value shape |
| --- | --- |
| `NEXT_PUBLIC_REALTIME_API_BASE_URL` | `https://<render-host>/api/v1` |
| `NEXT_PUBLIC_WS_URL` | `https://<render-host>` (**https**, not wss) or leave unset: sockets then use the realtime host |

Leave `NEXT_PUBLIC_API_BASE_URL` on the Vercel backend. Then redeploy the frontend: `NEXT_PUBLIC_*`
values are baked in at build time.

`NEXT_PUBLIC_WS_URL` must not be a `wss://` URL. `src/contexts/WebSocketContext.tsx` opens a *raw*
WebSocket only when the value starts with `ws(s)://`, and nothing on the server answers raw
WebSockets. With `https://` it stays inert, and Socket.io accepts `https://`.

### 3. Optional: keep it warm

To remove the cold start, an external pinger (for example cron-job.org, free) can hit
`https://<render-host>/api/v1/health/ready` every 10–14 minutes.

- Cost: one free service awake 24/7 is 720–744 h, inside the 750 h allowance (V), but it leaves no
  hours for a second free service in the workspace.
- Whether Render permits this is **unverified**. Its free-tier page does not mention it either way.

### 4. Rollback

Unset `NEXT_PUBLIC_REALTIME_API_BASE_URL` (and `NEXT_PUBLIC_WS_URL` if set) on the frontend and
redeploy. Everything goes back to the Vercel API exactly as before. The Render services can be
suspended or deleted from the dashboard.

## What was verified locally (2026-10-24)

- Docker is not usable on this machine (no daemon), so the image itself was not built. Its steps
  were replayed in a scratch directory holding only the files the Dockerfile copies:
  - `npm ci` and `npm run build` succeeded.
  - `node dist/main.js` started from the runtime file set, against local Postgres and a scratch
    Redis DB.
- Observed: `Connected to PostgreSQL`, `WebSocket server initialized with Redis adapter`, `Server
  running on port …`.
- Probes:
  - `/socket.io/?EIO=4&transport=polling` → 200 for an allowed origin (exact and `*.vercel.app`
    wildcard), 400 for an unlisted one.
  - `/api/v1/health` → all `ok` with the commit from `RENDER_GIT_COMMIT`.
- **Not verified:** a real Render deploy, the cold-start time, internal Key Value reachability from a
  free web service, and an end-to-end battle against the hosted pair.
