#!/usr/bin/env bash
#
# push-env-to-vercel.sh
#
# One-shot helper: read Backend/.env.production → push the keys listed in
# scripts/vercel-env-keys.txt to the linked Vercel project via `vercel env add`.
#
# Why this exists: the backend Vercel project (`api-eduscale`) currently has
# ZERO env vars set, so every serverless invocation crashes with
# FUNCTION_INVOCATION_FAILED during module init (env.ts calls process.exit(1)
# on any missing required var). Those 500s have no `Access-Control-Allow-Origin`
# header, which the browser reports as "CORS error." Setting the env vars
# resolves the "CORS errors" entirely — no code change to the CORS middleware
# is required.
#
# Safety:
# - DOES NOT commit or print secrets (values go straight to `vercel env add`).
# - SKIPS comments and blank lines.
# - Uses `printf "%s"` (no trailing newline) so HMAC-style secrets aren't
#   corrupted like we saw on razorpay-patterns-demo last week.
# - Overwrites with `vercel env add --force` (never rm-then-add, which left a
#   key unset in production whenever the add failed).
# - Validates the whole file BEFORE pushing anything: NODE_ENV must be
#   `production`, and no value may point at localhost. Backend/.env is the dev
#   file (NODE_ENV=development, localhost URLs, E2E passwords) and must never
#   be pushed, so the default source is .env.production.
# - Parses values like dotenv: surrounding single or double quotes stripped,
#   inline ` # comment` dropped from unquoted values.
#
# Usage:
#   cd ~/Desktop/Coding/EduScale/Backend
#   bash scripts/push-env-to-vercel.sh            # reads .env.production
#   ENV_FILE=other.env bash scripts/push-env-to-vercel.sh
#   # then:
#   vercel --prod
#
# Before running:
# - You must already be logged in to Vercel CLI (`vercel whoami` works).
# - The repo directory must already be linked to the right Vercel project
#   (`cat .vercel/project.json` should show projectId for `api-eduscale`).

set -euo pipefail

ENV_FILE="${ENV_FILE:-.env.production}"
VERCEL_ENV="${VERCEL_ENV:-production}"
KEYS_FILE="${KEYS_FILE:-scripts/vercel-env-keys.txt}"

for required in "$ENV_FILE" "$KEYS_FILE" ".vercel/project.json"; do
  if [[ ! -f "$required" ]]; then
    echo "error: $required not found. Run from Backend/ (and 'vercel link' first)."
    exit 1
  fi
done

if ! command -v vercel >/dev/null 2>&1; then
  echo "error: vercel CLI not found on PATH."
  exit 1
fi

allowed() {
  grep -qxF "$1" <(grep -vE '^[[:space:]]*(#|$)' "$KEYS_FILE")
}

# dotenv-style value: quoted → contents; unquoted → up to an inline " #".
parse_value() {
  local raw="$1"
  if [[ "$raw" =~ ^\"(.*)\"[[:space:]]*$ ]] || [[ "$raw" =~ ^\'(.*)\'[[:space:]]*$ ]]; then
    printf '%s' "${BASH_REMATCH[1]}"
    return
  fi
  raw="${raw%%[[:space:]]#*}"
  raw="${raw%"${raw##*[![:space:]]}"}"
  printf '%s' "$raw"
}

keys=()
values=()
problems=()
skipped=0

while IFS= read -r line || [[ -n "$line" ]]; do
  line="${line%$'\r'}"
  [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]] && continue
  [[ "$line" =~ ^[[:space:]]*(export[[:space:]]+)?([A-Za-z_][A-Za-z0-9_]*)=(.*)$ ]] || continue
  key="${BASH_REMATCH[2]}"
  value="$(parse_value "${BASH_REMATCH[3]}")"
  if ! allowed "$key" || [[ -z "$value" ]]; then
    skipped=$((skipped + 1))
    continue
  fi
  if [[ "$key" == "NODE_ENV" && "$value" != "production" ]]; then
    problems+=("NODE_ENV is '$value', expected 'production'")
  fi
  if [[ "$value" =~ (localhost|127\.0\.0\.1|0\.0\.0\.0) ]]; then
    problems+=("$key points at a local address")
  fi
  keys+=("$key")
  values+=("$value")
done < "$ENV_FILE"

if [[ ${#problems[@]} -gt 0 ]]; then
  echo "refusing to push anything from $ENV_FILE:"
  printf '  - %s\n' "${problems[@]}"
  exit 1
fi

if [[ ${#keys[@]} -eq 0 ]]; then
  echo "nothing to push: no allow-listed keys with values in $ENV_FILE"
  exit 1
fi

project_id=$(grep -o '"projectId":"[^"]*"' .vercel/project.json | cut -d'"' -f4)
echo "→ target: Vercel project $project_id, environment: $VERCEL_ENV"
echo "→ reading: $ENV_FILE (${#keys[@]} allow-listed keys, $skipped skipped)"
echo ""

pushed=0
failed=0
for i in "${!keys[@]}"; do
  echo -n "  ${keys[$i]}: "
  # Push via printf so no trailing newline is appended
  if printf "%s" "${values[$i]}" | vercel env add "${keys[$i]}" "$VERCEL_ENV" --force >/dev/null 2>&1; then
    echo "ok"
    pushed=$((pushed + 1))
  else
    echo "FAILED (previous value, if any, left in place)"
    failed=$((failed + 1))
  fi
done

echo ""
echo "→ pushed: $pushed, failed: $failed"
echo ""
echo "next:"
echo "  vercel --prod       # redeploy so the new env takes effect"
echo "  curl -sD- https://api-eduscale.vercel.app/api/v1/stats/summary | head"
echo "  # expect 200 or 401 JSON, NOT 500 text — that's when CORS 'errors' stop."
[[ $failed -eq 0 ]]
