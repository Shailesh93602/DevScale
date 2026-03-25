import { useCallback, useState } from 'react';
import {
  useAxiosGet,
  useAxiosPost,
  useAxiosPut,
  useAxiosDelete,
} from '@/hooks/useAxios';
import {
  Battle,
  BattleFilters,
  BattleQuestion,
  BattleResponse,
  BattlesResponse,
  PaginatedResponse,
} from '@/types/battle';

// Define the BattleLeaderboardEntry type if it doesn't exist in the battle types
interface BattleLeaderboardEntry {
  user_id: string;
  username: string;
  score: number;
  rank: number;
  correct_answers: number;
  total_answers: number;
  time_taken: number;
}

export const useBattleApi = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [getBattles] = useAxiosGet<BattlesResponse>('/battles');
  const [getBattle] = useAxiosGet<BattleResponse>('/battles/{{id}}');
  const [getBattleQuestions] = useAxiosGet<PaginatedResponse<BattleQuestion>>(
    '/battles/{{id}}/questions',
  );
  const [getBattleLeaderboard] = useAxiosGet<
    PaginatedResponse<BattleLeaderboardEntry>
  >('/battles/{{id}}/leaderboard');
  const [createBattle] = useAxiosPost<BattleResponse>('/battles/create');
  const [updateBattle] = useAxiosPut<BattleResponse>('/battles/{{id}}');
  const [deleteBattle] = useAxiosDelete<{ success: boolean }>(
    '/battles/{{id}}',
  );
  const [joinBattle] = useAxiosPost<BattleResponse>('/battles/{{id}}/join');
  const [leaveBattle] = useAxiosPost<BattleResponse>('/battles/{{id}}/leave');
  const [submitAnswer] = useAxiosPost<{ success: boolean; score: number }>(
    '/battles/submit',
  );

  const fetchBattles = useCallback(
    async (filters?: BattleFilters) => {
      setIsLoading(true);
      setError(null);

      try {
        // Convert filters to query params
        const queryParams = new URLSearchParams();
        if (filters) {
          Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
              queryParams.append(key, String(value));
            }
          });
        }

        const response = await getBattles({ params: queryParams.toString() });
        setIsLoading(false);
        return response.data;
      } catch (err) {
        setIsLoading(false);
        setError(err instanceof Error ? err.message : 'An error occurred');
        return null;
      }
    },
    [getBattles],
  );

  const fetchBattle = useCallback(
    async (id: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await getBattle({}, { id });
        setIsLoading(false);
        return response.data;
      } catch (err) {
        setIsLoading(false);
        setError(err instanceof Error ? err.message : 'An error occurred');
        return null;
      }
    },
    [getBattle],
  );

  const fetchBattleQuestions = useCallback(
    async (id: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await getBattleQuestions({}, { id });
        setIsLoading(false);
        return response.data;
      } catch (err) {
        setIsLoading(false);
        setError(err instanceof Error ? err.message : 'An error occurred');
        return null;
      }
    },
    [getBattleQuestions],
  );

  const fetchBattleLeaderboard = useCallback(
    async (id: string, page = 1, limit = 10) => {
      setIsLoading(true);
      setError(null);

      try {
        const queryParams = new URLSearchParams();
        queryParams.append('page', String(page));
        queryParams.append('limit', String(limit));

        const response = await getBattleLeaderboard(
          { params: queryParams.toString() },
          { id },
        );
        setIsLoading(false);
        return response.data;
      } catch (err) {
        setIsLoading(false);
        setError(err instanceof Error ? err.message : 'An error occurred');
        return null;
      }
    },
    [getBattleLeaderboard],
  );

  const createNewBattle = useCallback(
    async (battleData: Partial<Battle>) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await createBattle(battleData);
        if (!response?.data) {
          throw new Error('Failed to create battle: No response data');
        }
        setIsLoading(false);
        return response.data;
      } catch (err) {
        setIsLoading(false);
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to create battle. Please try again.';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },
    [createBattle],
  );

  const updateExistingBattle = useCallback(
    async (id: string, battleData: Partial<Battle>) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await updateBattle(battleData, { params: { id } });
        setIsLoading(false);
        return response.data;
      } catch (err) {
        setIsLoading(false);
        setError(err instanceof Error ? err.message : 'An error occurred');
        return null;
      }
    },
    [updateBattle],
  );

  const removeExistingBattle = useCallback(
    async (id: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await deleteBattle({}, { id });
        setIsLoading(false);
        return response.data;
      } catch (err) {
        setIsLoading(false);
        setError(err instanceof Error ? err.message : 'An error occurred');
        return null;
      }
    },
    [deleteBattle],
  );

  const joinExistingBattle = useCallback(
    async (id: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await joinBattle({}, { params: { id } });
        setIsLoading(false);
        return response.data;
      } catch (err) {
        setIsLoading(false);
        setError(err instanceof Error ? err.message : 'An error occurred');
        return null;
      }
    },
    [joinBattle],
  );

  const leaveExistingBattle = useCallback(
    async (id: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await leaveBattle({}, { params: { id } });
        setIsLoading(false);
        return response.data;
      } catch (err) {
        setIsLoading(false);
        setError(err instanceof Error ? err.message : 'An error occurred');
        return null;
      }
    },
    [leaveBattle],
  );

  const submitBattleAnswer = useCallback(
    async (data: {
      battle_id: string;
      question_id: string;
      answer: string;
      time_taken: number;
    }) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await submitAnswer(data);
        setIsLoading(false);
        return response.data;
      } catch (err) {
        setIsLoading(false);
        setError(err instanceof Error ? err.message : 'An error occurred');
        return null;
      }
    },
    [submitAnswer],
  );

  return {
    isLoading,
    error,
    fetchBattles,
    fetchBattle,
    fetchBattleQuestions,
    fetchBattleLeaderboard,
    createNewBattle,
    updateExistingBattle,
    removeExistingBattle,
    joinExistingBattle,
    leaveExistingBattle,
    submitBattleAnswer,
  };
};

export default useBattleApi;
