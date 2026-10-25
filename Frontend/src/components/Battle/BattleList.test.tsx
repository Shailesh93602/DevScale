import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StrictMode } from 'react';
import { render, screen, waitFor } from '@testing-library/react';

const h = vi.hoisted(() => ({
  calls: new Map<string, ReturnType<typeof vi.fn>>(),
  toast: vi.fn(),
}));
vi.mock('@/hooks/useAxios', () => ({
  useAxiosGet: (url: string) => {
    if (!h.calls.has(url)) h.calls.set(url, vi.fn());
    return [h.calls.get(url)!, {}];
  },
}));
vi.mock('@/hooks/use-toast', () => ({ useToast: () => ({ toast: h.toast }) }));
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'me' }, userId: 'me' }),
}));
vi.mock('./BattleCard', () => ({
  default: ({ battle }: { battle: { title: string } }) => (
    <div data-testid="battle">{battle.title}</div>
  ),
  BattleCardSkeleton: () => <div data-testid="skeleton" />,
}));

import { BattleList } from './BattleList';
import { useBattleStore } from '@/store/battleStore';

const ok = (data: unknown[]) => ({ success: true, message: '', data });
const lastParams = (url: string) =>
  h.calls.get(url)!.mock.calls.at(-1)![0].params;

describe('BattleList', () => {
  beforeEach(() => {
    h.calls.clear();
    h.toast.mockReset();
    useBattleStore.getState().resetFilters();
  });

  it('shows an error, not "No battles found", when the request fails', async () => {
    h.calls.set(
      '/battles',
      vi
        .fn()
        .mockResolvedValue({ success: false, data: null, message: 'Boom' }),
    );
    render(<BattleList />);
    expect(await screen.findByRole('alert')).toHaveTextContent('Boom');
    expect(screen.queryByText('No battles found')).toBeNull();
  });

  it('replaces filters between tabs instead of merging them', async () => {
    h.calls.set('/battles', vi.fn().mockResolvedValue(ok([])));
    const { rerender } = render(
      <BattleList initialFilters={{ user_id: 'me', page: 1 }} />,
    );
    await waitFor(() => expect(lastParams('/battles').user_id).toBe('me'));
    rerender(<BattleList initialFilters={{ status: 'COMPLETED', page: 1 }} />);
    await waitFor(() =>
      expect(lastParams('/battles').status).toBe('COMPLETED'),
    );
    expect(lastParams('/battles').user_id).toBeUndefined();
  });

  it('keeps its initial filters through a StrictMode remount', async () => {
    h.calls.set('/battles', vi.fn().mockResolvedValue(ok([])));
    render(
      <StrictMode>
        <BattleList initialFilters={{ user_id: 'me' }} />
      </StrictMode>,
    );
    await waitFor(() => expect(lastParams('/battles').user_id).toBe('me'));
    expect(useBattleStore.getState().filters.user_id).toBe('me');
  });

  it('clears the global filters on unmount', () => {
    h.calls.set('/battles', vi.fn().mockResolvedValue(ok([])));
    const { unmount } = render(
      <BattleList initialFilters={{ user_id: 'me' }} />,
    );
    unmount();
    expect(useBattleStore.getState().filters.user_id).toBeUndefined();
  });

  it('scope "mine" reads /battles/my and applies select', async () => {
    h.calls.set(
      '/battles/my',
      vi.fn().mockResolvedValue(
        ok([
          { id: 'a', title: 'Mine', user_id: 'me', status: 'WAITING' },
          { id: 'b', title: 'Theirs', user_id: 'x', status: 'WAITING' },
        ]),
      ),
    );
    const select = (b: { user_id: string }) => b.user_id !== 'me';
    render(<BattleList scope="mine" select={select} />);
    expect(await screen.findByText('Theirs')).toBeInTheDocument();
    expect(screen.queryByText('Mine')).toBeNull();
    expect(h.calls.get('/battles')?.mock.calls.length ?? 0).toBe(0);
  });
});
