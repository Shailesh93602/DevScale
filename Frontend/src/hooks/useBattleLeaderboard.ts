import { useState } from 'react';
import { useAxiosGet } from './useAxios';
import { useToast } from '@/hooks/use-toast';

interface LeaderboardEntry {
  userId: string;
  username: string;
  score: number;
  rank: number;
  correctAnswers: number;
  totalQuestions: number;
  timeSpent: number;
}

interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const useBattleLeaderboard = (battleId: string) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [execute, state] = useAxiosGet<LeaderboardResponse>(
    '/battles/{{battleId}}/leaderboard',
  );

  const fetchLeaderboard = async (page = 1, limit = 10) => {
    setIsLoading(true);
    try {
      const response = await execute({ params: { page, limit } }, { battleId });
      if (response?.data) {
        return response.data;
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch leaderboard. Please try again.',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    fetchLeaderboard,
    isLoading: isLoading || state.isLoading,
    error: state.error,
    data: state.data,
  };
};
