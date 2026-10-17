import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

const h = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock('@/hooks/useAxios', () => ({ useAxiosGet: () => [h.get, {}] }));

import CodingChallengesPage from './ChallengesBrowser';

const page = (title: string) => ({
  success: true,
  message: '',
  data: [{ id: title, title, description: 'x', difficulty: 'EASY' }],
  meta: { total: 24, totalPages: 2, currentPage: 1, limit: 12 },
});

describe('ChallengesBrowser', () => {
  beforeEach(() => h.get.mockReset());

  it('page N replaces the list, and going back to page 1 refetches it', async () => {
    h.get.mockImplementation(async (cfg?: { params: { page: number } }) =>
      page(`Challenge p${cfg?.params.page}`),
    );
    render(<CodingChallengesPage />);
    expect(await screen.findByText('Challenge p1')).toBeInTheDocument();

    fireEvent.click(screen.getByText('2'));
    expect(await screen.findByText('Challenge p2')).toBeInTheDocument();
    expect(screen.queryByText('Challenge p1')).toBeNull();

    fireEvent.click(screen.getByText('1'));
    expect(await screen.findByText('Challenge p1')).toBeInTheDocument();
    expect(screen.queryByText('Challenge p2')).toBeNull();
  });

  it('shows the error when the request fails', async () => {
    h.get.mockResolvedValue({ success: false, data: null, message: 'Boom' });
    render(<CodingChallengesPage />);
    expect(
      await screen.findByText(/Failed to load challenges: Boom/),
    ).toBeInTheDocument();
  });
});
