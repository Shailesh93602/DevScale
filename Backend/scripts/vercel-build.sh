#!/usr/bin/env bash
#
# Vercel build entrypoint for the EduScale backend.
#
# WHY THIS EXISTS.
#
# The build was `tsc && tsc-alias`, with `prisma generate` in postinstall.
# `generate` rebuilds the Prisma CLIENT from schema.prisma; it never touches the
# database. So migrations were only ever applied by hand — and on 2026-08-23 a
# read-only `prisma migrate status` against production found FOUR unapplied:
#
#   20260622000000_add_ai_code_review_fields
#   20260622010000_add_content_embedding
#   20260622020000_add_user_rating
#   20260823120000_unique_ai_review_per_submission
#
# Every one of those backs code that is already merged. The AI paths happen to
# be inert because GEMINI_API_KEY is unset, which masked the problem — but the
# rating and matchmaking endpoints need no LLM at all, and `UserRating` does not
# exist in production. They fail the moment they are called.
#
# PRODUCTION ONLY, DELIBERATELY.
#
# Preview builds share production environment variables unless configured
# otherwise, so migrating unconditionally would let a branch that may never
# merge decide production's schema. `migrate deploy` is additive and never
# resets, so the blast radius would be small — but small is not a reason to hand
# that decision to a feature branch.
set -euo pipefail

if [ "${VERCEL_ENV:-}" = "production" ]; then
  echo "▶ production deploy — applying migrations"
  # Fails the BUILD on error, which is the intent: a deploy that cannot migrate
  # must not go live and start serving 500s from missing tables.
  npx prisma migrate deploy
else
  echo "▶ ${VERCEL_ENV:-local} build — skipping migrations (production only)"
fi

npx tsc
npx tsc-alias --resolve-full-paths
