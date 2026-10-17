// eduscale-backend#22-10 — pattern invalidation walks SCAN, never the blocking KEYS.
import { describe, it, expect, jest } from '@jest/globals';
import { redis, invalidateCachePattern } from '../../services/cacheService';

describe('invalidateCachePattern', () => {
  it('deletes every page of SCAN matches without calling KEYS', async () => {
    const scan = jest
      .spyOn(redis, 'scan')
      .mockResolvedValueOnce(['7', ['a', 'b']] as never)
      .mockResolvedValueOnce(['0', ['c']] as never);
    const keys = jest.spyOn(redis, 'keys').mockResolvedValue([] as never);
    const del = jest.spyOn(redis, 'del').mockResolvedValue(1 as never);

    await invalidateCachePattern('roadmap:detail:r1:*');

    expect(scan).toHaveBeenCalledWith(
      '0',
      'MATCH',
      'roadmap:detail:r1:*',
      'COUNT',
      500
    );
    expect(del.mock.calls).toEqual([['a', 'b'], ['c']]);
    expect(keys).not.toHaveBeenCalled();
  });
});
