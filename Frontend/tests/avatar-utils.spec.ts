import { expect, test } from '@playwright/test';
import { getInitials } from '../src/lib/avatar';

test.describe('Avatar Initials Fallback', () => {
  test('derives initials from full name', async () => {
    expect(getInitials('John Doe')).toBe('JD');
  });

  test('falls back to username and trims spaces', async () => {
    expect(getInitials('', '  alex99  ')).toBe('AL');
  });

  test('returns default letter when no identity is present', async () => {
    expect(getInitials()).toBe('U');
  });
});
