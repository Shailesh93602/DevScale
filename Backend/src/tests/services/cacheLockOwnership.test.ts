/**
 * A lock you release without having taken it is not a lock.
 *
 * `getWithLock` guards an expensive regeneration with `SET … NX`, and had its
 * release in a `finally` that ran on EVERY path — including the path where the
 * `NX` failed because someone else held it. So each waiter that woke up,
 * recursed, and returned also deleted the winner's lock on the way out.
 *
 * The damage is exactly what the lock exists to prevent: with the lock gone
 * early, the next waiter takes a fresh one and runs `callback()` again, so N
 * concurrent callers produce N regenerations instead of one. It stayed
 * invisible because the function still returns the right value every time —
 * only the number of expensive calls is wrong, and nothing counted them.
 *
 * The client is injected rather than module-mocked because the module-level
 * client connects at import time and `jest-setup` has already loaded it; this
 * is the same shape `matchmakingService` uses to unit-test its own locking
 * "with a fake Redis + Redlock (no live infra)".
 */
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { getWithLock, LockClient } from '../../services/cacheService';

const store = new Map<string, string>();
const deleted: string[] = [];

const fakeClient: LockClient = {
  async set(key, value) {
    if (store.has(key)) return null; // NX: already held
    store.set(key, value);
    return 'OK';
  },
  async del(key) {
    deleted.push(key);
    return store.delete(key) ? 1 : 0;
  },
};

/** Stands in for getCache, so nothing touches a real connection. */
const cache = new Map<string, unknown>();
const read = async <V>(k: string): Promise<V | null> =>
  (cache.get(k) as V) ?? null;

beforeEach(() => {
  store.clear();
  cache.clear();
  deleted.length = 0;
});

describe('getWithLock — only the holder may release', () => {
  it('a caller that LOST the lock does not delete it', async () => {
    // Somebody else is mid-regeneration and holds the lock.
    store.set('lock:hot-key', '1');

    const callback = jest.fn(() => Promise.resolve('fresh'));

    // The winner finishes and publishes its value while we are backing off.
    setTimeout(() => cache.set('hot-key', 'cached-by-winner'), 50);

    const result = await getWithLock<string>(
      'hot-key',
      callback,
      {},
      fakeClient,
      read
    );

    expect(result).toBe('cached-by-winner');
    // It never ran the expensive work…
    expect(callback).not.toHaveBeenCalled();
    // …and, crucially, it never deleted the lock it did not own.
    expect(deleted).not.toContain('lock:hot-key');
    expect(store.has('lock:hot-key')).toBe(true);
  });

  it('a caller that WON the lock still releases it', async () => {
    const result = await getWithLock<string>(
      'cold-key',
      () => Promise.resolve('fresh'),
      {},
      fakeClient,
      read
    );

    expect(result).toBe('fresh');
    expect(deleted).toContain('lock:cold-key');
  });

  it('releases the lock it holds even when the callback throws', async () => {
    await expect(
      getWithLock<string>(
        'boom-key',
        () => Promise.reject(new Error('generation failed')),
        {},
        fakeClient,
        read
      )
    ).rejects.toThrow('generation failed');

    expect(deleted).toContain('lock:boom-key');
  });
});
