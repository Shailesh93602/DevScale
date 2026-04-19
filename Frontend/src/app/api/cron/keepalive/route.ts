export const runtime = 'nodejs';

import { NextResponse } from 'next/server';

import { createClient } from '@/utils/supabase/server';

// Daily keep-alive cron: issues a trivial Supabase query so the free-tier
// project doesn't auto-pause after 7 days of no activity. We hit the actual
// Supabase client (not just REST) so it works even if the project only uses
// direct Postgres connections.

const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: Request) {
  return handleKeepalive(request);
}

export async function POST(request: Request) {
  return handleKeepalive(request);
}

async function handleKeepalive(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = await createClient();
    // getSession() is a cheap auth call that exercises the Supabase project
    // and counts as activity for the inactivity-pause timer.
    const { error } = await supabase.auth.getSession();
    if (error) throw error;

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
