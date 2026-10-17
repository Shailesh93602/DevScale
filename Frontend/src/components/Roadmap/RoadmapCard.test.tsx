import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('react-toastify', () => ({ toast: { error: vi.fn() } }));
vi.mock('@/hooks/useRoadmapSocial', () => ({
  useRoadmapSocial: () => ({ handleLike: vi.fn(), handleBookmark: vi.fn() }),
}));
vi.mock('@/hooks/useSignInGate', () => ({
  useSignInGate: () => ({ requireSignIn: () => true }),
}));

import RoadmapCard from './RoadmapCard';
import { mapToRoadmapType } from '@/lib/dashboard-roadmap';

describe('RoadmapCard social controls', () => {
  it('hides Like and Bookmark when the viewer state is unknown (dashboard)', () => {
    const roadmap = mapToRoadmapType({ id: 'rm', title: 'Backend' }, false);
    render(<RoadmapCard roadmap={roadmap} index={0} />);
    expect(screen.queryByRole('button', { name: 'Like' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Bookmark' })).toBeNull();
  });

  it('shows them when the API sent the viewer state', () => {
    const roadmap = {
      ...mapToRoadmapType({ id: 'rm', title: 'Backend' }, false),
      isLiked: true,
      isBookmarked: false,
      likesCount: 3,
    };
    render(<RoadmapCard roadmap={roadmap} index={0} />);
    expect(screen.getByRole('button', { name: 'Like' })).toHaveTextContent('3');
    expect(
      screen.getByRole('button', { name: 'Bookmark' }),
    ).toBeInTheDocument();
  });
});
