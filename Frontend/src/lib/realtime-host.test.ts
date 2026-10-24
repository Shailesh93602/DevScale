import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import {
  needsRealtimeHost,
  isBattlePath,
  socketBaseUrl,
  warmRealtimeHost,
  resetWarmRealtimeHost,
} from './realtime-host';

describe('needsRealtimeHost', () => {
  it.each([
    ['post', '/battles'],
    ['post', '/battles/abc/ready'],
    ['post', '/battles/abc/start'],
    ['patch', '/battles/abc'],
    ['post', '/battles/abc/answer'],
    ['get', '/matchmaking/status'],
    ['post', '/matchmaking/join'],
    ['post', 'https://api.example.test/api/v1/battles/abc/join'],
  ])('%s %s goes to the realtime host', (method, url) => {
    expect(needsRealtimeHost(method, url)).toBe(true);
  });

  it.each([
    ['get', '/battles'],
    ['get', '/battles/abc'],
    ['get', '/battles/global-stats'],
    ['post', '/roadmaps/enroll'],
    ['post', '/battlesx'],
    ['get', '/users/me'],
    [undefined, '/battles/abc'],
  ])('%s %s stays on the REST host', (method, url) => {
    expect(needsRealtimeHost(method, url)).toBe(false);
  });

  it('isBattlePath covers reads too, so a battle page wakes the host', () => {
    expect(isBattlePath('/battles/global-stats')).toBe(true);
    expect(isBattlePath('/roadmaps')).toBe(false);
  });
});

describe('socketBaseUrl', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('prefers NEXT_PUBLIC_WS_URL', () => {
    vi.stubEnv('NEXT_PUBLIC_WS_URL', 'https://ws.example.test');
    vi.stubEnv(
      'NEXT_PUBLIC_REALTIME_API_BASE_URL',
      'https://rt.example.test/api/v1',
    );
    expect(socketBaseUrl()).toBe('https://ws.example.test');
  });

  it('falls back to the realtime host, not the serverless REST host', () => {
    vi.stubEnv('NEXT_PUBLIC_WS_URL', '');
    vi.stubEnv(
      'NEXT_PUBLIC_REALTIME_API_BASE_URL',
      'https://rt.example.test/api/v1',
    );
    vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', 'https://api.example.test/api/v1');
    expect(socketBaseUrl()).toBe('https://rt.example.test');
  });

  it('keeps the old behaviour when no realtime host is configured', () => {
    vi.stubEnv('NEXT_PUBLIC_WS_URL', '');
    vi.stubEnv('NEXT_PUBLIC_REALTIME_API_BASE_URL', '');
    vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', 'https://api.example.test/api/v1');
    expect(socketBaseUrl()).toBe('https://api.example.test');
  });
});

describe('warmRealtimeHost', () => {
  const fetchMock = vi.fn(() => Promise.resolve(new Response('{}')));
  beforeEach(() => {
    resetWarmRealtimeHost();
    fetchMock.mockClear();
    vi.stubGlobal('fetch', fetchMock);
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('pings the liveness route once per page load', () => {
    vi.stubEnv(
      'NEXT_PUBLIC_REALTIME_API_BASE_URL',
      'https://rt.example.test/api/v1/',
    );
    warmRealtimeHost();
    warmRealtimeHost();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://rt.example.test/api/v1/health/ready',
      { cache: 'no-store' },
    );
  });

  it('does nothing without a realtime host', () => {
    vi.stubEnv('NEXT_PUBLIC_REALTIME_API_BASE_URL', '');
    warmRealtimeHost();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
