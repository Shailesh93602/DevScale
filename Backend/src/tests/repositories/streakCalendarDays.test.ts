// eduscale-backend#24-08 — a streak is consecutive calendar days, not pings.
import { describe, it, expect, jest, afterEach } from '@jest/globals';
import { updateStreakSchema } from '../../validations/streakValidations';

let lastActivity: Date;
const updates: Array<{ data: { current_streak?: number } }> = [];
const tx = {
  userStreak: {
    upsert: async () => ({}),
    findUnique: async () => ({
      current_streak: 3,
      longest_streak: 5,
      last_activity_date: lastActivity,
    }),
    update: async (a: { data: { current_streak?: number } }) =>
      void updates.push(a),
  },
  userDailyActivity: { create: async () => ({}) },
};
jest.mock('../../lib/prisma', () => ({
  __esModule: true,
  default: {
    userStreak: {},
    $transaction: (fn: (t: typeof tx) => unknown) => fn(tx),
  },
}));

import StreakRepository from '../../repositories/streakRepository';

async function streakAfterPing(
  last: string,
  now: string
): Promise<number | undefined> {
  lastActivity = new Date(last);
  updates.length = 0;
  jest.spyOn(Date, 'now').mockReturnValue(new Date(now).getTime());
  await new StreakRepository().updateStreak('u1', {
    activityType: 'TOPIC_COMPLETION',
    minutesSpent: 5,
    timezone: 'UTC',
  });
  return updates[0]?.data.current_streak;
}

afterEach(() => {
  jest.restoreAllMocks();
});

describe('StreakRepository.updateStreak', () => {
  it('a second ping on the same day leaves the streak unchanged', async () => {
    expect(
      await streakAfterPing('2026-10-10T08:00:00Z', '2026-10-10T09:00:00Z')
    ).toBe(3);
  });

  it('yesterday 08:00 → today 20:00 extends the streak (36h is still the next day)', async () => {
    expect(
      await streakAfterPing('2026-10-09T08:00:00Z', '2026-10-10T20:00:00Z')
    ).toBe(4);
  });

  it('a missed day resets it to 1', async () => {
    expect(
      await streakAfterPing('2026-10-07T23:00:00Z', '2026-10-10T01:00:00Z')
    ).toBe(1);
  });
});

describe('updateStreakSchema', () => {
  it('rejects an unknown timezone and an impossible minutesSpent', () => {
    const base = { activityType: 'TOPIC_COMPLETION' };
    expect(
      updateStreakSchema.validate({
        ...base,
        minutesSpent: 5,
        timezone: 'Mars/Base',
      }).error
    ).toBeDefined();
    expect(
      updateStreakSchema.validate({ ...base, minutesSpent: 100000 }).error
    ).toBeDefined();
  });
});
