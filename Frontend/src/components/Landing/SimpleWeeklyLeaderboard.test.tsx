import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';

/**
 * The landing leaderboard renders what the ratings API returns — and nothing
 * it does not.
 *
 * It has carried invented names twice (ED-5). These tests pin the third
 * version: names come from the response, an empty response says so in words,
 * a failed request says so in words, and no hand-typed player ever appears.
 */

const fetchMock = vi.fn();

vi.mock('@/hooks/useAxios', () => ({
  useAxiosGet: () => [fetchMock, { isLoading: false }],
}));

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...rest
  }: React.PropsWithChildren<{ href: string }>) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

import SimpleWeeklyLeaderboard, {
  displayName,
  type RatingLeaderboardEntry,
} from './SimpleWeeklyLeaderboard';

function entry(
  i: number,
  overrides: Partial<RatingLeaderboardEntry['user']> = {},
): RatingLeaderboardEntry {
  return {
    userId: `u${i}`,
    rating: 1500 - i * 37,
    gamesPlayed: 10,
    wins: 6,
    losses: 4,
    user: { id: `u${i}`, username: `player_${i}`, ...overrides },
  };
}

beforeEach(() => {
  fetchMock.mockReset();
});

describe('SimpleWeeklyLeaderboard', () => {
  it('renders the players the API returned, in rank order, with their ratings', async () => {
    fetchMock.mockResolvedValue({
      success: true,
      data: [
        entry(1, { firstName: 'Asha', lastName: 'Rao' }),
        entry(2),
        entry(3),
        entry(4),
        entry(5),
      ],
    });

    render(<SimpleWeeklyLeaderboard />);

    await waitFor(() => expect(screen.getByText('Asha Rao')).toBeVisible());
    expect(fetchMock).toHaveBeenCalledWith({ params: { limit: 5 } });

    // Podium carries ranks 1–3; the list below carries 4 and 5.
    for (const name of ['player_2', 'player_3', 'player_4', 'player_5']) {
      expect(screen.getByText(name)).toBeVisible();
    }
    expect(screen.getByText('1463 rating')).toBeVisible(); // player_1 → 1500-37
    expect(screen.getByText('1315 rating')).toBeVisible(); // player_5 → 1500-185

    // The block is marked as live data so the honesty e2e can tell it apart
    // from a labelled sample.
    expect(
      document.querySelector('[data-leaderboard-source="ratings-api"]'),
    ).not.toBeNull();
  });

  it('says plainly when nobody has been rated yet — no placeholder rows', async () => {
    fetchMock.mockResolvedValue({ success: true, data: [] });

    render(<SimpleWeeklyLeaderboard />);

    await waitFor(() =>
      expect(screen.getByText('No rated players yet')).toBeVisible(),
    );
    // The old placeholders must not come back under any state.
    // Exact matches: the subtitle legitimately says "Top players by …".
    expect(screen.queryByText('Top player')).toBeNull();
    expect(screen.queryByText('Runner-up')).toBeNull();
    expect(screen.queryByText(/—\s*pts/)).toBeNull();
    expect(screen.queryByText('Preview')).toBeNull();
  });

  it('reports a failed request rather than rendering an empty podium', async () => {
    fetchMock.mockRejectedValue(new Error('network'));

    render(<SimpleWeeklyLeaderboard />);

    await waitFor(() =>
      expect(
        screen.getByText('The leaderboard could not be loaded right now.'),
      ).toBeVisible(),
    );
    expect(screen.queryByText('No rated players yet')).toBeNull();
  });

  it('renders supplied entries without fetching', () => {
    render(<SimpleWeeklyLeaderboard initialEntries={[entry(9)]} />);
    expect(screen.getByText('player_9')).toBeVisible();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('tolerates a non-array payload', async () => {
    fetchMock.mockResolvedValue({ success: true, data: null });
    render(<SimpleWeeklyLeaderboard />);
    await waitFor(() =>
      expect(screen.getByText('No rated players yet')).toBeVisible(),
    );
  });
});

describe('displayName', () => {
  it('prefers "First Last", then first name, then username', () => {
    expect(displayName(entry(1, { firstName: 'A', lastName: 'B' }))).toBe(
      'A B',
    );
    expect(displayName(entry(1, { firstName: 'A', lastName: null }))).toBe('A');
    expect(displayName(entry(1))).toBe('player_1');
  });
});
