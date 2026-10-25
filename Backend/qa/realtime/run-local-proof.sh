#!/usr/bin/env bash
# Local proof of the realtime split, end to end. Steps: Backend/docs/REALTIME_HOSTING.md, "Local proof".
# Needs: Postgres 17 with pgvector on RT_PG_PORT, Redis on 6379. Touches only RT_DB and Redis DB RT_REDIS_DB.
set -euo pipefail

REPO="$(cd "$(dirname "$0")/../../.." && pwd)"
RT_PG_PORT="${RT_PG_PORT:-5434}"
RT_DB="${RT_DB:-eduscale_rt_test}"
RT_REDIS_DB="${RT_REDIS_DB:-5}"
RT_DIR="${RT_DIR:-$(mktemp -d)}"
SKIP_BUILD="${SKIP_BUILD:-0}"
DB_URL="postgresql://${USER}@127.0.0.1:${RT_PG_PORT}/${RT_DB}"

case "$RT_DB" in *_test | *_e2e) ;; *) echo "RT_DB must end in _test or _e2e" >&2; exit 2 ;; esac
[ "$RT_REDIS_DB" != "0" ] || { echo "refusing Redis DB 0" >&2; exit 2; }

PIDS=()
cleanup() { for p in "${PIDS[@]:-}"; do kill "$p" 2>/dev/null || true; done; }
trap cleanup EXIT

wait_for() { # url, name
  for _ in $(seq 1 90); do curl -sf -o /dev/null "$1" && return 0; sleep 1; done
  echo "$2 did not come up; logs in $RT_DIR" >&2; exit 1
}

for port in 3055 4055 4056 54399; do
  if lsof -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1; then echo "port $port is busy" >&2; exit 1; fi
done

echo "▶ runtime dir (logs + local .env): $RT_DIR"
# The backends run from here, so Backend/.env (production) is never loaded.
cat >"$RT_DIR/.env" <<EOF
NODE_ENV=development
DATABASE_URL=$DB_URL
DIRECT_URL=$DB_URL
SUPABASE_URL=http://127.0.0.1:54399
SUPABASE_PUBLISHABLE_KEY=local-fake-publishable-key
REDIS_URL=redis://127.0.0.1:6379/$RT_REDIS_DB
CORS_ORIGIN=http://127.0.0.1:3055
API_URL=http://127.0.0.1:4055
EOF

createdb -h 127.0.0.1 -p "$RT_PG_PORT" "$RT_DB" 2>/dev/null || true
cd "$REPO/Backend"
export DATABASE_URL="$DB_URL" DIRECT_URL="$DB_URL"
npx prisma migrate status 2>&1 | grep -F "\"$RT_DB\"" | grep -F "127.0.0.1:$RT_PG_PORT" \
  || { echo "prisma datasource is not the local database; refusing" >&2; exit 2; }
npx prisma migrate deploy >/dev/null
RT_DATABASE_URL="$DB_URL" node qa/realtime/seedRealtime.mjs
redis-cli -n "$RT_REDIS_DB" flushdb >/dev/null
unset DATABASE_URL DIRECT_URL

FRONT_ENV=(
  NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54399
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=local-fake-publishable-key
  NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:4056/api/v1
  NEXT_PUBLIC_REALTIME_API_BASE_URL=http://127.0.0.1:4055/api/v1
  NEXT_PUBLIC_WS_URL=
  NEXT_PUBLIC_SENTRY_DSN=
  SENTRY_AUTH_TOKEN=
)
if [ "$SKIP_BUILD" != "1" ]; then
  echo "▶ building backend and frontend"
  npm run build:local >"$RT_DIR/backend-build.log" 2>&1
  (cd "$REPO/Frontend" && env "${FRONT_ENV[@]}" npx next build >"$RT_DIR/frontend-build.log" 2>&1)
fi

node qa/realtime/fakeSupabaseAuth.mjs >"$RT_DIR/auth.log" 2>&1 & PIDS+=($!)
(cd "$RT_DIR" && PORT=4055 exec node "$REPO/Backend/dist/main.js") >"$RT_DIR/realtime.log" 2>&1 & PIDS+=($!)
(cd "$RT_DIR" && PORT=4056 exec node "$REPO/Backend/qa/realtime/restOnlyHost.mjs") >"$RT_DIR/rest.log" 2>&1 & PIDS+=($!)
(cd "$REPO/Frontend" && exec env "${FRONT_ENV[@]}" ./node_modules/.bin/next start -H 127.0.0.1 -p 3055) >"$RT_DIR/frontend.log" 2>&1 & PIDS+=($!)

wait_for http://127.0.0.1:54399/auth/v1/.well-known/jwks.json "fake auth"
wait_for http://127.0.0.1:4055/api/v1/health "realtime host"
wait_for http://127.0.0.1:4056/api/v1/health/ready "REST-only host"
wait_for http://127.0.0.1:3055/instant-battle "frontend"
curl -sf -o /dev/null "http://127.0.0.1:4055/socket.io/?EIO=4&transport=polling" || { echo "realtime host serves no socket.io" >&2; exit 1; }
[ "$(curl -s -o /dev/null -w '%{http_code}' "http://127.0.0.1:4056/socket.io/?EIO=4&transport=polling")" = 404 ] \
  || { echo "REST-only host unexpectedly serves socket.io" >&2; exit 1; }

echo "▶ playwright"
cd "$REPO/Frontend"
RT_DATABASE_URL="$DB_URL" npx playwright test -c playwright.realtime.config.ts
