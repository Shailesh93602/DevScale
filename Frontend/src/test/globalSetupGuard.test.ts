import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// The seeder must never run from a unit test.
const execSync = vi.hoisted(() => vi.fn());
vi.mock('child_process', () => ({ execSync, default: { execSync } }));

import globalSetup from '../../tests/global-setup';

describe('Playwright globalSetup remote-target guard', () => {
  const saved = { ...process.env };
  beforeEach(() => {
    execSync.mockReset();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    process.env.PLAYWRIGHT_SKIP_SEED = '1';
    delete process.env.PLAYWRIGHT_ALLOW_REMOTE;
    delete process.env.PLAYWRIGHT_BASE_URL;
    process.env.NEXT_PUBLIC_API_BASE_URL = 'http://localhost:4000/api/v1';
  });
  afterEach(() => {
    process.env = { ...saved };
  });

  it('refuses a deployed site under test, even with the seed skipped', async () => {
    process.env.PLAYWRIGHT_BASE_URL = 'https://eduscale.vercel.app';
    await expect(globalSetup()).rejects.toThrow(/PLAYWRIGHT_BASE_URL/);
  });

  it('refuses a hosted API before seeding anything', async () => {
    delete process.env.PLAYWRIGHT_SKIP_SEED;
    process.env.NEXT_PUBLIC_API_BASE_URL = 'https://api.example.com/api/v1';
    await expect(globalSetup()).rejects.toThrow(/NEXT_PUBLIC_API_BASE_URL/);
    expect(execSync).not.toHaveBeenCalled();
  });

  it('allows an explicit override', async () => {
    process.env.PLAYWRIGHT_BASE_URL = 'https://eduscale.vercel.app';
    process.env.PLAYWRIGHT_ALLOW_REMOTE = '1';
    await expect(globalSetup()).resolves.toBeUndefined();
  });

  it('passes for a local stack', async () => {
    await expect(globalSetup()).resolves.toBeUndefined();
  });
});
