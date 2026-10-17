import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

const h = vi.hoisted(() => ({
  push: vi.fn(),
  toast: vi.fn(),
  join: vi.fn(),
}));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: h.push }) }));
vi.mock('@/hooks/use-toast', () => ({ useToast: () => ({ toast: h.toast }) }));
vi.mock('@/hooks/useBattleApi', () => ({
  default: () => ({ joinExistingBattle: h.join }),
}));

import { useJoinAndEnterBattle } from './useJoinAndEnterBattle';

describe('useJoinAndEnterBattle', () => {
  beforeEach(() => {
    h.push.mockReset();
    h.toast.mockReset();
    h.join.mockReset();
  });

  it('stays put and shows the server message when the join is refused', async () => {
    h.join.mockResolvedValue({ ok: false, message: 'Battle is full' });
    const { result } = renderHook(() =>
      useJoinAndEnterBattle({ successToast: 'Joined!' }),
    );
    let entered: boolean | undefined;
    await act(async () => {
      entered = await result.current('b1');
    });
    expect(entered).toBe(false);
    expect(h.push).not.toHaveBeenCalled();
    expect(h.toast).toHaveBeenCalledWith({
      title: 'Battle is full',
      variant: 'destructive',
    });
  });

  it('enters on success with the success toast', async () => {
    h.join.mockResolvedValue({ ok: true, battle: { id: 'b1' } });
    const { result } = renderHook(() =>
      useJoinAndEnterBattle({ successToast: 'Joined!' }),
    );
    await act(async () => {
      await result.current('b1');
    });
    expect(h.push).toHaveBeenCalledWith('/battle-zone/b1');
    expect(h.toast).toHaveBeenCalledWith({ title: 'Joined!' });
  });

  it('enters without an error when the server says the caller already joined', async () => {
    h.join.mockResolvedValue({
      ok: false,
      message: 'You have already joined this battle',
    });
    const { result } = renderHook(() => useJoinAndEnterBattle());
    await act(async () => {
      await result.current('b1');
    });
    expect(h.push).toHaveBeenCalledWith('/battle-zone/b1');
    expect(h.toast).not.toHaveBeenCalled();
  });
});
