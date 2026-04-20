#!/usr/bin/env bash
#
# push-env-to-vercel.sh
#
# One-shot helper: read Backend/.env → push every non-comment line to the
# linked Vercel project's Production environment via `vercel env add`.
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
# - Will `vercel env rm <key> production --yes` first if the key already exists,
#   so it's idempotent.
#
# Usage:
#   cd ~/Desktop/Coding/EduScale/Backend
#   bash scripts/push-env-to-vercel.sh
#   # then:
#   vercel --prod
#
# Before running:
# - You must already be logged in to Vercel CLI (`vercel whoami` works).
# - The repo directory must already be linked to the right Vercel project
#   (`cat .vercel/project.json` should show projectId for `api-eduscale`).

set -euo pipefail

ENV_FILE="${ENV_FILE:-.env}"
VERCEL_ENV="${VERCEL_ENV:-production}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "error: $ENV_FILE not found. Run from Backend/ directory."
  exit 1
fi

if [[ ! -f ".vercel/project.json" ]]; then
  echo "error: .vercel/project.json missing. Run 'vercel link' first."
  exit 1
fi

if ! command -v vercel >/dev/null 2>&1; then
  echo "error: vercel CLI not found on PATH."
  exit 1
fi

project_id=$(grep -o '"projectId":"[^"]*"' .vercel/project.json | cut -d'"' -f4)
echo "→ target: Vercel project $project_id, environment: $VERCEL_ENV"
echo "→ reading: $ENV_FILE"
echo ""

pushed=0
skipped=0
failed=0

# Read line-by-line, supporting KEY=VALUE and KEY="VALUE" (with quotes stripped)
while IFS= read -r line || [[ -n "$line" ]]; do
  # strip trailing \r from crlf line endings
  line="${line%$'\r'}"
  # skip comments and blank lines
  [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]] && continue
  # must be KEY=VALUE
  if [[ ! "$line" =~ ^[[:space:]]*([A-Za-z_][A-Za-z0-9_]*)=(.*)$ ]]; then
    continue
  fi
  key="${BASH_REMATCH[1]}"
  value="${BASH_REMATCH[2]}"
  # strip single-layer surrounding double-quotes, if any
  if [[ "$value" =~ ^\"(.*)\"$ ]]; then
    value="${BASH_REMATCH[1]}"
  fi
  # skip if value is empty
  if [[ -z "$value" ]]; then
    skipped=$((skipped + 1))
    continue
  fi

  echo -n "  $key: "

  # Remove existing binding (idempotent) — ignore failure if not set
  vercel env rm "$key" "$VERCEL_ENV" --yes >/dev/null 2>&1 || true

  # Push via printf so no trailing newline is appended
  if printf "%s" "$value" | vercel env add "$key" "$VERCEL_ENV" >/dev/null 2>&1; then
    echo "ok"
    pushed=$((pushed + 1))
  else
    echo "FAILED"
    failed=$((failed + 1))
  fi
done < "$ENV_FILE"

echo ""
echo "→ pushed: $pushed, skipped (empty): $skipped, failed: $failed"
echo ""
echo "next:"
echo "  vercel --prod       # redeploy so the new env takes effect"
echo "  curl -sD- https://api-eduscale.vercel.app/api/v1/stats/summary | head"
echo "  # expect 200 or 401 JSON, NOT 500 text — that's when CORS 'errors' stop."
