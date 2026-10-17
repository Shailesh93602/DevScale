import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

const h = vi.hoisted(() => ({ get: vi.fn(), url: '' }));
vi.mock('@/hooks/useAxios', () => ({
  useAxiosGet: (url: string) => {
    h.url = url;
    return [h.get, {}];
  },
}));
vi.mock('@/components/Battle/BattleZoneLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import LeaderboardPage from './page';

// What GET /ratings/leaderboard sends after camelCaseResponse.
const row = {
  userId: 'u1',
  rating: 1342,
  gamesPlayed: 4,
  wins: 3,
  losses: 1,
  user: { id: 'u1', username: 'grace', firstName: null, lastName: null },
};

describe('LeaderboardPage', () => {
  beforeEach(() => h.get.mockReset());

  it('renders players from the ratings API without crashing', async () => {
    h.get.mockResolvedValue({ success: true, message: '', data: [row] });
    render(<LeaderboardPage />);
    expect(await screen.findByText('grace')).toBeInTheDocument();
    expect(h.url).toBe('/ratings/leaderboard');
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('has no tabs or selects that relabel the global list', async () => {
    h.get.mockResolvedValue({ success: true, message: '', data: [row] });
    render(<LeaderboardPage />);
    await screen.findByText('grace');
    expect(screen.queryByText('Friends')).toBeNull();
    expect(screen.queryByText('By Topic')).toBeNull();
    expect(screen.queryByText('This Week')).toBeNull();
  });

  it('says so when the request fails', async () => {
    h.get.mockResolvedValue({ success: false, data: null, message: 'x' });
    render(<LeaderboardPage />);
    expect(await screen.findByRole('alert')).toBeInTheDocument();
  });
});
