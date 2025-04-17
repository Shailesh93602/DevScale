import { useState } from 'react';
import { useAxiosPost } from './useAxios';
import { useToast } from '@/hooks/use-toast';

interface BattleAnswer {
  questionId: string;
  answer: string;
  timeSpent: number;
}

interface BattleSubmitData {
  battleId: string;
  answers: BattleAnswer[];
}

interface BattleSubmitResponse {
  success: boolean;
  message: string;
  data: {
    score: number;
    correctAnswers: number;
    totalQuestions: number;
    timeSpent: number;
  };
}

export const useBattleSubmit = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [execute, state] = useAxiosPost<BattleSubmitResponse, BattleSubmitData>(
    '/battles/{{battleId}}/submit',
  );

  const submitBattle = async (data: BattleSubmitData) => {
    setIsSubmitting(true);
    try {
      const response = await execute(data, undefined, {
        battleId: data.battleId,
      });
      if (response?.data?.data) {
        toast({
          title: 'Success',
          description: `Battle completed! Score: ${response.data.data.score}`,
        });
        return response.data.data;
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit battle. Please try again.',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitBattle,
    isSubmitting,
    isLoading: state.isLoading,
    error: state.error,
  };
};
