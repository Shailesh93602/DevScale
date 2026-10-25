export const runtime = 'nodejs';

import { NextResponse } from 'next/server';

// Daily keep-alive cron: one real request to the Supabase project so the
// free tier sees activity. It used to call `supabase.auth.getSession()`, which
// reads the (absent) session cookie and makes no network request at all.

export async function GET(request: Request) {
  return handleKeepalive(request);
}

export async function POST(request: Request) {
  return handleKeepalive(request);
}

async function handleKeepalive(request: Request) {
  // Fails closed: with the secret unset the old check was skipped and anyone could call this.
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: 'CRON_SECRET is not configured' },
      { status: 503 },
    );
  }
  if (request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/health`,
      {
        headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY! },
        cache: 'no-store',
        signal: AbortSignal.timeout(10_000),
      },
    );
    if (!res.ok) throw new Error(`Supabase answered ${res.status}`);

    return NextResponse.json({
      ok: true,
      project: 'eduscale-frontend',
      db: 'supabase',
      at: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Keepalive failed:', message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
