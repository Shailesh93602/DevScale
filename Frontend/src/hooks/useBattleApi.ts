import { useCallback, useState } from 'react';
import { useAxiosGet, useAxiosPost, useAxiosPatch } from '@/hooks/useAxios';
import {
  Battle,
  BattleFilters,
  BattleQuestion,
  LeaderboardEntry,
  AnswerResult,
} from '@/types/battle';
import { normalizeBattle } from '@/lib/battle-normalizer';

export interface MyResultQuestion {
  order: number;
  question_text: string;
  options: string[];
  correct_answer: number;
  explanation: string | null;
  points: number;
  selected_option: number;
  is_correct: boolean;
  time_taken_ms: number;
  points_earned: number;
  community_accuracy_pct: number;
  community_total_answers: number;
}

export interface MyBattleResults {
  summary: {
    score: number;
    rank: number | null;
    correct_count: number;
    wrong_count: number;
    avg_time_ms: number;
    total_questions: number;
    answered: number;
  };
  questions: MyResultQuestion[];
}

export const useBattleApi = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [getBattles] = useAxiosGet<Battle[]>('/battles');
  const [getBattle] = useAxiosGet<Battle>('/battles/{{id}}');
  const [getBattleQuestions] = useAxiosGet<BattleQuestion[]>(
    '/battles/{{id}}/questions',
  );
  const [getBattleLeaderboard] = useAxiosGet<LeaderboardEntry[]>(
    '/battles/{{id}}/leaderboard',
  );
  const [getBattleResults] = useAxiosGet('/battles/{{id}}/results');
  const [getMyResultsReq] = useAxiosGet<MyBattleResults>(
    '/battles/{{id}}/my-results',
  );
  const [getMyBattles] = useAxiosGet('/battles/my');

  const [createBattleReq] = useAxiosPost<Battle>('/battles');
  const [joinBattleReq] = useAxiosPost('/battles/{{id}}/join');
  const [leaveBattleReq] = useAxiosPost('/battles/{{id}}/leave');
  const [markReadyReq] = useAxiosPost('/battles/{{id}}/ready');
  const [openLobbyReq] = useAxiosPost('/battles/{{id}}/lobby');
  const [startBattleReq] = useAxiosPost('/battles/{{id}}/start');
  const [cancelBattleReq] = useAxiosPatch('/battles/{{id}}/cancel');
  const [submitAnswerReq] = useAxiosPost<
    AnswerResult & {
      leaderboard: LeaderboardEntry[];
      participant_done: boolean;
    }
  >('/battles/answer');
  const [addQuestionsReq] = useAxiosPost<{
    added: number;
    total_questions_added: number;
    total_questions_required: number;
    ready_to_start: boolean;
  }>('/battles/{{id}}/questions');

  // ── Helpers ────────────────────────────────────────────────────────────────

  const wrap = useCallback(
    async <T>(fn: () => Promise<T>): Promise<T | null> => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await fn();
        return result;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // ── Browse ─────────────────────────────────────────────────────────────────

  const fetchBattles = useCallback(
    (filters?: BattleFilters) =>
      wrap(async () => {
        const params = Object.fromEntries(
          Object.entries(filters ?? {}).filter(
            ([, v]) => v !== undefined && v !== null && v !== '' && v !== 'all',
          ),
        );
        const res = await getBattles({ params });
        const data = res.data as unknown as
          | { data?: Battle[]; meta?: unknown }
          | Battle[];
        const list = Array.isArray(data)
          ? data
          : ((data as { data?: Battle[] }).data ?? []);
        return {
          data: list.map(normalizeBattle),
          meta: (data as { meta?: unknown }).meta,
        };
      }),
    [getBattles, wrap],
  );

  const fetchMyBattles = useCallback(
    (page = 1, limit = 10) =>
      wrap(async () => {
        const res = await getMyBattles({ params: { page, limit } });
        const data = res.data as unknown as
          | { data?: Battle[]; meta?: unknown }
          | Battle[];
        const list = Array.isArray(data)
          ? data
          : ((data as { data?: Battle[] }).data ?? []);
        return {
          data: list.map(normalizeBattle),
          meta: (data as { meta?: unknown }).meta,
        };
      }),
    [getMyBattles, wrap],
  );

  // ── Detail ─────────────────────────────────────────────────────────────────

  const fetchBattle = useCallback(
    (id: string) =>
      wrap(async () => {
        const res = await getBattle({}, { id });
        return res.data
          ? normalizeBattle(res.data as unknown as Record<string, unknown>)
          : null;
      }),
    [getBattle, wrap],
  );

  const fetchBattleQuestions = useCallback(
    (id: string) =>
      wrap(async () => {
        const res = await getBattleQuestions({}, { id });
        return Array.isArray(res.data) ? (res.data as BattleQuestion[]) : [];
      }),
    [getBattleQuestions, wrap],
  );

  const fetchBattleLeaderboard = useCallback(
    (id: string) =>
      wrap(async () => {
        const res = await getBattleLeaderboard({}, { id });
        return Array.isArray(res.data) ? (res.data as LeaderboardEntry[]) : [];
      }),
    [getBattleLeaderboard, wrap],
  );

  const fetchBattleResults = useCallback(
    (id: string) =>
      wrap(async () => {
        const res = await getBattleResults({}, { id });
        return res.data;
      }),
    [getBattleResults, wrap],
  );

  const fetchMyResults = useCallback(
    (id: string) =>
      wrap(async () => {
        const res = await getMyResultsReq({}, { id });
        return res.data ?? null;
      }),
    [getMyResultsReq, wrap],
  );

  // ── Mutations ──────────────────────────────────────────────────────────────

  const createNewBattle = useCallback(
    (battleData: {
      title: string;
      description?: string;
      topic_id: string;
      difficulty: string;
      type: string;
      max_participants?: number;
      total_questions?: number;
      time_per_question?: number;
      points_per_question?: number;
      start_time?: string;
    }) =>
      wrap(async () => {
        const res = await createBattleReq(battleData);
        if (!res?.data) throw new Error('Failed to create battle');
        return normalizeBattle(res.data as unknown as Record<string, unknown>);
      }),
    [createBattleReq, wrap],
  );

  const joinExistingBattle = useCallback(
    async (
      id: string,
    ): Promise<
      { ok: true; battle: Battle } | { ok: false; message: string }
    > => {
      const res = await joinBattleReq({}, undefined, { id });
      if (!res.success) {
        return { ok: false, message: res.message || 'Failed to join battle' };
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = res?.data as any;
      if (data && typeof data === 'object' && 'battle' in data) {
        return {
          ok: true,
          battle: normalizeBattle(data.battle as Record<string, unknown>),
        };
      }
      return { ok: false, message: 'Unexpected response from server' };
    },
    [joinBattleReq],
  );

  const leaveExistingBattle = useCallback(
    (id: string) =>
      wrap(async () => {
        await leaveBattleReq({}, undefined, { id });
        return true;
      }),
    [leaveBattleReq, wrap],
  );

  const markReady = useCallback(
    (id: string) =>
      wrap(async () => {
        const res = await markReadyReq({}, undefined, { id });
        return res?.data;
      }),
    [markReadyReq, wrap],
  );

  const openLobby = useCallback(
    (id: string) =>
      wrap(async () => {
        await openLobbyReq({}, undefined, { id });
        return true;
      }),
    [openLobbyReq, wrap],
  );

  const startBattle = useCallback(
    (id: string) =>
      wrap(async () => {
        await startBattleReq({}, undefined, { id });
        return true;
      }),
    [startBattleReq, wrap],
  );

  const cancelBattle = useCallback(
    (id: string) =>
      wrap(async () => {
        await cancelBattleReq({}, undefined, { id });
        return true;
      }),
    [cancelBattleReq, wrap],
  );

  const addQuestionsTosBattle = useCallback(
    (
      id: string,
      questions: Array<{
        question: string;
        options: string[];
        correct_answer: number;
        explanation?: string;
        points?: number;
        time_limit?: number;
      }>,
    ) =>
      wrap(async () => {
        const res = await addQuestionsReq({ questions }, undefined, { id });
        return res?.data ?? null;
      }),
    [addQuestionsReq, wrap],
  );

  const submitBattleAnswer = useCallback(
    (data: {
      battle_id: string;
      question_id: string;
      selected_option: number;
      time_taken_ms: number;
    }) =>
      wrap(async () => {
        const res = await submitAnswerReq(data);
        return res?.data ?? null;
      }),
    [submitAnswerReq, wrap],
  );

  return {
    isLoading,
    error,
    fetchBattles,
    fetchMyBattles,
    fetchBattle,
    fetchBattleQuestions,
    fetchBattleLeaderboard,
    fetchBattleResults,
    fetchMyResults,
    createNewBattle,
    joinExistingBattle,
    leaveExistingBattle,
    markReady,
    openLobby,
    startBattle,
    cancelBattle,
    submitBattleAnswer,
    addQuestionsTosBattle,
  };
};

export default useBattleApi;
