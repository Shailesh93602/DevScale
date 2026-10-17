import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

const h = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock('@/hooks/useAxios', () => ({
  useAxiosGet: () => [h.get, { isLoading: false }],
}));
vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
}));
vi.mock('@/hooks/useIntersection', () => ({ useIntersection: () => false }));
vi.mock('react-toastify', () => ({ toast: { error: vi.fn() } }));
vi.mock('@/components/Roadmap/RoadmapCard', () => ({
  default: ({ roadmap }: { roadmap: { title: string } }) => (
    <div>{roadmap.title}</div>
  ),
  RoadmapCardSkeleton: () => null,
}));

import RoadmapsPage from './page';

describe('RoadmapsPage', () => {
  it('renders roadmaps from the envelope and fetches page 1 once', async () => {
    h.get.mockResolvedValue({
      success: true,
      message: '',
      data: [
        {
          id: 'r1',
          title: 'Backend Engineer',
          description: 'd',
          user_id: 'u',
          created_at: '2026-01-01',
          updated_at: '2026-01-01',
          main_concepts: [],
        },
      ],
      meta: { total: 1, currentPage: 1, totalPages: 1, hasNextPage: false },
    });
    render(<RoadmapsPage />);
    expect(await screen.findByText('Backend Engineer')).toBeInTheDocument();
    await waitFor(() => expect(h.get).toHaveBeenCalled());
    const pages = h.get.mock.calls.map(([cfg]) =>
      (cfg.params as URLSearchParams).get('page'),
    );
    expect(pages.every((p) => p === '1')).toBe(true);
  });
});
