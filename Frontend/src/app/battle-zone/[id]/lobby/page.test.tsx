import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

const h = vi.hoisted(() => ({
  push: vi.fn(),
  toast: vi.fn(),
  leave: vi.fn(),
}));
vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 'b1' }),
  useRouter: () => ({ push: h.push }),
}));
vi.mock('@/hooks/use-toast', () => ({ useToast: () => ({ toast: h.toast }) }));
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'u1' } }),
}));
vi.mock('@/components/Battle/BattleZoneLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock('../../Components/BattleLobby', () => ({
  default: ({ onLeaveBattle }: { onLeaveBattle: () => void }) => (
    <button onClick={onLeaveBattle}>leave</button>
  ),
}));
vi.mock('@/hooks/useBattleApi', () => ({
  default: () => ({
    fetchBattle: async () => ({
      id: 'b1',
      status: 'WAITING',
      participants: [{ user_id: 'u1' }],
    }),
    joinExistingBattle: vi.fn(),
    leaveExistingBattle: h.leave,
  }),
}));

import BattleLobbyPage from './page';

describe('BattleLobbyPage leave', () => {
  beforeEach(() => {
    h.push.mockReset();
    h.toast.mockReset();
    h.leave.mockReset();
  });

  it('does not claim success when the server refuses the leave', async () => {
    h.leave.mockResolvedValue(null);
    render(<BattleLobbyPage />);
    fireEvent.click(await screen.findByText('leave'));
    await waitFor(() => expect(h.leave).toHaveBeenCalledWith('b1'));
    await waitFor(() =>
      expect(h.toast).toHaveBeenCalledWith(
        expect.objectContaining({ variant: 'destructive' }),
      ),
    );
    expect(h.toast).not.toHaveBeenCalledWith({
      title: 'You have left the battle',
    });
    expect(h.push).not.toHaveBeenCalled();
  });

  it('leaves and navigates on success', async () => {
    h.leave.mockResolvedValue(true);
    render(<BattleLobbyPage />);
    fireEvent.click(await screen.findByText('leave'));
    await waitFor(() => expect(h.push).toHaveBeenCalledWith('/battle-zone'));
    expect(h.toast).toHaveBeenCalledWith({ title: 'You have left the battle' });
  });
});
