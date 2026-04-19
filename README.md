<div align="center">
  <h1>EduScale</h1>
  <p><strong>Distributed real-time EdTech platform — Socket.io at scale, Redlock, circuit breaker, Prometheus</strong></p>

  <p>
    <a href="https://eduscale.vercel.app"><img src="https://img.shields.io/badge/live-eduscale.vercel.app-blue?style=flat-square" alt="Live" /></a>
    <a href="https://github.com/Shailesh93602/devscale"><img src="https://img.shields.io/badge/github-devscale-black?style=flat-square&logo=github" alt="GitHub" /></a>
    <img src="https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js" alt="Next.js 15" />
    <img src="https://img.shields.io/badge/Socket.io-Redis_Adapter-010101?style=flat-square&logo=socket.io" alt="Socket.io" />
    <img src="https://img.shields.io/badge/Redis-Redlock_%2B_Pub%2FSub-DC382D?style=flat-square&logo=redis" alt="Redis" />
    <img src="https://img.shields.io/badge/Prometheus-prom--client-E6522C?style=flat-square&logo=prometheus" alt="Prometheus" />
  </p>
</div>

---

## What it is

EduScale is an engineering learning platform with real-time coding battles. The interesting engineering problem: when two players join a battle room, the server that handles "player 1 joined" and the server that handles "player 2 joined" may be **different Node.js instances**. Without distributed coordination, the battle never starts.

This README focuses on the infrastructure decisions — the distributed architecture, not the features.

---

## Architecture

```
Browser ──────────────────────────────────────────────────────────────
          WebSocket (wss://)        HTTP (REST/Next.js SSR)
               │                              │
         ┌─────▼──────┐               ┌───────▼───────┐
         │  Socket.io  │               │  Next.js 15   │
         │  Server A   │               │  App Router   │
         └─────┬───────┘               └───────┬───────┘
               │                              │
    @socket.io/redis-adapter          Prisma + PostgreSQL
               │
         ┌─────▼───────────────────────────────┐
         │              Redis                  │
         │  • Pub/Sub (socket.io cross-node)   │
         │  • Redlock (battle start mutex)     │
         │  • Bull queue (background jobs)     │
         └─────────────────────────────────────┘
               │
         ┌─────▼───────┐
         │  Socket.io  │
         │  Server B   │
         └─────────────┘
```

---

## Key design decisions

### 1. `@socket.io/redis-adapter` — multi-instance Socket.io

The default Socket.io in-memory adapter only broadcasts events within a single Node.js process. When deployed on Vercel/Railway with multiple instances, `socket.to(room).emit(...)` would reach only sockets connected to the same instance.

The Redis adapter publishes every room event to a Redis Pub/Sub channel. All instances subscribe and re-emit to their local sockets:

```ts
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

const pubClient = createClient({ url: process.env.REDIS_URL });
const subClient = pubClient.duplicate();
await Promise.all([pubClient.connect(), subClient.connect()]);

io.adapter(createAdapter(pubClient, subClient));
```

Without this: battles only work when both players hit the same server. With this: horizontal scaling works transparently.

### 2. Redlock — distributed mutex on battle start

When two players join simultaneously, both Socket.io servers may detect "room is full" at the same time and try to start the battle. Without a lock, both execute the start logic — double-starting a battle corrupts scoring.

