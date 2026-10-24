// eduscale-backend#24-08 — a streak is consecutive calendar days, not pings.
import { describe, it, expect, jest, afterEach } from '@jest/globals';
import { updateStreakSchema } from '../../validations/streakValidations';

let lastActivity: Date;
const updates: Array<{
  data: { current_streak?: number; timezone?: string };
}> = [];
const tx = {
  userStreak: {
    upsert: async () => ({}),
    findUnique: async () => ({
      current_streak: 3,
      longest_streak: 5,
      last_activity_date: lastActivity,
    }),
    update: async (a: {
      data: { current_streak?: number; timezone?: string };
    }) => void updates.push(a),
  },
  userDailyActivity: { create: async () => ({}) },
};
jest.mock('../../lib/prisma', () => ({
  __esModule: true,
  default: {
    userStreak: {
      findUnique: async () => ({
        current_streak: 12,
        longest_streak: 12,
        last_activity_date: new Date('2026-09-20T10:00:00Z'),
        streak_start_date: null,
        timezone: 'UTC',
        daily_activities: [],
      }),
    },
    $transaction: (fn: (t: typeof tx) => unknown) => fn(tx),
  },
}));

import { DateTime } from 'luxon';
import StreakRepository, {
  liveCurrentStreak,
} from '../../repositories/streakRepository';

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

describe('liveCurrentStreak (reads never decayed the stored streak)', () => {
  const at = (iso: string) => DateTime.fromISO(iso, { zone: 'UTC' });

  it('a streak last extended three weeks ago reads as 0, not its old length', () => {
    expect(
      liveCurrentStreak(
        12,
        '2026-09-20T10:00:00Z',
        'UTC',
        at('2026-10-11T09:00:00Z')
      )
    ).toBe(0);
  });

  it('activity yesterday or today keeps it alive', () => {
    const last = new Date('2026-10-09T23:30:00Z');
    expect(liveCurrentStreak(4, last, 'UTC', at('2026-10-10T22:00:00Z'))).toBe(
      4
    );
    expect(liveCurrentStreak(4, last, 'UTC', at('2026-10-09T23:59:00Z'))).toBe(
      4
    );
  });

  it('counts days in the zone the activity was recorded in', () => {
    // Kolkata: last activity 10 Oct 01:00 IST; now 11 Oct 23:00 IST = yesterday.
    expect(
      liveCurrentStreak(
        6,
        '2026-10-09T19:30:00Z',
        'Asia/Kolkata',
        at('2026-10-11T17:30:00Z')
      )
    ).toBe(6);
  });

  it('GET /streak/stats reports the live streak, not the stored length', async () => {
    jest
      .spyOn(Date, 'now')
      .mockReturnValue(new Date('2026-10-11T09:00:00Z').getTime());
    const stats = await new StreakRepository().getUserStreak('u1');
    expect(stats?.currentStreak).toBe(0);
    expect(stats?.longestStreak).toBe(12);
  });

  it('the update stores the zone it counted days in', async () => {
    await streakAfterPing('2026-10-09T08:00:00Z', '2026-10-10T20:00:00Z');
    expect(updates[0]?.data.timezone).toBe('UTC');
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
