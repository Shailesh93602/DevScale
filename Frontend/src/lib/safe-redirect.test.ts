import { describe, it, expect } from 'vitest';
import { safeRedirectPath } from './safe-redirect';

describe('safeRedirectPath', () => {
  it.each([
    '//evil.com',
    '/\\evil.com',
    '/\t/evil.com',
    '/.//evil.com',
    '/..//evil.com',
    '/%2e%2e//evil.com',
    '/./\\evil.com',
    '@evil.com',
    '.evil.com',
    'https://evil.com',
    'javascript:alert(1)',
    '',
    null,
    undefined,
  ])('rejects %j', (value) => {
    expect(safeRedirectPath(value, '/dashboard')).toBe('/dashboard');
  });

  it.each([
    ['/instant-battle', '/instant-battle'],
    [
      '/coding-challenges/two-sum?tab=editor#x',
      '/coding-challenges/two-sum?tab=editor#x',
    ],
    ['/auth', '/auth'],
  ])('keeps the same-origin path %j', (value, expected) => {
    expect(safeRedirectPath(value, '/dashboard')).toBe(expected);
  });
});
