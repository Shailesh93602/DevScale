import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('@/components/3dPin', () => ({ PinContainer: () => null }));
vi.mock('@/components/InfiniteMovingCards', () => ({
  InfiniteMovingCards: () => null,
}));

import PlacementPreparation from './page';

describe('PlacementPreparation', () => {
  it('advertises no resume builder and has no dead buttons', () => {
    render(<PlacementPreparation />);
    expect(screen.queryByText(/resume building tools/i)).toBeNull();
    expect(screen.queryByText('Build your Resume')).toBeNull();
    // every remaining call to action goes somewhere
    expect(screen.queryAllByRole('button')).toHaveLength(0);
    expect(
      screen.getByRole('link', { name: /Read Interview Questions/ }),
    ).toHaveAttribute('href', '/interview-question');
  });

  it('does not point every tip card at the same /resources page', () => {
    const { container } = render(<PlacementPreparation />);
    expect(container.querySelectorAll('a[href="/resources"]')).toHaveLength(0);
  });
});
