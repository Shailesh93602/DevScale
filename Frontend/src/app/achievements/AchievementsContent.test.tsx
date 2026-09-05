import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { AchievementRecord } from '@/hooks/useDashboard';

// The page reads through useDashboard().getAchievements — the same hook the
// dashboard uses — so the mock sits at that seam. Each test decides what the
// API "returns" and asserts the state the user ends up looking at.
const getAchievements = vi.fn();
vi.mock('@/hooks/useDashboard', () => ({
  useDashboard: () => ({ getAchievements }),
}));
vi.mock('@/lib/logger', () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));
// framer-motion animates via rAF/IntersectionObserver, neither of which jsdom
// has; render a plain div so the assertions are about content, not motion.
vi.mock('framer-motion', () => ({
  motion: {
    // Only the DOM-safe props are forwarded; the animation props are dropped.
    div: ({
      children,
      className,
      style,
    }: React.PropsWithChildren<{
      className?: string;
      style?: React.CSSProperties;
    }>) => (
      <div className={className} style={style}>
        {children}
      </div>
    ),
  },
}));

import AchievementsContent from './AchievementsContent';

const ok = (data: AchievementRecord[]) => ({
  success: true,
  error: false,
  message: 'ACHIEVEMENTS_FETCHED',
  data,
});

const rows: AchievementRecord[] = [
  {
    id: 'a1',
    type: 'daily_topic',
    title: 'Weekly Warrior',
    description: 'Completed daily topics for 7 consecutive days!',
    criteria: { consecutiveCompletions: 7 },
    earned_at: '2026-08-01T10:00:00.000Z',
  },
  {
    id: 'a2',
    type: 'trophy',
    title: 'First Battle Won',
    description: 'Won a 1-v-1 battle.',
    criteria: {},
    earned_at: '2026-07-15T10:00:00.000Z',
  },
];

describe('AchievementsContent', () => {
  beforeEach(() => {
    getAchievements.mockReset();
  });

  it('renders every achievement the API returns, with its title and description', async () => {
    getAchievements.mockResolvedValue(ok(rows));
    render(<AchievementsContent />);

    const list = await screen.findByTestId('achievements-list');
    expect(list.querySelectorAll('li')).toHaveLength(2);
    expect(screen.getByText('Weekly Warrior')).toBeInTheDocument();
    expect(
      screen.getByText('Completed daily topics for 7 consecutive days!'),
    ).toBeInTheDocument();
    expect(screen.getByText('First Battle Won')).toBeInTheDocument();
    expect(screen.getByText('2 achievements')).toBeInTheDocument();
    expect(screen.queryByText(/coming soon/i)).not.toBeInTheDocument();
  });

  it('shows an honest empty state (not "Coming Soon") when the user has earned nothing', async () => {
    getAchievements.mockResolvedValue(ok([]));
    render(<AchievementsContent />);

    await screen.findByTestId('achievements-empty');
    expect(screen.getByText('No achievements yet')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Go to Dashboard' }),
    ).toHaveAttribute('href', '/dashboard');
    expect(screen.queryByText(/coming soon/i)).not.toBeInTheDocument();
    expect(screen.queryByTestId('achievements-list')).not.toBeInTheDocument();
  });

  it('shows the error state when the request fails and retries on demand', async () => {
    getAchievements
      .mockResolvedValueOnce({
        success: false,
        error: true,
        message: 'Request failed',
        data: null,
      })
      .mockResolvedValueOnce(ok(rows.slice(0, 1)));
    render(<AchievementsContent />);

    await screen.findByTestId('achievements-error');
    expect(
      screen.getByText('Could not load your achievements'),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));

    await waitFor(() =>
      expect(screen.getByTestId('achievements-list')).toBeInTheDocument(),
    );
    expect(getAchievements).toHaveBeenCalledTimes(2);
    expect(screen.getByText('1 achievement')).toBeInTheDocument();
  });

  it('shows a loading skeleton while the request is in flight', () => {
    getAchievements.mockReturnValue(new Promise(() => {}));
    render(<AchievementsContent />);
    expect(screen.getByTestId('achievements-loading')).toBeInTheDocument();
  });
});
