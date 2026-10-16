import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';

const h = vi.hoisted(() => ({
  user: { id: 'user-b', first_name: 'Bea' } as {
    id: string;
    first_name: string;
  } | null,
  getDashboardSummary: vi.fn(),
}));
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: h.user }),
}));
vi.mock('@/hooks/useDashboard', () => ({
  useDashboard: () => ({ getDashboardSummary: h.getDashboardSummary }),
}));
vi.mock('@/components/dashboard/DashboardSkeletons', () => ({
  DashboardSkeleton: () => <div>SKELETON</div>,
}));
vi.mock('@/components/dashboard/StatCard', () => ({
  default: ({ title, value }: { title: string; value: unknown }) => (
    <div>{`${title}: ${String(value)}`}</div>
  ),
}));
vi.mock('@/components/Roadmap/RoadmapCard', () => ({ default: () => null }));
vi.mock('@/components/dashboard/StreakCalendar', () => ({
  default: () => null,
}));
vi.mock('@/components/dashboard/ActivityItem', () => ({ default: () => null }));
vi.mock('@/components/dashboard/AchievementItem', () => ({
  default: () => null,
}));

import DashboardPage from './page';

const summaryOf = (enrolledRoadmaps: number) => ({
  data: {
    stats: { enrolledRoadmaps },
    enrolledRoadmaps: [],
    recommendedRoadmaps: [],
    activities: [],
    achievements: [],
    streak: null,
    weeklyActivity: [],
  },
  ts: Date.now(),
});

describe('dashboard summary cache', () => {
  beforeEach(() => {
    sessionStorage.clear();
    h.getDashboardSummary.mockReset().mockReturnValue(new Promise(() => {}));
  });

  it("never seeds one account's page from another account's cached summary", () => {
    // User A's summary, cached in this tab before A signed out.
    sessionStorage.setItem(
      'dashboard:summary:v1',
      JSON.stringify(summaryOf(7)),
    );
    sessionStorage.setItem(
      'dashboard:summary:v1:user-a',
      JSON.stringify(summaryOf(7)),
    );
    h.user = { id: 'user-b', first_name: 'Bea' };
    render(<DashboardPage />);
    expect(screen.getByText('SKELETON')).toBeInTheDocument();
    expect(screen.queryByText('Enrolled Roadmaps: 7')).not.toBeInTheDocument();
  });

  it("still seeds from the same user's own cache", () => {
    sessionStorage.setItem(
      'dashboard:summary:v1:user-b',
      JSON.stringify(summaryOf(3)),
    );
    h.user = { id: 'user-b', first_name: 'Bea' };
    render(<DashboardPage />);
    expect(screen.getByText('Enrolled Roadmaps: 3')).toBeInTheDocument();
  });

  it('writes the cache when the profile loads after the summary', async () => {
    h.getDashboardSummary.mockResolvedValue({
      success: true,
      data: summaryOf(5).data,
    });
    h.user = null;
    const { rerender } = render(<DashboardPage />);
    await act(async () => {});
    h.user = { id: 'user-b', first_name: 'Bea' };
    rerender(<DashboardPage />);
    expect(
      sessionStorage.getItem('dashboard:summary:v1:user-b'),
    ).not.toBeNull();
  });

  it("seeds from the user's own cache once the profile loads", () => {
    sessionStorage.setItem(
      'dashboard:summary:v1:user-b',
      JSON.stringify(summaryOf(3)),
    );
    h.user = null;
    const { rerender } = render(<DashboardPage />);
    h.user = { id: 'user-b', first_name: 'Bea' };
    rerender(<DashboardPage />);
    expect(screen.getByText('Enrolled Roadmaps: 3')).toBeInTheDocument();
  });
});
