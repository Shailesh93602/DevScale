// The socket handshake must accept exactly the origins REST CORS accepts, so a
// realtime host configured with a wildcard preview origin is not refused.
import {
  describe,
  it,
  expect,
  jest,
  beforeEach,
  afterEach,
} from '@jest/globals';
import { isOriginAllowed, parseAllowedOrigins } from '../../config/corsOrigins';

jest.mock('../../lib/prisma', () => ({ __esModule: true, default: {} }));

type Verdict = { err: Error | null; allow?: boolean };

async function socketVerdict(corsOrigin: string, origin: string) {
  process.env.CORS_ORIGIN = corsOrigin;
  process.env.NODE_ENV = 'production';
  let verdict: Verdict = { err: null };
  await jest.isolateModulesAsync(async () => {
    const { socketCorsOrigin } = await import(
      '../../services/realtime/socketHandshake'
    );
    socketCorsOrigin(origin, (err, allow) => {
      verdict = { err, allow };
    });
  });
  return verdict;
}

describe('CORS origin matching', () => {
  const saved = { ...process.env };
  beforeEach(() => {
    jest.resetModules();
  });
  afterEach(() => {
    process.env = { ...saved };
  });

  it('matches exact entries and single-label wildcards', () => {
    const list = parseAllowedOrigins(
      ' https://eduscale.vercel.app , https://*.vercel.app,'
    );
    expect(list).toEqual([
      'https://eduscale.vercel.app',
      'https://*.vercel.app',
    ]);
    expect(isOriginAllowed('https://eduscale.vercel.app', list)).toBe(true);
    expect(isOriginAllowed('https://edu-git-x.vercel.app', list)).toBe(true);
    expect(isOriginAllowed('https://evil.example', list)).toBe(false);
    expect(isOriginAllowed('https://vercel.app.evil.example', list)).toBe(
      false
    );
  });

  it('the socket handshake accepts a wildcard origin the REST check accepts', async () => {
    const v = await socketVerdict(
      'https://*.vercel.app',
      'https://eduscale.vercel.app'
    );
    expect(v).toEqual({ err: null, allow: true });
  });

  it('the socket handshake refuses an unlisted origin', async () => {
    const v = await socketVerdict(
      'https://eduscale.vercel.app',
      'https://evil.example'
    );
    expect(v.err).toBeInstanceOf(Error);
  });

  it('the socket handshake fails closed on a blank list', async () => {
    const v = await socketVerdict(' , ', 'https://evil.example');
    expect(v.err).toBeInstanceOf(Error);
  });
});
