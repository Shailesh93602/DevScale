import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

const h = vi.hoisted(() => ({
  calls: new Map<string, ReturnType<typeof vi.fn>>(),
}));
vi.mock('@/hooks/useAxios', () => ({
  useAxiosGet: (url: string) => {
    if (!h.calls.has(url))
      h.calls.set(
        url,
        vi.fn(async () => ({ success: true, message: '', data: [] })),
      );
    return [h.calls.get(url)!, {}];
  },
}));

import { useQuestionSourceState } from './useQuestionSourceState';

const deferred = () => {
  let resolve!: (v: unknown) => void;
  const promise = new Promise((r) => (resolve = r));
  return { promise, resolve };
};
const pool = (n: number) => ({
  success: true,
  message: '',
  data: { questions: [], total_available: n },
});

describe('useQuestionSourceState pool check', () => {
  beforeEach(() => {
    h.calls.clear();
    vi.useFakeTimers();
  });
  afterEach(() => vi.useRealTimers());

  const setup = () => {
    const onChange = vi.fn();
    const r = renderHook(() =>
      useQuestionSourceState({ onChange, defaultCount: 10 }),
    );
    return { onChange, ...r };
  };

  it('a slower answer for the previous source cannot override the current one', async () => {
    const { result, onChange } = setup();
    const getPool = vi.fn();
    h.calls.set('/battles/question-pool', getPool);
    const a = deferred();
    const b = deferred();
    getPool.mockReturnValueOnce(a.promise).mockReturnValueOnce(b.promise);

    act(() => result.current.setSelectedRoadmap('A'));
    await act(async () => vi.advanceTimersByTime(500));
    act(() => result.current.setSelectedRoadmap('B'));
    await act(async () => vi.advanceTimersByTime(500));

    await act(async () => b.resolve(pool(40)));
    await act(async () => a.resolve(pool(40)));

    const last = onChange.mock.calls.at(-1)![0];
    expect(last?.id).toBe('B');
  });

  it('a failed pool check rejects the source and reports it', async () => {
    const { result, onChange } = setup();
    h.calls.set(
      '/battles/question-pool',
      vi.fn(async () => ({ success: false, data: null, message: 'down' })),
    );
    act(() => result.current.setSelectedRoadmap('A'));
    await act(async () => vi.advanceTimersByTime(500));
    expect(onChange).toHaveBeenLastCalledWith(null);
    expect(result.current.poolError).toBe(true);
    expect(result.current.totalAvailable).toBeNull();
  });

  it('clearing the source inside the debounce stops the spinner', async () => {
    const { result } = setup();
    act(() => result.current.setSelectedRoadmap('A'));
    expect(result.current.poolLoading).toBe(true);
    act(() => result.current.setSelectedRoadmap(''));
    expect(result.current.poolLoading).toBe(false);
  });
});
