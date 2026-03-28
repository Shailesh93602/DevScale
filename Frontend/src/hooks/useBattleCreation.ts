import { useState } from 'react';
import { useAxiosPost } from './useAxios';
import { useToast } from '@/hooks/use-toast';

export interface BattleQuestionSource {
  type: 'topic' | 'subject' | 'main_concept' | 'roadmap' | 'dsa';
  id: string;
  difficulty?: string;
  categories?: string[];
  count?: number;
}

export interface BattleCreationData {
  title: string;
  description: string;
  topic_id?: string;
  question_source?: BattleQuestionSource;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  type: 'QUICK' | 'SCHEDULED' | 'PRACTICE';
  max_participants: number;
  start_time?: string;
  points_per_question: number;
  time_per_question: number;
  total_questions: number;
}

export const useBattleCreation = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [execute, state] = useAxiosPost<
    { id: string; slug?: string },
    BattleCreationData
  >('/battles');

  const createBattle = async (data: BattleCreationData) => {
    setIsSubmitting(true);
    try {
      const response = await execute(data);
      if (response?.data?.id) {
        toast({
          title: 'Success',
          description: 'Battle created successfully!',
        });
        return response.data;
      }

      throw new Error(response?.message || 'Failed to create battle.');
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to create battle. Please try again.',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    createBattle,
    isSubmitting,
    isLoading: state.isLoading,
    error: state.error,
  };
};
