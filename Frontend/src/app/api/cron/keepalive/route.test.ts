import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { GET } from './route';

const fetchMock = vi.fn();
const req = (auth?: string) =>
  new Request('http://localhost/api/cron/keepalive', {
    headers: auth ? { authorization: auth } : {},
  });

beforeEach(() => {
  fetchMock.mockReset().mockResolvedValue(new Response('{}', { status: 200 }));
  vi.stubGlobal('fetch', fetchMock);
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://proj.supabase.co');
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'sb_publishable_x');
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe('/api/cron/keepalive', () => {
  it('refuses every caller when CRON_SECRET is unset (it used to answer 200 to anyone)', async () => {
    vi.stubEnv('CRON_SECRET', '');
    expect((await GET(req())).status).toBe(503);
    expect((await GET(req('Bearer '))).status).toBe(503);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('refuses a wrong token', async () => {
    vi.stubEnv('CRON_SECRET', 's3cret');
    expect((await GET(req('Bearer nope'))).status).toBe(401);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('with the right token, makes a real request to the Supabase project', async () => {
    vi.stubEnv('CRON_SECRET', 's3cret');
    const res = await GET(req('Bearer s3cret'));
    expect(res.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://proj.supabase.co/auth/v1/health');
    expect(init.headers.apikey).toBe('sb_publishable_x');
  });

  it('reports a failed ping as 500, not ok', async () => {
    vi.stubEnv('CRON_SECRET', 's3cret');
    fetchMock.mockResolvedValue(new Response('', { status: 401 }));
    const res = await GET(req('Bearer s3cret'));
    expect(res.status).toBe(500);
    expect((await res.json()).ok).toBe(false);
  });
});
