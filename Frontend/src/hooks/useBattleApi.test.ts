import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// One mock per URL, at the useAxios seam. Like the real hooks they resolve
// `{ success: false }` on an HTTP error and never throw.
const { calls, byUrl } = vi.hoisted(() => {
  const calls = new Map<string, ReturnType<typeof vi.fn>>();
  const byUrl = (url: string) => {
    if (!calls.has(url)) calls.set(url, vi.fn());
    return [calls.get(url)!, {}];
  };
  return { calls, byUrl };
});
vi.mock('@/hooks/useAxios', () => ({
  useAxiosGet: byUrl,
  useAxiosPost: byUrl,
  useAxiosPatch: byUrl,
}));

import { useBattleApi } from './useBattleApi';

const fail = (message: string) => ({
  success: false,
  error: true,
  data: null,
  message,
});

describe('useBattleApi mutations on a 4xx', () => {
  beforeEach(() => calls.forEach((fn) => fn.mockReset()));

  it.each([
    ['startBattle', '/battles/{{id}}/start'],
    ['openLobby', '/battles/{{id}}/lobby'],
    ['cancelBattle', '/battles/{{id}}/cancel'],
    ['leaveExistingBattle', '/battles/{{id}}/leave'],
  ] as const)('%s resolves to null and sets error', async (name, url) => {
    const { result } = renderHook(() => useBattleApi());
    calls.get(url)!.mockResolvedValue(fail('Only the host can do that'));
    let out: unknown;
    await act(async () => {
      out = await result.current[name]('b1');
    });
    expect(out).toBeNull();
    expect(result.current.error).toBe('Only the host can do that');
  });

  it('submitBattleAnswer and fetchBattle surface the server message', async () => {
    const { result } = renderHook(() => useBattleApi());
    calls.get('/battles/answer')!.mockResolvedValue(fail('Too late'));
    let out: unknown;
    await act(async () => {
      out = await result.current.submitBattleAnswer({
        battle_id: 'b1',
        question_id: 'q1',
        selected_option: 0,
        time_taken_ms: 100,
      });
    });
    expect(out).toBeNull();
    expect(result.current.error).toBe('Too late');

    calls.get('/battles/{{id}}')!.mockResolvedValue(fail('Battle not found'));
    await act(async () => {
      out = await result.current.fetchBattle('b1');
    });
    expect(out).toBeNull();
    expect(result.current.error).toBe('Battle not found');
  });

  it('a successful start still resolves true with no error', async () => {
    const { result } = renderHook(() => useBattleApi());
    calls
      .get('/battles/{{id}}/start')!
      .mockResolvedValue({ success: true, data: {}, message: 'ok' });
    let out: unknown;
    await act(async () => {
      out = await result.current.startBattle('b1');
    });
    expect(out).toBe(true);
    expect(result.current.error).toBeNull();
  });
});
