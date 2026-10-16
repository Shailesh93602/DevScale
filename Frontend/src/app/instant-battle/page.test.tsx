import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('@/components/Battle/BattleZoneLayout', () => ({
  default: ({ children }: { children: ReactNode }) => children,
}));
vi.mock('@/components/Battle/MatchmakingRadar', () => ({
  MatchmakingRadar: () => null,
  MatchFoundModal: () => null,
}));
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ isAuthenticated: false, status: 'unauthenticated' }),
}));
vi.mock('@/hooks/useMatchmaking', () => ({
  useMatchmaking: () => ({ phase: 'idle' }),
}));

import InstantBattlePage from './page';

describe('/instant-battle signed out', () => {
  it('the sign-in link uses the param LoginForm reads, so login returns here', () => {
    render(<InstantBattlePage />);
    const link = screen.getByRole('link', { name: /sign in to play/i });
    const url = new URL(link.getAttribute('href')!, 'https://x.test');
    expect(url.pathname).toBe('/auth/login');
    expect(url.searchParams.get('callbackUrl')).toBe('/instant-battle');
  });
});
