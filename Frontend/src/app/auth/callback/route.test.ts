import { describe, it, expect, vi } from 'vitest';

vi.mock('@/utils/supabase/server', () => ({
  createClient: async () => ({
    auth: { exchangeCodeForSession: async () => ({ error: null }) },
  }),
}));

import { GET } from './route';

const redirectFor = async (next: string) => {
  const url = new URL('https://eduscale.test/auth/callback?code=c');
  url.searchParams.set('next', next);
  const res = await GET(new Request(url));
  return res.headers.get('location');
};

describe('/auth/callback next=', () => {
  it.each(['@evil.com', '.evil.com', '//evil.com', 'https://evil.com'])(
    'never leaves the origin for %j',
    async (next) => {
      expect(new URL((await redirectFor(next))!).host).toBe('eduscale.test');
      expect(await redirectFor(next)).toBe('https://eduscale.test/dashboard');
    },
  );

  it('keeps a same-origin path', async () => {
    expect(await redirectFor('/battle-zone?x=1')).toBe(
      'https://eduscale.test/battle-zone?x=1',
    );
  });
});
