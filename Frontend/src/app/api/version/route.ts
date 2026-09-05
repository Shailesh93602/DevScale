export const runtime = 'nodejs';
// Never pre-rendered: the whole point is to report what THIS deployment is.
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';

import { resolveAppVersion, versionResponseHeaders } from '@/lib/app-version';

/**
 * GET /api/version — public, no DB, no secrets.
 *
 * `{ sha, shortSha, ref, deployedAt, env }` for whatever build is answering,
 * `unknown` for anything the platform did not provide. Exists so a health
 * checker can compare the live commit against `main` instead of trusting a
 * 200 from a deploy that quietly stopped updating. See src/lib/app-version.ts.
 */
export async function GET() {
  const version = resolveAppVersion();
  return NextResponse.json(version, {
    headers: versionResponseHeaders(version),
  });
}
