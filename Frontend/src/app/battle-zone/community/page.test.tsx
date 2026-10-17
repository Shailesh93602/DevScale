import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('@/components/Battle/BattleZoneLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock('@/hooks/useAxios', () => ({
  useAxiosGet: () => [vi.fn(async () => ({ success: false, data: null })), {}],
}));

import CommunityPage from './page';
import { battleZoneItems } from '@/components/Navbar/constants';

describe('Community page', () => {
  it('renders no invented members, events or online counts', async () => {
    render(<CommunityPage />);
    expect(
      await screen.findByText('Community is not built yet'),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Online/)).toBeNull();
    expect(
      screen.queryByText(/Weekend Tournament|Community Meetup/),
    ).toBeNull();
  });

  it('is not advertised in the battle-zone navigation', () => {
    expect(battleZoneItems.map((i) => i.path)).not.toContain(
      '/battle-zone/community',
    );
  });
});
