import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

const h = vi.hoisted(() => ({
  getChallenge: vi.fn(),
  getCloudDraft: vi.fn(),
  saveDraft: vi.fn(),
}));
vi.mock('@/hooks/useAxios', () => ({
  useAxiosGet: (url: string) =>
    url.startsWith('/run-code/draft/')
      ? [h.getCloudDraft, {}]
      : [h.getChallenge, {}],
  useAxiosPost: () => [h.saveDraft, {}],
}));
vi.mock('@/lib/logger', () => ({ logger: { error: vi.fn() } }));

import { useChallengeCode } from './useChallengeCode';

const DRAFT = 'function main() { return "my real work"; }';

const flush = async () => {
  for (let i = 0; i < 5; i++) await Promise.resolve();
};

describe('useChallengeCode', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    h.getChallenge.mockReset().mockResolvedValue({
      success: true,
      data: { id: 'c1', title: 'Two Sum' },
    });
    // Real envelope: `data` is the ChallengeDraft row itself.
    h.getCloudDraft.mockReset().mockResolvedValue({
      success: true,
      message: 'DRAFT_FETCHED',
      data: { code: DRAFT, language: 'javascript' },
    });
    h.saveDraft.mockReset().mockResolvedValue({ success: true });
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('a cloud draft survives a fresh mount with empty localStorage', async () => {
    const { result } = renderHook(() => useChallengeCode('c1', 'javascript'));
    await act(flush);
    expect(result.current.code).toBe(DRAFT);

    await act(async () => {
      vi.advanceTimersByTime(3000);
      await flush();
    });
    // Mount must never write the boilerplate back over the draft.
    expect(h.saveDraft).not.toHaveBeenCalled();
    expect(
      JSON.parse(localStorage.getItem('challenge_progress_c1')!).javascript,
    ).toBe(DRAFT);
  });

  it('an edit is still synced to the cloud', async () => {
    const { result } = renderHook(() => useChallengeCode('c1', 'javascript'));
    await act(flush);
    act(() => result.current.handleEditorChange('edited code here'));
    await act(async () => {
      vi.advanceTimersByTime(2500);
      await flush();
    });
    expect(h.saveDraft).toHaveBeenCalledWith({
      challengeId: 'c1',
      code: 'edited code here',
      language: 'javascript',
    });
  });

  it('an edit in one language never syncs another language over its draft', async () => {
    const { result, rerender } = renderHook(
      ({ lang }) => useChallengeCode('c1', lang),
      { initialProps: { lang: 'javascript' } },
    );
    await act(flush);
    act(() => result.current.handleEditorChange('edited js code here'));
    await act(async () => {
      vi.advanceTimersByTime(2500);
      await flush();
    });
    h.saveDraft.mockClear();

    rerender({ lang: 'python' });
    await act(async () => {
      vi.advanceTimersByTime(3000);
      await flush();
    });
    expect(h.saveDraft).not.toHaveBeenCalledWith(
      expect.objectContaining({ language: 'python' }),
    );
  });
});
