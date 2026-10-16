import { describe, it, expect } from 'vitest';
import { remoteTargets, resolveTargetEnv } from './remoteTargets';

describe('remoteTargets', () => {
  it('accepts localhost targets and unset vars', () => {
    expect(
      remoteTargets({
        PLAYWRIGHT_BASE_URL: 'http://localhost:3220',
        NEXT_PUBLIC_API_BASE_URL: 'http://127.0.0.1:4000/api/v1',
      }),
    ).toEqual([]);
    expect(remoteTargets({})).toEqual([]);
  });

  it('names a hosted site or API without echoing its value', () => {
    expect(
      remoteTargets({
        PLAYWRIGHT_BASE_URL: 'https://eduscale.vercel.app',
        NEXT_PUBLIC_API_BASE_URL: 'https://api.example.com/api/v1',
      }),
    ).toEqual(['PLAYWRIGHT_BASE_URL', 'NEXT_PUBLIC_API_BASE_URL']);
  });

  it('treats a lookalike host or garbage as remote', () => {
    expect(
      remoteTargets({ NEXT_PUBLIC_API_BASE_URL: 'http://localhost.evil.com' }),
    ).toEqual(['NEXT_PUBLIC_API_BASE_URL']);
    expect(remoteTargets({ PLAYWRIGHT_BASE_URL: 'not a url' })).toEqual([
      'PLAYWRIGHT_BASE_URL',
    ]);
  });
});

describe('resolveTargetEnv', () => {
  const files: Record<string, string> = {
    '.env': 'NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api/v1\n',
    '.env.local':
      'OTHER=1\nNEXT_PUBLIC_API_BASE_URL="https://api.example.com"\n',
  };
  const read = (n: string) => files[n] ?? null;

  it('uses next dev precedence: process env, then .env.local, then .env', () => {
    expect(resolveTargetEnv({}, read).NEXT_PUBLIC_API_BASE_URL).toBe(
      'https://api.example.com',
    );
    expect(
      resolveTargetEnv({ NEXT_PUBLIC_API_BASE_URL: 'http://localhost:1' }, read)
        .NEXT_PUBLIC_API_BASE_URL,
    ).toBe('http://localhost:1');
    expect(
      resolveTargetEnv({}, (n) => (n === '.env' ? files['.env'] : null))
        .NEXT_PUBLIC_API_BASE_URL,
    ).toBe('http://localhost:4000/api/v1');
  });

  it.each([
    'export NEXT_PUBLIC_API_BASE_URL=https://api.prod.example.com/api/v1',
    'NEXT_PUBLIC_API_BASE_URL: https://api.prod.example.com/api/v1',
    'NEXT_PUBLIC_API_BASE_URL=http://localhost:4000\nNEXT_PUBLIC_API_BASE_URL=https://api.prod.example.com/api/v1',
  ])('reads the value next dev applies from %j', (text) => {
    const env = resolveTargetEnv({}, (n) => (n === '.env' ? text : null));
    expect(env.NEXT_PUBLIC_API_BASE_URL).toBe(
      'https://api.prod.example.com/api/v1',
    );
    expect(remoteTargets(env)).toEqual(['NEXT_PUBLIC_API_BASE_URL']);
  });
});