Redlock implements the [Redlock algorithm](https://redis.io/docs/manual/patterns/distributed-locks/): acquire a lock across Redis with a TTL before executing the critical section.

```ts
import Redlock from 'redlock';

const redlock = new Redlock([redis], {
  retryCount: 0,    // fail-fast: if we can't get the lock, the other instance got it
  retryDelay: 0,
  driftFactor: 0.01,
});

async function startBattle(roomId: string) {
  const lock = await redlock.acquire([`lock:battle:${roomId}`], 5000);
  try {
    // only one instance reaches here
    await initializeBattleState(roomId);
    io.to(roomId).emit('battle:started', { roomId });
  } finally {
    await lock.release();
  }
}
```

**Why `retryCount: 0`:** If the lock is taken, the other instance already won the race and is starting the battle. Retrying would queue up a second start attempt after the first completes — which would restart an already-running battle. Fail-fast is the correct behavior here.

### 3. opossum — circuit breaker on code execution

The code execution service (external sandbox) is the most likely failure point. If it goes down or becomes slow, every battle hangs waiting for execution results.

opossum wraps the execution call with a circuit breaker:

```ts
import CircuitBreaker from 'opossum';

const executionBreaker = new CircuitBreaker(executeCode, {
  timeout: 3000,          // 3s — execution should be fast
  errorThresholdPercentage: 50,  // open if >50% fail
  resetTimeout: 10000,    // try again after 10s
  volumeThreshold: 5,     // need 5 calls before tripping
});

executionBreaker.fallback(() => ({
  output: '',
  error: 'Code execution unavailable. Score based on test cases submitted.',
  timedOut: true,
}));
```

When the circuit is open, battles continue with the fallback — players can still submit, scoring just uses the already-submitted results.

### 4. prom-client — Prometheus `/metrics`

```ts
import { collectDefaultMetrics, Counter, Histogram, register } from 'prom-client';

collectDefaultMetrics();

export const battleStarted = new Counter({
  name: 'eduscale_battles_started_total',
  help: 'Total battles started',
  labelNames: ['mode'],   // 1v1 | ffa
});

export const executionDuration = new Histogram({
  name: 'eduscale_code_execution_duration_seconds',
  help: 'Code execution latency',
  buckets: [0.1, 0.5, 1, 2, 5],
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});
```

Metrics exposed: battle start count (by mode), code execution latency histogram, Redis lock acquisition failures, circuit breaker state.

### 5. Bull queues — async background processing

Score updates, badge awards, and leaderboard recalculations happen in Bull workers, not in the WebSocket handler. The handler returns immediately; the queue processes asynchronously:

```ts
import Bull from 'bull';

const scoreQueue = new Bull('score-update', { redis: process.env.REDIS_URL });

// In WebSocket handler (fast path):
await scoreQueue.add({ userId, battleId, score });

// In worker (decoupled, retryable):
scoreQueue.process(async (job) => {
  await updateUserScore(job.data);
  await recalculateLeaderboard(job.data.userId);
  await awardBadgesIfEarned(job.data);
});
```

---

## Running locally

### Prerequisites

- Node.js 18+
- PostgreSQL (local or Supabase free tier)
- Redis (local or Upstash free tier)

### 1. Clone

```bash
git clone https://github.com/Shailesh93602/devscale.git
cd devscale
```

### 2. Backend

```bash
cd Backend
npm install
cp .env.example .env   # fill in values below
npx prisma generate
npx prisma db push
npm run dev            # starts on :5000
```

### 3. Frontend

```bash
cd Frontend
npm install
cp .env.example .env   # fill in values below
npm run dev            # starts on :3000
```

---

## Environment variables

### Backend (`Backend/.env`)

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `REDIS_URL` | Yes | Redis URL — used by socket adapter, Redlock, Bull |
| `JWT_SECRET` | Yes | Sign JWT access tokens |
| `PORT` | No | API port (default: 5000) |
| `CLOUDINARY_CLOUD_NAME` | No | Media uploads |
| `CLOUDINARY_API_KEY` | No | Media uploads |
| `CLOUDINARY_API_SECRET` | No | Media uploads |

### Frontend (`Frontend/.env`)

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | Yes | Backend REST URL, e.g. `http://localhost:5000/api/v1` |
| `NEXT_PUBLIC_WS_URL` | Yes | Socket.io server URL, e.g. `http://localhost:5000` |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Yes | Supabase anon key |

---

## Tech stack

| Layer | Package | Why |
|---|---|---|
| Real-time transport | `socket.io` | WebSocket + fallback, room/namespace model |
| Multi-instance scaling | `@socket.io/redis-adapter` | Cross-node Pub/Sub for Socket.io rooms |
| Distributed locking | `redlock` | Redlock algorithm — prevents double-start race condition |
| Circuit breaker | `opossum` | Protects code execution service; fallback keeps battles running |
| Metrics | `prom-client` | Prometheus-compatible `/metrics` endpoint |
| Background jobs | `bull` | Redis-backed queue for async score/badge processing |
| ORM | `prisma` | Type-safe PostgreSQL queries |
| Frontend | `next.js 15` | App Router, SSR, edge functions |
| State | `redux-toolkit` | Battle state, user session |

---

## Live demo

[eduscale.vercel.app](https://eduscale.vercel.app)

---

Built by [Shailesh Chaudhary](https://shaileshchaudhari.vercel.app)
