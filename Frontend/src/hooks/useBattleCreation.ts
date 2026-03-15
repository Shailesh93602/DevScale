import { useState } from 'react';
import { useAxiosPost } from './useAxios';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export interface BattleCreationData {
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  tags: string[];
  maxParticipants: number;
  startTime: string;
  endTime: string;
}

interface BattleCreationResponse {
  id: string;
  success: boolean;
  message: string;
  data: {
    id: string;
  };
}

export const useBattleCreation = () => {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [execute, state] = useAxiosPost<
    BattleCreationResponse,
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
        router.push(`/battle-zone/${response.data.id}`);
        return response.data;
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create battle. Please try again.',
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
