import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import { subDays } from 'date-fns';
import StreakCalendar from '@/components/dashboard/StreakCalendar';
import { ActivityTimeline } from '@/components/streak/ActivityTimeline';
import { StreakStats } from '@/components/streak/StreakStats';

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  BarChart: () => null,
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
}));

const NOW = new Date(2026, 9, 14, 12); // a Wednesday
beforeAll(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(NOW);
});
afterAll(() => vi.useRealTimers());

describe('StreakCalendar with the real (sparse, per-type) payload', () => {
  it('labels a single Wednesday activity as Wed and sums duplicate days', () => {
    render(
      <StreakCalendar
        currentStreak={1}
        longestStreak={1}
        thisWeek={[
          { date: '2026-10-14T00:00:00.000Z', minutesSpent: 20 },
          { date: '2026-10-14T00:00:00.000Z', minutesSpent: 10 },
        ]}
      />,
    );
    const cell = screen.getByTitle('30 minutes on 2026-10-14');
    expect(cell.previousElementSibling).toHaveTextContent('Wed');
    expect(screen.getAllByTitle(/minutes on/)).toHaveLength(7);
  });
});

describe('streak page components with GET /streak/weekly-activity rows', () => {
  const rows = [
    {
      date: subDays(NOW, 1).toISOString(),
      minutesSpent: 25,
      activityType: 'TOPIC_COMPLETED',
    },
  ];

  it('ActivityTimeline renders without throwing', () => {
    render(<ActivityTimeline activities={rows} />);
    expect(screen.getByText(/25 min/)).toBeInTheDocument();
  });

  it('StreakStats renders without throwing', () => {
    render(<StreakStats stats={null} weeklyActivity={rows} />);
    expect(screen.getByText('Total Activities This Week')).toBeInTheDocument();
  });
});
