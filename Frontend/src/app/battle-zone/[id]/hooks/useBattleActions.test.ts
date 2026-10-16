import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

const h = vi.hoisted(() => ({ push: vi.fn(), toast: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: h.push }) }));
vi.mock('@/hooks/use-toast', () => ({ useToast: () => ({ toast: h.toast }) }));

import { useBattleActions } from './useBattleActions';

const setup = (api: Record<string, unknown>) =>
  renderHook(() =>
    useBattleActions({
      api: api as never,
      battleId: 'b1',
      userId: 'u1',
      isReady: false,
      currentQuestion: null,
      selectedOption: null,
      answeredQuestions: new Set(),
      questionStartRef: { current: 0 },
      setBattle: vi.fn(),
      setAnswerResult: vi.fn(),
      setAnsweredQuestions: vi.fn(),
    }),
  );

describe('useBattleActions leave/cancel', () => {
  beforeEach(() => {
    h.push.mockReset();
    h.toast.mockReset();
  });

  it('stays on the battle and says so when the server refuses the leave', async () => {
    const { result } = setup({ leaveExistingBattle: vi.fn(async () => null) });
    await act(() => result.current.handleLeave());
    expect(h.push).not.toHaveBeenCalled();
    expect(h.toast).toHaveBeenCalledWith(
      expect.objectContaining({ variant: 'destructive' }),
    );
  });

  it('navigates away after a successful leave', async () => {
    const { result } = setup({ leaveExistingBattle: vi.fn(async () => true) });
    await act(() => result.current.handleLeave());
    expect(h.push).toHaveBeenCalledWith('/battle-zone');
    expect(h.toast).not.toHaveBeenCalled();
  });

  it('reports a refused cancel', async () => {
    const { result } = setup({ cancelBattle: vi.fn(async () => null) });
    await act(() => result.current.handleCancelBattle());
    expect(h.toast).toHaveBeenCalledWith(
      expect.objectContaining({ variant: 'destructive' }),
    );
  });
});
