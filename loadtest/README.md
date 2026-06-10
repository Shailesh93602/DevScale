# EduScale Load Tests

Produce **real, measured** latency/throughput numbers to replace unverified claims in the portfolio. Two layers:

- `rest-load.js` — k6 test of the read-heavy REST endpoints (health, battle listing).
- `battle-socket-load.js` — Socket.io simulation of the real-time battle path (join → `battle:started`), which exercises Redlock + the Redis adapter.

> Report these as a **local benchmark** (state your machine + concurrency). They are not production figures — say so. Honesty here reads as senior; fake "<200ms" claims get caught.

## 1. Start local dependencies

```bash
docker compose -f loadtest/docker-compose.yml up -d
```

## 2. Point the backend at them and run it

```bash
cd Backend
# .env: DATABASE_URL=postgresql://eduscale:eduscale@localhost:5432/eduscale
#       REDIS_URL=redis://localhost:6379
npx prisma migrate deploy   # or: npx prisma db push
npm run dev                 # :5000
```

## 3. Run the tests

```bash
# REST (needs k6: `brew install k6`)
BASE_URL=http://localhost:5000 k6 run loadtest/rest-load.js

# Real-time battle path (uses the app's socket.io-client dep)
WS_URL=http://localhost:5000 PAIRS=100 node loadtest/battle-socket-load.js
```

> ⚠️ Adjust the endpoint path in `rest-load.js` and the socket event names in
> `battle-socket-load.js` to match your actual router/client — they're wired to
> the documented names but verify against `src/services/socket.ts` + Frontend.

## 4. Record results here (paste real output)

| Metric | Value | Conditions |
|---|---|---|
| REST p50 / p95 / p99 | _tbd_ | 100 VUs, 2m, local |
| REST throughput (req/s) | _tbd_ | |
| REST error rate | _tbd_ | |
| Battle-start p50 / p95 / p99 | _tbd_ | N concurrent battles, local |
| Battles failed | _tbd_ | |

Once filled in, give me the numbers and I'll wire them into the portfolio copy and EduScale README (replacing any soft/unverified metrics).
