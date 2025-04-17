import { useState } from 'react';
import { useAxiosPost } from './useAxios';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface BattleJoinData {
  id: string;
  status: string;
}

interface BattleJoinResponse {
  success: boolean;
  message: string;
  data: BattleJoinData;
}

export const useBattleJoin = () => {
  const { toast } = useToast();
  const router = useRouter();
  const [isJoining, setIsJoining] = useState(false);
  const [execute, state] = useAxiosPost<BattleJoinResponse, void>(
    '/battles/{{battleId}}/join',
  );

  const joinBattle = async (battleId: string) => {
    setIsJoining(true);
    try {
      const response = await execute(undefined, undefined, { battleId });
      if (response?.data?.data?.id) {
        toast({
          title: 'Success',
          description: 'Successfully joined the battle!',
        });
        router.push(`/battle-zone/${response.data.data.id}`);
        return response.data.data;
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to join battle. Please try again.',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsJoining(false);
    }
  };

  return {
    joinBattle,
    isJoining,
    isLoading: state.isLoading,
    error: state.error,
  };
};
