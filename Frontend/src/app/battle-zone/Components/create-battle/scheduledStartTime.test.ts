import { describe, it, expect, vi, afterAll } from 'vitest';

vi.mock('@/hooks/useBattleCreation', () => ({ useBattleCreation: vi.fn() }));
vi.mock('@/hooks/use-toast', () => ({ useToast: vi.fn() }));
import { scheduledStartTime } from './useCreateBattleWizard';

// West of UTC is where the UTC-midnight parse slips a day; Node honours a runtime TZ change.
const originalTz = process.env.TZ;
process.env.TZ = 'America/New_York';
afterAll(() => {
  if (originalTz === undefined) delete process.env.TZ;
  else process.env.TZ = originalTz;
});

describe('scheduledStartTime', () => {
  const past = new Date(2020, 0, 1);

  it('keeps the chosen local calendar day and time', () => {
    const iso = scheduledStartTime(
      { type: 'SCHEDULED', date: '2026-10-20', time: '14:00' },
      past,
    )!;
    const local = new Date(iso);
    expect([local.getFullYear(), local.getMonth(), local.getDate()]).toEqual([
      2026, 9, 20,
    ]);
    expect([local.getHours(), local.getMinutes()]).toEqual([14, 0]);
  });

  it('rejects a start that is not in the future', () => {
    expect(() =>
      scheduledStartTime(
        { type: 'SCHEDULED', date: '2026-10-20', time: '14:00' },
        new Date(2026, 9, 20, 15, 0),
      ),
    ).toThrow(/future/);
  });
});
